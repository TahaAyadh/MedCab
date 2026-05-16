import { useState } from "react";

function PrendreRdvForm({ onBack }) {
  const [medecin, setMedecin] = useState("");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [motif, setMotif] = useState("");

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
              className="w-full border border-blue-100 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une heure</option>
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
          className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-green-700 shadow-md transition"
        >
          Confirmer le rendez-vous
        </button>
      </form>
    </div>
  );
}

export default PrendreRdvForm;