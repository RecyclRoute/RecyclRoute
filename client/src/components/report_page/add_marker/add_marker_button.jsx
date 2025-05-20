import React, { useState, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import "./add_marker.css";
import { ReactComponent as AddMarkerIcon } from "../../icons/black/add_marker_icon.svg";

export const AddMarkerButton = (props) => {

  const AddMarkerClick = () => {
    props.setAddMarkerOpen(true);
    props.setMarkerMode(true);
    props.setStartPageMode(false);
  }
  
  return (
      <button id= "AddMarkerButton" onClick={AddMarkerClick}>
        <AddMarkerIcon style={{width: "30px", height: "30px"}}/>
      </button>
  );
};