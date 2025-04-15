import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const GraphMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [geojsonData, setGeojsonData] = useState(null);

  // Lade GeoJSON-Datei bei Mount
  useEffect(() => {
    fetch("/chinese_postman_path.geojson")
      .then((res) => res.json())
      .then((data) => {
        // Entferne alle Punkte, behalte nur LineStrings
        const onlyLines = {
          type: "FeatureCollection",
          features: data.features.filter(f => f.geometry.type === "LineString").map(f => ({
            ...f,
            properties: {
              ...f.properties,
              status: "open",
            },
          })),
        };
        setGeojsonData(onlyLines);
      });
  }, []);

  // Initialisiere Karte
  useEffect(() => {
    if (!geojsonData || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: geojsonData.features[0].geometry.coordinates[0],
      zoom: 17,
    });

    map.on("load", () => {
      map.addSource("graph-lines", {
        type: "geojson",
        data: geojsonData,
      });

      map.addLayer({
        id: "graph-lines-layer",
        type: "line",
        source: "graph-lines",
        paint: {
          "line-color": [
            "match",
            ["get", "status"],
            "done", "#00cc66",  // grün
            "open", "#cc3333",  // rot
            "#000000",          // fallback
          ],
          "line-width": 5,
        },
      });

      map.on("click", "graph-lines-layer", (e) => {
        const clickedFeature = e.features[0];

        const updatedFeatures = geojsonData.features.map((feature) => {
          if (
            JSON.stringify(feature.geometry.coordinates) ===
            JSON.stringify(clickedFeature.geometry.coordinates)
          ) {
            return {
              ...feature,
              properties: {
                ...feature.properties,
                status: feature.properties.status === "done" ? "open" : "done",
              },
            };
          }
          return feature;
        });

        const newData = {
          ...geojsonData,
          features: updatedFeatures,
        };

        setGeojsonData(newData);
        map.getSource("graph-lines").setData(newData);
      });
    });

    mapRef.current = map;
    return () => map.remove();
  }, [geojsonData]);

  return <div ref={mapContainer} style={{ height: "100%", width: "100%" }} />;
};
