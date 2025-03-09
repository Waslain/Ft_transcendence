from django.urls import path
from . import views

urlpatterns = [
    path('<str:room_name>/', views.room, name='room'),
	path('api/messages/', views.MessageListCreate.as_view(), name='message-list-create'),
]