import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import "./navigationpage.css";

export const NavigationGuidePopup = ({ currentIndex }) => {
  const navigate = useNavigate();
  const [instructions, setInstructions] = useState([]);

  useEffect(() => {
    fetch("/data/coordinates_output.geojson")
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

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case "left": return "⬅️";
      case "right": return "➡️";
      case "straight": return "⬆️";
      case "uturn": return "↩️";
      default: return "⬆️";
    }
  };

  const currentInstruction = instructions[currentIndex] || {};

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
                {getDirectionIcon(currentInstruction.direction)}
              </div>
              <div className="mt-2 text-center text-lg">
                {currentInstruction.instruction || currentInstruction.description || "Warten..."}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};