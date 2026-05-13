from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Rendez_Vous
from .Rdv_Serializer import Rendez_Vous_Serializer

@api_view(['GET'])
def get_rdv(request):
    Rdv = Rendez_Vous.objects.all()
    serializedData = Rendez_Vous_Serializer(Rdv, many=True)
    return Response(serializedData.data)

