from rest_framework import serializers
from users.models import User

class UserSerializer(serializers.HyperlinkedModelSerializer):
	password = serializers.CharField(write_only=True)

	class Meta:
		model = User
		fields = ['url', 'id', 'username', 'password', 'friends']

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
		user.save()
		return user
