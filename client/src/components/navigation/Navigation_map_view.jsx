import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Header } from "../Header.jsx";
import { Footer } from "../footer/Footer.jsx";

export const NavigationMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [order, setOrder] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/data/prepared_graph.geojson").then((res) => res.json()),
      fetch("/data/coordinates.json").then((res) => res.json()),
    ])
      .then(([geojson, coordOrder]) => {
        console.log("GeoJSON geladen:", geojson);
        setGraphData(geojson);
        setOrder(coordOrder);
      })
      .catch((err) => console.error("Fehler beim Laden der Dateien:", err));
  }, []);

  useEffect(() => {
    if (!graphData || mapRef.current) return;

    const swissImageStyle = {
      version: 8,
      sources: {
        swissimage: {
          type: "raster",
          tiles: [
            "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg",
          ],
          tileSize: 256,
          attribution: "© swisstopo",
        },
      },
      layers: [
        {
          id: "swissimage-layer",
          type: "raster",
          source: "swissimage",
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: swissImageStyle,
      center: [7.6419, 47.5348],
      zoom: 17,
      maxZoom: 21,
      pitch: 0,
      pitchWithRotate: false,
      interactive: true,
      crossOrigin: "anonymous",
    });

    map.on("load", () => {
      console.log("Map geladen");

      const styledData = styleGraph(graphData, order, currentIndex);

      map.addSource("graph", {
        type: "geojson",
        data: styledData,
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
            "#000000",
          ],
          "line-width": 5,
          "line-dasharray": [
            "match",
            ["get", "status"],
            "upcoming", [2, 2],
            [1, 0],
          ],
        },
      });

      const bounds = getFeatureBounds(styledData.features);
      map.fitBounds(bounds, { padding: 40 });

      mapRef.current = map;
    });

    return () => map.remove();
  }, [graphData, order]);

  useEffect(() => {
    if (mapRef.current && graphData && order.length > 0) {
      const updated = styleGraph(graphData, order, currentIndex);
      const source = mapRef.current.getSource("graph");
      if (source) source.setData(updated);

      const currentFeature = updated.features.find(
        (f) => f.properties.status === "current"
      );
      if (currentFeature) {
        const center = getLineCenter(currentFeature.geometry.coordinates);
        mapRef.current.flyTo({ center, zoom: 18 });
      }
    }
  }, [currentIndex, graphData, order]);

  const handleWeiter = () => {
    if (currentIndex < order.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert("Alle Abschnitte erledigt!");
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flexGrow: 1, position: "relative" }}>
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
        <button
          onClick={handleWeiter}
          style={{ position: "absolute", bottom: 20, left: 20, padding: "10px 20px", zIndex: 10 }}
        >
          Weiter
        </button>
      </div>
      <Footer />
    </div>
  );
};

function styleGraph(graph, order, index) {
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
        },
      };
    }),
  };
}

function getLineCenter(coords) {
  const idx = Math.floor(coords.length / 2);
  return coords[idx];
}

function getFeatureBounds(features) {
  const allCoords = features.flatMap((f) => f.geometry.coordinates.flat());
  const lons = allCoords.map((c) => c[0]);
  const lats = allCoords.map((c) => c[1]);
  const minLng = Math.min(...lons);
  const maxLng = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
