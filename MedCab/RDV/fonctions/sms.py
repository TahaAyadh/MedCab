from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from RDV.models import Rendez_Vous


def send_sms(phone, message):
    print(f"SMS envoyé à {phone} : {message}")


class Command(BaseCommand):
    help = "Envoie les rappels SMS des rendez-vous à venir"

    def handle(self, *args, **options):
        now = timezone.now()
        reminder_limit = now + timedelta(hours=24)

        rdvs = Rendez_Vous.objects.select_related(
            "Current_Pat__user",
            "Current_Doc__employe__user"
        ).filter(
            Status="P",
            Rappel_SMS_Envoye=False,
            Moment__gte=now,
            Moment__lte=reminder_limit
        )

        for rdv in rdvs:
            patient = rdv.Current_Pat.user
            medecin_user = rdv.Current_Doc.employe.user

            message = (
                f"Bonjour {patient.Prenom}, rappel: vous avez un RDV "
                f"avec Dr {medecin_user.Nom} {medecin_user.Prenom} "
                f"le {rdv.Moment.strftime('%d/%m/%Y')} "
                f"à {rdv.Moment.strftime('%H:%M')}."
            )

            send_sms(patient.phone, message)

            rdv.Rappel_SMS_Envoye = True
            rdv.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"{rdvs.count()} rappel(s) SMS traité(s)."
            )
        )