from django.http import JsonResponse
from django.core.cache import cache
from urllib.parse import quote
from random import randint

# 随机8位数暗号
def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = "2810"
    redirect_uri = quote("https://app2810.acapp.acwing.com.cn/settings/acwing/acapp/receive_code/")   # quote可以对参数中部分歧义符号进行处理
    scope = "userinfo"
    state = get_state() # 传暗号再传回来验证，屏蔽攻击行为

    cache.set(state, True, 7200)    # 限2小时内完成授权，主要防止数据堆积

    return JsonResponse({
        'result' : "success",
        'redirect_uri' : redirect_uri,
        'appid' : appid,
        'scope' : scope,
        'state' : state,
    })
    # 前往第三方授权页，参数包括appid，跳转回来的路由，请求获取的信息种类，传回来的暗号