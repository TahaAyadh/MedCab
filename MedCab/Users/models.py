from django.db import models

# Create your models here.

class User(models.Model):
    Nom = models.CharField(max_length=50)
    Prenom = models.CharField(max_length=50)
    birth_date = models.DateField()
    phone = models.CharField(max_length=15, unique=True)
    Mail_Adress = models.CharField(max_length=254,unique=True)
    PassWord = models.CharField(max_length=128)
    Refister_Date = models.DateTimeField(auto_now_add=True)

class Employe(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    Id_Emp = models.AutoField(primary_key=True)
    Date_Embauche = models.DateField()
    CIN = models.CharField(max_length=8,unique=True )
    Debut_Shift = models.TimeField()
    Fin_Shift = models.TimeField()
    salaire = models.DecimalField(max_digits=10, decimal_places=2)

class Patient(models.Model):
    Id_Patient = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

class Secretaire(Employe):
    Id_Secretaire = models.AutoField(primary_key=True)
class Medecin(Employe):
    Specialite = models.CharField(max_length=250)

class Salaire(models.Model):
    employe = models.ForeignKey(Employe,on_delete=models.PROTECT,related_name='salaires')
    Compte_Bancaire = models.CharField(max_length=50)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_paiement = models.DateTimeField()
    mois = models.IntegerField()
    annee = models.IntegerField()
    Date_Salaire= models.DateTimeField(auto_now_add=True)

