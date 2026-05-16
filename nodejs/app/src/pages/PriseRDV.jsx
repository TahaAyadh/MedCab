export default function RendezVousPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-blue-900">Rendez-vous</h2>
        </div>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 shadow-md transition">
          Prendre un RDV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-5">
          Rendez-vous à venir
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="border border-green-200 bg-green-50 rounded-xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-gray-800">
                Dr Karim Alaoui
              </p>
              <p className="text-gray-500">Cardiologue</p>
              <p className="text-gray-600 mt-2">20 Mai 2026 — 09:30</p>
            </div>

            <span className="bg-green-500 text-white px-4 py-2 rounded-full">
              Confirmé
            </span>
          </div>

          <div className="border border-orange-200 bg-orange-50 rounded-xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-gray-800">
                Dr Sara Benali
              </p>
              <p className="text-gray-500">Dermatologue</p>
              <p className="text-gray-600 mt-2">23 Mai 2026 — 11:00</p>
            </div>

            <span className="bg-orange-500 text-white px-4 py-2 rounded-full">
              En attente
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-5">
          RDVs passés
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="border border-gray-200 bg-gray-50 rounded-xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xl font-bold text-gray-800">
                Dr Youssef Amrani
              </p>
              <p className="text-gray-500">Généraliste</p>
              <p className="text-gray-600 mt-2">10 Avril 2026 — 15:00</p>
            </div>

            <span className="bg-gray-500 text-white px-4 py-2 rounded-full">
              Terminé
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}