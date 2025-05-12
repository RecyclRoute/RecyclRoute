import "./reportpage.css";
import { useState, useEffect } from "react";
import { ReportpageHeader } from "./reportpage_header/reportpage_header.jsx";
import { ReportpageFooter } from "./reportpage_footer/reportpage_footer.jsx";
import { AddMarkerPopup } from "./add_marker/add_marker_popup.jsx";
import { AddMarkerPopupInfo } from "./add_marker/add_marker_popup_info.jsx";
import { MapRotationButton } from "../map/MapRotationButton.jsx";
import { MapPositionButton } from "../map/MapPositionButton.jsx";
import { MapLayerButton } from "../map/MapLayerButton.jsx";
import { BaseMap } from "../map/BaseMap.jsx";
import { MapLayerPopup } from "../map/MapLayerPopup.jsx";
import useCreateMarker from "../map/useCreateMarker";


export const ReportPage = () => {
  const [startPageMode, setStartPageMode] = useState(true);
  const [addMarkerOpen, setAddMarkerOpen] = useState(false);
  const [map, setMap] = useState(null);
  const [markerMode, setMarkerMode] = useState(false);
  const [marker, setMarker] = useState(null);
  const [changeLayerMode, setChangeLayerMode] = useState(false);
  const [layerMarkers, setLayerMarkers] = useState([]);


  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  useCreateMarker(map, markerMode, marker, setMarker);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <ReportpageHeader/>
      <div style={{ zIndex: 0, height: "100%" }}>
        <BaseMap
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
            <MapLayerButton 
              map={map}
              changeLayerMode={changeLayerMode}
              setChangeLayerMode={setChangeLayerMode}
              startPageMode={startPageMode}
              setStartPageMode={setStartPageMode}
              classNameMapButtons="ReportMapButtons"
            />
            <MapPositionButton classNameMapButtons="ReportMapButtons" map={map} />
            <MapRotationButton map={map} classNameMapButtons="ReportPageMapButtons" />
          </div>
        )}
      </div>

      <ReportpageFooter
        markerMode={markerMode}
        setMarkerMode={setMarkerMode}
        setAddMarkerOpen={setAddMarkerOpen}
        startPageMode={startPageMode}
        setStartPageMode={setStartPageMode}
        useCreateMarker={useCreateMarker}
      />

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
          />
          <AddMarkerPopupInfo />
        </>
      )}    
    </div>
  );
};
