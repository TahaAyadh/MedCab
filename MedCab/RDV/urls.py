from django.urls import path
from .views import get_creneaux, create_rdv, get_mes_rdvs

urlpatterns = [
    path('creneaux/', get_creneaux),
    path('create/', create_rdv),
    path('list/', get_mes_rdvs),
]