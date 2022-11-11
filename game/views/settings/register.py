from django.contrib.auth import login
from django.contrib.auth.models import User
from django.http import JsonResponse
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get("username", "").strip() # 去掉前后的空格
    password = data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()

    if not username or not password:
        return JsonResponse({
            'result' : "用户名密码不能为空",
        })
    if password != password_confirm:
        return JsonResponse({
            'result' : "两次密码不一致",
        })
    if User.objects.filter(username=username).exists(): # 只是检查返回的列表是否有数据
        return JsonResponse({
            'result' : "用户名已存在",
        })
    # 创建用户
    user = User(username=username)
    user.set_password(password)
    user.save()

    # 设定默认头像
    Player.objects.create(user=user, photo="https://mgc-1311747586.cos.ap-shanghai.myqcloud.com/zhuanzhuan.jpg")    # player里保存的两个数据
    login(request, user)
    return JsonResponse({
        'result' : "success",
    })
