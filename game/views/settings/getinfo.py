from django.http import JsonResponse
from game.models.player.player import Player

# 实现不同端的不同处理方法
def getinfo_acapp(request):
    player = Player.objects.all()[0]    # 调取数据库
    return JsonResponse({
        'result' : "success",
        'username' : player.user.username,
        'photo' : player.photo,
    })

def getinfo_web(request):
    user = request.user;
    # 判断是否登录(总有人给你提供实现好的参数，实在不行自己写)
    if not user.is_authenticated:
        return JsonResponse({
            'result' : "未登录",
        })  # 字典的作用来了
    else:
        player = Player.objects.get(user=user)   # filter返回列表，get返回单个对象
        return JsonResponse({
            'result' : "success",
            'username' : player.user.username,
            'photo' : player.photo,
        })
    # 值得一提的是，django数据库实现了高度同步，后台数据库的修改会立刻在前端显现

def getinfo(request):
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)