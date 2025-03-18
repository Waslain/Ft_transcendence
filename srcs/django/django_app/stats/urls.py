from django.urls import path, include
from rest_framework.routers import DefaultRouter
from stats import views

router = DefaultRouter()
router.register(r'stats', views.StatsViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:userid>/', views.get_stats, name='get_stats'),
]