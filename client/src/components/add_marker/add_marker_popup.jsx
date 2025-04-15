import React, { useState, useEffect } from 'react';
import { MapSwissimage} from "../map/MapSwissimage.jsx";
import "./add_marker.css";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const AddMarkerPopup = (props) => {

  const closeAddMarker = () => {
    props.setAddMarkerOpen(false);
    props.setMarkerMode(false);
    props.setStartPageMode(true)
    if (props.marker) {
      props.marker.remove();
    }}

  const saveMarker = () => {
    props.setAddMarkerOpen(false);
    props.setMarkerMode(false);
    props.setStartPageMode(true)};
  
  
  return (
    <div className="addmarker-overlay">
    <div className="addmarker-content">
      <h3>Neuer Punkt erstellen:</h3>
      <div>
        <label>
          Projekt:
          <select style={{ marginLeft: "10px" }}>
            <option value="">Bitte wählen...</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>
          Bemerkungen:
          <input
            type="text"
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