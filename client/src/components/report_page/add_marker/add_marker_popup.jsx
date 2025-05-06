import React, { useState, useEffect } from 'react';
import { MapSwissimage } from "../../map/useCreateMarker.jsx";
import "./add_marker.css";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const AddMarkerPopup = (props) => {
  const [projects, setProjects] = useState([]);
  const [pointTypes, setPointTypes] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [bemerkungen, setBemerkungen] = useState('');
  const [datum, setDatum] = useState('');

  useEffect(() => {
    const heute = new Date().toISOString().split('T')[0];
    setDatum(heute);

    // Fetch projects
    fetch("http://localhost:8000/getProjects")
      .then(res => res.json())
      .then(data => setProjects(data.projects))  // ← nur das Array speichern
      .catch(err => console.error("Fehler beim Laden der Projekte:", err));

    // Fetch point types
    fetch("http://localhost:8000/getPointTypes")
      .then(res => res.json())
      .then(data => setPointTypes(data))
      .catch(err => console.error("Fehler beim Laden der Punkt-Typen:", err));
  }, []);

  const getProjectIdFromName = (name) => {
    const project = projects.find(p => p.name === name);
    return project?.id || 0;
  };

  const closeAddMarker = () => {
    props.setAddMarkerOpen(false);
    props.setMarkerMode(false);
    props.setStartPageMode(true);
    if (props.marker) {
      props.marker.remove();
    }
  };

  const saveMarker = async () => {
    if (!projectName || !bemerkungen || !datum || !props.marker) {
      alert('Bitte alle Felder ausfüllen und Marker setzen.');
      return;
    }

    const coordinates = props.marker.getLngLat();
    const latitude = coordinates.lat;
    const longitude = coordinates.lng;

    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    if (!file) {
      alert("Bitte ein Foto hochladen.");
      return;
    }

    const formData = new FormData();
    formData.append("project_id", getProjectIdFromName(projectName));
    formData.append("point_type", bemerkungen);
    formData.append("date", datum.replace(/-/g, "/"));
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("picture", file);

    try {
      const response = await fetch("http://localhost:8000/addPointWithDetails", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }

      alert("Punkt erfolgreich gespeichert.");
    } catch (error) {
      alert("Fehler beim Speichern: " + error.message);
    }

    closeAddMarker();
  };

  return (
    <div className="addmarker-overlay">
      <div className="addmarker-content">
        <h3>Neuer Punkt erstellen:</h3>

        <div>
          <label>
            Projekt:
            <select
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{ marginLeft: "10px" }}
            >
              <option value="">Bitte wählen...</option>
              {projects.map(project => (
                <option key={project.id} value={project.name}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Bemerkungen:
            <select
              value={bemerkungen}
              onChange={(e) => setBemerkungen(e.target.value)}
              style={{ marginLeft: "10px", width: "60%" }}
            >
              <option value="">Bitte wählen...</option>
              {pointTypes.map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Datum:
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              style={{ marginLeft: "10px", width: "60%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px", flexDirection: "row" }}>
          <label>
            Upload Foto:
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ marginLeft: "10px" }}
            />
          </label>
        </div>

        <div>
          <button style={{ marginRight: "10px" }} onClick={closeAddMarker}>
            Abbrechen
          </button>
          <button onClick={saveMarker}>Speichern</button>
        </div>
      </div>
    </div>
  );
};
