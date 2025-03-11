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

	def create(self, request):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		self.perform_create(serializer)
		headers = self.get_success_headers(serializer.data)
		return Response({
			'message':'User created successfully'},
			status=status.HTTP_201_CREATED,
			headers=headers
		)

class LoginUserAPIView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		user = authenticate(
			username=request.data['username'],
			password=request.data['password']
		)
		if user:
			token, created = Token.objects.get_or_create(user=user)
			return Response({
				'message':'User logged successfully',
				'token': [token.key]},
				status=status.HTTP_201_CREATED
			)
		return Response({
			'message':'Invalid Username or Password'},
			status=401)
