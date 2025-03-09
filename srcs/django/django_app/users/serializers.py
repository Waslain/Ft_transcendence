from rest_framework import serializers
from users.models import User

class UserSerializer(serializers.HyperlinkedModelSerializer):
	password = serializers.CharField(write_only=True)

	class Meta:
		model = User
		fields = ['url', 'id', 'username', 'password']

	def create(self, validated_data):
		user = User.objects.create_user(**validated_data)
		user.set_password(validated_data['password'])
		user.save()
		return user
