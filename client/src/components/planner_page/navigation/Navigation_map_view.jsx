import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const NavigationMap = ({ currentIndex, onRouteLoad }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/data/route_full.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        setGraphData(geojson);
        onRouteLoad(geojson.features.length);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Route:", err);
        setIsLoading(false);
      });
  }, [onRouteLoad]);
 

  useEffect(() => {
    if (!graphData || !mapRef.current || !mapRef.current.isStyleLoaded()) return;
  
    const updatedFeatures = graphData.features.map((feature, i) => {
      let status = "abgeschlossen";
      if (i === currentIndex) status = "aktiv";
      else if (i > currentIndex) status = "zukuenftig";
      return { ...feature, properties: { ...feature.properties, status } };
    });
  
    const updatedData = { ...graphData, features: updatedFeatures };
  
    const source = mapRef.current.getSource("route");
    if (source) {
      source.setData(updatedData);
    }
  
    // 🗺️ Nach jedem Schritt: auf aktuellen Abschnitt zentrieren!
    const currentFeature = updatedData.features[currentIndex];
    if (currentFeature && currentFeature.geometry) {
      const coordinates = currentFeature.geometry.coordinates;
      let center = coordinates[0]; // fallback erstes Koordinatenpaar
  
      if (currentFeature.geometry.type === "LineString") {
        const midIndex = Math.floor(coordinates.length / 2);
        center = coordinates[midIndex];
      } else if (currentFeature.geometry.type === "Point") {
        center = coordinates;
      }
  
      mapRef.current.flyTo({
        center: center,
        zoom: 18,
        speed: 0.8,
        curve: 1,
        easing: (t) => t,
      });
    }
  }, [graphData, currentIndex]);
 
  

  useEffect(() => {
    if (!graphData) return;
  
    if (!mapRef.current) {
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
              status: i === currentIndex ? "aktiv" : i > currentIndex ? "zukuenftig" : "abgeschlossen",
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
              "aktiv", "#cc0000",         // ROT für aktuellen Abschnitt
              "zukuenftig", "#FFD700",    // GELB für zukünftige Abschnitte
              "abgeschlossen", "#999999", // GRAU für abgeschlossene Abschnitte
              "#000000"                   // fallback schwarz
            ],
            "line-width": [
              "match",
              ["get", "status"],
              "aktiv", 6,                 // aktiver Abschnitt dicker
              "zukuenftig", 4,
              "abgeschlossen", 3,
              2
            ],
            "line-dasharray": [
              "match",
              ["get", "status"],
              "zukuenftig", [2, 2],       // Gelb gestrichelt
              [1, 0]                     // Andere durchgezogen
            ],
          },
        });
        
        
      });
  
      mapRef.current = map;
    } else {
      const updatedFeatures = graphData.features.map((feature, i) => {
        let status = "abgeschlossen";
        if (i === currentIndex) status = "aktiv";
        else if (i > currentIndex) status = "zukuenftig";
        return { ...feature, properties: { ...feature.properties, status } };
      });
  
      const updatedData = { ...graphData, features: updatedFeatures };
      const source = mapRef.current.getSource("route");
  
      if (source) {
        source.setData(updatedData);
      }
    }
  }, [graphData, currentIndex]);
  

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {isLoading && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}>
          Loading...
        </div>
      )}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};