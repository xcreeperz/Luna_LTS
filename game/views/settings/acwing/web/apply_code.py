from django.http import JsonResponse
from django.core.cache import cache
from urllib.parse import quote
from random import randint

# 随机生成8位数暗号
def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    # 设定appid，返回重定向目标，请求数据类型，生成暗号
    appid = "2810"
    redirect_uri = quote("https://app2810.acapp.acwing.com.cn/settings/acwing/web/receive_code/")   # quote可以对参数中部分歧义符号进行处理
    scope = "userinfo"

    state = get_state()
    cache.set(state, True, 7200)    # 只保存2小时，节省空间

    aurl = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"
    return JsonResponse({
        'result' : "success",
        'apply_code_url' : aurl + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
    })
    # 返回带参数的url，在前端跳转界面