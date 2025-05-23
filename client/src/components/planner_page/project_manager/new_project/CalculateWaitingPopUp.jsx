import { useEffect } from "react";
import 'maplibre-gl/dist/maplibre-gl.css';
import "../../plannerpage.css";

export const CalculateWaitingPopUp = ({ projectName, setIsLoading }) => {
  useEffect(() => {
    console.log("🟡 CalculateWaitingPopUp angezeigt für Projekt:", projectName);
  }, [projectName, setIsLoading]);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: 100000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        backgroundColor: "#F4F7F5",
        outlineColor: "#273028",
        padding: "30px 40px",
        textAlign: "center"
      }}>
        <h2 style={{ marginBottom: "10px" }}>Route wird berechnet</h2>
        <p>Bitte einen Moment Geduld...</p>
        <div className="loader" style={{ marginTop: "20px" }}></div>
      </div>
    </div>
  );
};
