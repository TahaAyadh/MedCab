from rest_framework import serializers
from .models import Rendez_Vous, Dossier_Pat, Facture, Ordonance, Medicament, Lettre_Ref, Devis, Objet_Devis

class Rendez_Vous_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Rendez_Vous
        fields = '__all__' 

class Dossier_Pat_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Dossier_Pat
        fields = '__all__'

class Facture_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Facture
        fields = '__all__'

class Ordonance_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Ordonance
        fields = '__all__'

class Medicament_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Medicament
        fields = '__all__'

class Lettre_Ref_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Lettre_Ref
        fields = '__all__'

class Devis_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Devis
        fields = '__all__'

class Objet_Devis_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Objet_Devis
        fields = '__all__'

