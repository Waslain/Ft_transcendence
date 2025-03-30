from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
from .models import MatchHistory
from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework import serializers, viewsets
from rest_framework.response import Response
from django.db.models import Count, Q, F, ExpressionWrapper, IntegerField, Sum
from django.db.models.functions import Coalesce
from collections import defaultdict

# Serializer for user statistics
class UserStatsSerializer(serializers.Serializer):
	user_id = serializers.IntegerField()
	username = serializers.CharField()
	matches_played = serializers.IntegerField()
	matches_won = serializers.IntegerField()
	win_rate = serializers.FloatField()
	total_points = serializers.IntegerField()
	avg_points_per_match = serializers.FloatField()

# ViewSet for user statistics
class StatsViewSet(viewsets.ViewSet):
	permission_classes = [IsAuthenticated]
	
	def list(self, request):
		users = User.objects.all()
		stats = []
		
		for user in users:
			# Get matches where user participated
			user_matches = MatchHistory.objects.filter(Q(user_a=user) | Q(user_b=user))
			matches_count = user_matches.count()
			
			if matches_count > 0:
				# Calculate wins
				wins_as_a = user_matches.filter(user_a=user, score_a__gt=F('score_b')).count()
				wins_as_b = user_matches.filter(user_b=user, score_b__gt=F('score_a')).count()
				total_wins = wins_as_a + wins_as_b
				
				# Calculate points
				points_as_a = user_matches.filter(user_a=user).aggregate(sum=Coalesce(sum('score_a'), 0))['sum'] or 0
				points_as_b = user_matches.filter(user_b=user).aggregate(sum=Coalesce(sum('score_b'), 0))['sum'] or 0
				total_points = points_as_a + points_as_b
				
				win_rate = (total_wins / matches_count) * 100 if matches_count > 0 else 0
				avg_points = total_points / matches_count if matches_count > 0 else 0
				
				stats.append({
					'user_id': user.id,
					'username': user.username,
					'matches_played': matches_count,
					'matches_won': total_wins,
					'win_rate': round(win_rate, 2),
					'total_points': total_points,
					'avg_points_per_match': round(avg_points, 2)
				})
		
		serializer = UserStatsSerializer(stats, many=True)
		return Response(serializer.data)
	
	def retrieve(self, request, pk=None):
		try:
			user = User.objects.get(pk=pk)
			
			# Get matches where user participated
			user_matches = MatchHistory.objects.filter(Q(user_a=user) | Q(user_b=user))
			matches_count = user_matches.count()
			
			if matches_count == 0:
				stats = {
					'user_id': user.id,
					'username': user.username,
					'matches_played': 0,
					'matches_won': 0,
					'win_rate': 0,
					'total_points': 0,
					'avg_points_per_match': 0
				}
			else:
				# Calculate wins
				wins_as_a = user_matches.filter(user_a=user, score_a__gt=F('score_b')).count()
				wins_as_b = user_matches.filter(user_b=user, score_b__gt=F('score_a')).count()
				total_wins = wins_as_a + wins_as_b
				
				# Calculate points
				points_as_a = user_matches.filter(user_a=user).aggregate(sum=Coalesce(sum('score_a'), 0))['sum'] or 0
				points_as_b = user_matches.filter(user_b=user).aggregate(sum=Coalesce(sum('score_b'), 0))['sum'] or 0
				total_points = points_as_a + points_as_b
				
				win_rate = (total_wins / matches_count) * 100
				avg_points = total_points / matches_count
				
				stats = {
					'user_id': user.id,
					'username': user.username,
					'matches_played': matches_count,
					'matches_won': total_wins,
					'win_rate': round(win_rate, 2),
					'total_points': total_points,
					'avg_points_per_match': round(avg_points, 2)
				}
			
			serializer = UserStatsSerializer(stats)
			return Response(serializer.data)
			
		except User.DoesNotExist:
			return Response({'error': 'User not found'}, status=404)

