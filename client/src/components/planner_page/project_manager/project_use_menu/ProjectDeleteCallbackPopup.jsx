import React, { useState, useEffect } from "react";
import "../../plannerpage.css"

export const ProjectDeleteCallbackPopup = (props) => { 

  const SubmitDeleteProject = async () => {
    if (!props.ActiveProject) {
      alert("Kein aktives Projekt ausgewählt.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/deleteProject/${props.ActiveProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Fehler beim Löschen");
      }

      const result = await response.json();
      alert(result.message);

      // Zurück zur Projektübersicht
      props.setStartPageMode(true)
      props.setProjectDeleteCallbackMode(false);

    } catch (error) {
      if (error instanceof Error) {
        alert("Fehler beim Löschen des Projekts: " + error.message);
      } else {
        alert("Unbekannter Fehler beim Löschen des Projekts.");
      }
    }
  };


  const GoBackToUseMenu = () => {
    props.setStartPageMode(true)
    props.setProjectDeleteCallbackMode(false)
  };

  return (
    <div className="ProjectManagerPopup-overlay">
      <div className="ProjectManagerPopup-content">
        <div>
          <div style={{marginBottom: "10px"}}>Sind Sie sicher dass sie das Projekt {props.ActiveProject.name} löschen möchten?</div>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px",}}>
          <button
          onClick={SubmitDeleteProject}
          className="ProjectManagerPopup-Button">
            Ja löschen
          </button>
          <button
          onClick={GoBackToUseMenu}
          className="ProjectManagerPopup-Button">
            Abbrechen
          </button>
          </div>
        </div>
      </div>
    </div>
  );
  
};

