from django.db import models
from django.contrib.auth.models import User

class Player(models.Model):
    photo = models.URLField(max_length = 256, blank = True)
    user = models.OneToOneField(User, on_delete = models.CASCADE)
    # blank 表单是否可空 null 空值是否设为None/NULL存进数据库(否则存默认值)
    openid = models.CharField(default="", max_length=50, blank=True, null=True)

    def __str__(self):
        return str(self.user)