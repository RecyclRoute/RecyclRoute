import { ReactComponent as FolderIcon } from "../../icons/black/folder_icon.svg";
import React, { useState, useRef, useEffect } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import "../plannerpage.css";
import { BackendURL } from "../../../config";

export const ProjectManagerButton = (props) => {

const ProjectManagerClick = () => {
  fetch(BackendURL + "/getProjects")
    .then(res => res.json())
    .then(data => {
      console.log("FETCH RESPONSE:", data);
      if (Array.isArray(data.projects)) {
        props.setProjects(data.projects);
        props.setProjectManagerMode(true);
        props.setStartPageMode(false);
      } else {
        console.error("Ungültiges Projektformat:", data);
      }
    })
    .catch(err => {
      console.error("Fehler beim Laden der Projekte:", err);
    });
};


  return (
    <button id="ProjectManagerButton" onClick={ProjectManagerClick}>
      <FolderIcon style={{ width: "30px", height: "30px" }} />
    </button>
  );
};