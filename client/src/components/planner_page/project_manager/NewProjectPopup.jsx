import React, { useState } from 'react';
import '../plannerpage.css'; // Modal Styling ist schon drin!

export const NewProjectPopup = (props) => {
  const [ProjectName, setProjectName] = useState('');
  const [Location, setLocation] = useState('');

  const handleSubmit = () => {
    if (ProjectName && Location) {
      props.onSubmit({ ProjectName, Location });
    } else {
      alert('Bitte alle Felder ausfüllen.');
    }
  };

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
          value={ProjectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Gemeinde"
          value={Location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleSubmit}>Weiter</button>
        </div>
      </div>
    </div>
  );
};
