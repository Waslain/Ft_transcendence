from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from users.models import User
from rest_framework import viewsets
from rest_framework import generics, permissions
from .models import Stats
from .serializers import StatsSerializer

'''
@api_view(['GET'])
def get_stats(request, userid):
	try:
		user1 = User.objects.get(id=userid)
	except User.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)
	stats = Stats.objects.filter(user=user1)
	stats_data = list(stats.values())
	return JsonResponse(stats_data, safe=False)
'''

class getStatsView(generics.RetrieveAPIView):
	serializer_class = StatsSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, username):
		try:
			user = User.objects.get(username=username)
		except:
			return Response({"message":"User doesn't exist"}, status=status.HTTP_404_NOT_FOUND)
		stats = Stats.objects.get(user=user)
		serializer = StatsSerializer(stats)
		return Response(serializer.data)
