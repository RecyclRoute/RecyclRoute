import React, { useState, useEffect } from 'react';
import "./add_marker.css";
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
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: "45px"}}>
        <h3 style={{marginTop: "0px", alignItems: "flex-start"}}>Neuer Punkt erstellen:</h3>
        <button className='closeButton' onClick={closeAddMarker}>
            X
          </button>
        </div>
        

        <div>
          <label>
            Projekt:
            <select className='addMarkerPullDownMenus'
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
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

        <div>
          <label>
            Bemerkungen:
            <select
              className='addMarkerPullDownMenus'
              value={bemerkungen}
              onChange={(e) => setBemerkungen(e.target.value)}
            >
              <option value="">Bitte wählen...</option>
              {pointTypes.map((type, idx) => (
                <option key={idx} value={type}>{type}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label>
            Datum:
            <input className='addMarkerPullDownMenus'
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
            />
          </label>
        </div>
<div style={{display: "flex", alignItems: "flex-start"}}>
  <label>Upload Foto:</label>
        <div>
  <label className="UploadFotoButton" style={{ marginLeft: "10px", position: 'relative', overflow: 'hidden', display: 'inline-block'}}>
    Datei auswählen:
    <input
      type="file"
      accept="image/*"
      capture="environment"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        opacity: 0,
        cursor: 'pointer',
        height: '100%',
        width: '100%',

      }}
    />
  </label>
</div>
</div>

        <div>

          <button className="SaveButton" onClick={saveMarker}>Punkt Speichern</button>
        </div>
      </div>
    </div>
  );
};
