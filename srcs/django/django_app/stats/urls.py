from django.urls import path, include
from rest_framework.routers import DefaultRouter
from stats import views

router = DefaultRouter()
router.register(r'stats', views.StatsViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('<str:username>/', views.getStatsView.as_view()),
]
