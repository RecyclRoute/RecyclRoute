import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const NavigationMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [order, setOrder] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Daten laden
  useEffect(() => {
    Promise.all([
      fetch("/data/prepared_graph.geojson").then(res => res.json()),
      fetch("/data/coordinates.json").then(res => res.json())
    ]).then(([geojson, coordOrder]) => {
      setGraphData(geojson);
      setOrder(coordOrder);
    });
  }, []);

  // Map laden
  useEffect(() => {
    if (!graphData || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [7.6419, 47.5348],
      zoom: 17,
    });

    map.on("load", () => {
      map.addSource("graph", {
        type: "geojson",
        data: styleGraph(graphData, order, currentIndex),
      });

      map.addLayer({
        id: "graph-layer",
        type: "line",
        source: "graph",
        paint: {
          "line-color": [
            "match",
            ["get", "status"],
            "current", "#cc0000",
            "done", "#999999",
            "next", "#FFD700",
            "upcoming", "#FFD700",
            "#000000"
          ],
          "line-width": 5,
          "line-dasharray": [
            "match",
            ["get", "status"],
            "upcoming", [2, 2],
            [1, 0]
          ]
        }
      });

      mapRef.current = map;
    });

    return () => map.remove();
  }, [graphData, order]);

  // Update Darstellung bei Wechsel
  useEffect(() => {
    if (mapRef.current && graphData && order.length > 0) {
      const updated = styleGraph(graphData, order, currentIndex);
      mapRef.current.getSource("graph").setData(updated);

      const currentFeature = updated.features.find(f => f.properties.status === "current");
      if (currentFeature) {
        const center = getLineCenter(currentFeature.geometry.coordinates);
        mapRef.current.flyTo({ center, zoom: 18 });
      }
    }
  }, [currentIndex]);

  const handleWeiter = () => {
    if (currentIndex < order.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert("Alle Abschnitte erledigt!");
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      <button
        onClick={handleWeiter}
        style={{ position: "absolute", bottom: 20, left: 20, padding: "10px 20px", zIndex: 10 }}
      >
        Weiter
      </button>
    </div>
  );
};

// Hilfsfunktionen
function styleGraph(graph, order, index) {
  const idOrder = new Set(order.map((_, i) => `${i}`));
  return {
    ...graph,
    features: graph.features.map((feature, i) => {
      let status = "upcoming";
      if (i < index) status = "done";
      else if (i === index) status = "current";
      else if (i === index + 1) status = "next";
      return {
        ...feature,
        properties: {
          ...feature.properties,
          status,
        }
      };
    })
  };
}

function getLineCenter(coords) {
  const idx = Math.floor(coords.length / 2);
  return coords[idx];
}