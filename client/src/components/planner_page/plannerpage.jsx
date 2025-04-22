import "./plannerpage_footer/plannerpage_footer.css";
import "./plannerpage.css";
import { useState, useEffect } from "react";
import { PlannerpageHeader } from "./plannerpage_header/plannerpage_header.jsx";
import { Footer, PlannerpageFooter } from "./plannerpage_footer/plannerpage_footer.jsx";
import { MapRotationButton } from "../map/MapRotationButton.jsx";
import { MapPositionButton } from "../map/MapPositionButton.jsx";
import { MapLayerButton } from "../map/MapLayerButton.jsx";
import { ProjectManagerButton } from "./project_manager/ProjectManagerButton.jsx";
import { ProjectStatsButton } from "./project_manager/ProjectStatsButton.jsx";
import { ProjectPopup } from "./project_manager/ProjectPopup.jsx";
import { useNavigate } from "react-router-dom";
import { BaseMap } from "../map/BaseMap.jsx";
import useCreateMarker from "../map/useCreateMarker.jsx";
import useCreatePolygon from "../map/useCreatePolygon.jsx";

export const PlannerPage = () => {
  const [projectPopupOpen, setProjectPopupOpen] = useState(false);
  const [polygonMode, setPolygonMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [startPageMode, setStartPageMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showProjectPopup, setShowProjectPopup] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null);
  
  const navigate = useNavigate();

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleNavigationToPage = () => {
    navigate("/navigation");
  };
  
  const sendPolygonToBackend = async (polygonGeoJSON) => {
    try {
      const response = await fetch('http://localhost:8000/addProject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(polygonGeoJSON),
      });
      if (!response.ok) throw new Error('Fehler beim Routenberechnen');
      const result = await response.json();
      alert('Route erfolgreich berechnet!');
      handleNavigationToPage();
    } catch (error) {
      console.error("Backend Fehler:", error);
      alert("Fehler bei der Routenberechnung.");
    }
  };

  useCreatePolygon({
    map,
    polygonMode,
    polygonPoints,
    setPolygonPoints,
    projectInfo,
    setPolygonMode,
    sendPolygonToBackend
  });

  const handleProjectSubmit = async ({ projectName, municipality }) => {
    setProjectPopupOpen(false);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(municipality)}&country=Switzerland&format=json`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lon, lat } = data[0];
        map.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 14 });
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
      <PlannerpageHeader/>
      <div style={{ zIndex: 0, height: "100%" }}>
        <BaseMap
          map={map}
          setMap={setMap}
          onMapLoad={handleMapLoad}
          polygonMode={polygonMode}
          setPolygonMode={setPolygonMode}
          polygonPoints={polygonPoints}
          setPolygonPoints={setPolygonPoints}
          setIsLoading={setIsLoading}
          projectInfo={projectInfo}
          onNavigateToNavigation={handleNavigationToPage}
        />

        {startPageMode && (
          <div className="button-panel">
            <ProjectStatsButton className="PlannerPageMapButtons"/>
            <ProjectManagerButton onClick={() => setProjectPopupOpen(true)} />
            <MapLayerButton className="PlannerPageMapButtons"/>
            <MapPositionButton className="PlannerPageMapButtons" map={map} />
            <MapRotationButton className="PlannerPageMapButtons" map={map} />
          </div>
        )}

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

      <PlannerpageFooter/>

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
