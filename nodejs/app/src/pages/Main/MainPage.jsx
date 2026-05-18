import { useState } from "react";

import ProfilePage from "./Profil";
import RendezVousPage from "../RDV/PagesRDV";
import MedecinRDVPage from "../Medecin/MedecinRDV";
import ListePatients from "../Medecin/ListePatients";

function AppLayout({ setIsLoggedIn }) {
  const role = localStorage.getItem("role");

  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("currentPage") || "profile";
  });

  const changePage = (page) => {
    setCurrentPage(page);
    localStorage.setItem("currentPage", page);
  };

  const RenderPage = () => {
    switch (currentPage) {
      case "profile":
        return <ProfilePage />;

      case "rendezvous":
        if (role === "medecin") {
          return <MedecinRDVPage />;
        }

        return <RendezVousPage />;

      case "patients":
        if (role === "medecin") {
          return <ListePatients />;
        }

        return <ProfilePage />;

      default:
        return <ProfilePage />;
    }
  };

  const Logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("currentPage");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
  };

  return (
    <div className="h-screen bg-gray-50">

      {/* SIDEBAR FIXE */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-blue-500 text-white p-4 flex flex-col shadow-xl z-50">

        <h1 className="text-4xl font-bold mb-12 select-none text-center">
          MedCab
        </h1>

        <button
          onClick={() => changePage("profile")}
          className="text-left text-xl p-4 mb-2 hover:bg-blue-700 rounded-xl transition select-none"
        >
          Profile
        </button>

        <button
          onClick={() => changePage("rendezvous")}
          className="text-left text-xl p-4 mb-2 hover:bg-blue-700 rounded-xl transition select-none"
        >
          Rendez-vous
        </button>

        {role === "medecin" && (
          <button
            onClick={() => changePage("patients")}
            className="text-left text-xl p-4 mb-2 hover:bg-blue-700 rounded-xl transition select-none"
          >
            Patients
          </button>
        )}

        <button
          onClick={Logout}
          className="text-left bg-red-500 border-red-700 border-2 text-xl p-3 hover:bg-red-700 rounded-xl mt-auto transition select-none"
        >
          Déconnection
        </button>
      </div>

      {/* CONTENU */}
      <div className="ml-64 min-h-screen overflow-y-auto p-8">
        <RenderPage />
      </div>
    </div>
  );
}

export default AppLayout;