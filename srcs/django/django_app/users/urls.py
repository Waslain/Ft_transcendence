from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users import views

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('images', views.ImageViewSet, basename='image')

urlpatterns = [
	path('', include(router.urls)),
	path('get/<str:username>/', views.GetUserView.as_view()),
	path('updateUser/', views.UpdateAvatarView.as_view()),
	path('register/', views.RegisterView.as_view()),
	path('login/', views.LoginView.as_view()),
	path('logout/', views.LogoutView.as_view()),
	path('check-auth/', views.SessionView.as_view()),
	path('friends/add/', views.AddFriendView.as_view()),
	path('friends/remove/', views.RemoveFriendView.as_view()),
	path('friends/check/', views.CheckFriendView.as_view()),
	path('friends/list/', views.FriendsListView.as_view()),
	path('block/add/', views.AddBlockView.as_view()),
	path('block/remove/', views.RemoveBlockView.as_view()),
	path('block/list/', views.BlockListView.as_view()),
	path('online/', views.get_online_users, name='online_users'),
]
