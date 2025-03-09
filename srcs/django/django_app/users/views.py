from django.contrib.auth import authenticate
from rest_framework import viewsets, generics, status, permissions
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from users.serializers import UserSerializer
from users.models import User


class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer

class RegisterUserAPIView(generics.CreateAPIView):
	serializer_class = UserSerializer
	permission_classes = [permissions.AllowAny]

class LoginUserAPIView(APIView):
	permission_classes = [permissions.AllowAny]
	def post(self, request):
		user = authenticate(
			username=request.data['username'],
			password=request.data['password']
		)
		if user:
			token, created = Token.objects.get_or_create(user=user)
			return Response(
				{'token': [token.key]},
				status=status.HTTP_201_CREATED
			)
		return Response({
			'Message':'Invalid Username or Password'},
			status=401)
