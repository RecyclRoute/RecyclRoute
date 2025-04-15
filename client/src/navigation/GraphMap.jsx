import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Dummy GeoJSON für die Linien (später ersetzen durch echte Daten)
const dummyLines = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { status: "open" },
      geometry: {
        type: "LineString",
        coordinates: [
          [7.6419, 47.5348],
          [7.6420, 47.5352],
        ],
      },
    },
  ],
};

export const GraphMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const [geojsonData, setGeojsonData] = useState(dummyLines);

  useEffect(() => {
    if (mapRef.current) return; // Nur 1x initialisieren

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [7.6419, 47.5348],
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
            "done",
            "#00cc66", // grün
            "open",
            "#cc3333", // rot
            "#000000", // fallback
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
