import { ReactComponent as LayerIcon } from "../icons/layer_icon.svg";
import React, { useState, useRef, useEffect } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

export const MapLayerButton = ({ map }) => {



  return (
    <button className="MapButtons">
      <LayerIcon style={{ width: "30px", height: "30px" }}/>
    </button>
  );
};