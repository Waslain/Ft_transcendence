from django.db import models
from django.conf import settings

class MatchHistory(models.Model):
    id = models.BigAutoField(primary_key=True)
    user_a = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_a_matches')
    user_b = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_b_matches')
    score_a = models.IntegerField()
    score_b = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)
    game_time = models.DurationField()

    def __str__(self):
        return f"Game {self.id} between {self.user_a.username} and {self.user_b.username}"