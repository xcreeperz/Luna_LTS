from django.urls import path, include
from game.views.index import index

urlpatterns = [
    path("", index, name = "index"),
    path("menu/", include('game.urls.menu.index')),
    path("play/", include('game.urls.play.index')),
    path("settings/", include('game.urls.settings.index')),
    path("mgc/", include('game.urls.mgc.index')),
]