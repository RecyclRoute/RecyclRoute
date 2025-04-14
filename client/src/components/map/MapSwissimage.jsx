import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import testStrassenGeojson from '../../data/test_strassen.json';


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
        center: [7.641948397622829, 47.53488012308844], // Beispielkoordinaten (FHNW-Park)
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

        const geojson = testStrassenGeojson;
        geojson.features = geojson.features.map(feature => ({
          ...feature,
          properties: {
            ...feature.properties,
            Fortschritt: feature.properties.Fortschritt || 'nochOffen'
          }
        }));

        mapInstance.addSource('strassen', {
          type: 'geojson',
          data: geojson
        });

        mapInstance.addLayer({
          id: 'strassen-layer',
          type: 'line',
          source: 'strassen',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#1976D2',
            'line-width': 4
          }
        });

        mapInstance.on('click', 'strassen-layer', (e) => {
          const feature = e.features[0];
          const coordinates = e.lngLat;
          const aktuelleWahl = feature.properties.Fortschritt || 'nochOffen';

          const dropdown = `
            <label for="fortschritt-select">Fortschritt:</label>
            <select id="fortschritt-select">
              <option value="nochOffen" ${aktuelleWahl === 'nochOffen' ? 'selected' : ''}>nochOffen</option>
              <option value="inArbeit" ${aktuelleWahl === 'inArbeit' ? 'selected' : ''}>inArbeit</option>
              <option value="abgeschlossen" ${aktuelleWahl === 'abgeschlossen' ? 'selected' : ''}>abgeschlossen</option>
            </select>
          `;

          const popup = new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(dropdown)
            .addTo(mapInstance);

          popup.on('open', () => {
            const select = document.getElementById('fortschritt-select');
            if (select) {
              select.addEventListener('change', (event) => {
                const newStatus = event.target.value;

                geojson.features = geojson.features.map(f => {
                  if (f.properties.id === feature.properties.id) {
                    return {
                      ...f,
                      properties: {
                        ...f.properties,
                        Fortschritt: newStatus
                      }
                    };
                  }
                  return f;
                });

                mapInstance.getSource('strassen').setData(geojson);
                popup.remove();
              });
            }
          });
        });
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