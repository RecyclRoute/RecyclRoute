import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Header } from "../Header.jsx";
import { Footer } from "../footer/Footer.jsx";

export const NavigationMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    fetch("/data/coordinates_output.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        setGraphData(geojson);
      })
      .catch((err) => console.error("Fehler beim Laden der Route:", err));
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
      const styledData = {
        ...graphData,
        features: graphData.features.map((feature, i) => ({
          ...feature,
          properties: {
            ...feature.properties,
            id: i,
            status: feature.properties.status || "nochOffen",
          },
        })),
      };

      map.addSource("route", {
        type: "geojson",
        data: styledData,
      });

      map.addLayer({
        id: "route-layer",
        type: "line",
        source: "route",
        paint: {
          "line-color": [
            "match",
            ["get", "status"],
            "abgeschlossen", "#999999",
            "inArbeit", "#FFD700",
            "nochOffen", "#cc0000",
            "#000000",
          ],
          "line-width": 5,
        },
      });

      map.on("mouseenter", "route-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "route-layer", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "route-layer", (e) => {
        const feature = e.features[0];
        const id = feature.properties.id;
        const currentStatus = feature.properties.status;
        const nextStatus =
          currentStatus === "nochOffen"
            ? "inArbeit"
            : currentStatus === "inArbeit"
            ? "abgeschlossen"
            : "nochOffen";

        const updatedFeatures = graphData.features.map((f, i) =>
          i === id ? { ...f, properties: { ...f.properties, status: nextStatus } } : f
        );

        const updatedData = { ...graphData, features: updatedFeatures };
        setGraphData(updatedData);
        map.getSource("route").setData(updatedData);
      });

      mapRef.current = map;
    });

    return () => map.remove();
  }, [graphData]);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div ref={mapContainer} style={{ flexGrow: 1 }} />
    </div>
  );
};
