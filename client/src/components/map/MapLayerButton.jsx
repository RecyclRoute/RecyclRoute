import { ReactComponent as LayerIcon } from "../icons/black/layer_icon.svg";
import React, { useState } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import "./Map.css";


export const MapLayerButton = (props) => {

  return (
    <>
      <button className={props.classNameMapButtons} onClick={() => props.setChangeLayerMode(true)}>
        <LayerIcon style={{ width: "30px", height: "30px" }}/>
      </button>
    </>
  );
};
