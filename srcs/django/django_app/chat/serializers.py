from rest_framework import serializers
from .models import Message
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(source='by', read_only=True)
    receiver = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'sender', 'receiver', 'user', 'by']
        read_only_fields = ['id', 'timestamp']