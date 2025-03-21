from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'api', views.ChatViewSet, basename='chat')

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Chat UI endpoints
    path('', views.chat_index, name='chat_index'),
    path('conversation/<int:recipient_id>/', views.chat_view, name='chat_conversation'),
]