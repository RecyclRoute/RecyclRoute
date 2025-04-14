import { ReactComponent as FolderIcon } from "../icons/black/folder_icon.svg";
import React, { useState, useRef, useEffect } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

export const ProjectManagerButton = () => {



  return (
    <button className="MapButtons">
      <FolderIcon style={{ width: "30px", height: "30px" }}/>
    </button>
  );
};