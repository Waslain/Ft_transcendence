from django.shortcuts import render
from rest_framework import generics
from .models import Message
from .serializers import MessageSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# def room(request, room_name):
#     return render(request, 'chat/room.html', {
#         'room_name': room_name
#     })

class MessageListCreate(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def perform_create(self, serializer):
        message = serializer.save()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'chat_{message.room_name}',
            {
                'type': 'chat_message',
                'message': message.content
            }
        )

def index(request):
    return JsonResponse({"message": "Chat API endpoint"})