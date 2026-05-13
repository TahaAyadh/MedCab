from django.db import models
from Users.models import Patient, Medecin

# Create your models here.
class Status(models.TextChoices):
    Paye = 'P','payé'
    Non_Paye = 'N','non payé'
class Etat_RDV(models.TextChoices):
    PREVU = 'P', 'Prévu'
    CONFIRME = 'C', 'Confirmé'
    ANNULE = 'A', 'Annulé'
    TERMINE = 'T', 'Terminé'

class Rendez_Vous(models.Model):
    Id_RDV = models.AutoField(primary_key=True)
    Current_Pat = models.ForeignKey(Patient, verbose_name=("Patient"), on_delete=models.PROTECT) 
    Current_Doc = models.ForeignKey( Medecin,verbose_name=("Medecin"), on_delete=models.PROTECT)
    Notes = models.TextField(blank=True,null=True)
    Moment = models.DateTimeField()
    duree = models.IntegerField(help_text="Durée en minutes", default=30)
    Status = models.CharField(max_length=1,choices=Etat_RDV.choices,default='P')
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['Current_Doc', 'Moment'],
                name='unique_doctor_schedule'
            )
        ]
        ordering = ['Moment']
    
class Dossier_Pat(models.Model):
    Id_Dossier = models.AutoField(primary_key=True)
    Patient_Cons = models.ForeignKey(Patient,on_delete=models.PROTECT)

class Facture(models.Model):
    Id_Facture = models.AutoField(primary_key=True)
    rdv = models.ForeignKey(Rendez_Vous,verbose_name=("Rendez Vous"),on_delete=models.PROTECT)
    status = models.CharField(max_length=1, choices=Status.choices,default='N')
    Date_Payement = models.DateTimeField()

class Ordonance(models.Model):
    Id_Ord = models.AutoField(("Numero"),primary_key=True)
    Rdv_concerne = models.ForeignKey(Rendez_Vous,verbose_name=("Rendez Vous"), on_delete=models.PROTECT)

class Medicament(models.Model):
    Ap_Ordonance= models.ForeignKey(Ordonance, related_name=("Medicaments"), on_delete=models.CASCADE)
    Nom = models.CharField(max_length=100)
    QTE = models.IntegerField(default=1)
    Consommation = models.TextField(blank=True,null=True)


class Lettre_Ref(models.Model):
    Id_Lettre = models.AutoField(primary_key=True)
    Recepteur = models.TextField()
    Concerne = models.ForeignKey(Patient, verbose_name=("Patient"),on_delete=models.PROTECT)
    Contenu = models.TextField()

class Devis(models.Model):
    Rdv_Cons = models.ForeignKey(Rendez_Vous,related_name=("Devis"),on_delete=models.CASCADE)
    Id_Devis = models.AutoField(primary_key=True)
    Devis_Pat = models.ForeignKey(Patient,related_name=("Patient"),on_delete=models.CASCADE)

    @property
    def total(self):
        return sum(Objet.total for Objet in self.Objets.all())

class Objet_Devis(models.Model):
    Ap_Devis = models.ForeignKey(Devis,on_delete=models.CASCADE, related_name=("Objets"))
    Nom = models.CharField(max_length=300)
    Qte = models.IntegerField()
    PU = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total(self):
        return self.Qte * self.PU
    


