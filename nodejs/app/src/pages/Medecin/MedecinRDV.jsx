import { useEffect, useState } from "react";
import {
  getMedecinRdvsToday,
  startRdv,
  endRdv,
} from "../../api/auth";

function getStatusLabel(status) {
  switch (status) {
    case "P":
      return "Prévu";
    case "C":
      return "En cours";
    case "T":
      return "Terminé";
    case "A":
      return "Annulé";
    default:
      return "RDV";
  }
}

function getStatusStyle(status) {
  switch (status) {
    case "P":
      return "bg-orange-100 text-orange-700";
    case "C":
      return "bg-green-100 text-green-700";
    case "T":
      return "bg-gray-100 text-gray-700";
    case "A":
      return "bg-red-100 text-red-700";
    default:
      return "bg-blue-100 text-blue-700";
  }
}

export default function MedecinRDV() {
  const [rdvs, setRdvs] = useState([]);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const loadRdvs = async () => {
    try {
      const data = await getMedecinRdvsToday(selectedDate);
      setRdvs(data);
    } catch (error) {
      console.error("Erreur chargement RDV médecin:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  loadRdvs();
  },[selectedDate]);

  useEffect(() => {
    let interval = null;

    if (selectedRdv && selectedRdv.status === "C") {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [selectedRdv]);

  const formatTimer = () => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleStartRdv = async (rdv) => {
    try {
      const data = await startRdv(rdv.Id_RDV);

      setSelectedRdv(data);
      setNotes(data.notes || "");
      if (data.debut_consultation) {
      const startedAt = new Date(data.debut_consultation);
      const diff = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      setSeconds(diff > 0 ? diff : 0);
    } else {
      setSeconds(0);
    }

      await loadRdvs();
    } catch (error) {
      console.error("Erreur début RDV:", error.response?.data);
      alert(error.response?.data?.error || "Erreur lors du démarrage du RDV");
    }
  };

  const handleEndRdv = async () => {
    try {
      await endRdv(selectedRdv.Id_RDV, {
        Notes: notes,
      });

      setSelectedRdv(null);
      setNotes("");
      setSeconds(0);

      await loadRdvs();
    } catch (error) {
      console.error("Erreur fin RDV:", error.response?.data);
      alert(error.response?.data?.error || "Erreur lors de la fin du RDV");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-900">
            Rendez-vous
          </h1>

          <p className="text-gray-500 mt-2">
            Gérez les arrivées, consultations et dossiers patients.
          </p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-blue-100 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedRdv && (
          <div className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md text-xl font-bold">
            Temps : {formatTimer()}
          </div>
        )}
      </div>

      {!selectedRdv && (
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Liste des rendez-vous
          </h2>

          {loading ? (
            <p className="text-blue-600 font-semibold">
              Chargement des rendez-vous...
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-left text-gray-700">
                    <th className="p-4">Heure</th>
                    <th className="p-4">Patient</th>
                    <th className="p-4">Téléphone</th>
                    <th className="p-4">Motif</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rdvs.length > 0 ? (
                    rdvs.map((rdv) => (
                      <tr
                        key={rdv.Id_RDV}
                        className="border-b border-blue-100 hover:bg-gray-50"
                      >
                        <td className="p-4 font-semibold text-gray-800">
                          {rdv.heure}
                        </td>

                        <td className="p-4">
                          {rdv.patient}
                        </td>

                        <td className="p-4">
                          {rdv.phone}
                        </td>

                        <td className="p-4 max-w-xs truncate">
                          {rdv.motif || "Non renseigné"}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                              rdv.status
                            )}`}
                          >
                            {getStatusLabel(rdv.status)}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          {rdv.status === "P" && (
                            <button
                              onClick={() => handleStartRdv(rdv)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                              Confirmer arrivée
                            </button>
                          )}

                          {rdv.status === "C" && (
                            <button
                              onClick={() => {
                                setSelectedRdv(rdv);
                                setNotes(rdv.notes || "");

                                if (rdv.debut_consultation) {
                                  const startedAt = new Date(rdv.debut_consultation);
                                  const diff = Math.floor((Date.now() - startedAt.getTime()) / 1000);
                                  setSeconds(diff > 0 ? diff : 0);
                                }
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                              Reprendre
                            </button>
                          )}

                          {rdv.status === "T" && (
                            <span className="text-gray-400">
                              Consultation terminée
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-6 text-center text-gray-500"
                      >
                        Aucun rendez-vous aujourd’hui.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedRdv && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Patient
            </h2>

            <div className="space-y-3 text-gray-700">
              <p>
                <span className="font-semibold">Nom :</span>{" "}
                {selectedRdv.patient}
              </p>

              <p>
                <span className="font-semibold">Téléphone :</span>{" "}
                {selectedRdv.phone}
              </p>

              <p>
                <span className="font-semibold">Motif :</span>{" "}
                {selectedRdv.motif || "Non renseigné"}
              </p>

              <p>
                <span className="font-semibold">Début :</span>{" "}
                {selectedRdv.heure}
              </p>

              <p>
                <span className="font-semibold">Statut :</span>{" "}
                {getStatusLabel(selectedRdv.status)}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button className="bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition">
                Dossier patient
              </button>

              <button className="bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition">
                Préparer devis
              </button>

              <button className="bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition">
                Certificat médical
              </button>

              <button className="bg-cyan-600 text-white py-3 rounded-xl hover:bg-cyan-700 transition">
                Lettre de référence
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-800">
                Consultation en cours
              </h2>

              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold">
                {formatTimer()}
              </div>
            </div>

            <label className="block text-gray-700 font-semibold mb-2">
              Notes du médecin
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="12"
              placeholder="Ajouter les notes de consultation..."
              className="w-full border border-blue-100 rounded-xl p-4 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedRdv(null)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition"
              >
                Retour
              </button>

              <button
                onClick={handleEndRdv}
                className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition"
              >
                Terminer le RDV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}