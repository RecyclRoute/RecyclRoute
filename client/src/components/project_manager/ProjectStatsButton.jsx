import { ReactComponent as StatsIcon } from "../icons/black/stats_icon.svg";
import React, { useState, useRef, useEffect } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

export const ProjectStatsButton = () => {



  return (
    <button className="MapButtons">
      <StatsIcon style={{ width: "30px", height: "30px" }}/>
    </button>
  );
};