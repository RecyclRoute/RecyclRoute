import { ReactComponent as FolderIcon } from "../../icons/black/folder_icon.svg";
import React, { useState, useRef, useEffect } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import "../plannerpage.css";

export const ProjectManagerButton = (props) => {

  useEffect(() => {
    fetch("http://localhost:8000/getProjects")
      .then(res => res.json())
      .then(data => {
        console.log("FETCH RESPONSE:", data);
        if (Array.isArray(data.projects)) {
          props.setProjects(data.projects);
        } else {
          console.error("Ungültiges Projektformat:", data);
        }
      });
  }
);


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
