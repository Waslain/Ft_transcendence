from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.core.cache import cache
from django.utils import timezone

'''
def upload_to(instance, filename):
	return 'images/{filename}'.format(filename=filename)
'''

class User(AbstractUser):
	friends = ArrayField(
		models.IntegerField(),
		blank=True,
		default=list,
		help_text='List of user IDs representing friends'
	)
	blocked_users = ArrayField(
		models.IntegerField(),
		blank=True,
		default=list,
		help_text='List of user IDs representing blocked users'
	)
	avatar = models.ImageField(upload_to='images/', blank=True, null=True)
	def update_online_status(self):
		#Update user's online status in cache
		cache.set(f'user_{self.id}_last_activity', timezone.now(), 300)  # Store for 5 minutes
	
	@property
	def is_online(self):
		#Check if user is considered online (active in the last 5 minutes)
		return cache.get(f'user_{self.id}_last_activity') is not None
