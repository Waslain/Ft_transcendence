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
		if 'username' not in request.data or 'password' not in request.data:
			return Response({
				'Message':'Username and Password must be set'},
				status=400)
		user = authenticate(
			username=request.data['username'],
			password=request.data['password']
		)
		if user:
			token, created = Token.objects.get_or_create(user=user)
			return Response(
				{'token': token.key},
				status=status.HTTP_201_CREATED
			)
		return Response({
			'message':'Invalid Username or Password'},
			status=401)

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