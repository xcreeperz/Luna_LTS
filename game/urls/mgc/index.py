from django.urls import path
from game.views.mgc.index import index, play

urlpatterns = [
    path("", index, name = "idx"), 
    path("play/", play, name = "ply")
]