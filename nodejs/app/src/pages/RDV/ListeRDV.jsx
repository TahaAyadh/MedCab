import { useEffect, useState } from "react";
import { getMesRdvs, deleteRdv, reportRdv, getCreneaux } from "../../api/auth";

function getStatusStyle(status, isPast) {

  if (isPast) {

  if (status === "P") {
    return {
      card: "border-yellow-200 bg-yellow-50",
      badge: "bg-gray-600 text-white",
      label: "Raté",
    };
  }

  if (status === "T") {
    return {
      card: "border-gray-200 bg-gray-50",
      badge: "bg-gray-500 text-white",
      label: "Terminé",
    };
  }

  if (status === "A") {
    return {
      card: "border-red-200 bg-red-50",
      badge: "bg-red-500 text-white",
      label: "Annulé",
    };
  }

  if (status === "C") {
    return {
      card: "border-green-200 bg-green-50",
      badge: "bg-green-500 text-white",
      label: "Confirmé",
    };
  }
}

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

function RdvCard({ rdv, onCancel, onStartReport }) {
  const style = getStatusStyle(rdv.status, rdv.is_past);

  return (
    <div className={`rounded-xl p-5 flex justify-between items-center border ${style.card}`}>
      <div className="min-w-0 flex-1 pr-6">
        <p className="text-xl font-bold text-gray-800">{rdv.medecin}</p>
        <p className="text-gray-500">{rdv.specialite}</p>
        <p className="text-gray-600 mt-2">{rdv.date} — {rdv.heure}</p>

        {rdv.motif && (
          <p className="text-gray-600 mt-2 break-words">
            Motif : {rdv.motif}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-3 shrink-0">
        <span className={`px-4 py-2 rounded-full ${style.badge}`}>
          {style.label}
        </span>

        {!rdv.is_past && rdv.status === "P" && (
          <div className="flex gap-2">
            <button
              onClick={() => onCancel(rdv.Id_RDV)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Annuler
            </button>

            <button
              onClick={() => onStartReport(rdv)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Reporter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RendezVousPage({ onPrendreRDV }) {
  const [rdvsAVenir, setRdvsAVenir] = useState([]);
  const [rdvsPasses, setRdvsPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  const [rdvToReport, setRdvToReport] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newHeure, setNewHeure] = useState("");
  const [creneaux, setCreneaux] = useState([]);

  const today = new Date().toLocaleDateString("en-CA");

  const loadRdvs = async () => {
    try {
      const data = await getMesRdvs();

      const avenir = data.filter((rdv) => !rdv.is_past);
      const passes = data.filter((rdv) => rdv.is_past);

      setRdvsAVenir(avenir);
      setRdvsPasses(passes);
    } catch (error) {
      console.error("Erreur chargement RDV:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRdvs();
  }, []);

  useEffect(() => {
    const loadCreneauxReport = async () => {
      setNewHeure("");

      if (!rdvToReport || !newDate) {
        setCreneaux([]);
        return;
      }

      try {
        const data = await getCreneaux(rdvToReport.Id_Medecin, newDate);
        setCreneaux(data);
      } catch (error) {
        console.error("Erreur chargement créneaux:", error.response?.data);
        setCreneaux([]);
      }
    };

    loadCreneauxReport();
  }, [rdvToReport, newDate]);

  const handleCancel = async (Id_RDV) => {
    try {
      await deleteRdv(Id_RDV);

      setSuccessMsg("Rendez-vous annulé avec succès");
      await loadRdvs();

      setTimeout(() => {
        setSuccessMsg("");
      }, 1500);
    } catch (error) {
      console.error("Erreur annulation RDV:", error.response?.data);
      alert(error.response?.data?.error || "Erreur lors de l'annulation du RDV");
    }
  };

  const handleStartReport = (rdv) => {
    setRdvToReport(rdv);
    setNewDate("");
    setNewHeure("");
    setCreneaux([]);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();

    if (!rdvToReport || !newDate || !newHeure) {
      alert("Veuillez choisir une date et une heure");
      return;
    }

    try {
      await reportRdv(rdvToReport.Id_RDV, {
        Date_RDV: newDate,
        Heure_RDV: newHeure,
      });

      setSuccessMsg("Rendez-vous reporté avec succès");
      setRdvToReport(null);
      setNewDate("");
      setNewHeure("");
      setCreneaux([]);

      await loadRdvs();

      setTimeout(() => {
        setSuccessMsg("");
      }, 1500);
    } catch (error) {
      console.error("Erreur report RDV:", error.response?.data);
      alert(error.response?.data?.error || "Erreur lors du report du RDV");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {successMsg && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {successMsg}
        </div>
      )}

      {rdvToReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <form
            onSubmit={handleReportSubmit}
            className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 w-full max-w-lg"
          >
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Reporter le rendez-vous
            </h3>

            <p className="text-gray-600 mb-4">
              {rdvToReport.medecin} — {rdvToReport.date} à {rdvToReport.heure}
            </p>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Nouvelle date
              </label>

              <input
                type="date"
                value={newDate}
                min={today}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border border-blue-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Nouvelle heure
              </label>

              <select
                value={newHeure}
                onChange={(e) => setNewHeure(e.target.value)}
                disabled={!newDate}
                className="w-full border border-blue-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {!newDate ? "Choisissez d'abord une date" : "Sélectionner une heure"}
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

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRdvToReport(null)}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Fermer
              </button>

              <button
                type="submit"
                disabled={!newDate || !newHeure}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmer
              </button>
            </div>
          </form>
        </div>
      )}

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
                    onCancel={handleCancel}
                    onStartReport={handleStartReport}
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
                    onCancel={handleCancel}
                    onStartReport={handleStartReport}
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