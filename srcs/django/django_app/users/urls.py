from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
	path('', include(router.urls)),
	path('register/', views.RegisterUserAPIView.as_view()),
	path('login/', views.LoginUserAPIView.as_view()),
]
