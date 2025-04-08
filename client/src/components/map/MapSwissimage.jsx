import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';


export const MapSwissimage = (props) => {
    const mapContainer = useRef(null);


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
  
    useEffect(() => {
      // Definiere den benutzerdefinierten Style für Swissimage
      const swissImageStyle = {
        version: 8,
        sources: {
          swissimage: {
            type: 'raster',
            tiles: [
              // URL des WMTS-Endpunkts von Swissimage
              'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'
            ],
            tileSize: 256,
            attribution: '© swisstopo'
          }
        },
        layers: [
          {
            id: 'swissimage-layer',
            type: 'raster',
            source: 'swissimage',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      };
  
      // Initialisiere die Map mit dem Swissimage-Style
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: swissImageStyle,
        center: [7.641948397622829, 47.53488012308844], // Beispielkoordinaten (z.B. Zürich)
        zoom: 17,
        maxZoom: 21,  
        pitch: 0,
      });

      // Sobald die Map geladen ist, rufe den Callback auf
      map.on('load', () => {
        if (handleMapLoad) {
          handleMapLoad(map);
        }
      });
  
      // Aufräumfunktion beim Unmounten der Komponente
      return () => map.remove();
    }, []);
  
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
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
      </div>
    );
  };