from django.db import models
from django.conf import settings

class Stats(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    goals_scored = models.IntegerField(default=0)
    goals_taken = models.IntegerField(default=0)
    play_time = models.IntegerField(default=0)

    def __str__(self):
        return f"Stats for {self.user.username}"