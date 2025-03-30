from django.urls import path, include
from rest_framework.routers import DefaultRouter
from stats import views

urlpatterns = [
    path('<str:username>/', views.getStatsView.as_view()),
]
