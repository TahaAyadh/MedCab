from datetime import datetime, timedelta

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from Users.models import Medecin, User, Patient
from .models import Rendez_Vous
from .Rdv_Serializer import Rendez_Vous_Serializer


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


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def create_rdv(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return Response(
            {"error": "Token manquant ou invalide"},
            status=401
        )

    try:
        token_str = auth_header.split(" ")[1]
        token = AccessToken(token_str)

        user_id = token.get("user_id")

        Current_User = User.objects.get(id=user_id)
        Current_Pat = Patient.objects.get(user=Current_User)

        Id_Medecin = request.data.get("Id_Medecin")
        Date_RDV = request.data.get("Date_RDV")
        Heure_RDV = request.data.get("Heure_RDV")
        Motif = request.data.get("Motif", "")

        if not Id_Medecin or not Date_RDV or not Heure_RDV:
            return Response(
                {"error": "Id_Medecin, Date_RDV et Heure_RDV sont obligatoires"},
                status=400
            )

        Current_Doc = Medecin.objects.get(Id_Medecin=Id_Medecin)

        Moment_Naive = datetime.strptime(
            f"{Date_RDV} {Heure_RDV}",
            "%Y-%m-%d %H:%M"
        )

        Moment = timezone.make_aware(Moment_Naive)

        if Moment < timezone.now():
            return Response(
                {"error": "Impossible de prendre un rendez-vous dans le passé"},
                status=400
            )

        if Rendez_Vous.objects.filter(
            Current_Pat=Current_Pat,
            Current_Doc=Current_Doc
        ).exists():
            return Response(
                {"error": "Vous avez déjà un rendez-vous avec ce médecin"},
                status=400
            )

        if Rendez_Vous.objects.filter(
            Current_Doc=Current_Doc,
            Moment=Moment
        ).exists():
            return Response(
                {"error": "Ce créneau est déjà pris"},
                status=400
            )

        Nouveau_RDV = Rendez_Vous.objects.create(
            Current_Pat=Current_Pat,
            Current_Doc=Current_Doc,
            Moment=Moment,
            Motif=Motif,
            Status="P"
        )

        serializer = Rendez_Vous_Serializer(Nouveau_RDV)

        return Response(serializer.data, status=201)

    except TokenError:
        return Response(
            {"error": "Token invalide ou expiré"},
            status=401
        )

    except User.DoesNotExist:
        return Response(
            {"error": "Utilisateur introuvable"},
            status=404
        )

    except Patient.DoesNotExist:
        return Response(
            {"error": "Patient introuvable"},
            status=404
        )

    except Medecin.DoesNotExist:
        return Response(
            {"error": "Médecin introuvable"},
            status=404
        )

    except Exception as e:
        return Response(
            {"error": "Erreur serveur", "details": str(e)},
            status=500
        )
    
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_mes_rdvs(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return Response(
            {"error": "Token manquant ou invalide"},
            status=401
        )

    try:
        token_str = auth_header.split(" ")[1]
        token = AccessToken(token_str)

        user_id = token.get("user_id")

        Current_User = User.objects.get(id=user_id)
        Current_Pat = Patient.objects.get(user=Current_User)

        rdvs = Rendez_Vous.objects.select_related(
            "Current_Doc__employe__user"
        ).filter(
            Current_Pat=Current_Pat
        ).order_by("Moment")

        data = []

        for rdv in rdvs:
            data.append({
                "Id_RDV": rdv.Id_RDV,
                "medecin": f"Dr {rdv.Current_Doc.employe.user.Nom} {rdv.Current_Doc.employe.user.Prenom}",
                "specialite": rdv.Current_Doc.Specialite,
                "date": rdv.Moment.strftime("%Y-%m-%d"),
                "heure": rdv.Moment.strftime("%H:%M"),
                "motif": rdv.Motif,
                "status": rdv.Status,
                "Moment": rdv.Moment,
            })

        return Response(data, status=200)

    except TokenError:
        return Response(
            {"error": "Token invalide ou expiré"},
            status=401
        )

    except User.DoesNotExist:
        return Response(
            {"error": "Utilisateur introuvable"},
            status=404
        )

    except Patient.DoesNotExist:
        return Response(
            {"error": "Patient introuvable"},
            status=404
        )

    except Exception as e:
        return Response(
            {"error": "Erreur serveur", "details": str(e)},
            status=500
        )