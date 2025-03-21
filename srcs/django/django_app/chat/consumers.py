import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if self.scope["user"].is_anonymous:
            # Reject the connection if user is not authenticated
            await self.close()
            return
            
        self.user = self.scope["user"]
        self.user_id = self.user.id
        
        # Create a personal group for the user to receive messages
        self.room_group_name = f"user_{self.user_id}"
        
        # Join the personal group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave the personal group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        
        recipient_id = data.get('recipient_id')
        content = data.get('content')
        
        if not recipient_id or not content:
            return
            
        # Save message to database
        message = await self.save_message(
            user_id=recipient_id,
            by_id=self.user_id,
            content=content
        )
        
        # Send message to recipient's personal group
        await self.channel_layer.group_send(
            f"user_{recipient_id}",
            {
                'type': 'chat.message',
                'message': {
                    'id': message.id,
                    'content': content,
                    'timestamp': str(message.timestamp),
                    'sender_id': self.user_id,
                    'recipient_id': recipient_id
                }
            }
        )
        
        # Also send confirmation to sender
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.message',
                'message': {
                    'id': message.id,
                    'content': content,
                    'timestamp': str(message.timestamp),
                    'sender_id': self.user_id,
                    'recipient_id': recipient_id,
                    'sent': True
                }
            }
        )
    
    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
    
    @database_sync_to_async
    def save_message(self, user_id, by_id, content):
        user = User.objects.get(id=user_id)
        by = User.objects.get(id=by_id)
        
        return Message.objects.create(
            user=user,
            by=by,
            content=content
        )