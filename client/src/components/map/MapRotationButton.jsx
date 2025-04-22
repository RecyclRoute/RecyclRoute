import React from 'react';
import { ReactComponent as NorthArrowIcon } from "../icons/black/north_arrow_icon.svg";
import "./Map.css";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const MapRotationButton = ({ map, classNameMapButtons = "" }) => {
  
  const handleResetRotation = () => {
      map.rotateTo(0);
    }

  return (
    <button className={classNameMapButtons} onClick={handleResetRotation}>
      <NorthArrowIcon style={{ width: "30px", height: "30px" }}/>
    </button>
  );
};