# Create your views here.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_list(request):
	try:
		# Get user's matches (either as user_a or user_b)
		user = request.user
		matches = MatchHistory.objects.filter(user_a=user) | MatchHistory.objects.filter(user_b=user)
		
		# Order by most recent
		# matches = matches.order_by('-timestamp')
		matches = matches.order_by('id')
		
		# Prepare data for response
		match_data = []
		for match in matches:
			match_data.append({
				'id': match.id,
				'user_a': match.user_a.username,
				'user_b': match.user_b.username,
				'score_a': match.score_a,
				'score_b': match.score_b,
				'game_time': match.game_time,
				# 'timestamp': match.timestamp.isoformat(),
				# 'winner': match.user_a.username if match.score_a > match.score_b else match.user_b.username
			})
		
		return JsonResponse({'status': 'success', 'matches': match_data})
	except Exception as e:
		return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def add_match(request):
	import logging
	logger = logging.getLogger(__name__)
	try:
		logger.info(f"add_match called with data: {request.body}")
		data = json.loads(request.body)
		
		# Extract data from request
		usera_id = data.get('usera_id')
		userb_id = data.get('userb_id')
		usera_score = data.get('usera_score', 0)
		userb_score = data.get('userb_score', 0)
		game_time_seconds = data.get('game_time', 0)
		logger.info(f"Extracted data: user_a={usera_id}, user_b={userb_id}, score_a={usera_score}, score_b={userb_score}, time={game_time_seconds}")

		# Convert game_time to proper interval format
		from datetime import timedelta
		game_time = timedelta(seconds=game_time_seconds)
		
		# Validate data
		if not usera_id or not userb_id:
			return JsonResponse({'status': 'error', 'message': 'Missing usera_id or userb_id'}, status=400)
		
		# Get user objects
		try:
			usera = User.objects.get(id=usera_id)
			userb = User.objects.get(id=userb_id)
			logger.info(f"Found users: {usera.username} (ID: {usera.id}), {userb.username} (ID: {userb.id})")
		except User.DoesNotExist:
			logger.error(f"User not found: usera_id={usera_id}, userb_id={userb_id}")
			return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
		
		# Create match history entry
		match = MatchHistory.objects.create(
			user_a=usera,
			user_b=userb,
			score_a=usera_score,
			score_b=userb_score,
			game_time=game_time
		)
		logger.info(f"Created match with ID: {match.id}")
		
		# Update user statistics based on match result
		try:
			from stats.models import Stats
			logger.info("Stats module imported successfully")
			
			# Get or create stats objects for both users
			stats_a, created_a = Stats.objects.get_or_create(user=usera)
			stats_b, created_b = Stats.objects.get_or_create(user=userb)
			logger.info(f"Stats objects: A (created={created_a}), B (created={created_b})")

			logger.info(f"Initial stats A: wins={stats_a.wins}, losses={stats_a.losses}")
			logger.info(f"Initial stats B: wins={stats_b.wins}, losses={stats_b.losses}")
			# Determine winner and loser
			if usera_score > userb_score:
				# User A won
				stats_a.wins += 1
				stats_b.losses += 1
				logger.info("User A won")
			elif userb_score > usera_score:
				# User B won
				stats_b.wins += 1
				stats_a.losses += 1
				logger.info("User B won")
			# If it's a tie, no wins/losses are updated
			
			# Update goals
			stats_a.goals_scored += usera_score
			stats_a.goals_taken += userb_score
			stats_b.goals_scored += userb_score
			stats_b.goals_taken += usera_score
			
			# Update play time (in seconds)
			stats_a.play_time += game_time_seconds
			stats_b.play_time += game_time_seconds
			
			# Save the updated stats
			stats_a.save()
			stats_b.save()
			logger.info(f"Updated stats A: wins={stats_a.wins}, losses={stats_a.losses}")
			logger.info(f"Updated stats B: wins={stats_b.wins}, losses={stats_b.losses}")
		except Exception as stats_error:
			logger.error(f"Error updating stats: {str(stats_error)}")
			import traceback
			logger.error(traceback.format_exc())
		return JsonResponse({'status': 'success', 'match_id': match.id}, status=201)
		
	except json.JSONDecodeError:
		return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
	except Exception as e:
		return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

def create_match_record(usera_id, userb_id, usera_score, userb_score, game_time_seconds):
	# Create a match record and update stats - for direct calls from other Django code
	# Returns the created match object or None on failure
	import logging
	logger = logging.getLogger(__name__)
	
	try:
		# Convert game_time to proper interval format
		from datetime import timedelta
		if isinstance(game_time_seconds, timedelta):
			game_time = game_time_seconds
			# Extract seconds for stats
			game_time_seconds_int = game_time_seconds.total_seconds()
		else:
			# It's a number, create a timedelta
			game_time = timedelta(seconds=game_time_seconds)
			game_time_seconds_int = game_time_seconds
		
		# Get user objects
		try:
			usera = User.objects.get(id=usera_id)
			userb = User.objects.get(id=userb_id)
		except User.DoesNotExist:
			logger.error(f"User not found: usera_id={usera_id}, userb_id={userb_id}")
			return None
		
		# Create match history entry
		match = MatchHistory.objects.create(
			user_a=usera,
			user_b=userb,
			score_a=usera_score,
			score_b=userb_score,
			game_time=game_time
		)
		
		# Update user statistics based on match result
		try:
			from stats.models import Stats
			
			# Get or create stats objects for both users
			stats_a, created_a = Stats.objects.get_or_create(user=usera)
			stats_b, created_b = Stats.objects.get_or_create(user=userb)
			
			# Determine winner and loser
			if usera_score > userb_score:
				# User A won
				stats_a.wins += 1
				stats_b.losses += 1
			elif userb_score > usera_score:
				# User B won
				stats_b.wins += 1
				stats_a.losses += 1
			# If it's a tie, no wins/losses are updated
			
			# Update goals
			stats_a.goals_scored += usera_score
			stats_a.goals_taken += userb_score
			stats_b.goals_scored += userb_score
			stats_b.goals_taken += usera_score
			
			# Update play time (in seconds)
			stats_a.play_time += int(game_time_seconds_int)
			stats_b.play_time += int(game_time_seconds_int)
			
			# Save the updated stats
			stats_a.save()
			stats_b.save()
			
			return match
		except Exception as stats_error:
			logger.error(f"Error updating stats: {str(stats_error)}")
			import traceback
			logger.error(traceback.format_exc())
			return match  # Still return the match even if stats update fails
	
	except Exception as e:
		logger.error(f"Error creating match: {str(e)}")
		import traceback
		logger.error(traceback.format_exc())
		return None