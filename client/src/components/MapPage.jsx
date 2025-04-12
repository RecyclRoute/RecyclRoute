import "../App.css";
import "./footer/Footer.css"
import "./MapPage.css"
import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./footer/Footer.jsx";
import { MapSwissimage} from "./map/MapSwissimage.jsx";
// import Map from "ol/Map.js";
// import View from "ol/View.js";
// import OSM from "ol/source/OSM.js";
// import TileLayer from "ol/layer/Tile.js";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AddMarkerButton } from "./add_marker/add_marker_button.jsx";
import { AddMarkerPopup } from "./add_marker/add_marker_popup.jsx";
import { LoginPopup } from "./footer/login_popup.jsx";
import { AddMarkerPopupInfo } from "./add_marker/add_marker_popup_info.jsx";
import { MapRotationButton } from "./map/MapRotationButton.jsx";
import { MapPositionButton } from "./map/MapPositionButton.jsx";
import { MapLayerButton } from "./map/MapLayerButton.jsx";
import { ProjectManagerButton} from "./project_manager/ProjectManagerButton.jsx";
import { ProjectStatsButton} from "./project_manager/ProjectStatsButton.jsx";


export const MapPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [addMarkerOpen, setAddMarkerOpen] = useState(false);
  const [LoginOpen, setLoginOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);};

  const closeModal = () => {
    setModalOpen(false);};

  // Speicher die Karteninstanz, sobald sie von MapSwissimage geladen ist
  const [map, setMap] = useState(null);

    // Wenn active, dann erscheint das Fadenkreuz und der Klick-Handler ist aktiv
    const [markerMode, setMarkerMode] = useState(false);
    // Falls du nur einen Marker zulassen möchtest, kannst du diesen hier speichern
    const [marker, setMarker] = useState(null);

    const [startPageMode, setStartPageMode] = useState(true)
  
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
      {startPageMode && (
      <div className="button-panel">
          <ProjectStatsButton>
            Ordner
          </ProjectStatsButton>
          <ProjectManagerButton>
            Ordner
          </ProjectManagerButton>
          <AddMarkerButton
            markerMode={markerMode}
            setMarkerMode={setMarkerMode}
            setAddMarkerOpen={setAddMarkerOpen}
            startPageMode={startPageMode}
            setStartPageMode={setStartPageMode}
          />
          <MapLayerButton>
            
          </MapLayerButton>
          <MapPositionButton
            map={map}
          />
          <MapRotationButton
            map={map}
          />
          </div>
        )} 
    </div>
    <Footer
      setLoginOpen={setLoginOpen}
      startPageMode={startPageMode}
      setStartPageMode={setStartPageMode}
    />
    {addMarkerOpen && (
    <AddMarkerPopup
      markerMode={markerMode}
      setMarkerMode={setMarkerMode}
      setAddMarkerOpen={setAddMarkerOpen}
      startPageMode={startPageMode}
      setStartPageMode={setStartPageMode}
      marker={marker}
    />
    )}
  {addMarkerOpen && (
    <AddMarkerPopupInfo
    />
  )}
{LoginOpen && (
    <LoginPopup
      setLoginOpen={setLoginOpen}
      startPageMode={startPageMode}
      setStartPageMode={setStartPageMode}
    />
    )}
    </div>  
  );
};




