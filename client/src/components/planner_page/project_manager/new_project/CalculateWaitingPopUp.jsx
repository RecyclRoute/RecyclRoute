import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import 'maplibre-gl/dist/maplibre-gl.css';
import "../../plannerpage.css";

export const CalculateWaitingPopUp = ({ projectName, setIsLoading }) => {
  const [status, setStatus] = useState("pending");
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  console.log("🟡 CalculateWaitingPopUp gerendert mit Projekt:", projectName);
  console.log("📌 Aktueller Status:", status);

  useEffect(() => {
  if (window.location.pathname === "/navigation") {
    // Sicherstellen, dass wir auf der Zielseite sind
    setIsLoading(false);
  }
}, []);

  useEffect(() => {
    console.log("🔁 Starte Statusüberwachung für:", projectName);

    const interval = setInterval(() => {
      console.log("⏱️ Anfrage an /getCalculationStatus für:", projectName);
      fetch(`http://localhost:8000/getCalculationStatus?project_name=${projectName}`)
      .then(async res => {
  const data = await res.json();
  if (!res.ok) {
    console.error("❌ HTTP-Fehlerstatus:", res.status);
    throw new Error(`HTTP ${res.status}`);
  }
  return data;
})
.then(data => {
  console.log("✅ Status-Antwort erhalten:", data);
  if (data.status === "done") {
    console.log("🎯 Status ist 'done' – navigiere sofort zu /navigation");
    clearInterval(interval);
    setStatus("done");
    navigate("/navigation");
  }
})

        .catch(err => {
          console.error("❌ Fehler beim Statusabruf:", err);
        });
    }, 1000);

    return () => {
      console.log("🧹 Stoppe Intervall für Projekt:", projectName);
    };
  }, [projectName, navigate]);

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
        backgroundColor: "white",
        padding: "30px 40px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        textAlign: "center"
      }}>
        <h2 style={{ marginBottom: "10px" }}>Route wird berechnet</h2>
        <p>Bitte einen Moment Geduld...</p>
        <div className="loader" style={{ marginTop: "20px" }}></div>
      </div>
    </div>
  );
};
