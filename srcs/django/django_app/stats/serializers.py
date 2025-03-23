from rest_framework import serializers
from .models import Stats

class StatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stats
        fields = ['wins', 'losses', 'goals_scored', 'goals_taken', 'play_time']
