import React, { useState, useEffect } from "react";
import "../../plannerpage.css"

export const ProjectUseMenuPopup = (props) => { 


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
    <div className="ProjectManagerPopup-overlay">
      <div className="ProjectManagerPopup-content">
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: "45px"}}>
          <h3 style={{marginTop: "0px", marginRight: "10px", alignItems: "flex-start"}}>Projekt: {props.ActiveProject.name}</h3>
          <button
            onClick={CloseButtonClick}
            className="ProjectManagerPopup-closeButton"
          >
            ×
          </button>
        </div>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px",}}>
          <button className="ProjectManagerPopup-Button" onClick={console.log("der button wurde geklickt")}>
            Route Berechnen
          </button>
          <button className="ProjectManagerPopup-Button" onClick={console.log("der button wurde geklickt")}>
            Routing Starten
          </button>
          <button className="ProjectManagerPopup-Button" onClick={StatisticButtonClick}>
            Statistiken
          </button>
          <button className="ProjectManagerPopup-Button" onClick={ProjectDeleteButtonClick}>
            Projekt löschen
          </button>
        </div>
      </div>
    </div>
  );
  
};

