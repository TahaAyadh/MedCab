from django.urls import path

from .views import (
    get_creneaux,
    create_rdv,
    get_mes_rdvs,
    delete_rdv,
    report_rdv,
    get_medecin_rdvs_today,
    start_rdv,
    end_rdv,
    save_rdv_notes,
)

urlpatterns = [
    path('creneaux/', get_creneaux),
    path('create/', create_rdv),
    path('list/', get_mes_rdvs),
    path('delete/<int:Id_RDV>/', delete_rdv),
    path('report/<int:Id_RDV>/', report_rdv),
    path('medecin/notes/<int:rdv_id>/', save_rdv_notes),
    path('medecin/today/', get_medecin_rdvs_today),
    path('medecin/start/<int:rdv_id>/', start_rdv),
    path('medecin/end/<int:rdv_id>/', end_rdv),
]