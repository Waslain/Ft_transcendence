from django.db import models
from django.conf import settings

class Message(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)  # User who receives the message
    by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='by')  # User who sent the message
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.by.username} to {self.user.username}: {self.content[:20]}"
    
    class Meta:
        ordering = ['timestamp']