import "../App.css";
import "./footer/Footer.css";
import "./MapPage.css";
import { useState } from "react";
import { Header } from "./Header.jsx";
import { Footer } from "./footer/Footer.jsx";
import { MapSwissimage } from "./map/MapSwissimage.jsx";
import { AddMarkerButton } from "./add_marker/add_marker_button.jsx";
import { AddMarkerPopup } from "./add_marker/add_marker_popup.jsx";
import { LoginPopup } from "./footer/login_popup.jsx";
import { AddMarkerPopupInfo } from "./add_marker/add_marker_popup_info.jsx";
import { MapRotationButton } from "./map/MapRotationButton.jsx";
import { MapPositionButton } from "./map/MapPositionButton.jsx";
import { MapLayerButton } from "./map/MapLayerButton.jsx";
import { ProjectManagerButton } from "./project_manager/ProjectManagerButton.jsx";
import { ProjectStatsButton } from "./project_manager/ProjectStatsButton.jsx";
import { ProjectPopup } from "./project_manager/ProjectPopup.jsx";
import { useNavigate } from "react-router-dom";

export const MapPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [addMarkerOpen, setAddMarkerOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [projectPopupOpen, setProjectPopupOpen] = useState(false);
  const [polygonMode, setPolygonMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [map, setMap] = useState(null);
  const [markerMode, setMarkerMode] = useState(false);
  const [marker, setMarker] = useState(null);
  const [startPageMode, setStartPageMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // 🧩 Ladezustand für Animation
  const [showProjectPopup, setShowProjectPopup] = useState(false); // oder false, wenn du manuell öffnest
  const [projectInfo, setProjectInfo] = useState(null);
  const navigate = useNavigate(); // 🧩 useNavigate-Hook für Navigation
  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleNavigationToPage = () => {
    navigate("/navigation");
  };
  const handleProjectSubmit = async ({ projectName, municipality }) => {
    setProjectPopupOpen(false);
  
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
          municipality
        )}&country=Switzerland&format=json`
      );
      const data = await response.json();
  
      if (data.length > 0) {
        const { lon, lat } = data[0];
        map.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 14 });
  
        // 🔥 HIER: Projektinfo speichern
        setProjectInfo({ projectName, municipality });
  
        setPolygonMode(true);
        alert(`Projekt "${projectName}" gestartet! Bitte zeichne nun das Polygon.`);
      } else {
        alert("Keine Ergebnisse gefunden. Bitte überprüfe die Eingaben.");
      }
    } catch (error) {
      console.error("Geocoding Fehler:", error);
      alert("Fehler beim Geocoding.");
    }
  };
  

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      <div style={{ zIndex: 0, height: "100%" }}>
        <MapSwissimage
          map={map}
          setMap={setMap}
          markerMode={markerMode}
          setMarkerMode={setMarkerMode}
          marker={marker}
          setMarker={setMarker}
          onMapLoad={handleMapLoad}
          polygonMode={polygonMode}
          setPolygonMode={setPolygonMode}
          polygonPoints={polygonPoints}
          setPolygonPoints={setPolygonPoints}
          setIsLoading={setIsLoading} // 🧩 Ladeanimation übergeben
          projectInfo={projectInfo}
          onNavigateToNavigation={handleNavigationToPage}
        />

        {startPageMode && (
          <div className="button-panel">
            <ProjectStatsButton />
            <ProjectManagerButton onClick={() => setProjectPopupOpen(true)} />
            <AddMarkerButton
              markerMode={markerMode}
              setMarkerMode={setMarkerMode}
              setAddMarkerOpen={setAddMarkerOpen}
              startPageMode={startPageMode}
              setStartPageMode={setStartPageMode}
            />
            <MapLayerButton />
            <MapPositionButton map={map} />
            <MapRotationButton map={map} />
          </div>
        )}

        {/* 🧩 Ladeanimation */}
        {isLoading && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "20px 40px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <div className="loader" style={{ marginBottom: "10px" }}></div>
            Route wird berechnet, bitte kurz Geduld haben...
          </div>
        )}
      </div>

      <Footer setLoginOpen={setLoginOpen} startPageMode={startPageMode} setStartPageMode={setStartPageMode} />

      {addMarkerOpen && (
        <>
          <AddMarkerPopup
            markerMode={markerMode}
            setMarkerMode={setMarkerMode}
            setAddMarkerOpen={setAddMarkerOpen}
            startPageMode={startPageMode}
            setStartPageMode={setStartPageMode}
            marker={marker}
          />
          <AddMarkerPopupInfo />
        </>
      )}

      {loginOpen && (
        <LoginPopup setLoginOpen={setLoginOpen} startPageMode={startPageMode} setStartPageMode={setStartPageMode} />
      )}

      {projectPopupOpen && (
        <ProjectPopup
          onClose={() => setProjectPopupOpen(false)}
          onSubmit={(projectData) => handleProjectSubmit(projectData)}
        />
      )}
      {showProjectPopup && (
        <ProjectPopup
        onClose={() => setShowProjectPopup(false)}
        onSubmit={(info) => {
          setProjectInfo(info);
          setShowProjectPopup(false);
        }}
  />
)}

    </div>
  );
};
