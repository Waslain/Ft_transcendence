from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'matchhistory'

router = DefaultRouter()
router.register(r'matchhistory', views.StatsViewSet, basename='user')

urlpatterns = [
	path('', include(router.urls)),
	path('add/', views.add_match, name='add_match'),
	path('list/', views.match_list, name='match_list'),
	# path('detail/<int:match_id>/', views.match_detail, name='match_detail'),
]