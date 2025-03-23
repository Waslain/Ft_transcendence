from django.contrib.auth import authenticate
from rest_framework import viewsets, generics, status, permissions
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from users.serializers import UserSerializer
from users.models import User
from rest_framework.decorators import api_view


class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	# permission_classes = [permissions.IsAuthenticated]


class RegisterView(generics.CreateAPIView):
	serializer_class = UserSerializer
	permission_classes = [permissions.AllowAny]
	authentication_classes = []

	def create(self, request):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		self.perform_create(serializer)
		headers = self.get_success_headers(serializer.data)
		user = authenticate(
			username=request.data['username'],
			password=request.data['password']
		)
		token, created = Token.objects.get_or_create(user=user)
		response = Response({
			'message': 'User created successfully',
			'username': user.username},
			status=status.HTTP_201_CREATED,
			headers=headers
		)
		response.set_cookie(
			key = 'auth_token',
			value = token.key,
			secure = True,
			httponly = True,
			samesite = 'Lax'
		)
		return response


class LoginView(APIView):
	permission_classes = [permissions.AllowAny]
	authentication_classes = []

	def post(self, request):
		if 'username' not in request.data or 'password' not in request.data:
			return Response({'message':'Username and Password must be set'}, status=400)
		user = authenticate(
			username=request.data['username'],
			password=request.data['password']
		)
		if user is None:
			return Response({'message':'Invalid username or password'}, status=401)
		token, created = Token.objects.get_or_create(user=user)
		response = Response({
			'message': 'Successfully logged in',
			'username': user.username
		})
		response.set_cookie(
			key = 'auth_token',
			value = token.key,
			secure = True,
			httponly = True,
			samesite = 'Lax'
		)
		return response


class LogoutView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		response = Response({'message': 'Successfully logged out'})
		response.set_cookie(
			key = 'auth_token',
			value = '',
			max_age = -1,
			secure = True,
			httponly = True,
			samesite = 'Lax'
		)
		return response


class SessionView(APIView):
	permission_classes = [permissions.AllowAny]

	def get(self, request):
		if (request.user.is_authenticated):
			return Response({'IsAuthenticated': True})
		return Response({'IsAuthenticated': False})


@api_view(['GET'])
def mutual_friends(request, user_id_1, user_id_2):
	try:
		user1 = User.objects.get(id=user_id_1)
		user2 = User.objects.get(id=user_id_2)
	except User.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	are_mutual_friends = user_id_2 in user1.friends and user_id_1 in user2.friends
	return Response({'are_mutual_friends': are_mutual_friends}, status=status.HTTP_200_OK)


@api_view(['POST'])
def add_friend(request, user_id_1, user_id_2):
	try:
		user1 = User.objects.get(id=user_id_1)
		user2 = User.objects.get(id=user_id_2)
	except User.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	if user_id_2 not in user1.friends:
		user1.friends.append(user_id_2)
		user1.save()
		return Response({'status': 'friend added'}, status=status.HTTP_200_OK)
	else:
		return Response({'status': 'friend already in list'}, status=status.HTTP_400_BAD_REQUEST)
