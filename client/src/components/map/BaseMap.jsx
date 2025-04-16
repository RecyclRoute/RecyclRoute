import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const BaseMap = (props) => {
  const mapContainer = useRef(null);

  useEffect(() => {
    const swissImageStyle = {
      version: 8,
      sources: {
        swissimage: {
          type: 'raster',
          tiles: [
            'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg'
          ],
          tileSize: 256,
          attribution: '© swisstopo'
        }
      },
      layers: [
        {
          id: 'swissimage-layer',
          type: 'raster',
          source: 'swissimage',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    };

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: swissImageStyle,
      center: [7.641948397622829, 47.53488012308844],
      zoom: 17,
      maxZoom: 21,  
      pitch: 0,
      pitchWithRotate: false,
      touchPitch: false, 
      interactive: true,
    });

    mapInstance.on('load', () => {
      if (props.onMapLoad) {
        props.onMapLoad(mapInstance);
      }
    });

    return () => mapInstance.remove();
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
