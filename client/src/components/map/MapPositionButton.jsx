import { ReactComponent as CrosshairIcon } from "../icons/black/crosshair_icon.svg";
import { ReactComponent as CircleIcon } from "../icons/black/circle_icon.svg";
import React, { useState, useRef, useEffect } from 'react';
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import "./Map.css";

export const MapPositionButton = ({ map, classNameMapButtons = ""}) => {
  const [isActive, setIsActive] = useState(false);
  const markerRef = useRef(null);
  const intervalIdRef = useRef(null);

  // Funktion, die die aktuelle Position abruft und den Marker (und optional auch die Map) aktualisiert.
  // Der Parameter shouldZoom bewirkt, dass die Karte nach dem Abrufen der Position zentriert und gezoomt wird.
  const updateMarkerPosition = (shouldZoom = false) => {
    if (!map) {
      console.log("Map-Instanz ist noch nicht verfügbar.");
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Aktualisierte Position:", latitude, longitude);

          // Marker erstellen oder aktualisieren
          if (!markerRef.current) {
            markerRef.current = new maplibregl.Marker({ color: "blue" })
              .setLngLat([longitude, latitude])
              .addTo(map);
          } else {
            markerRef.current.setLngLat([longitude, latitude]);
          }

          // Wenn shouldZoom true ist, zentriere und zoome die Karte auf die aktuelle Position.
          if (shouldZoom) {
            map.easeTo({
              center: [longitude, latitude],
              duration: 1000, // Animationsdauer in Millisekunden
              zoom: 17        // Gewünschter Zoom-Level (anpassen falls nötig)
            });
          }
        },
        (error) => {
          console.error("Fehler beim Abrufen der Position:", error);
        }
      );
    } else {
      console.error("Die Geolocation wird von diesem Browser nicht unterstützt.");
    }
  };

  // useEffect, der das automatische Updaten der Position steuert: Beim Aktivieren wird
  // der Marker initial gesetzt und ein Interval gestartet, das alle 30 Sekunden die Position abruft.
  useEffect(() => {
    if (isActive && map) {
      // Initiales Update mit Zoomen
      updateMarkerPosition(true);
      // Starte Interval für fortlaufende Updates ohne Zoom
      intervalIdRef.current = setInterval(() => updateMarkerPosition(false), 30000);
    } else {
      // Interval stoppen und Marker entfernen, wenn deaktiviert wird
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }

    // Aufräumfunktion beim Unmount
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [isActive, map]);

  const toggleAutoUpdate = () => {
    setIsActive((prev) => !prev);
  };

  return (
    <button className={classNameMapButtons} onClick={toggleAutoUpdate}>
      {isActive ? <CrosshairIcon style={{ width: "30px", height: "30px" }}/> : <CircleIcon style={{ width: "30px", height: "30px" }}/>}
    </button>
  );
};