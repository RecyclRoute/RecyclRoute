import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const MapSwissimage = (props) => {
  const mapContainer = useRef(null);
  const [mousePosition, setMousePosition] = useState(null);
  const [routeData, setRouteData] = useState(null); // 🧩 Neu: Route-Daten

  // 🧩 Helper: Visualisiere die Route
  const displayRoute = (geojson) => {
    if (props.map.getSource('route')) {
      props.map.getSource('route').setData(geojson);
    } else {
      props.map.addSource('route', {
        type: 'geojson',
        data: geojson
      });
      props.map.addLayer({
        id: 'route-layer',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#0000FF',
          'line-width': 4
        }
      });
    }
  };

  // 🧩 Backend Request
  const sendPolygonToBackend = async (polygonGeoJSON) => {
    try {
      const response = await fetch('http://localhost:8000/calculate-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(polygonGeoJSON),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Routenberechnen');
      }

      const routeGeoJSON = await response.json();
      setRouteData(routeGeoJSON); // Speichern für Visualisierung
      alert('Route erfolgreich berechnet!');
    } catch (error) {
      console.error('Backend Fehler:', error);
      alert('Fehler bei der Routenberechnung.');
    }
  };

  // Marker Mode
  useEffect(() => {
    if (!props.map) return;

    const handleMapClick = () => {
      const center = props.map.getCenter();
      if (props.marker) {
        props.marker.remove();
      }
      const newMarker = new maplibregl.Marker({ color: "red" })
        .setLngLat(center)
        .addTo(props.map);
      props.setMarker(newMarker);
    };

    if (props.markerMode) {
      props.map.on("click", handleMapClick);
    }

    return () => {
      if (props.markerMode) {
        props.map.off("click", handleMapClick);
      }
    };
  }, [props.markerMode, props.map, props.marker, props.setMarker]);

  // Polygon Mode - Punktesammeln & Klicks
  useEffect(() => {
    if (!props.map || !props.polygonMode) return;

    props.map.doubleClickZoom.disable();

    const handlePolygonClick = (e) => {
      const { lng, lat } = e.lngLat;
      props.setPolygonPoints((prevPoints) => [...prevPoints, [lng, lat]]);
    };

    const handlePolygonDoubleClick = async () => {
      if (props.polygonPoints.length >= 3) {
        const closedPolygon = [...props.polygonPoints, props.polygonPoints[0]];
        props.setPolygonPoints(closedPolygon);

        const geojson = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {
                name: "Mein Projekt",
              },
              geometry: {
                type: "Polygon",
                coordinates: [closedPolygon],
              },
            },
          ],
        };

        // Speichern als Datei
        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'polygon_project.geojson';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alert('Das Gebiet ist gespeichert! Nun wird die Route berechnet, bitte kurz Geduld haben...');

        // Anfrage ans Backend senden
        await sendPolygonToBackend(geojson);

        props.setPolygonMode(false);
      } else {
        alert('Mindestens 3 Punkte notwendig!');
      }
    };

    const handleMouseMove = (e) => {
      setMousePosition([e.lngLat.lng, e.lngLat.lat]);
    };

    props.map.on("click", handlePolygonClick);
    props.map.on("dblclick", handlePolygonDoubleClick);
    props.map.on("mousemove", handleMouseMove);

    return () => {
      props.map.off("click", handlePolygonClick);
      props.map.off("dblclick", handlePolygonDoubleClick);
      props.map.off("mousemove", handleMouseMove);
      props.map.doubleClickZoom.enable();
    };
  }, [props.map, props.polygonMode, props.polygonPoints]);

  // Visualisierung Route bei Antwort vom Backend
  useEffect(() => {
    if (routeData && props.map) {
      displayRoute(routeData);
    }
  }, [routeData, props.map]);

  // Polygon Visualisierung
  useEffect(() => {
    if (!props.map || !props.polygonMode) return;

    const pointsLength = props.polygonPoints.length;

    if (pointsLength === 0) {
      ["polygon-line", "polygon-points-layer", "polygon-live-line-layer"].forEach(layerId => {
        if (props.map.getLayer(layerId)) props.map.removeLayer(layerId);
        if (props.map.getSource(layerId.replace('-layer', ''))) props.map.removeSource(layerId.replace('-layer', ''));
      });
      return;
    }

    const polygonGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: pointsLength > 2 ? 'Polygon' : 'LineString',
            coordinates: pointsLength > 2
              ? [[...props.polygonPoints, props.polygonPoints[0]]]
              : props.polygonPoints
          }
        }
      ]
    };

    if (props.map.getSource('polygon-line')) {
      props.map.getSource('polygon-line').setData(polygonGeoJSON);
    } else {
      props.map.addSource('polygon-line', {
        type: 'geojson',
        data: polygonGeoJSON
      });
      props.map.addLayer({
        id: 'polygon-line',
        type: 'line',
        source: 'polygon-line',
        paint: {
          'line-color': '#FF0000',
          'line-width': 3
        }
      });
    }

    const pointsGeoJSON = {
      type: 'FeatureCollection',
      features: props.polygonPoints.map(point => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: point
        }
      }))
    };

    if (props.map.getSource('polygon-points')) {
      props.map.getSource('polygon-points').setData(pointsGeoJSON);
    } else {
      props.map.addSource('polygon-points', {
        type: 'geojson',
        data: pointsGeoJSON
      });
      props.map.addLayer({
        id: 'polygon-points-layer',
        type: 'circle',
        source: 'polygon-points',
        paint: {
          'circle-radius': 5,
          'circle-color': '#007cbf',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      });
    }

    if (pointsLength > 0 && mousePosition) {
      const liveLineGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                props.polygonPoints[pointsLength - 1],
                mousePosition
              ]
            }
          }
        ]
      };

      if (props.map.getSource('polygon-live-line')) {
        props.map.getSource('polygon-live-line').setData(liveLineGeoJSON);
      } else {
        props.map.addSource('polygon-live-line', {
          type: 'geojson',
          data: liveLineGeoJSON
        });
        props.map.addLayer({
          id: 'polygon-live-line-layer',
          type: 'line',
          source: 'polygon-live-line',
          paint: {
            'line-color': '#00FF00',
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });
      }
    } else {
      if (props.map.getLayer('polygon-live-line-layer')) {
        props.map.removeLayer('polygon-live-line-layer');
        props.map.removeSource('polygon-live-line');
      }
    }

  }, [props.polygonPoints, props.map, props.polygonMode, mousePosition]);

  useEffect(() => {
    const swissImageStyle = {
      version: 8,
      sources: {
        swissimage: {
          type: 'raster',
          tiles: [
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

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: swissImageStyle,
      center: [7.641948397622829, 47.53488012308844],
      zoom: 17,
      maxZoom: 21,
      pitch: 0,
      pitchWithRotate: false,
      interactive: true,
    });

    props.setMap(mapInstance);

    mapInstance.on('load', () => {
      if (props.onMapLoad) props.onMapLoad(mapInstance);
    });

    return () => mapInstance.remove();
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
