import React, { useState } from 'react';
import '../../plannerpage.css'; // Modal Styling ist schon drin!

export const NewProjectPopup = (props) => {
  

  const CloseButtonClick = () => {
    props.setNewProjectMode(false)
    props.setStartPageMode(true)
  };


  return (
    <div className="ProjectManagerPopup-overlay">
      <div className="ProjectManagerPopup-content">
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: "45px"}}>
          <h3 style={{marginTop: "0px", marginRight: "10px", alignItems: "flex-start"}}>Neues Projekt erstellen</h3>
          <button
            onClick={CloseButtonClick}
            className="ProjectManagerPopup-closeButton"
          >
            ×
          </button>
        </div>
        <label>Projektname:
        <input
          type="text"
          placeholder="Bitte ausfüllen..."
          className="ProjectManagerPopup-Inputs"
          value={props.ProjectName}
          onChange={(e) => props.setProjectName(e.target.value)}
        />
        </label>
        <label>Gemeinde:
        <input
          type="text"
          placeholder="Bitte ausfüllen..."
          className="ProjectManagerPopup-Inputs"
          value={props.Location}
          onChange={(e) => props.setLocation(e.target.value)}
        />
        </label>
        <div>
          <label>
            Datum:
            <input 
              type="date"
              className="ProjectManagerPopup-Inputs"
              value={props.Datum}
              onChange={(e) => props.setDatum(e.target.value)}
            />
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <button className="ProjectManagerPopup-Button" onClick={props.checkInputNewProject}>Weiter</button>
        </div>
      </div>
    </div>
  );
};
