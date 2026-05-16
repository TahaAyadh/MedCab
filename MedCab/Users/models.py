from django.db import models

class User(models.Model):
    Nom = models.CharField(max_length=50)
    Prenom = models.CharField(max_length=50)
    birth_date = models.DateField()
    phone = models.CharField(max_length=15, unique=True)
    Mail_Adress = models.CharField(max_length=254, unique=True)
    PassWord = models.CharField(max_length=128)
    Register_Date = models.DateTimeField(auto_now_add=True)

class Patient(models.Model):
    Id_Patient = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)


class Employe(models.Model):
    Id_Emp = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    Date_Embauche = models.DateField()
    CIN = models.CharField(max_length=8, unique=True)
    Debut_Shift = models.TimeField()
    Fin_Shift = models.TimeField()
    salaire = models.DecimalField(max_digits=10, decimal_places=2)


class Medecin(models.Model):
    Id_Medecin = models.AutoField(primary_key=True)
    employe = models.OneToOneField(Employe, on_delete=models.CASCADE)
    Specialite = models.CharField(max_length=250)


class Secretaire(models.Model):
    Id_Secretaire = models.AutoField(primary_key=True)
    employe = models.OneToOneField(Employe, on_delete=models.CASCADE)


class Salaire(models.Model):
    employe = models.ForeignKey(
        Employe,
        on_delete=models.PROTECT,
        related_name='salaires'
    )
    Compte_Bancaire = models.CharField(max_length=50)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_paiement = models.DateTimeField()
    mois = models.IntegerField()
    annee = models.IntegerField()
    Date_Salaire = models.DateTimeField(auto_now_add=True)