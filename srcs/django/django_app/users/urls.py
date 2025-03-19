from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users import views

router = DefaultRouter()
router.register(r'', views.UserViewSet, basename='user')

urlpatterns = [
	path('get/', include(router.urls)),
	path('register/', views.RegisterView.as_view()),
	path('login/', views.LoginView.as_view()),
	path('logout/', views.LogoutView.as_view()),
	path('session/', views.SessionView.as_view()),
	path('friends/<int:user_id_1>/<int:user_id_2>/', views.mutual_friends, name='friends'),
	path('add-friend/<int:user_id_1>/<int:user_id_2>/', views.add_friend, name='add-friend'),
]
