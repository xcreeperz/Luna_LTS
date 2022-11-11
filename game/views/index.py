from django.shortcuts import render

def index(request):
    return render(request, "multi_terminal/web.html")