import React, { useState } from 'react';
import '../MapPage.css'; // Modal Styling ist schon drin!

export const ProjectPopup = ({ onClose, onSubmit }) => {
  const [projectName, setProjectName] = useState('');
  const [municipality, setMunicipality] = useState('');

  const handleSubmit = () => {
    if (projectName && municipality) {
      onSubmit({ projectName, municipality });
    } else {
      alert('Bitte alle Felder ausfüllen.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Neues Projekt erstellen</h2>
        <input
          type="text"
          placeholder="Projektname"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Gemeinde"
          value={municipality}
          onChange={(e) => setMunicipality(e.target.value)}
        />
        <div style={{ marginTop: '10px' }}>
          <button onClick={handleSubmit}>Weiter</button>
          <button onClick={onClose} style={{ marginLeft: '10px' }}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
};
