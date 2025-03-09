from django.urls import path, re_path

from .views import index_view

urlpatterns = [
    re_path(r'^', index_view ,name="index"),
]
