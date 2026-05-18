from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import register, login, UserView, get_medecins, get_patients_list

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('user/', UserView.as_view()),
    path('medecins/', get_medecins),
    path('patients/list/', get_patients_list),
    path('token/refresh/', TokenRefreshView.as_view()),
]