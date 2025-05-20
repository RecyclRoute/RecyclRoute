import React, { useState, useEffect } from "react";
import "../plannerpage.css"

export const ProjectManagerPopup = (props) => { 


  const TableProjectClick = (project) => {
    props.setProjectInfo({
  ProjectName: project.name,
  Location: project.gemeindename,
  Datum: project.date
});
    props.setActiveProject(project);
    props.setProjectUseMenuMode(true);
    props.setProjectManagerMode(false);
  };

  const CloseButtonClick = () => {
    props.setProjectManagerMode(false);
    props.setStartPageMode(true)
  };

  const NewProjectButtonClick = () => {
    props.setProjectManagerMode(false);
    props.setNewProjectMode(true)
  };
 

  return (
    <div className="ProjectManagerPopup-overlay">
      <div className="ProjectManagerPopup-content">
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: "45px"}}>
          <h3 style={{marginTop: "0px", alignItems: "flex-start"}} className="">Projektmanager</h3>
          <button
            onClick={CloseButtonClick}
            className="ProjectManagerPopup-closeButton"
          >
            ×
          </button>
        </div>

        <div id="ProjectManagerTableWrapper">
          <table id="ProjectManagerTable">
            <thead>
              <tr>
                <th>Projektname</th>
                <th>Ortschaft</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(props.projects) && props.projects.map((project, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-200 cursor-pointer" : "bg-white cursor-pointer"}
                  onClick={() => TableProjectClick(project)}
                >
                  <td>{project.name || "–"}</td>
                  <td>{project.gemeindename || "–"}</td>
                  <td>{project.date || "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center">
          <button className="ProjectManagerPopup-Button"
          onClick={NewProjectButtonClick}>
            Neues Projekt erstellen
          </button>
        </div>
      </div>
    </div>
  );
  
};

