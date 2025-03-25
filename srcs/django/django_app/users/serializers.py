from rest_framework import serializers
from users.models import User
from stats.models import Stats

class ImageSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'avatar']
		

class UserSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True)
	avatar = serializers.ImageField(required=False)

	class Meta:
		model = User
		fields = ['id', 'username', 'password', 'avatar']

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
