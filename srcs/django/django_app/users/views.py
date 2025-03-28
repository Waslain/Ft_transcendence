from django.contrib.auth import authenticate
from rest_framework import viewsets, generics, status, permissions
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication
from users.serializers import UserSerializer, ImageSerializer, FriendsSerializer
from users.models import User
from rest_framework.decorators import api_view
from django.core.cache import cache
import logging
logger = logging.getLogger('users')

class ImageViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	serializer_class = ImageSerializer
	permission_classes = [permissions.AllowAny]

class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	serializer_class = UserSerializer
	# permission_classes = [permissions.IsAuthenticated]


class GetUserView(generics.RetrieveAPIView):
	serializer_class = UserSerializer
	#permission_classes = [permissions.IsAuthenticated]

	def get(self, request, username):
		try:
			user = User.objects.get(username=username)
		except:
			return Response({"message":"User doesn't exist"}, status=status.HTTP_404_NOT_FOUND)
		serializer = UserSerializer(user)
		return Response(serializer.data)


class UpdateAvatarView(generics.UpdateAPIView):
	serializer_class = ImageSerializer
	permission_classes = [permissions.IsAuthenticated]

	def update(self, request, *args, **kwargs):
		token_key = request.COOKIES['auth_token']
		instance = Token.objects.get(key=token_key).user
		serializer = self.get_serializer(instance, data=request.data)
		serializer.is_valid(raise_exception=True)
		self.perform_update(serializer)
		response = Response({
			'message': 'Successfully updated user',
			'username': instance.username,
		})
		if instance.avatar:
			response.data['avatar'] = instance.avatar.url
		return response

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
			'message': 'Successfully created user',
			'username': user.username,
		},
			status=status.HTTP_201_CREATED,
			headers=headers
		)
		if user.avatar:
			response.data['avatar'] = user.avatar.url
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
		else:
			user.update_online_status()
		token, created = Token.objects.get_or_create(user=user)
		response = Response({
			'message': 'Successfully logged in',
			'username': user.username,
		})
		if user.avatar:
			response.data['avatar'] = user.avatar.url
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
		if request.user.is_authenticated:
			cache.delete(f'user_{request.user.id}_last_activity')
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


class AddFriendView(generics.UpdateAPIView):
	serializer_class = FriendsSerializer;
	permission_classes = [permissions.IsAuthenticated]

	def update(self, request, *args, **kwargs):
		token_key = request.COOKIES['auth_token']
		user = Token.objects.get(key=token_key).user
		
		if 'username' not in request.data:
			return Response({'message':'Must provide a username'}, status=400)

		friend = User.objects.get(username=request.data['username']);
		if friend is None:
			return Response({'message':'User does not exist'}, status=400)
		user.friends.add(friend);
		response = Response({
			'message': 'Friend added',
		})
		return response


class RemoveFriendView(generics.UpdateAPIView):
	serializer_class = FriendsSerializer;
	permission_classes = [permissions.IsAuthenticated]

	def update(self, request, *args, **kwargs):
		token_key = request.COOKIES['auth_token']
		user = Token.objects.get(key=token_key).user
		
		if 'username' not in request.data:
			return Response({'message':'Must provide a username'}, status=400)

		friend = User.objects.get(username=request.data['username']);
		if friend is None:
			return Response({'message':'User does not exist'}, status=400)
		user.friends.remove(friend);
		response = Response({
			'message': 'Friend removed',
		})
		return response


class FriendsListView(generics.RetrieveAPIView):
	serializer_class = FriendsSerializer;
	#permission_classes = [permissions.IsAuthenticated]
		
	def get(self, request, username):
		try:
			user = User.objects.get(username=username)
		except:
			return Response({"message":"User doesn't exist"}, status=status.HTTP_404_NOT_FOUND)
		serializer = FriendsSerializer(user)
		return Response(serializer.data)


class CheckFriendView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		token_key = request.COOKIES['auth_token']
		user = Token.objects.get(key=token_key).user
		
		if 'username' not in request.data:
			return Response({'message':'Must provide a username'}, status=400)

		if user.friends.filter(username=request.data['username']).exists():
			return Response({"is_friend": True})
		return Response({"is_friend": False})

'''
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
'''

@api_view(['POST'])
def block_user_by_id(request, user_id_1, user_id_2):
	try:
		user1 = User.objects.get(id=user_id_1)
		user2 = User.objects.get(id=user_id_2)
	except User.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)

	if user_id_2 not in user1.blocked_users:
		user1.blocked_users.append(user_id_2)
		user1.save()
		return Response({'status': 'user blocked'}, status=status.HTTP_200_OK)
	else:
		return Response({'status': 'user already blocked'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def block_user(request, username):
	user = request.user
	try:
		user_to_block = User.objects.get(username=username)
	except User.DoesNotExist:
		return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
	
	if user_to_block.id not in user.blocked_users:
		user.blocked_users.append(user_to_block.id)
		user.save()
		return Response({'message': f'{username} has been blocked'}, status=status.HTTP_200_OK)
	else:
		return Response({'message': f'{username} is already blocked'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_blocked_users(request):
	# Returns a list of user IDs that the current user has blocked
	user = request.user
	
	if user.is_authenticated:
		# Return just the list of blocked user IDs
		return Response(user.blocked_users)
	else:
		return Response([], status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def get_online_users(request):
	logger.debug("Getting online users using cache-based tracking")
	users = User.objects.exclude(id=request.user.id)
	
	online_users = []
	for user in users:
		# Check if user is online using the cache
		if user.is_online:
			online_users.append({
				'id': user.id,
				'username': user.username
			})
			logger.debug(f"Added online user {user.username} to list")
		else:
			logger.debug(f"User {user.username} is not online")
	
	return Response(online_users)
