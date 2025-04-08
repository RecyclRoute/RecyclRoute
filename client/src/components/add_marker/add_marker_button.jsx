import React, { useState, useEffect } from 'react';
import { MapSwissimage} from "../map/MapSwissimage.jsx";
import maplibregl from 'maplibre-gl';
import "./add_marker_button.css";

export const AddMarkerButton = (props) => {
  
  const [markerMode, setMarkerMode] = useState(false);
  const [addMarkerOpen, setAddMarkerOpen] = useState(false);

    


  const AddMarkerClick = () => {
    props.setAddMarkerOpen(true);
    props.setMarkerMode(true);
  }
  
  return (
      <button
        id= "AddMarkerButton"
        onClick={AddMarkerClick}
      >
        Marker
      </button>
  );
};