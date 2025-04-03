from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.core.cache import cache
from django.utils import timezone

class User(AbstractUser):
	language = models.CharField(max_length=5, default="en");
	friends = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='is_friend');
	blocked = models.ManyToManyField('self', blank=True, symmetrical=False, related_name='is_blocked');
	avatar = models.ImageField(upload_to='images/', blank=True, null=True)
	auth_token_42 = models.CharField(max_length=64, blank=True, null=True)
	password_set = models.BooleanField(default=False)
	in_game = models.BooleanField(default=False)
	def update_online_status(self):
		#Update user's online status in cache
		cache.set(f'user_{self.id}_last_activity', timezone.now(), 300)  # Store for 5 minutes
	def remove_online_status(self):
		# Remove user's online status from cache
		cache.delete(f'user_{self.id}_last_activity')
	
	@property
	def is_online(self):
		#Check if user is considered online (active in the last 5 minutes)
		return cache.get(f'user_{self.id}_last_activity') is not None
