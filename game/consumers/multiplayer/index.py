from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

# 继承channels内的类，是表示一对客户端-服务器连接的对象
class MultiPlayer(AsyncWebsocketConsumer):
    # 连接成功时调用
    async def connect(self):
        await self.accept() # await保证联机成功后才继续
        print("连接成功")
    
    # 断开连接(因为需要发送断连请求，不适用于非正常断连)
    async def disconnect(self, close_code):
        # print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        self.room_name = None
        start = 0
        # 管理debug账号单独划定房间号
        # if data['username'] == "秘封の月列":
        #     start = 100

        # 搜索第一个没开或未满的房间
        for i in range(start, 1000):
            name = "room-%d" %(i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name   # 加入房间
                break
        # 没有找到房间
        if not self.room_name:
            return
            
        if not cache.has_key(self.room_name):   # 房间未注册
            cache.set(self.room_name, [], 3600) # 有效期1h
        for player in cache.get(self.room_name):    # 遍历房间中所有玩家并获取信息
            # 从js接收房间内所有玩家信息
            await self.send(text_data = json.dumps({
                'event' : "create_player",
                'uuid' : player['uuid'],
                'username' : player['username'],
                'photo' : player['photo'],
            }))
        # 记住这个函数，给房间内所有玩家创建group
        await self.channel_layer.group_add(self.room_name, self.channel_name)

        players = cache.get(self.room_name)
        players.append({
            'uuid' : data['uuid'],
            'username' : data['username'],
            'photo' : data['photo']
        })
        cache.set(self.room_name, players, 3600)

        await self.channel_layer.group_send(self.room_name, {
            'type' : "group_send_event",
            'event' : "create_player",
            'uuid' : data['uuid'],
            'username' : data['username'],
            'photo' : data['photo'],
        })

    async def move_to(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type' : "group_send_event",
            'event' : "move_to",
            'uuid' : data['uuid'],
            'tx' : data['tx'],
            'ty' : data['ty'],
        })

    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type' : "group_send_event",
            'event' : "shoot_fireball",
            'uuid' : data['uuid'],
            'tx' : data['tx'],
            'ty' : data['ty'],
            'ball_uuid' : data['ball_uuid'],
        })

    async def attack(self, data):
        await self.channel_layer.group_send(self.room_name,{
            'type' : "group_send_event",
            'event' : "attack",
            'uuid' : data['uuid'],
            't_uuid' : data['t_uuid'],
            'x': data['x'],
            'y': data['y'],
            'angle': data['angle'],
            'damage': data['damage'],
            'ball_uuid': data['ball_uuid'],
        })

    async def blink(self, data):
        await self.channel_layer.group_send(self.room_name,{
            'type': "group_send_event",
            'event': "blink",
            'uuid': data['uuid'],
            'tx': data['tx'],
            'ty': data['ty'],
        })

    async def message(self, data):
        await self.channel_layer.group_send(self.room_name, {
            'type': "group_send_event",
            'event': "message",
            'uuid': data['uuid'],
            'username': data['username'],
            'text': data['text'],
        })

    async def group_send_event(self, data):
        await self.send(text_data = json.dumps(data))
    
    # (connect成功后)从前端接收并更新对局信息
    async def receive(self, text_data):
        data = json.loads(text_data)
        # print(data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)