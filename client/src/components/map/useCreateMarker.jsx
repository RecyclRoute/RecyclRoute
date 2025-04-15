import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';

const useCreateMarker = (map, markerMode, marker, setMarker) => {
  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e) => {
      const { lng, lat } = e.lngLat;
      console.log('Marker gesetzt bei:', { lng, lat });
      if (marker) {
        marker.remove();
      }
      const newMarker = new maplibregl.Marker({ color: 'red' })
        .setLngLat([lng, lat])
        .addTo(map);
      setMarker(newMarker);
    };

    if (markerMode) {
      map.on('click', handleMapClick);
    }

    return () => {
      if (markerMode) {
        map.off('click', handleMapClick);
      }
    };
  }, [map, markerMode, marker, setMarker]);
};

export default useCreateMarker;
