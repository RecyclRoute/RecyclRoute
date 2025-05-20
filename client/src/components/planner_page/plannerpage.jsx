import "./plannerpage_footer/plannerpage_footer.css";
import "./plannerpage.css";
import maplibregl from 'maplibre-gl';
import { useState, useEffect, useRef } from "react";
import { PlannerpageHeader } from "./plannerpage_header/plannerpage_header.jsx";
import { Footer, PlannerpageFooter } from "./plannerpage_footer/plannerpage_footer.jsx";
import { MapRotationButton } from "../map/MapRotationButton.jsx";
import { MapPositionButton } from "../map/MapPositionButton.jsx";
import { MapLayerButton } from "../map/MapLayerButton.jsx";
import { ProjectManagerPopup } from "./project_manager/ProjectManagerPopup.jsx";
import { useNavigate } from "react-router-dom";
import { BaseMap } from "../map/BaseMap.jsx";
import useCreatePolygon from "../map/useCreatePolygon.jsx";
import { NewProjectPopup } from "./project_manager/new_project/NewProjectPopup.jsx";
import { ProjectUseMenuPopup } from "./project_manager/project_use_menu/ProjectUseMenuPopup.jsx";
import {PolygonInstructionsPopup} from "./project_manager/new_project/PolygonInstructionsPopup.jsx";
import {SavePolygonPopup} from "./project_manager/new_project/SavePolygonPopup.jsx";
import {StartPointInstructionsPopup} from "./project_manager/new_project/StartPointInstructionsPopup.jsx";
import { MapLayerPopup } from "../map/MapLayerPopup.jsx";
import { CalculateWaitingPopUp } from "./project_manager/new_project/CalculateWaitingPopUp.jsx";
import { ProjectStatisticsPopup } from "./project_manager/project_use_menu/ProjectStatisticsPopup.jsx";
import { ProjectDeleteCallbackPopup } from"./project_manager/project_use_menu/ProjectDeleteCallbackPopup.jsx";

