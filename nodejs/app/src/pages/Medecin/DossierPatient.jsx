import { useEffect, useState } from "react";
import { getPatientDossier } from "../../api/auth";

export default function DossierPatient({ Id_Patient, onBack }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDossier = async () => {
      try {
        const data = await getPatientDossier(Id_Patient);
        setDossier(data);
      } catch (error) {
        console.error("Erreur chargement dossier:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    loadDossier();
  }, [Id_Patient]);

  if (loading) {
    return <p className="text-blue-600 font-semibold">Chargement du dossier...</p>;
  }

  if (!dossier) {
    return <p className="text-red-600">Impossible de charger le dossier.</p>;
  }

  const patient = dossier.patient;

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition"
      >
        Retour
      </button>

      <h1 className="text-4xl font-bold text-blue-900 mb-6">
        Dossier patient
      </h1>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Informations patient
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Nom :</strong> {patient.Nom}</p>
          <p><strong>Prénom :</strong> {patient.Prenom}</p>
          <p><strong>Email :</strong> {patient.Mail_Adress}</p>
          <p><strong>Téléphone :</strong> {patient.phone}</p>
          <p><strong>Date de naissance :</strong> {patient.birth_date}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Historique des consultations
        </h2>

        {dossier.historique.length > 0 ? (
          <div className="space-y-4">
            {dossier.historique.map((rdv) => (
              <div
                key={rdv.Id_RDV}
                className="border border-blue-100 rounded-xl p-5 bg-blue-50"
              >
                <p className="font-bold text-gray-800">
                  {rdv.date} — {rdv.heure}
                </p>

                <p className="text-gray-700 mt-1">
                  <strong>Médecin :</strong> {rdv.medecin}
                </p>

                <p className="text-gray-700 mt-1">
                  <strong>Motif :</strong> {rdv.motif || "Non renseigné"}
                </p>

                <p className="text-gray-700 mt-1">
                  <strong>Début :</strong> {rdv.Debut_Consultation || "Non démarré"}
                </p>

                <p className="text-gray-700 mt-1">
                  <strong>Fin :</strong> {rdv.Fin_Consultation || "Non terminé"}
                </p>

                <p className="text-gray-700 mt-1">
                  <strong>Durée :</strong> {rdv.duree} min
                </p>

                <p className="text-gray-700 mt-3">
                  <strong>Notes :</strong>
                </p>

                <p className="bg-white rounded-lg p-3 mt-1 text-gray-600">
                  {rdv.notes || "Aucune note enregistrée."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucun historique trouvé.</p>
        )}
      </div>
    </div>
  );
}