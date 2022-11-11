from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    line1 = '<h1 style = "text-align: center">MGC Lunar Tech</h1>'
    line2 = '<img src = "https://mgc-1311747586.cos.ap-shanghai.myqcloud.com/rumia.jpeg" width = 1000>'
    return HttpResponse(line1 + "<hr>Hello World<br>" + line2)

def play(request):
    line1 = '<h1 style = "text-align: center">凍結的永遠之都</h1>'
    return HttpResponse(line1)
# Create your views here.
