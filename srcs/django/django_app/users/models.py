from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField

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
	avatar = models.ImageField(upload_to='images/', blank=True, null=True)
