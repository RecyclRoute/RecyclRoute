import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import "./navigationpage.css";

export const NavigationGuidePopup = ({ currentIndex }) => {
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState([]);

  useEffect(() => {
    fetch("/data/navigation.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        const fetchedInstructions = geojson.features.map((f) => f.properties);
        setInstructions(fetchedInstructions);
      })
      .catch((err) => console.error("Fehler beim Laden der Anweisungen:", err));
  }, []);

  const CloseButtonClick = () => {
    navigate('/planner');
  };

  const getDirectionIconByValhallaType = (type) => {
    switch (type) {
      case 1: return { icon: "🟢", text: "Route starten" };
      case 2: return { icon: "🟢➡️", text: "Starte rechts" };
      case 3: return { icon: "🟢⬅️", text: "Starte links" };
      case 4: return { icon: "🏁", text: "Ziel erreicht" };
      case 5: return { icon: "🏁➡️", text: "Ziel liegt rechts" };
      case 6: return { icon: "🏁⬅️", text: "Ziel liegt links" };
      case 7: return { icon: "➡️", text: "Straßenname ändert sich" };
      case 8: return { icon: "⬆️", text: "Weiter geradeaus" };
      case 9: return { icon: "↗️", text: "Leicht rechts halten" };
      case 10: return { icon: "➡️", text: "Rechts abbiegen" };
      case 11: return { icon: "↘️", text: "Scharf rechts abbiegen" };
      case 12: return { icon: "↩️", text: "Wenden (nach rechts)" };
      case 13: return { icon: "↩️", text: "Wenden (nach links)" };
      case 14: return { icon: "↙️", text: "Scharf links abbiegen" };
      case 15: return { icon: "⬅️", text: "Links abbiegen" };
      case 16: return { icon: "↖️", text: "Leicht links halten" };
      case 17: return { icon: "🛣️⬆️", text: "Geradeaus auf Rampe" };
      case 18: return { icon: "🛣️➡️", text: "Rampe rechts nehmen" };
      case 19: return { icon: "🛣️⬅️", text: "Rampe links nehmen" };
      case 20: return { icon: "⬅️🚧", text: "Abfahrt nach rechts" };
      case 21: return { icon: "➡️🚧", text: "Abfahrt nach links" };
      case 22: return { icon: "⬆️", text: "Geradeaus bleiben" };
      case 23: return { icon: "↗️", text: "Rechts halten" };
      case 24: return { icon: "↖️", text: "Links halten" };
      case 25: return { icon: "⇢", text: "Einfädeln" };
      case 26: return { icon: "🔄", text: "Kreisverkehr betreten" };
      case 27: return { icon: "↗️", text: "Kreisverkehr verlassen" };
      case 28: return { icon: "⛴️", text: "Fähre benutzen" };
      case 29: return { icon: "🛳️", text: "Fähre verlassen" };
      case 30: return { icon: "🚉", text: "ÖV benutzen" };
      case 31: return { icon: "🔄🚉", text: "ÖV umsteigen" };
      case 32: return { icon: "🚌➡️", text: "Im ÖV bleiben" };
      case 33: return { icon: "🚶‍♂️🚉", text: "Zum ÖV-Zugang" };
      case 34: return { icon: "🚶‍♂️🔄🚉", text: "Zum Umstieg" };
      case 35: return { icon: "🚶‍♂️🏁", text: "Ziel beim ÖV-Ausgang" };
      case 36: return { icon: "🚶‍♂️", text: "Fußweg zum Ziel" };
      case 37: return { icon: "⇢➡️", text: "Rechts einfädeln" };
      case 38: return { icon: "⇢⬅️", text: "Links einfädeln" };
      case 39: return { icon: "🏢⬇️", text: "In Aufzug eintreten" };
      case 40: return { icon: "🪜⬇️", text: "Treppen betreten" };
      case 41: return { icon: "↘️", text: "Rolltreppe benutzen" };
      case 42: return { icon: "➡️🏢", text: "Gebäude betreten" };
      case 43: return { icon: "⬅️🏢", text: "Gebäude verlassen" };
      default: return { icon: "❓", text: "Unbekannte Richtung" };
    }
  };
  

  const current = instructions[currentIndex] || {};
  const { icon, text } = getDirectionIconByValhallaType(current.type);

  const finalInstruction = current.instruction || text;

  return (
    <div id="NavigationGuidePopup-overlay">
      <div id="NavigationGuidePopup-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button onClick={CloseButtonClick}>
            ×
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div style={{ fontSize: "3rem" }}>
                {icon}
              </div>
              <div className="mt-2 text-center text-lg">
                {finalInstruction}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
