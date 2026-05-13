from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, Employe, Patient, Secretaire, Medecin, Salaire

class User_Serializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'PassWord': {'write_only': True}
        }

    def create(self, validated_data):
        if 'PassWord' in validated_data:
            validated_data['PassWord'] = make_password(validated_data['PassWord'])
            user = User.objects.create(**validated_data)
            Patient.objects.create(user=user)
        return user

    def update(self, instance, validated_data):
        if 'PassWord' in validated_data:
            validated_data['PassWord'] = make_password(validated_data['PassWord'])
        return super().update(instance, validated_data)
    
class Employe_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Employe
        fields = '__all__'

class Patient_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class Secretaire_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Secretaire
        fields = '__all__'

class Medecin_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Medecin
        fields = '__all__'

class Salaire_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Salaire
        fields = '__all__'