import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// export const MapComponent = () => {
//   const mapContainer = useRef(null);

//   useEffect(() => {
//     // Karte initialisieren
//     const map = new maplibregl.Map({
//       container: mapContainer.current,
//       style: 'https://demotiles.maplibre.org/style.json', // Beispiel-Stil
//       center: [13.4050, 52.5200], // Startposition (Berlin)
//       zoom: 10
//     });

//     // Marker erstellen und hinzufügen
//     new maplibregl.Marker()
//       .setLngLat([7.641960840095425, 47.534875051953875])
//       .addTo(map);

//     // Aufräumfunktion: Entfernt die Karte beim Unmounten der Komponente
//     return () => map.remove();
//   }, []);

//   return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
// };



  // useEffect(() => {
  //   // Initialisiere die Karte nach dem Mounten der Komponente
  //   const map = new Map({
  //     target: "map",
  //     layers: [
  //       new TileLayer({ source: new OSM() }),
  //     ],
  //     view: new View({
  //       center: [0, 0],
  //       zoom: 2,
  //     }),
  //   });
  // }, []);


  export const MapLK10f = () => {
    const mapContainer = useRef(null);
  
    useEffect(() => {
      // Definiere den benutzerdefinierten Style für Landeskarte
      const swisstopoLandeskarteStyle = {
        version: 8,
        sources: {
          landeskarte: {
            type: 'raster',
            tiles: [
              // URL des WMTS-Endpunkts von Landeskarte
              'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.landeskarte-grau-10/default/{Time}/3857/{TileMatrix}/{TileCol}/{TileRow}.png'
            ],
            tileSize: 256,
            attribution: '© swisstopo'
          }
        },
        layers: [
          {
            id: 'landeskarte-layer',
            type: 'raster',
            source: 'landeskarte',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };
  
      // Initialisiere die Map mit dem Landeskarte-Style
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: swisstopoLandeskarteStyle,
        center: [7.641948397622829, 47.53488012308844], // Beispielkoordinaten (z.B. Zürich)
        zoom: 13,
        maxZoom: 21
      });
  
      // Optional: Marker hinzufügen
      new maplibregl.Marker()
        .setLngLat([7.641948397622829, 47.53488012308844])
        .addTo(map);
  
      // Aufräumfunktion beim Unmounten der Komponente
      return () => map.remove();
    }, []);
  
    return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
  };