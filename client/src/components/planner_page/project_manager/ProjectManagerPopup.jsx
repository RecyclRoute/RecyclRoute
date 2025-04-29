import React, { useState } from "react";
import "../plannerpage.css"

const projects = [
  { name: "Karton - Matten b. I. 2025", location: "Matten", date: "2025" },
  { name: "Gemischte Sammlung – Brienz Oktober 2024", location: "Brienz", date: "Oktober 2024" },
  { name: "......", location: "-", date: "-" },
  { name: "......", location: "-", date: "-" },
  { name: "......", location: "-", date: "-" }
];

export const ProjectManagerPopup = (props) => {


  const TableProjectClick = (project) => {
    props.setActiveProject(project);
    // Project Benutzung Modus aktivieren muss noch eingefügt werden
    alert(`Projekt geöffnet: ${project.name}`);
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
    <div className="PlannerPopup-overlay">
      <div className="PlannerPopup-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Projektmanager</h2>
          <button
            onClick={CloseButtonClick}
            className=""
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
              {projects.map((project, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-200 cursor-pointer" : "bg-white cursor-pointer"}
                  onClick={() => TableProjectClick(project)}
                >
                  <td>{project.name}</td>
                  <td>{project.location}</td>
                  <td>{project.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center">
          <button className="bg-cyan-800 text-white hover:bg-cyan-700 px-4 py-2 rounded-full"
          onClick={NewProjectButtonClick}>
            Neues Projekt erstellen
          </button>
        </div>
      </div>
    </div>
  );
};
