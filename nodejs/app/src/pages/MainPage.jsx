import { useState } from "react";

import ProfilePage from "./Profil";
import RendezVousPage from "./PriseRDV";
import DossierPage from "./DossierMed";

function AppLayout({ setIsLoggedIn }) {

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
        return <RendezVousPage />;

      case "dossier":
        return <DossierPage />;

      default:
        return <ProfilePage />;
    }
  };

  const Logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("currentPage");
    setIsLoggedIn(false);
  };

  return (
    <div className="flex h-screen">

      <div className="w-64 bg-blue-500 text-white p-4 flex flex-col">

        <h1 className="text-4xl font-bold mb-12 select-none text-center">
          MedCab
        </h1>

        <button
          onClick={() => changePage("profile")}
          className="text-left text-xl p-4 mb-2 hover:bg-blue-700 rounded select-none"
        >
          Profile
        </button>

        <button
          onClick={() => changePage("rendezvous")}
          className="text-left text-xl p-4 mb-2 hover:bg-blue-700 rounded select-none"
        >
          Rendez-vous
        </button>

        <button
          onClick={() => changePage("dossier")}
          className="text-left text-xl p-4 mb-2 hover:bg-blue-700 rounded select-none"
        >
          Dossier
        </button>

        <button
          onClick={Logout}
          className="text-left border-red-700 border-3 text-xl p-3 hover:bg-red-700 hover:border-blue-500 rounded-xl mt-auto select-none"
        >
          Déconnection
        </button>

      </div>

      <div className="flex-1 bg-gray-50 p-6">
        <RenderPage />
      </div>

    </div>
  );
}

export default AppLayout;