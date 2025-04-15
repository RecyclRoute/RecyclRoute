import React from "react";
import { InstructionDisplay } from "./InstructionDisplay.jsx";
import { GraphMap } from "./GraphMap.jsx";

export const NavigationPage = () => {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ height: "20%", backgroundColor: "#f0f0f0", padding: "10px" }}>
        <InstructionDisplay />
      </div>
      <div style={{ flexGrow: 1 }}>
        <GraphMap />
      </div>
    </div>
  );
};
