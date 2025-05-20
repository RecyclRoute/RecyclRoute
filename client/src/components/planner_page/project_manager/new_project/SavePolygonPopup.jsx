import React, { useState, useEffect } from "react";
import "../../plannerpage.css"

export const SavePolygonPopup = ({finishPolygon}) => {
  

  return (
    <div className="addpolygon-overlay">
      <div className="addpolygon-content">
        <div className="mt-4 flex justify-center">
          <button className="ProjectManagerPopup-Button" onClick={finishPolygon}>
            Perimeter speichern
          </button>
        </div>
      </div>
    </div>
  );
  
};

