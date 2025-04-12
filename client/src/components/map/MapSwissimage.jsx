import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';


export const MapSwissimage = (props) => {
    const mapContainer = useRef(null);

        // useEffect: Wird jedes Mal ausgeführt, wenn markerMode oder die map sich ändert
        useEffect(() => {
          if (!props.map) return; // Falls die Karte noch nicht geladen ist, nichts tun
      
          // Handler, der beim Klick auf die Karte ausgeführt wird: marker wird an der Kartenmitte gesetzt
          const handleMapClick = () => {
            const center = props.map.getCenter();
            // Falls bereits ein Marker vorhanden ist, entfernen wir diesen – falls nur ein Marker existieren soll
            if (props.marker) {
              props.marker.remove();
            }
            // Neuen Marker an der aktuellen Kartenmitte setzen
            const newMarker = new maplibregl.Marker({ color: "red" })
              .setLngLat(center)
              .addTo(props.map);
            props.setMarker(newMarker);
      
            // Optional: Marker-Modus wieder deaktivieren, damit der nächste Klick nicht sofort einen neuen Marker setzt
            
          };
      
        
          // Wenn der Marker-Modus aktiv ist, den Klick-Handler registrieren
          if (props.markerMode) {
            props.map.on("click", handleMapClick);
          }
          // Cleanup: Entferne den Handler wieder, wenn der Marker-Modus deaktiviert wird
          return () => {
            if (props.markerMode) {
              props.map.off("click", handleMapClick);
            }
          };
        }, [props.markerMode, props.map, props.marker, props.setMarker, props.setMarkerMode]);
  
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
      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: swissImageStyle,
        center: [7.641948397622829, 47.53488012308844], // Beispielkoordinaten (z.B. Zürich)
        zoom: 17,
        maxZoom: 21,  
        pitch: 0,
        pitchWithRotate: false,
        interactive: true,
      });

      // Speichere die Karteninstanz im Parent-State über den Setter
      props.setMap(mapInstance);

      // Sobald die Map geladen ist, rufe den Callback auf
      mapInstance.on('load', () => {
        if (props.onMapLoad) {
          props.onMapLoad(mapInstance);
        }
      });
  
      // Aufräumfunktion beim Unmounten der Komponente
      return () => mapInstance.remove();
    }, []);
  
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        {props.markerMode && (
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