from rest_framework import serializers
from users.models import User
from stats.models import Stats
from urllib.request import urlopen
from django.core.files import File
from django.core.files.temp import NamedTemporaryFile
import requests
import json

class ImageSerializer(serializers.ModelSerializer):
	avatar = serializers.ImageField(required=False, allow_null=True)
	language = serializers.CharField(required=False, allow_null=True)
	image_set = serializers.BooleanField(write_only=True);
	password = serializers.CharField(write_only=True, required = False)

	class Meta:
		model = User
		fields = ['id', 'avatar', 'language', 'image_set', 'password']

	def validate_password(self, value):
		if len(value) > 20:
			raise serializers.ValidationError("Password can't be longer than 20 characters")
		return value

	def update(self, instance, validated_data):
		avatar = validated_data.get('avatar');
		image_set = validated_data.get('image_set');
		if image_set is True:
			if (avatar):
				setattr(instance, 'avatar', avatar)
			else:
				setattr(instance, 'avatar', None)

		language = validated_data.get('language');
		if (language):
			setattr(instance, 'language', language)

		password = validated_data.get('password');
		if (password):
			instance.set_password(password)
			instance.password_set = True

		instance.save();
		return instance


class UserSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True)
	avatar = serializers.ImageField(required=False)
	is_online = serializers.ReadOnlyField()
	avatarUrl = serializers.CharField(write_only=True, required=False)
	login_42 = serializers.CharField(read_only=True)

	class Meta:
		model = User
		fields = ['id', 'username', 'password', 'avatar', 'is_online', 'avatarUrl', 'login_42']

	def validate_username(self, value):
		if len(value) > 20:
			raise serializers.ValidationError("Username can't be longer than 20 characters")
		return value
	
	def validate_password(self, value):
		if len(value) > 20:
			raise serializers.ValidationError("Password can't be longer than 20 characters")
		return value

	def validate_login_42(self, value):
		try:
			user = user.Objects.get(login_42=value)
		except:
			user = None
		if user is not None:
			raise serializers.ValidationError("A user is already associated to this 42 account")
		return value

	def create(self, auth_token_42, **kwargs):
		validated_data = {**self.validated_data, **kwargs}
		user = User.objects.create_user(
			username=validated_data.get('username'),
			password=validated_data.get('password')
		)

		avatar = validated_data.get('avatar')
		avatarUrl = validated_data.get('avatarUrl')
		if auth_token_42 is not None:
			try:
				r = requests.get("https://api.intra.42.fr/v2/me", headers={
					"Authorization":"Bearer " + auth_token_42
				})
			except:
				pass;
			data = json.loads(r.text)
			if 'error' in data:
				user.destroy()
				return Response({"message":"Call to the 42 API failed"}, status=401)

			# check if a user is already associated with this login
			try:
				testUser = User.objects.get(login_42=data['login'])
			except:
				testUser = None
			if testUser is not None:
				user.destroy()
				return Response({"message": "Couldn't create user: another user is already linked to this 42 account" }, status=401)
			user.login_42 = data['login']
		else:
			user.password_set = True

		if avatar is not None:
			user.avatar = avatar
		elif avatarUrl is not None:
			img_tmp = NamedTemporaryFile(delete=True)
			img_tmp.write(urlopen(avatarUrl).read())
			img_tmp.flush()
			user.avatar.save(f"image_{user.username}", File(img_tmp))

		user.set_password(validated_data['password'])
		user.stats = Stats.objects.create(user=user);
		user.save()
		return None
		

class FriendsSerializer(serializers.ModelSerializer):
	username = serializers.CharField(write_only=True)
	friends = UserSerializer(read_only=True, many=True)

	class Meta:
		model = User
		fields = ['id', 'friends', 'username']


class BlockSerializer(serializers.ModelSerializer):
	username = serializers.CharField(write_only=True)
	blocked = UserSerializer(read_only=True, many=True)

	class Meta:
		model = User
		fields = ['id', 'blocked', 'username']
