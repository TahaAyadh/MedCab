from django.urls import path
from .views import get_current_user, login, register

urlpatterns = [
    path('login/', login),
    path('register/', register),
    path('user/', get_current_user),
]