from datetime import datetime, timedelta

from rest_framework.decorators import api_view
from rest_framework.response import Response

from Users.models import Medecin
from .models import Rendez_Vous


@api_view(['GET'])
def get_creneaux(request):
    medecin_id = request.GET.get("medecin_id")
    date_str = request.GET.get("date")

    if not medecin_id or not date_str:
        return Response(
            {"error": "medecin_id et date sont obligatoires"},
            status=400
        )

    try:
        medecin = Medecin.objects.select_related("employe").get(
            Id_Medecin=medecin_id
        )

        selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()

        debut_shift = medecin.employe.Debut_Shift
        fin_shift = medecin.employe.Fin_Shift

        current = datetime.combine(selected_date, debut_shift)
        end = datetime.combine(selected_date, fin_shift)

        rdvs_pris = Rendez_Vous.objects.filter(
            Current_Doc=medecin,
            Moment__date=selected_date
        ).values_list("Moment", flat=True)

        heures_prises = set([
            rdv_moment.strftime("%H:%M")
            for rdv_moment in rdvs_pris
        ])

        creneaux = []

        while current < end:
            heure = current.strftime("%H:%M")

            creneaux.append({
                "heure": heure,
                "disponible": heure not in heures_prises
            })

            current += timedelta(minutes=30)

        return Response(creneaux, status=200)

    except Medecin.DoesNotExist:
        return Response(
            {"error": "Médecin introuvable"},
            status=404
        )