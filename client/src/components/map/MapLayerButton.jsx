import { ReactComponent as LayerIcon } from "../icons/black/layer_icon.svg";
import React, { useState, useRef, useEffect } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import "./Map.css";

export const MapLayerButton = ({ map, classNameMapButtons = ""}) => {



  return (
    <button className={classNameMapButtons}>
      <LayerIcon style={{ width: "30px", height: "30px" }}/>
    </button>
  );
};