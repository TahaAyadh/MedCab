from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from .Users_Serializer import User_Serializer
from .models import User, Medecin


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = User_Serializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    try:
        email = request.data.get('Mail_Adress')
        password = request.data.get('PassWord')

        if not email or not password:
            return Response(
                {"error": "Mail_Adress et PassWord sont obligatoires"},
                status=400
            )

        user = User.objects.filter(Mail_Adress=email).first()

        if not user:
            return Response({"error": "Utilisateur non existant"}, status=404)

        if not check_password(password, user.PassWord):
            return Response({"error": "Mot de passe incorrect"}, status=401)

        refresh = RefreshToken()
        refresh["user_id"] = user.id
        refresh["Mail_Adress"] = user.Mail_Adress

        role = "patient"

        if hasattr(user, "employe") and hasattr(user.employe, "medecin"):
            role = "medecin"

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": role,
            "user": {
                "id": user.id,
                "Nom": user.Nom,
                "Prenom": user.Prenom,
                "Mail_Adress": user.Mail_Adress
            }
        }, status=200)

    except Exception as e:
        print("LOGIN ERROR:", e)
        return Response(
            {"error": "Erreur serveur", "details": str(e)},
            status=500
        )


class UserView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return Response({"error": "Token manquant"}, status=401)

        if not auth_header.startswith("Bearer "):
            return Response({"error": "Format du token invalide"}, status=401)

        token_str = auth_header.split(" ")[1]

        try:
            token = AccessToken(token_str)
            user_id = token.get("user_id")

            if not user_id:
                return Response({"error": "user_id absent du token"}, status=401)

            user = User.objects.get(id=user_id)

            return Response({
                "id": user.id,
                "Nom": user.Nom,
                "Prenom": user.Prenom,
                "Mail_Adress": user.Mail_Adress,
                "phone": user.phone,
                "birth_date": user.birth_date,
            }, status=200)

        except TokenError as e:
            return Response({
                "error": "Token invalide ou expiré",
                "details": str(e)
            }, status=401)

        except User.DoesNotExist:
            return Response({"error": "Utilisateur introuvable"}, status=404)

        except Exception as e:
            return Response({
                "error": "Erreur serveur",
                "details": str(e)
            }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_medecins(request):
    medecins = Medecin.objects.select_related('employe__user').all()

    data = []

    for medecin in medecins:
        data.append({
            "Id_Medecin": medecin.Id_Medecin,
            "Nom": medecin.employe.user.Nom,
            "Prenom": medecin.employe.user.Prenom,
            "Mail_Adress": medecin.employe.user.Mail_Adress,
            "Specialite": medecin.Specialite,
        })

    return Response(data, status=200)