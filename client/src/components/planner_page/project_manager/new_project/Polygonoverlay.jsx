import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';

/**
 * PolygonOverlay
 * Adds a polygon to the MapLibre map and zooms to it when CreateStartPointMode is active.
 *
 * Props:
 * - map: MapLibre map instance
 * - CreateStartPointMode: boolean, whether the overlay should be active
 * - ActiveProject: object with geometry.coordinates in GeoJSON Polygon format
 */
function PolygonOverlay({ map, CreateStartPointMode, ActiveProject }) {
  useEffect(() => {
    if (!map || !CreateStartPointMode || !ActiveProject?.geometry?.coordinates) return;

    const polygonCoords = ActiveProject.geometry.coordinates;

    const polygonGeoJSON = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: polygonCoords,
      },
    };

    // Add GeoJSON source
    if (!map.getSource('start-point-polygon')) {
      map.addSource('start-point-polygon', {
        type: 'geojson',
        data: polygonGeoJSON,
      });
    } else {
      map.getSource('start-point-polygon').setData(polygonGeoJSON);
    }

    // Add fill layer
    if (!map.getLayer('start-point-layer')) {
      map.addLayer({
        id: 'start-point-layer',
        type: 'fill',
        source: 'start-point-polygon',
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.5,
        },
      });
    }

    // Zoom to polygon bounds
    const bounds = polygonCoords[0].reduce(
      (b, coord) => b.extend(coord),
      new maplibregl.LngLatBounds(polygonCoords[0][0], polygonCoords[0][0])
    );
    map.fitBounds(bounds, { padding: 40 });

    // Cleanup on unmount or deactivation
    return () => {
      if (map.getLayer('start-point-layer')) map.removeLayer('start-point-layer');
      if (map.getSource('start-point-polygon')) map.removeSource('start-point-polygon');
    };
  }, [map, CreateStartPointMode, ActiveProject]);

  return null;
}

export default PolygonOverlay;