export const PlannerPage = () => {
  const [ProjectManagerMode, setProjectManagerMode] = useState(false);
  const [NewProjectMode, setNewProjectMode] = useState(false);
  const [ProjectUseMenuMode, setProjectUseMenuMode] = useState(false);
  const [ProjectStatisticMode, setProjectStatisticMode] = useState(false);
  const [ProjectDeleteCallbackMode, setProjectDeleteCallbackMode] = useState(false);
  const [polygonMode, setPolygonMode] = useState(false);
  const [CreateStartPointMode, setCreateStartPointMode]= useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [map, setMap] = useState(null);
  const [startPageMode, setStartPageMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [ActiveProject, setActiveProject] = useState(null);
  const [ProjectName, setProjectName] = useState('');
  const [Datum, setDatum] = useState('');
  const [Location, setLocation] = useState('');
  const [changeLayerMode, setChangeLayerMode] = useState(false);
  const [layerMarkers, setLayerMarkers] = useState([]);
  const [SearchLocation, setSearchLocation] = useState('');
  const [calculationStarted, setCalculationStarted] = useState(false);
  const calculationTriggered = useRef(false);  // statt State → bleibt stabil auch bei Re-Renders
  const [calculationCompleted, setCalculationCompleted] = useState(false);
  const [userConfirmedRecalculation, setUserConfirmedRecalculation] = useState(false);

  const navigate = useNavigate();

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleStartPointConfirmed = (lngLat) => {
  if (calculationStarted) {
    console.warn("Berechnung bereits gestartet, ignoriere weiteren Klick");
    return;
  }
  calculationTriggered.current = true;
  setCalculationStarted(true);
  const coordinates = [lngLat.lng, lngLat.lat];
  console.log("Startpunkt gesetzt:", coordinates);
    if (calculationCompleted && !userConfirmedRecalculation) {
      const userWantsToRecalculate = window.confirm(
        "Dieses Projekt wurde bereits berechnet. Möchten Sie die Berechnung erneut starten?"
      );
      if (!userWantsToRecalculate) {
        console.log("✅ Nutzer hat Berechnung nicht erneut ausgelöst.");
        return;
      }
      setUserConfirmedRecalculation(true);
    }

    

    setCreateStartPointMode(false);
    setIsLoading(true);
    sendCalculationRequestToBackend(ProjectName, coordinates);
  };

  
  const sendCalculationRequestToBackend = async (ProjectName, startPoint) => {
  if (!startPoint || !ProjectName) {
    console.error("Fehlende Eingaben für Projektname oder Startpunkt");
    return;
  }
    if (!startPoint || !ProjectName) {
      console.error("❌ Fehlende Eingaben für Projektname oder Startpunkt");
      return;
    }

  const payload = {
    project_name: ProjectName,
    point_geometry: {
      type: "Point",
      coordinates: startPoint
    }
  };

  try {
    const response = await fetch(`http://localhost:8000/berechnen?project_name=${ProjectName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 409) {
      console.warn("Berechnung wurde bereits abgeschlossen.");
      alert("Dieses Projekt wurde bereits berechnet.");
      return;
    }

    if (response.status === 202) {
      console.warn("Berechnung läuft bereits.");
      alert("Die Berechnung läuft bereits.");
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Serverfehler: ${errorText}`);
    }

    const data = await response.json();
if (data.status === "done") {
  setIsLoading(false);
  navigate("/navigation");
}

  }catch (error) {
    console.error("Anfrage fehlgeschlagen:", error);
    alert("Die Berechnung wurde abgeschlossen, öffnen Sie die Navigation via Projectmanager");
  }
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

  const { finishPolygon } = useCreatePolygon({
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
        setCreateStartPointMode(false);

        handleStartPointConfirmed({ lng, lat });
        
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
  }, []);

  useEffect(() => {
  if (!isLoading) {
    fetch("http://localhost:8000/getProjects")
      .then(res => res.json())
      .then(data => {
        console.log("FETCH RESPONSE:", data);
        if (Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else {
          console.error("Ungültiges Projektformat:", data);
        }
      });
  }
}, [isLoading]);


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
        setProjectInfo({ ProjectName, Location, Datum });
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
  useEffect(() => {
  if (window.location.pathname === "/navigation") {
    console.log("Navigation aktiv – isLoading zurücksetzen");
    setIsLoading(false);
  }
}, []);

  const searchLocationClick = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(SearchLocation)}&country=Switzerland&format=json`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lon, lat } = data[0];
        map.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 14, duration: 1000 });
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
          onNavigateToNavigation={handleNavigationToPage}
          map={map}
          setMap={setMap}
          onMapLoad={handleMapLoad}
          polygonMode={polygonMode}
          setPolygonMode={setPolygonMode}
          polygonPoints={polygonPoints}
          setPolygonPoints={setPolygonPoints}
          setIsLoading={setIsLoading}
          projectInfo={projectInfo}
          
        />

        {startPageMode && (
          <div className="button-panel">
            <MapLayerButton classNameMapButtons="PlannerPageMapButtons"
              map={map}
              changeLayerMode={changeLayerMode}
              setChangeLayerMode={setChangeLayerMode}
              startPageMode={startPageMode}
              setStartPageMode={setStartPageMode}/>
            <MapPositionButton classNameMapButtons="PlannerPageMapButtons" map={map} />
            <MapRotationButton classNameMapButtons="PlannerPageMapButtons" map={map} />
          </div>
        )}


      </div>

      <PlannerpageFooter
        startPageMode={startPageMode}
        setStartPageMode={setStartPageMode}
        ProjectManagerMode={ProjectManagerMode}
        setProjectManagerMode={setProjectManagerMode}
        SearchLocation={SearchLocation}
        setSearchLocation={setSearchLocation}
        searchLocationClick={searchLocationClick}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        projects={projects}
        setProjects={setProjects}
      />

      {isLoading && projectInfo?.ProjectName && (
        <CalculateWaitingPopUp projectName={projectInfo.ProjectName} setIsLoading={setIsLoading}/>
      )}
      {polygonMode &&(
        <PolygonInstructionsPopup/>
        
      )}

      {polygonMode &&(
        <SavePolygonPopup finishPolygon={finishPolygon}/>
        
      )}

      {CreateStartPointMode &&(
        <StartPointInstructionsPopup/>
        
      )}

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
          Datum={Datum}
          setDatum={setDatum}
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
          ProjectStatisticMode={ProjectStatisticMode}
          setProjectStatisticMode={setProjectStatisticMode}
          ProjectDeleteCallbackMode={ProjectDeleteCallbackMode}
          setProjectDeleteCallbackMode={setProjectDeleteCallbackMode}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          projects={projects}
          setProjects={setProjects}
        />
      )}

      {changeLayerMode && (
        <>
          <MapLayerPopup
            changeLayerMode={changeLayerMode}
            setChangeLayerMode={setChangeLayerMode}
            startPageMode={startPageMode}
            setStartPageMode={setStartPageMode}
            map={map}
            layerMarkers={layerMarkers}
            setLayerMarkers={setLayerMarkers}
            designConst="PlannerPage"
          />
        </>
      )}

      {ProjectStatisticMode && (
        <>
          <ProjectStatisticsPopup
          ProjectUseMenuMode={ProjectUseMenuMode}
          setProjectUseMenuMode={setProjectUseMenuMode}
          ProjectStatisticMode={ProjectStatisticMode}
          setProjectStatisticMode={setProjectStatisticMode}
          />
        </>
      )}

      {ProjectDeleteCallbackMode && (
        <>
          <ProjectDeleteCallbackPopup
          ProjectUseMenuMode={ProjectUseMenuMode}
          setProjectUseMenuMode={setProjectUseMenuMode}
          ProjectDeleteCallbackMode={ProjectDeleteCallbackMode}
          setProjectDeleteCallbackMode={setProjectDeleteCallbackMode}
          ActiveProject={ActiveProject}
          setActiveProject={setActiveProject}
          ProjectManagerMode={ProjectManagerMode}
          setProjectManagerMode={setProjectManagerMode}
          startPageMode={startPageMode}
          setStartPageMode={setStartPageMode}
          />
        </>
      )}        
    </div>
  );
};
