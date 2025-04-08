import "../App.css";
import "./Footer.css"
import "./MapPage.css"
import { useState } from "react";
import { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { MapSwissimage} from "./map/MapSwissimage.jsx";
// import Map from "ol/Map.js";
// import View from "ol/View.js";
// import OSM from "ol/source/OSM.js";
// import TileLayer from "ol/layer/Tile.js";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AddMarkerButton } from "./add_marker/add_marker_button.jsx";



export const MapPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [addMarkerOpen, setAddMarkerOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);};

  const closeModal = () => {
    setModalOpen(false);};

  const closeAddMarker = () => {
    setAddMarkerOpen(false);};


  // Speicher die Karteninstanz, sobald sie von MapSwissimage geladen ist
  const [map, setMap] = useState(null);
    // Wenn active, dann erscheint das Fadenkreuz und der Klick-Handler ist aktiv
    const [markerMode, setMarkerMode] = useState(false);
    // Falls du nur einen Marker zulassen möchtest, kannst du diesen hier speichern
    const [marker, setMarker] = useState(null);
  
    // Callback, das von MapSwissimage aufgerufen wird, sobald die Karte geladen ist
    const handleMapLoad = (mapInstance) => {
      setMap(mapInstance);
    };
  




  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
    <Header></Header>
    <div style={{ zIndex: 0, height: "100%"}}>
      <MapSwissimage
        map={map}
        setMap={setMap}
        markerMode={markerMode}
        setMarkerMode={setMarkerMode}
        marker={marker}
        setMarker={setMarker}
        onMapLoad={handleMapLoad}
      />

      <div className="button-panel">
          <button className="circle-button" onClick={openModal}>
            Ordner
          </button>
          <AddMarkerButton
            markerMode={markerMode}
            setMarkerMode={setMarkerMode}
            setAddMarkerOpen={setAddMarkerOpen}

          />
          <button className="circle-button" onClick={openModal}>
            Info
          </button>
          <button className="circle-button" onClick={openModal}>
            Karte
          </button>
          <button className="circle-button" onClick={openModal}>
            Sonstiges
          </button>
        </div>
    </div>
    <Footer></Footer>

    {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Pop-up-Fenster</h2>
            <p>Hier könnte ein Formular oder weitere Informationen stehen.</p>
            <button onClick={closeModal}>Schließen</button>
          </div>
        </div>
      )}

{addMarkerOpen && (
        <div className="addmarker-overlay">
          <div className="addmarker-content">
            <h3>Neuer Punkt erstellen:</h3>
            <div>
              <label>
                Layer:
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
              <button>Speichern</button>
            </div>
          </div>
        </div>
    )}
    
  </div>  
  );
};




