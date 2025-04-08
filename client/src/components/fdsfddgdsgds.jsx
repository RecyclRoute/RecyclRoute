import React, { useState, useEffect } from "react";
import { MapSwissimage } from "./MapSwissimage";
import maplibregl from "maplibre-gl";

export default function MapPage() {
  // Speicher die Karteninstanz, sobald sie von MapSwissimage geladen ist
  const [map, setMap] = useState(null);
  // Wenn active, dann erscheint das Fadenkreuz und der Klick-Handler ist aktiv
  const [markerMode, setMarkerMode] = useState(false);
  // Falls du nur einen Marker zulassen möchtest, kannst du diesen hier speichern
  const [marker, setMarker] = useState(null);

  // Callback, das von MapSwissimage aufgerufen wird, sobald die Karte geladen ist
  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  // useEffect: Wird jedes Mal ausgeführt, wenn markerMode oder die map sich ändert
  useEffect(() => {
    if (!map) return; // Falls die Karte noch nicht geladen ist, nichts tun

    // Handler, der beim Klick auf die Karte ausgeführt wird: marker wird an der Kartenmitte gesetzt
    const handleMapClick = () => {
      const center = map.getCenter();
      // Falls bereits ein Marker vorhanden ist, entfernen wir diesen – falls nur ein Marker existieren soll
      if (marker) {
        marker.remove();
      }
      // Neuen Marker an der aktuellen Kartenmitte setzen
      const newMarker = new maplibregl.Marker({ color: "red" })
        .setLngLat(center)
        .addTo(map);
      setMarker(newMarker);

      // Optional: Marker-Modus wieder deaktivieren, damit der nächste Klick nicht sofort einen neuen Marker setzt
      setMarkerMode(false);
    };

    // Wenn der Marker-Modus aktiv ist, den Klick-Handler registrieren
    if (markerMode) {
      map.on("click", handleMapClick);
    }
    // Cleanup: Entferne den Handler wieder, wenn der Marker-Modus deaktiviert wird
    return () => {
      if (markerMode) {
        map.off("click", handleMapClick);
      }
    };
  }, [markerMode, map, marker]);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Hier wird die existierende Karte eingebunden */}
      <MapSwissimage handleMapLoad={handleMapLoad} />

      {/* Fadenkreuz (wird nur angezeigt, wenn markerMode aktiv ist) */}
      {markerMode && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none", // Damit Klicks durchgehen
            fontSize: "30px",
            color: "black",
            fontWeight: "bold",
            textShadow: "1px 1px 2px white"
          }}
        >
          +
        </div>
      )}

      {/* Button zum Aktivieren des Marker-Modus */}
      <button
        onClick={() => setMarkerMode(true)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          padding: "10px 15px",
          backgroundColor: "#007bff",
          border: "none",
          borderRadius: "5px",
          color: "#fff",
          cursor: "pointer"
        }}
      >
        Marker setzen
      </button>
    </div>
  );
}
