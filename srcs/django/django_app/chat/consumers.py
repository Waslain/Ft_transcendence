import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
import datetime
from .models import Message

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		# For general chat, we'll use a fixed group name
		self.room_group_name = 'general_chat'
		self.user = self.scope['user']
		
		# Join general chat group
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		
		# Also join a personal group for private messages
		if not self.user.is_anonymous:
			self.user_group = f'user_{self.user.id}'
			await self.channel_layer.group_add(
				self.user_group,
				self.channel_name
			)
			@database_sync_to_async
			def update_user_activity():
				self.scope['user'].update_online_status()
			
			await update_user_activity()

		await self.accept()

	async def disconnect(self, close_code):
		# Leave general chat group
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)
		
		# Also leave personal group
		if not self.user.is_anonymous:
			await self.channel_layer.group_discard(
				self.user_group,
				self.channel_name
			)

	async def receive(self, text_data):
		text_data_json = json.loads(text_data)
		message_type = text_data_json.get('type', 'general_chat')
		message = text_data_json.get('message', '')
		
		# Get the current user
		user = self.scope['user']
		
		if user.is_anonymous:
			username = "Anonymous"
			user_id = None
		else:
			username = user.username
			user_id = user.id
		
		# Handle private message
		if message_type == 'private_message':
			recipient_id = text_data_json.get('recipient_id')
			
			if not recipient_id or user.is_anonymous:
				return
				
			try:
				recipient = await self.get_user_by_id(recipient_id)
				recipient_username = recipient.username
				
				# # Save private message to database
				# if not user.is_anonymous:
				# 	await self.save_private_message(user_id, recipient_id, message)
				
				# Send to recipient's personal group
				await self.channel_layer.group_send(
					f'user_{recipient_id}',
					{
						'type': 'private_message',
						'message': message,
						'username': username,
						'sender_id': user_id,
						'recipient_id': recipient_id,
						'timestamp': str(datetime.datetime.now())
					}
				)
				
				# Send confirmation to sender (so they see their message)
				if not user.is_anonymous:
					await self.send(text_data=json.dumps({
						'message': {
							'message': message,
							'username': username,
							'recipient_username': recipient_username,
							'is_private': True,
							'is_own': True,
							'timestamp': str(datetime.datetime.now())
						}
					}))
			except User.DoesNotExist:
				# User not found
				pass
				
		# Handle general chat
		else:
			# Send message to general chat group
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'chat_message',
					'message': message,
					'username': username,
					'timestamp': str(datetime.datetime.now()),
					'user_id': user_id
				}
			)

	async def chat_message(self, event):
		# Extract message data
		message = event['message']
		username = event.get('username', 'Anonymous')
		timestamp = event.get('timestamp', str(datetime.datetime.now()))
		user_id = event.get('user_id')
		
		# Check if this is the user's own message
		current_user_id = self.scope['user'].id if not self.scope['user'].is_anonymous else None
		is_own = user_id == current_user_id
		
		# Send message to WebSocket
		await self.send(text_data=json.dumps({
			'message': {
				'message': message,
				'username': username,
				'timestamp': timestamp,
				'is_private': False,
				'is_own': is_own
			}
		}))
		
	async def private_message(self, event):
		# Extract message data
		message = event['message']
		username = event.get('username', 'Anonymous')
		timestamp = event.get('timestamp', str(datetime.datetime.now()))
		sender_id = event.get('sender_id')
		
		# Send private message to WebSocket
		await self.send(text_data=json.dumps({
			'message': {
				'message': message,
				'username': username,
				'timestamp': timestamp,
				'is_private': True,
				'is_own': False,
				'sender_id': sender_id
			}
		}))

	async def get_user_by_id(self, user_id):
		from django.contrib.auth import get_user_model
		User = get_user_model()
		
		# We need to run database queries in a thread
		from channels.db import database_sync_to_async
		
		@database_sync_to_async
		def get_user(uid):
			try:
				return User.objects.get(id=uid)
			except User.DoesNotExist:
				return None
		
		return await get_user(user_id)