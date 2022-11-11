from django.shortcuts import redirect
from django.core.cache import cache
from django.http import JsonResponse
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from random import randint

def receive_code(request):
    data = request.GET

    if "errcode" in data:
        return JsonResponse({
            'result' : "apply failed",
            'errcode' : data['errcode'],
            'errmsg' : data['errmsg'],
        })
    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return JsonResponse({
            'result' : "state not exist"
        })
    cache.delete(state)
    # 暗号对上就删掉

    turl = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid' : "2810",
        'secret' : "d2f7625e90234c33a40e5a7b25787707",
        'code' : code,
    }
    # 获得授权包
    access_token_res = requests.get(turl, params=params).json()
    
    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    players = Player.objects.filter(openid=openid)
    if players.exists():
        player = players[0]
        return JsonResponse({
            'result' : "success",
            'username' : player.user.username,
            'photo' : player.photo,
        })

    # 获取用户信息
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        'access_token' : access_token,
        'openid' : openid,
    }
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)


    return JsonResponse({
        'result' : "success",
        'username' : player.user.username,
        'photo' : player.photo,
    })