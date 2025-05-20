import React, { useState, useEffect } from "react";
import "../../plannerpage.css"

export const ProjectStatisticsPopup = (props) => { 

    const GoBackToUseMenu = () => {
    props.setProjectUseMenuMode(true);
    props.setProjectStatisticMode(false)
  };

  return (
    <div className="ProjectManagerPopup-overlay">
      <div className="ProjectManagerPopup-content">
        <div>
          <div style={{marginBottom: "10px"}}>Wir arbeiten daran Ihnen möglichst rasch weitere Funktionen bieten zu können</div>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px",}}>
          <button
            className="ProjectManagerPopup-Button"
            onClick={GoBackToUseMenu}>
            Zurück
          </button>
          </div>
        </div>
      </div>
    </div>
  );
  
};

