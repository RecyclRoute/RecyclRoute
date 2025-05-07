import React, { useState } from 'react';
import '../plannerpage.css'; // Modal Styling ist schon drin!

export const NewProjectPopup = (props) => {
  

  const CloseButtonClick = () => {
    props.setNewProjectMode(false)
    props.setStartPageMode(true)
  };


  return (
    <div className="PlannerPopup-overlay">
      <div className="PlannerPopup-content">
        <div>
          <h2>Neues Projekt erstellen</h2>
          <button
            onClick={CloseButtonClick}
            className=""
          >
            ×
          </button>
        </div>
        <input
          type="text"
          placeholder="Projektname"
          value={props.ProjectName}
          onChange={(e) => props.setProjectName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Gemeinde"
          value={props.Location}
          onChange={(e) => props.setLocation(e.target.value)}
        />
        <div style={{ marginTop: '10px' }}>
          <button onClick={props.checkInputNewProject}>Weiter</button>
        </div>
      </div>
    </div>
  );
};
