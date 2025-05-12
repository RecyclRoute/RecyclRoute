// components/map/MapLayerPopup.jsx
import React, { useState, useEffect } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

export const MapLayerPopup = (props) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/getProjects')
      .then(res => res.json())
      .then(data => setProjects(data.projects))
      .catch(err => console.error('Fehler beim Laden der Projekte:', err));
  }, []);

  const closePopup = () => props.setChangeLayerMode(false);

  const loadLayer = () => {
    if (!selectedProject || !props.map) return;

    fetch(`http://localhost:8000/getPointsByProject/${selectedProject}`)
      .then(res => res.json())
      .then(data => {
        data.points.forEach((point) => {
          new maplibregl.Marker({ color: 'blue' })
            .setLngLat([point.longitude, point.latitude])
            .addTo(props.map);
        });
      })
      .catch(err => console.error('Fehler beim Laden der Punkte:', err));

      props.setChangeLayerMode(false);
  };

  return (
    <div className="addmarker-overlay">
      <div className="addmarker-content">
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: "45px"}}>
          <h3 style={{marginTop: 0}}>Punktlayer anzeigen</h3>
          <button className="closeButton" onClick={closePopup}>X</button>
        </div>
        <label>
          Projekt wählen:
          <select className='addMarkerPullDownMenus' value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
            <option value="">Bitte wählen...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <div>
          <button className="SaveButton" onClick={loadLayer}>Layer anzeigen</button>
        </div>
      </div>
    </div>
  );
};
