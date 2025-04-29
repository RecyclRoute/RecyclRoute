import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const NavigationMap = ({ currentIndex, onRouteLoad }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/data/navigation.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        const lineFeatures = geojson.features.filter(
          (f) => f.geometry && f.geometry.type === "LineString"
        );
        const lineGeoJson = {
          type: "FeatureCollection",
          features: lineFeatures,
        };
        setRouteData(lineGeoJson);
        onRouteLoad(lineFeatures.length);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden:", err);
        setIsLoading(false);
      });
  }, [onRouteLoad]);

  useEffect(() => {
    if (!routeData || !mapRef.current || !mapRef.current.isStyleLoaded()) return;

    const updatedFeatures = routeData.features.map((feature, i) => {
      let status = "abgeschlossen";
      if (i === currentIndex) status = "aktiv";
      else if (i > currentIndex) status = "zukuenftig";
      return { ...feature, properties: { ...feature.properties, status } };
    });

    const updatedData = { ...routeData, features: updatedFeatures };

    const source = mapRef.current.getSource("route");
    if (source) {
      source.setData(updatedData);
    }

    const currentFeature = updatedData.features[currentIndex];
    if (currentFeature && currentFeature.geometry) {
      const coordinates = currentFeature.geometry.coordinates;
      if (coordinates.length > 0) {
        const midIndex = Math.floor(coordinates.length / 2);
        const center = coordinates[midIndex];
        mapRef.current.flyTo({
          center: center,
          zoom: 18,
          speed: 0.8,
          curve: 1,
          easing: (t) => t,
        });
      }
    }
  }, [routeData, currentIndex]);

  useEffect(() => {
    if (!routeData) return;
    if (!mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "swissimage": {
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
        },
        center: [7.6419, 47.5348],
        zoom: 16,
        maxZoom: 20,
        crossOrigin: "anonymous",
      });

      map.on("load", () => {
        const styledData = {
          ...routeData,
          features: routeData.features.map((feature, i) => ({
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
              "aktiv", "#cc0000",
              "zukuenftig", "#FFD700",
              "abgeschlossen", "#999999",
              "#000000"
            ],
            "line-width": [
              "match",
              ["get", "status"],
              "aktiv", 6,
              "zukuenftig", 4,
              "abgeschlossen", 3,
              2
            ],
            "line-dasharray": [
              "match",
              ["get", "status"],
              "zukuenftig", [2, 2],
              [1, 0]
            ],
          },
        });
      });

      mapRef.current = map;
    }
  }, [routeData, currentIndex]);

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
