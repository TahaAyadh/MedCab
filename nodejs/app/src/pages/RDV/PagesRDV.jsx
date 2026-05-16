import { useState } from "react";
import ListeRDV from "./ListeRDV";
import PriseRDV from "./PriseRDV";

export default function RendezVousPage() {
  const [showPriseRDV, setShowPriseRDV] = useState(false);

  if (showPriseRDV) {
    return (
      <PriseRDV
        onBack={() => setShowPriseRDV(false)}
      />
    );
  }

  return (
    <ListeRDV
      onPrendreRDV={() => setShowPriseRDV(true)}
    />
  );
}