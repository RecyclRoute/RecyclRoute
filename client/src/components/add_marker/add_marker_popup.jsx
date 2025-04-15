import React, { useState, useEffect } from 'react';
import { MapSwissimage } from "../map/MapSwissimage.jsx";
import "./add_marker.css";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const AddMarkerPopup = (props) => {
  const [projectName, setProjectName] = useState('');
  const [bemerkungen, setBemerkungen] = useState('');
  const [datum, setDatum] = useState('');

  useEffect(() => {
    const heute = new Date().toISOString().split('T')[0];
    setDatum(heute);
  }, []);

  const closeAddMarker = () => {
    props.setAddMarkerOpen(false);
    props.setMarkerMode(false);
    props.setStartPageMode(true);
    if (props.marker) {
      props.marker.remove();
    }
  };

  const saveMarker = () => {
    if (projectName && bemerkungen && datum) {
      onsubmit({ projectName, bemerkungen, datum });
    } else {
      alert('Bitte alle Felder ausfüllen.');
    }
    props.setAddMarkerOpen(false);
    props.setMarkerMode(false);
    props.setStartPageMode(true);
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
              <option value="Projekt A">Projekt A</option>
              <option value="Projekt B">Projekt B</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Bemerkungen:
            <select
              type="text"
              value={bemerkungen}
              onChange={(e) => setBemerkungen(e.target.value)}
              style={{ marginLeft: "10px", width: "60%" }}
            >
              <option value="Schlecht bereitgestellt">Schlecht bereitgestellt</option>
              <option value="Enthält Fremdstoffe">Enthält Fremdstoffe</option>
              <option value="Andere">Andere</option>
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
