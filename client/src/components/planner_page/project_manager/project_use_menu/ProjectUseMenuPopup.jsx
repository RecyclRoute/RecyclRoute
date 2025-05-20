import React, { useState, useEffect } from "react";
import "../../plannerpage.css"
import { useNavigate } from 'react-router-dom';

export const ProjectUseMenuPopup = (props) => { 
  const navigate = useNavigate();


  const CloseButtonClick = () => {
    props.setProjectUseMenuMode(false);
    props.setStartPageMode(true)
  };

    const StatisticButtonClick = () => {
    props.setProjectUseMenuMode(false);
    props.setProjectStatisticMode(true)
  };

    const ProjectDeleteButtonClick = () => {
    props.setProjectUseMenuMode(false);
    props.setProjectDeleteCallbackMode(true)
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
          <button onClick={() => {navigate('/navigation')}}>
            Routing Starten
          </button>
          <button onClick={StatisticButtonClick}>
            Statistiken
          </button>
          <button onClick={ProjectDeleteButtonClick}>
            Projekt löschen
          </button>
        </div>
      </div>
    </div>
  );
  
};

