import React, { useState, useEffect } from "react";
import "../plannerpage.css"

export const ProjectUseMenuPopup = (props) => { 

  const CloseButtonClick = () => {
    props.setProjectUseMenuMode(false);
    props.setStartPageMode(true)
  };
  

  return (
    <div className="PlannerPopup-overlay">
      <div className="PlannerPopup-content">
        <div>
          <h2 className="text-xl font-bold">{props.ActiveProject.name}</h2>
          <button
            onClick={CloseButtonClick}
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button onClick={console.log("der button wurde geklickt")}>
            Route Berechnen
          </button>
          <button onClick={console.log("der button wurde geklickt")}>
            Routing Starten
          </button>
          <button onClick={console.log("der button wurde geklickt")}>
            Statistiken
          </button>
          <button onClick={console.log("der button wurde geklickt")}>
            Projekt löschen
          </button>
        </div>
      </div>
    </div>
  );
  
};

