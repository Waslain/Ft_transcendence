# Generated by Django 5.1.3 on 2025-04-03 20:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_user_login_42'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='auth_token_42',
        ),
    ]
