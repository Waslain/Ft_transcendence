from django.urls import path, include
from users import views

urlpatterns = [
	path('get/<str:username>/', views.GetUserView.as_view()),
	path('updateUser/', views.UpdateUserView.as_view()),
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
	path('login42/', views.Login42View.as_view()),
	path('client_id/', views.Get42ClientIdView.as_view()),
]
