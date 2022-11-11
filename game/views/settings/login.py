from django.contrib.auth import authenticate, login
from django.http import JsonResponse

def signin(request):
    data = request.GET
    username = data.get('username')
    password = data.get('password')
    user = authenticate(username=username, password=password)   # 检查数据库(hash值)
    if not user:
        return JsonResponse({
            'result' : "用户名密码不正确",
        })
    login(request, user)    # django自带登录函数
    return JsonResponse({
        'result' : "success",
    })