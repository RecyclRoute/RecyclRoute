import { useEffect, useState } from 'react';

const useCreatePolygon = ({
  map,
  polygonMode,
  polygonPoints,
  setPolygonPoints,
  projectInfo,
  setPolygonMode,
  sendPolygonToBackend
}) => {
  const [mousePosition, setMousePosition] = useState(null);

  // ✅ Separate reusable logic
  const finishPolygon = async () => {
    if (polygonPoints.length >= 3) {
      const closedPolygon = [...polygonPoints, polygonPoints[0]];
      setPolygonPoints(closedPolygon);

      if (!projectInfo?.ProjectName || !projectInfo?.Location) {
        alert("Projektname oder Gemeinde fehlen!");
        return;
      }

      const customPolygon = {
        name: projectInfo.ProjectName,
        gemeindename: projectInfo.Location,
        datum: projectInfo.Datum,
        perimeter: closedPolygon
      };

      setPolygonMode(false);
      await sendPolygonToBackend(customPolygon);
    } else {
      alert('Mindestens 3 Punkte notwendig!');
    }
  };

  useEffect(() => {
    if (!map || !polygonMode) return;

    map.doubleClickZoom.disable();

    const handlePolygonClick = (e) => {
      const { lng, lat } = e.lngLat;
      setPolygonPoints((prev) => [...prev, [lng, lat]]);
    };

    const handleMouseMove = (e) => {
      setMousePosition([e.lngLat.lng, e.lngLat.lat]);
    };

    map.on("click", handlePolygonClick);
    map.on("mousemove", handleMouseMove);

    // ⛔️ Removed double-click to prevent conflict with button-based calls

    return () => {
      map.off("click", handlePolygonClick);
      map.off("mousemove", handleMouseMove);
      map.doubleClickZoom.enable();
    };
  }, [map, polygonMode]);

  useEffect(() => {
    if (!map || !polygonMode) return;

    const pointsLength = polygonPoints.length;

    // Clear layers if no points
    if (pointsLength === 0) {
      ["polygon-line", "polygon-points-layer", "polygon-live-line-layer"].forEach(layerId => {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(layerId.replace('-layer', ''))) map.removeSource(layerId.replace('-layer', ''));
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
              ? [[...polygonPoints, polygonPoints[0]]]
              : polygonPoints
          }
        }
      ]
    };

    // Draw polygon or line
    if (map.getSource('polygon-line')) {
      map.getSource('polygon-line').setData(polygonGeoJSON);
    } else {
      map.addSource('polygon-line', { type: 'geojson', data: polygonGeoJSON });
      map.addLayer({
        id: 'polygon-line',
        type: 'line',
        source: 'polygon-line',
        paint: { 'line-color': '#FF0000', 'line-width': 3 }
      });
    }

    // Draw points
    const pointsGeoJSON = {
      type: 'FeatureCollection',
      features: polygonPoints.map(point => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: point }
      }))
    };

    if (map.getSource('polygon-points')) {
      map.getSource('polygon-points').setData(pointsGeoJSON);
    } else {
      map.addSource('polygon-points', { type: 'geojson', data: pointsGeoJSON });
      map.addLayer({
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

    // Draw live line
    if (pointsLength > 0 && mousePosition) {
      const liveLineGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [polygonPoints[pointsLength - 1], mousePosition]
            }
          }
        ]
      };

      if (map.getSource('polygon-live-line')) {
        map.getSource('polygon-live-line').setData(liveLineGeoJSON);
      } else {
        map.addSource('polygon-live-line', { type: 'geojson', data: liveLineGeoJSON });
        map.addLayer({
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
      if (map.getLayer('polygon-live-line-layer')) {
        map.removeLayer('polygon-live-line-layer');
        map.removeSource('polygon-live-line');
      }
    }
  }, [polygonPoints, map, polygonMode, mousePosition]);

  // ✅ Return the function you want to use in SavePolygonPopup
  return {
    finishPolygon
  };
};

export default useCreatePolygon;
