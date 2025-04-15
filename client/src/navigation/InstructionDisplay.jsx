import React, { useState, useEffect } from "react";

export const InstructionDisplay = () => {
  const [instruction, setInstruction] = useState("Route wird geladen...");

  useEffect(() => {
    // Später: GPS-Tracking oder Klickdaten hier auswerten
    const fakeUpdate = setTimeout(() => {
      setInstruction("In 20 m rechts abbiegen");
    }, 2000);

    return () => clearTimeout(fakeUpdate);
  }, []);

  return (
    <div style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>
      {instruction}
    </div>
  );
};
