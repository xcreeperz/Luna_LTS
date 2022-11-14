class MultiPlayerSocket{
    constructor(play){
        this.play = play;
        //连接到后端wss类(通过as_asgi函数)
        this.ws = new WebSocket("wss://app2810.acapp.acwing.com.cn/wss/multiplayer/");
        //this.uuid 在外部调用时已指定为玩家uuid
        this.start();
    }

    //总的receive函数，从后端wss接收信息并交由具体receive函数处理
    receive(){
        let outer = this;
        this.ws.onmessage = function(e){
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if(uuid === outer.uuid) return false;

            let event = data.event;
            if(event === "create_player"){
                outer.receive_create_player(uuid, data.username, data.photo);
            }else if(event === "move_to"){
                outer.receive_move_to(uuid, data.tx, data.ty);
            }else if(event === "shoot_fireball"){
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            }else if(event === "attack"){
                outer.receive_attack(uuid, data.t_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            }else if(event === "blink"){
                outer.receive_blink(uuid, data.tx, data.ty);
            }else if(event === "message"){
                outer.receive_message(data.username, data.text);
            }
        }
    }

    start(){
        this.receive();
    }
    //在创建当前玩家时调用，通知后端
    send_create_player(username, photo){
        let outer = this;
        //向websocket发送消息，将json转为字符串
        this.ws.send(JSON.stringify({
            'event' : "create_player",
            'uuid' : outer.uuid,
            'username' : username,
            'photo' : photo,
        }))
    }
    //从后端接收其他玩家的信息
    receive_create_player(uuid, username, photo){
        let player = new Player(this.play, this.play.ratio * 0.5, 0.5, 0.05, "white", 0.2, "enemy", username, photo);
        player.uuid = uuid;
        this.play.players.push(player);
    }

    get_player(uuid){
        let players = this.play.players;
        for(let i = 0; i < players.length; i++){
            if(players[i].uuid === uuid){
                let player = players[i];
                return player;
            }
        }
        return null;
    }
    //向后端发送自己移动的信息
    send_move_to(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "move_to",
            'uuid' : outer.uuid,
            'tx' : tx,
            'ty' : ty,
        }))
    }
    //从后端接收其他玩家移动的信息
    receive_move_to(uuid, tx, ty){
        let player = this.get_player(uuid);
        if(player){
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "shoot_fireball",
            'uuid' : outer.uuid,
            'tx' : tx,
            'ty' : ty,
            'ball_uuid' : ball_uuid,
        }))
    }
    receive_shoot_fireball(uuid, tx, ty, ball_uuid){
        let player = this.get_player(uuid);
        if(player){
            //在当前窗口为该玩家创建火球，并同步为主人窗口上火球的uuid
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(t_uuid, x, y, angle, damage, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            't_uuid': t_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }))
    }
    //收到别人击中目标的消息，对本地的目标进行更新
    receive_attack(uuid, t_uuid, x, y, angle, damage, ball_uuid){
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(t_uuid);
        if(attacker && attackee){   //两个玩家都还在
            attackee.receive_attacked(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }))
    }
    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    send_message(username, text){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }))
    }
    receive_message(username, text){
        // console.log(username, text);
        this.play.cf.add_message(username, text);
    }
}