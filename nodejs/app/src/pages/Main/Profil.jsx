import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/auth";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error.response?.data);
        setError("Impossible de charger le profil.");
      }
    };

    loadUser();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-blue-600 text-lg font-medium">
          Chargement du profil...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-900">Mon Profil</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-4xl font-bold shadow-md">
              {user.Nom?.charAt(0)}
              {user.Prenom?.charAt(0)}
            </div>

            <div>
              <h2 className="text-3xl font-bold">
                {user.Nom} {user.Prenom}
              </h2>
              <p className="text-blue-100 mt-1">{user.Mail_Adress}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Nom</p>
            <p className="text-lg font-semibold text-gray-800">{user.Nom}</p>
          </div>

          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Prénom</p>
            <p className="text-lg font-semibold text-gray-800">{user.Prenom}</p>
          </div>

          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Adresse mail</p>
            <p className="text-lg font-semibold text-gray-800">
              {user.Mail_Adress}
            </p>
          </div>

          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Téléphone</p>
            <p className="text-lg font-semibold text-gray-800">
              {user.phone || "Non renseigné"}
            </p>
          </div>

          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <p className="text-sm text-gray-500 mb-1">Date de naissance</p>
            <p className="text-lg font-semibold text-gray-800">
              {user.birth_date || "Non renseignée"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;