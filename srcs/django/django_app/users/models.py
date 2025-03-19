from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField

class User(AbstractUser):
    friends = ArrayField(
        models.IntegerField(),
        blank=True,
        default=list,
        help_text='List of user IDs representing friends'
    )