import { ReactComponent as FolderIcon } from "../../icons/black/folder_icon.svg";
import React, { useState, useRef, useEffect } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import "../plannerpage.css";

export const ProjectManagerButton = (props) => {

  const ProjectManagerClick = () => {
    props.setProjectManagerMode(true);
    props.setStartPageMode(false);
  }

  return (
    <button id= "ProjectManagerButton" onClick={ProjectManagerClick}>
      <FolderIcon style={{ width: "30px", height: "30px" }} />
    </button>
  );
};
