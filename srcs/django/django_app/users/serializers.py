from rest_framework import serializers
from users.models import User
from stats.models import Stats

class ImageSerializer(serializers.ModelSerializer):
	avatar = serializers.ImageField(required=False, allow_null=True)

	class Meta:
		model = User
		fields = ['id', 'avatar']

		def update(self, instance, validated_data):
			value = validated_data.get('avatar');
			if (value):
				setattr(instance, 'avatar', value)
			else:
				setattr(instance, 'avatar', None)


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
