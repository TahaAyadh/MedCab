from django.urls import path
from .views import get_creneaux, create_rdv

urlpatterns = [
    path('creneaux/', get_creneaux),
    path('create/', create_rdv),
]