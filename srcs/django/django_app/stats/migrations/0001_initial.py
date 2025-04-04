# Generated by Django 5.1.3 on 2025-03-24 19:17

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Stats',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('wins', models.IntegerField(default=0)),
                ('losses', models.IntegerField(default=0)),
                ('goals_scored', models.IntegerField(default=0)),
                ('goals_taken', models.IntegerField(default=0)),
                ('play_time', models.IntegerField(default=0)),
            ],
        ),
    ]
