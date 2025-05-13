import React, { useState, useEffect } from "react";
import "../../plannerpage.css"

export const ProjectStatisticsPopup = (props) => { 

    const GoBackToUseMenu = () => {
    props.setProjectUseMenuMode(true);
    props.setProjectStatisticMode(false)
  };

  return (
    <div className="PlannerPopup-overlay">
      <div className="PlannerPopup-content">
        <div className="flex justify-between items-center mb-4">
          <div>Wir arbeiten daran Ihnen möglichst rasch weitere Funktionen bieten zu können</div>
          <button className="bg-cyan-800 text-white hover:bg-cyan-700 px-4 py-2 rounded-full"
          onClick={GoBackToUseMenu}>
            Zurück
          </button>
        </div>
      </div>
    </div>
  );
  
};

