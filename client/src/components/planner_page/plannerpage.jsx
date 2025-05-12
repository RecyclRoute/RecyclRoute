import "./plannerpage_footer/plannerpage_footer.css";
import "./plannerpage.css";
import maplibregl from 'maplibre-gl';
import { useState, useEffect } from "react";
import { PlannerpageHeader } from "./plannerpage_header/plannerpage_header.jsx";
import { Footer, PlannerpageFooter } from "./plannerpage_footer/plannerpage_footer.jsx";
import { MapRotationButton } from "../map/MapRotationButton.jsx";
import { MapPositionButton } from "../map/MapPositionButton.jsx";
import { MapLayerButton } from "../map/MapLayerButton.jsx";
import { ProjectManagerPopup } from "./project_manager/ProjectManagerPopup.jsx";
import { useNavigate } from "react-router-dom";
import { BaseMap } from "../map/BaseMap.jsx";
import useCreatePolygon from "../map/useCreatePolygon.jsx";
import { NewProjectPopup } from "./project_manager/NewProjectPopup.jsx";
import { ProjectUseMenuPopup } from "./project_manager/ProjectUseMenuPopup.jsx";

export const PlannerPage = () => {
  const [ProjectManagerMode, setProjectManagerMode] = useState(false);
  const [NewProjectMode, setNewProjectMode] = useState(false);
  const [ProjectUseMenuMode, setProjectUseMenuMode] = useState(false);
  const [polygonMode, setPolygonMode] = useState(false);
  const [CreateStartPointMode, setCreateStartPointMode]= useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [map, setMap] = useState(null);
  const [startPageMode, setStartPageMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null);
  const [ActiveProject, setActiveProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [ProjectName, setProjectName] = useState('');
  const [datum, setDatum] = useState('');
  const [Location, setLocation] = useState('');
  
  const navigate = useNavigate();

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleStartPointConfirmed = (lngLat) => {
    console.log("Startpunkt gesetzt:", lngLat);
    // Do anything you want here — send to backend, enable routing, etc.
  };
  

  const isPointInsidePolygon = (lng, lat, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };
  

  const handleNavigationToPage = () => {
    navigate("/navigation");
  };
  
  const sendPolygonToBackend = async (polygonGeoJSON) => {
    try {
      console.log(JSON.stringify(polygonGeoJSON, null, 2));
      const response = await fetch('http://localhost:8000/addProject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(polygonGeoJSON),
      });
      if (!response.ok) throw new Error('Fehler beim Routenberechnen');
      const result = await response.json();
      alert(`Projekt "${ProjectName}" gespeichert.`);
      setPolygonMode(false);
      setCreateStartPointMode(true);
      alert("Bitte klicken Sie auf einen Punkt innerhalb des Polygons, um den Startpunkt zu setzen.");
    } catch (error) {
      console.error("Backend Fehler:", error);
      alert("Fehler beim senden.");
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

  useEffect(() => {
    if (!map || !CreateStartPointMode) return;
  
    const handleStartPointClick = (e) => {
      const { lng, lat } = e.lngLat;
  
      if (isPointInsidePolygon(lng, lat, polygonPoints)) {
        // Remove old marker if exists
        if (startPoint) startPoint.remove();
  
        // Create new marker
        const newMarker = new maplibregl.Marker({ color: 'green' })
          .setLngLat([lng, lat])
          .addTo(map);
  
        setStartPoint(newMarker);
  
        // Callback to handle further logic
        handleStartPointConfirmed({ lng, lat });
  
        // Optional: disable further clicks
        setCreateStartPointMode(false);
      } else {
        alert('Bitte klicken Sie auf einen Punkt innerhalb des Polygons.');
      }
    };
  
    map.on('click', handleStartPointClick);
    return () => map.off('click', handleStartPointClick);
  }, [map, CreateStartPointMode, polygonPoints, startPoint]);
  

  useEffect(() => {
    const heute = new Date().toISOString().split('T')[0];
    setDatum(heute);

    // Fetch projects
    fetch("http://localhost:8000/getProjects")
    .then(res => res.json())
    .then(data => {
      console.log("FETCH RESPONSE:", data);  // <-- richtig
      if (Array.isArray(data.projects)) {
        setProjects(data.projects);
      } else {
        console.error("Ungültiges Projektformat:", data);
      }
    });
  

  }, []);

  const checkInputNewProject = () => {
    if (ProjectName && Location) {
      handleProjectSubmit({ ProjectName, Location });
    } else {
      alert('Bitte alle Felder ausfüllen.');
    }
  };


  const handleProjectSubmit = async ({ ProjectName, Location }) => {

    setNewProjectMode(false);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(Location)}&country=Switzerland&format=json`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lon, lat } = data[0];
        map.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 14 });
        setProjectInfo({ ProjectName, Location });
        setPolygonMode(true);
        alert(`Projekt "${ProjectName}" gestartet! Bitte zeichne nun das Polygon.`);
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
            <MapLayerButton classNameMapButtons="PlannerPageMapButtons"/>
            <MapPositionButton classNameMapButtons="PlannerPageMapButtons" map={map} />
            <MapRotationButton classNameMapButtons="PlannerPageMapButtons" map={map} />
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

      <PlannerpageFooter
        startPageMode={startPageMode}
        setStartPageMode={setStartPageMode}
        ProjectManagerMode={ProjectManagerMode}
        setProjectManagerMode={setProjectManagerMode}
      />

      {ProjectManagerMode && (
        <ProjectManagerPopup
        startPageMode={startPageMode}
        setStartPageMode={setStartPageMode}
        ProjectManagerMode={ProjectManagerMode}
        setProjectManagerMode={setProjectManagerMode}
        NewProjectMode={NewProjectMode}
        setNewProjectMode={setNewProjectMode}
        ActiveProject={setActiveProject}
        setActiveProject={setActiveProject}
        projects={projects}
        setProjects={setProjects}
        ProjectUseMenuMode={ProjectUseMenuMode}
        setProjectUseMenuMode={setProjectUseMenuMode}
        />
      )}

      {NewProjectMode && (
        <NewProjectPopup
          startPageMode={startPageMode}
          setStartPageMode={setStartPageMode}
          NewProjectMode={NewProjectMode}
          setNewProjectMode={setNewProjectMode}
          ActiveProject={ActiveProject}
          setActiveProject={setActiveProject}
          ProjectName={ProjectName}
          setProjectName={setProjectName}
          Location={Location}
          setLocation={setLocation}
          checkInputNewProject={checkInputNewProject}
        />
      )}

      {ProjectUseMenuMode && (
        <ProjectUseMenuPopup
          startPageMode={startPageMode}
          setStartPageMode={setStartPageMode}
          ActiveProject={ActiveProject}
          setActiveProject={setActiveProject}
          ProjectUseMenuMode={ProjectUseMenuMode}
          setProjectUseMenuMode={setProjectUseMenuMode}
        />
      )}
    </div>
  );
};
