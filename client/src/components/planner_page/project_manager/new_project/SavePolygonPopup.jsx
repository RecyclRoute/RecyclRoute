import React, { useState, useEffect } from 'react';
import { MapSwissimage} from "../../map/MapSwissimage.jsx";
import "./add_marker.css";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const SavePolygonPopup = (props) => {

  
  return (
    <div className="addmarkerInfo_Overlay">
    <div className="addmarkerInfo_Content">
      <h4>Position durch klicken auf Karte bestätigen!</h4>
    </div>
  </div>
  );
};