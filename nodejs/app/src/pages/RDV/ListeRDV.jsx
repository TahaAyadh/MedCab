import { useEffect, useState } from "react";
import { getMesRdvs } from "../../api/auth";

function getStatusStyle(status) {
  switch (status) {
    case "P":
      return {
        card: "border-orange-200 bg-orange-50",
        badge: "bg-orange-500 text-white",
        label: "Prévu",
      };

    case "C":
      return {
        card: "border-green-200 bg-green-50",
        badge: "bg-green-500 text-white",
        label: "Confirmé",
      };

    case "A":
      return {
        card: "border-red-200 bg-red-50",
        badge: "bg-red-500 text-white",
        label: "Annulé",
      };

    case "T":
      return {
        card: "border-gray-200 bg-gray-50",
        badge: "bg-gray-500 text-white",
        label: "Terminé",
      };

    default:
      return {
        card: "border-blue-200 bg-blue-50",
        badge: "bg-blue-500 text-white",
        label: "RDV",
      };
  }
}

function RdvCard({ rdv }) {
  const style = getStatusStyle(rdv.status);

  return (
    <div
      className={`rounded-xl p-5 flex justify-between items-center border ${style.card}`}
    >
      <div>
        <p className="text-xl font-bold text-gray-800">
          {rdv.medecin}
        </p>

        <p className="text-gray-500">
          {rdv.specialite}
        </p>

        <p className="text-gray-600 mt-2">
          {rdv.date} — {rdv.heure}
        </p>

        {rdv.motif && (
          <p className="text-gray-600 mt-2">
            Motif : {rdv.motif}
          </p>
        )}
      </div>

      <span className={`px-4 py-2 rounded-full ${style.badge}`}>
        {style.label}
      </span>
    </div>
  );
}

export default function RendezVousPage({ onPrendreRDV }) {
  const [rdvsAVenir, setRdvsAVenir] = useState([]);
  const [rdvsPasses, setRdvsPasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRdvs = async () => {
      try {
        const data = await getMesRdvs();

        const now = new Date();

        const avenir = data.filter((rdv) => {
          return new Date(rdv.Moment) >= now;
        });

        const passes = data.filter((rdv) => {
          return new Date(rdv.Moment) < now;
        });

        setRdvsAVenir(avenir);
        setRdvsPasses(passes);
      } catch (error) {
        console.error("Erreur chargement RDV:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    loadRdvs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-blue-900">
            Rendez-vous
          </h2>

          <p className="text-gray-500 mt-2">
            Consultez vos rendez-vous à venir et votre historique.
          </p>
        </div>

        <button
          onClick={onPrendreRDV}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 shadow-md transition"
        >
          Prendre un RDV
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <p className="text-blue-600 font-semibold">
            Chargement des rendez-vous...
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-5">
              Rendez-vous à venir
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {rdvsAVenir.length > 0 ? (
                rdvsAVenir.map((rdv) => (
                  <RdvCard
                    key={rdv.Id_RDV}
                    rdv={rdv}
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  Aucun rendez-vous à venir.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-5">
              RDVs passés
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {rdvsPasses.length > 0 ? (
                rdvsPasses.map((rdv) => (
                  <RdvCard
                    key={rdv.Id_RDV}
                    rdv={rdv}
                  />
                ))
              ) : (
                <p className="text-gray-500">
                  Aucun rendez-vous passé.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}