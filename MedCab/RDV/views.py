from datetime import datetime, timedelta

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from Users.models import Medecin, User, Patient, Employe
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
            Current_Doc=Current_Doc,
            Status__in=["P", "C"],
            Moment__gte=timezone.now()
            ).exists():
            return Response(
                {"error": "Vous avez déjà un rendez-vous à venir avec ce médecin"},
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

        now = timezone.now()

        rdvs_a_annuler = Rendez_Vous.objects.filter(
            Current_Pat=Current_Pat,
            Status='P',
            Moment__lt=now - timedelta(days=1)
        )

        rdvs_a_annuler.update(Status='A')

        rdvs = Rendez_Vous.objects.select_related(
            "Current_Doc__employe__user"
        ).filter(
            Current_Pat=Current_Pat
        ).order_by("Moment")

        data = []

        for rdv in rdvs:
            data.append({
                "Id_RDV": rdv.Id_RDV,
                "Id_Medecin": rdv.Current_Doc.Id_Medecin,

                "medecin": (
                    f"Dr "
                    f"{rdv.Current_Doc.employe.user.Nom} "
                    f"{rdv.Current_Doc.employe.user.Prenom}"
                ),

                "specialite": rdv.Current_Doc.Specialite,
                "date": rdv.Moment.strftime("%Y-%m-%d"),
                "heure": rdv.Moment.strftime("%H:%M"),
                "motif": rdv.Motif,
                "status": rdv.Status,
                "is_past": rdv.Moment < now,
                "Debut_Consultation": (
                rdv.Debut_Consultation.strftime("%Y-%m-%d %H:%M")
                if rdv.Debut_Consultation else None
                ),
                "Fin_Consultation": (
                    rdv.Fin_Consultation.strftime("%Y-%m-%d %H:%M")
                    if rdv.Fin_Consultation else None
                ),

            "duree": rdv.duree,
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
@api_view(['DELETE'])
@authentication_classes([])
@permission_classes([AllowAny])
def delete_rdv(request, Id_RDV):
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

        rdv = Rendez_Vous.objects.get(
            Id_RDV=Id_RDV,
            Current_Pat=Current_Pat
        )

        if rdv.Moment < timezone.now():
            return Response(
                {"error": "Impossible d'annuler un rendez-vous passé"},
                status=400
            )

        rdv.delete()

        return Response(
            {"message": "Rendez-vous annulé avec succès"},
            status=200
        )

    except TokenError:
        return Response({"error": "Token invalide ou expiré"}, status=401)

    except User.DoesNotExist:
        return Response({"error": "Utilisateur introuvable"}, status=404)

    except Patient.DoesNotExist:
        return Response({"error": "Patient introuvable"}, status=404)

    except Rendez_Vous.DoesNotExist:
        return Response({"error": "Rendez-vous introuvable"}, status=404)

    except Exception as e:
        return Response(
            {"error": "Erreur serveur", "details": str(e)},
            status=500
        )
    
@api_view(['PUT'])
@authentication_classes([])
@permission_classes([AllowAny])
def report_rdv(request, Id_RDV):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return Response({"error": "Token manquant ou invalide"}, status=401)

    try:
        token_str = auth_header.split(" ")[1]
        token = AccessToken(token_str)

        user_id = token.get("user_id")

        Current_User = User.objects.get(id=user_id)
        Current_Pat = Patient.objects.get(user=Current_User)

        Date_RDV = request.data.get("Date_RDV")
        Heure_RDV = request.data.get("Heure_RDV")

        if not Date_RDV or not Heure_RDV:
            return Response(
                {"error": "Date_RDV et Heure_RDV sont obligatoires"},
                status=400
            )

        rdv = Rendez_Vous.objects.get(
            Id_RDV=Id_RDV,
            Current_Pat=Current_Pat
        )

        if rdv.Status != "P":
            return Response(
                {"error": "Seuls les rendez-vous prévus peuvent être reportés"},
                status=400
            )

        if rdv.Moment < timezone.now():
            return Response(
                {"error": "Impossible de reporter un rendez-vous passé"},
                status=400
            )

        Moment_Naive = datetime.strptime(
            f"{Date_RDV} {Heure_RDV}",
            "%Y-%m-%d %H:%M"
        )

        New_Moment = timezone.make_aware(Moment_Naive)

        if New_Moment < timezone.now():
            return Response(
                {"error": "Impossible de reporter vers une date passée"},
                status=400
            )

        if Rendez_Vous.objects.filter(
            Current_Doc=rdv.Current_Doc,
            Moment=New_Moment
        ).exclude(Id_RDV=rdv.Id_RDV).exists():
            return Response(
                {"error": "Ce créneau est déjà pris"},
                status=400
            )

        rdv.Moment = New_Moment
        rdv.Rappel_SMS = False
        rdv.save()

        serializer = Rendez_Vous_Serializer(rdv)

        return Response(serializer.data, status=200)

    except TokenError:
        return Response({"error": "Token invalide ou expiré"}, status=401)

    except User.DoesNotExist:
        return Response({"error": "Utilisateur introuvable"}, status=404)

    except Patient.DoesNotExist:
        return Response({"error": "Patient introuvable"}, status=404)

    except Rendez_Vous.DoesNotExist:
        return Response({"error": "Rendez-vous introuvable"}, status=404)

    except Exception as e:
        return Response(
            {"error": "Erreur serveur", "details": str(e)},
            status=500
        )

def get_user_from_token(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None, Response({"error": "Token manquant ou invalide"}, status=401)

    token_str = auth_header.split(" ")[1]

    try:
        token = AccessToken(token_str)
        user_id = token.get("user_id")
        user = User.objects.get(id=user_id)
        return user, None

    except TokenError:
        return None, Response({"error": "Token invalide ou expiré"}, status=401)

    except User.DoesNotExist:
        return None, Response({"error": "Utilisateur introuvable"}, status=404)


def serialize_medecin_rdv(rdv):
    patient_user = rdv.Current_Pat.user

    return {
        "Id_RDV": rdv.Id_RDV,
        "patient": (
            f"{patient_user.Nom} "
            f"{patient_user.Prenom}"
        ),
        "phone": patient_user.phone,
        "motif": rdv.Motif,
        "heure": rdv.Moment.strftime("%H:%M"),
        "date": rdv.Moment.strftime("%Y-%m-%d"),
        "status": rdv.Status,
        "notes": rdv.Notes,
        "debut_consultation": (
            rdv.Debut_Consultation.isoformat()
            if rdv.Debut_Consultation else None
        ),
        "fin_consultation": (
            rdv.Fin_Consultation.isoformat()
            if rdv.Fin_Consultation else None
        ),
        "duree": rdv.duree,
    }


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def get_medecin_rdvs_today(request):
    user, error_response = get_user_from_token(request)

    if error_response:
        return error_response

    try:
        employe = Employe.objects.get(user=user)
        medecin = Medecin.objects.get(employe=employe)
    except Employe.DoesNotExist:
        return Response({"error": "Employé introuvable"}, status=404)
    except Medecin.DoesNotExist:
        return Response({"error": "Médecin introuvable"}, status=404)

    date_str = request.GET.get("date")

    if date_str:
        selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    else:
        selected_date = timezone.localdate()

    rdvs = Rendez_Vous.objects.select_related(
        "Current_Pat__user",
        "Current_Doc"
    ).filter(
        Current_Doc=medecin,
        Moment__date=selected_date
    ).order_by("Moment")

    data = [serialize_medecin_rdv(rdv) for rdv in rdvs]

    return Response(data, status=200)


@api_view(["PUT"])
@authentication_classes([])
@permission_classes([AllowAny])
def start_rdv(request, rdv_id):
    user, error_response = get_user_from_token(request)

    if error_response:
        return error_response

    try:
        employe = Employe.objects.get(user=user)
        medecin = Medecin.objects.get(employe=employe)

        rdv = Rendez_Vous.objects.select_related(
            "Current_Pat__user"
        ).get(
            Id_RDV=rdv_id,
            Current_Doc=medecin
        )

        if rdv.Status == "T":
            return Response({"error": "Ce RDV est déjà terminé"}, status=400)

        rdv.Debut_Consultation = timezone.now()
        rdv.Status = "C"
        rdv.save()

        return Response(serialize_medecin_rdv(rdv), status=200)

    except Employe.DoesNotExist:
        return Response({"error": "Employé introuvable"}, status=404)

    except Medecin.DoesNotExist:
        return Response({"error": "Médecin introuvable"}, status=404)

    except Rendez_Vous.DoesNotExist:
        return Response({"error": "RDV introuvable"}, status=404)


@api_view(["PUT"])
@authentication_classes([])
@permission_classes([AllowAny])
def end_rdv(request, rdv_id):
    user, error_response = get_user_from_token(request)

    if error_response:
        return error_response

    try:
        employe = Employe.objects.get(user=user)
        medecin = Medecin.objects.get(employe=employe)

        rdv = Rendez_Vous.objects.get(
            Id_RDV=rdv_id,
            Current_Doc=medecin
        )

        notes = request.data.get("Notes", "")
        now = timezone.now()
        rdv.Notes = notes
        rdv.Fin_Consultation = now
        if rdv.Debut_Consultation:
            rdv.duree = int((now - rdv.Debut_Consultation).total_seconds() / 60)
        rdv.Status = "T"
        rdv.save()

        return Response({
            "message": "RDV terminé avec succès",
            "rdv": serialize_medecin_rdv(rdv)
        }, status=200)

    except Employe.DoesNotExist:
        return Response({"error": "Employé introuvable"}, status=404)

    except Medecin.DoesNotExist:
        return Response({"error": "Médecin introuvable"}, status=404)

    except Rendez_Vous.DoesNotExist:
        return Response({"error": "RDV introuvable"}, status=404)
    
@api_view(["PUT"])
@authentication_classes([])
@permission_classes([AllowAny])
def save_rdv_notes(request, rdv_id):
    user, error_response = get_user_from_token(request)

    if error_response:
        return error_response

    try:
        medecin = Medecin.objects.get(employe__user=user)

        rdv = Rendez_Vous.objects.get(
            Id_RDV=rdv_id,
            Current_Doc=medecin
        )

        notes = request.data.get("Notes", "")

        rdv.Notes = notes
        rdv.save()

        return Response({
            "message": "Notes sauvegardées avec succès",
            "notes": rdv.Notes
        }, status=200)

    except Medecin.DoesNotExist:
        return Response(
            {"error": "Accès réservé aux médecins"},
            status=403
        )

    except Rendez_Vous.DoesNotExist:
        return Response(
            {"error": "RDV introuvable"},
            status=404
        )

    except Exception as e:
        return Response(
            {"error": "Erreur serveur", "details": str(e)},
            status=500
        )