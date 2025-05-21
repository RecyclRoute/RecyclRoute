// components/map/MapLayerPopup.jsx
import React, { useState, useEffect } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import "./MapLayerPopup.css"
import { BackendURL } from "../../config";



export const MapLayerPopup = (props) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    fetch(BackendURL + '/getProjects')
      .then(res => res.json())
      .then(data => setProjects(data.projects))
      .catch(err => console.error('Fehler beim Laden der Projekte:', err));
  }, []);

  const closeLayerMode = () => props.setChangeLayerMode(false);

  const loadLayer = () => {
    console.log("Layer anzeigen wurde geklickt");
  
    if (!selectedProject) {
      console.warn("Kein Projekt ausgewählt.");
      return;
    }
  
    if (!props.map) {
      console.warn("Karte nicht vorhanden (map).");
      return;
    }
  
    console.log("Lade Punkte für Projekt:", selectedProject);
  
    // Vorherige Marker entfernen
    props.layerMarkers.forEach(marker => marker.remove());
    props.setLayerMarkers([]); // Zustand leeren
  
    fetch(BackendURL +`/getPointsByProject/${selectedProject}`)
      .then(res => res.json())
      .then(data => {
        console.log("Erhaltene Punkte:", data.points);
  
        if (!Array.isArray(data.points) || data.points.length === 0) {
          console.warn("Keine Punkte empfangen oder Liste leer.");
          return;
        }
  
        const newMarkers = [];
  
        data.points.forEach((point) => {
            if (point.longitude === undefined || point.latitude === undefined) {
              console.warn("Ungültiger Punkt:", point);
              return;
            }
          
            const dateFormatted = point.date
            ? new Date(point.date).toLocaleDateString('de-CH')
            : "–";
          
          const imageHTML = point.picture
            ? `<img src="data:image/jpeg;base64,${point.picture}" alt="Bild" style="max-width: 200px; max-height: 150px; margin-top: 8px;" />`
            : "<em>Kein Bild verfügbar</em>";
          
          const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
            <strong>Typ:</strong> ${point.type || "Unbekannt"}<br/>
            <strong>Datum:</strong> ${dateFormatted}<br/>
            ${imageHTML}
          `);
          
          
            const marker = new maplibregl.Marker({ color: 'blue' })
              .setLngLat([point.longitude, point.latitude])
              .setPopup(popup) // ← das ist entscheidend!
              .addTo(props.map);
          
            newMarkers.push(marker);
          });
          
  
        props.setLayerMarkers(newMarkers); // Neue Marker speichern
        props.setChangeLayerMode(false);   // Popup schließen
      })
      .catch(err => console.error('Fehler beim Laden der Punkte:', err));
  };
  
  
  const resetLayer = () => {
    console.log("Layer wird zurückgesetzt");
  
    props.layerMarkers.forEach(marker => marker.remove());
    props.setLayerMarkers([]);
    setSelectedProject("");
    props.setChangeLayerMode(false); // optional
  };
  
  
  


  return (
    <div className={`${props.designConst}-overlay`}>
      <div className={`${props.designConst}-content`}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: "45px"}}>
          <h3 style={{marginTop: 0}}>Punktlayer anzeigen</h3>
          <button className={`${props.designConst}-closeButton`} onClick={closeLayerMode}>X</button>
        </div>
        <label>
          Projekt wählen:
          <select className={`${props.designConst}-PullDownMenus`} value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
            <option value="">Bitte wählen...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: "25px", marginTop: "10px" }}>
          <button className={`${props.designConst}-SaveButton`} onClick={loadLayer}>Layer anzeigen</button>
          <button className={`${props.designConst}-SaveButton`} onClick={resetLayer}>Layer zurücksetzen</button>
        </div>
      </div>
    </div>
  );
};
