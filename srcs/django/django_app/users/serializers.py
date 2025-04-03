from rest_framework import serializers
from users.models import User
from stats.models import Stats

class ImageSerializer(serializers.ModelSerializer):
	avatar = serializers.ImageField(required=False, allow_null=True)
	language = serializers.CharField(required=False, allow_null=True)
	image_set = serializers.BooleanField(write_only=True);

	class Meta:
		model = User
		fields = ['id', 'avatar', 'language', 'image_set']

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
		instance.save();
		return instance


class UserSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True)
	avatar = serializers.ImageField(required=False)
	is_online = serializers.ReadOnlyField()

	class Meta:
		model = User
		fields = ['id', 'username', 'password', 'avatar', 'is_online']

	def validate_username(self, value):
		if len(value) > 20:
			raise serializers.ValidationError("Username can't be longer than 20 characters")
		return value
	
	def validate_password(self, value):
		if len(value) > 20:
			raise serializers.ValidationError("Password can't be longer than 20 characters")
		return value

	def create(self, validated_data):
		user = User.objects.create_user(**validated_data)
		user.set_password(validated_data['password'])
		user.stats = Stats.objects.create(user=user);
		user.password_set = True
		user.save()
		return user
		

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
