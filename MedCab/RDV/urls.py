from django.urls import path
from .views import get_creneaux, create_rdv, get_mes_rdvs, delete_rdv

urlpatterns = [
    path('creneaux/', get_creneaux),
    path('create/', create_rdv),
    path('list/', get_mes_rdvs),
    path('delete/<int:Id_RDV>/', delete_rdv),
]