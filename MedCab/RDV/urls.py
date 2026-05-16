from django.urls import path
from .views import get_creneaux

urlpatterns = [
    path('creneaux/', get_creneaux),
]