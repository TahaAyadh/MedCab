import { useEffect, useState } from "react";
import { getPatientsList } from "../../api/auth";

export default function ListePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await getPatientsList();
        setPatients(data);
      } catch (error) {
        console.error("Erreur chargement patients:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-900 mb-6">
        Liste des patients
      </h1>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        {loading ? (
          <p className="text-blue-600 font-semibold">
            Chargement des patients...
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50 text-left text-gray-700">
                <th className="p-4">Nom</th>
                <th className="p-4">Prénom</th>
                <th className="p-4">Email</th>
                <th className="p-4">Téléphone</th>
                <th className="p-4">Date naissance</th>
              </tr>
            </thead>

            <tbody>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <tr
                    key={patient.Id_Patient}
                    className="border-b border-blue-100 hover:bg-gray-50"
                  >
                    <td className="p-4">{patient.Nom}</td>
                    <td className="p-4">{patient.Prenom}</td>
                    <td className="p-4">{patient.Mail_Adress}</td>
                    <td className="p-4">{patient.phone}</td>
                    <td className="p-4">{patient.birth_date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    Aucun patient trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}