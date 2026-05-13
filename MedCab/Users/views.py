from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import AccessToken
from .Users_Serializer import User_Serializer
from .models import User

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
            return Response({
                "error": "Mail_Adress et PassWord sont obligatoires"
            }, status=400)

        user = User.objects.filter(Mail_Adress=email).first()

        if not user:
            return Response({
                "error": "Utilisateur non existant"
            }, status=404)

        if not check_password(password, user.PassWord):
            return Response({
                "error": "Mot de passe incorrect"
            }, status=401)

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "Nom": user.Nom,
                "Prenom": user.Prenom,
                "Mail_Adress": user.Mail_Adress
            }
        }, status=200)

    except Exception as e:
        return Response({
            "error": "Erreur serveur",
            "details": str(e)
        }, status=500)
    
@api_view(['GET'])
@permission_classes([AllowAny])  # Since we're manually checking token
def get_current_user(request):
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({"error": "No token provided"}, status=401)
    
    token = auth_header.split()[1]
    try:
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        user = User.objects.get(id=user_id)
        return Response({
            "id": user.id,
            "username": f"{user.Nom} {user.Prenom}",
            "email": user.Mail_Adress,
        })
    except Exception as e:
        return Response({"error": "Invalid token"}, status=401)