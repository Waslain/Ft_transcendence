from rest_framework.authtoken.models import Token
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
import re

@database_sync_to_async
def get_user(token_key):
	try:
		return Token.objects.get(key=token_key).user
	except Token.DoesNotExist:
		return AnonymousUser()

class TokenAuthMiddleware:
	def __init__(self, inner):
		self.inner = inner
	
	async def __call__(self, scope, receive, send):
		scope = dict(scope)
		headers = dict(scope["headers"])
		if b'auth_token' in headers[b'cookie']:
			cookies = headers[b'cookie'].decode()
			token_key = re.search("auth_token=(.*)(; )?", cookies).group(1)
			if token_key:
				scope["user"] = await get_user(token_key)
		return await self.inner(scope, receive, send)


TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))

class UserActivityMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		response = self.get_response(request)
		
		# Update last_activity if user is authenticated
		if request.user.is_authenticated:
			request.user.update_online_status()
			
		return response