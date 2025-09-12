import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, useMap } from 'react-leaflet';
import type { EarthquakeFeature } from './App';
import { magToColor } from './App';
import 'leaflet/dist/leaflet.css';

type Props = {
  features: EarthquakeFeature[];
};

export default function MapView({ features }: Props): JSX.Element {
  const markers = useMemo(() => features, [features]);
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      worldCopyJump
      style={{ height: '100%', width: '100%' }}
      aria-label="Earthquake map"
    >
      <KeyboardFocusHelper />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((f) => {
        const [lon, lat, depth] = f.geometry.coordinates;
        const mag = f.properties.mag;
        const color = magToColor(mag);
        const radius = Math.max(3, (mag ?? 0) * 2 + 3);
        return (
          <CircleMarker
            key={f.id}
            center={[lat, lon]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 1 }}
         >
            <Tooltip direction="top" offset={[0, -4]} opacity={1} permanent={false} sticky>
              <div className="tooltip">
                <div className="tooltip-title">M {mag?.toFixed(1) ?? 'N/A'}</div>
                <div className="tooltip-sub">{f.properties.place ?? 'Unknown location'}</div>
              </div>
            </Tooltip>
            <Popup>
              <div className="popup">
                <div className="popup-title">Magnitude {mag?.toFixed(1) ?? 'N/A'}</div>
                <div className="popup-row"><strong>Location:</strong> {f.properties.place ?? 'Unknown'}</div>
                <div className="popup-row"><strong>Depth:</strong> {depth?.toFixed(1) ?? 'N/A'} km</div>
                <div className="popup-row"><strong>Time:</strong> {new Date(f.properties.time).toLocaleString()}</div>
                <a className="popup-link" href={f.properties.url} target="_blank" rel="noreferrer">USGS event page</a>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

function KeyboardFocusHelper(): null {
  const map = useMap();
  React.useEffect(() => {
    const container = map.getContainer();
    container.tabIndex = 0;
    container.setAttribute('aria-label', 'Interactive map');
  }, [map]);
  return null;
}


