from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
from .models import MatchHistory
from django.contrib.auth.models import User
# Create your views here.
@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def add_match(request):
	try:
		data = json.loads(request.body)
		
		# Extract data from request
		usera_id = data.get('usera_id')
		userb_id = data.get('userb_id')
		usera_score = data.get('usera_score', 0)
		userb_score = data.get('userb_score', 0)
		game_time = data.get('game_time', 0)
		
		# Validate data
		if not usera_id or not userb_id:
			return JsonResponse({'status': 'error', 'message': 'Missing usera_id or userb_id'}, status=400)
		
		# Get user objects
		try:
			usera = User.objects.get(id=usera_id)
			userb = User.objects.get(id=userb_id)
		except User.DoesNotExist:
			return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
		
		# Create match history entry
		match = MatchHistory.objects.create(
			user_a=usera,
			user_b=userb,
			score_a=usera_score,
			score_b=userb_score
			game_time=game_time
		)
		
		return JsonResponse({'status': 'success', 'match_id': match.id}, status=201)
		
	except json.JSONDecodeError:
		return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
	except Exception as e:
		return JsonResponse({'status': 'error', 'message': str(e)}, status=500)