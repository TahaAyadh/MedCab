import { useEffect, useState } from "react";
import { getMedecins, getCreneaux } from "../../api/auth";

function PrendreRdvForm({ onBack }) {
  const [medecin, setMedecin] = useState("");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [motif, setMotif] = useState("");

  const [medecins, setMedecins] = useState([]);
  const [creneaux, setCreneaux] = useState([]);

  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        const data = await getMedecins();
        setMedecins(data);
      } catch (error) {
        console.error("Erreur recherche medecins:", error.response?.data);
      }
    };

    fetchMedecins();
  }, []);

  useEffect(() => {
    const loadCreneaux = async () => {
      setHeure("");

      if (!medecin || !date) {
        setCreneaux([]);
        return;
      }

      try {
        const data = await getCreneaux(medecin, date);
        setCreneaux(data);
      } catch (error) {
        console.error("Erreur chargement créneaux:", error.response?.data);
        setCreneaux([]);
      }
    };

    loadCreneaux();
  }, [medecin, date]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const rdvData = {
      medecin,
      date,
      heure,
      motif,
    };

    console.log("RDV DATA =", rdvData);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={onBack}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 shadow-md transition"
        >
          Retour
        </button>

        <h2 className="text-4xl font-bold text-blue-900">
          Prise de rendez-vous
        </h2>

        <div className="w-28" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8"
      >
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Choix du médecin
          </label>

          <select
            value={medecin}
            onChange={(e) => setMedecin(e.target.value)}
            className="w-full border border-blue-100 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner un médecin</option>

            {medecins.map((doc) => (
              <option key={doc.Id_Medecin} value={doc.Id_Medecin}>
                Dr {doc.Nom} {doc.Prenom} — {doc.Specialite}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Choix de la date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-blue-100 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Choix de l’heure
            </label>

            <select
              value={heure}
              onChange={(e) => setHeure(e.target.value)}
              disabled={!medecin || !date}
              className="w-full border border-blue-100 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">
                {!medecin || !date
                  ? "Choisissez d'abord un médecin et une date"
                  : "Sélectionner une heure"}
              </option>

              {creneaux.map((slot) => (
                <option
                  key={slot.heure}
                  value={slot.heure}
                  disabled={!slot.disponible}
                >
                  {slot.heure} {slot.disponible ? "" : "- Déjà pris"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-2">
            Motif du rendez-vous
          </label>

          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            rows="8"
            placeholder="Décrivez le motif de votre rendez-vous..."
            className="w-full border border-blue-100 rounded-xl p-4 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={!medecin || !date || !heure}
          className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-green-700 shadow-md transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Confirmer le rendez-vous
        </button>
      </form>
    </div>
  );
}

export default PrendreRdvForm;