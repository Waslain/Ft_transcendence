from rest_framework.authentication import TokenAuthentication

class CustomAuthentication(TokenAuthentication):
	def authenticate(self, request):
		if 'auth_token' in request.COOKIES and 'HTTP_AUTHORIZATION' not in request.META:
			return self.authenticate_credentials(request.COOKIES.get('auth_token'))
		return super().authenticate(request)
