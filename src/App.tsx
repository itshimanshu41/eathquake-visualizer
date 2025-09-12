import React, { useEffect, useMemo, useState } from 'react';
import MapView from './MapView';

type EarthquakeFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number; // epoch ms
    url: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [lon, lat, depth]
  };
};

type EarthquakeResponse = {
  type: 'FeatureCollection';
  metadata: { generated: number };
  features: EarthquakeFeature[];
};

const FEED_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

export default function App(): JSX.Element {
  const [features, setFeatures] = useState<EarthquakeFeature[]>([]);
  const [minMag, setMinMag] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(FEED_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: EarthquakeResponse = await res.json();
      setFeatures(json.features || []);
      setLastUpdated(json.metadata?.generated ?? Date.now());
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 5 * 60 * 1000); // refresh every 5 minutes
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return features.filter(f => (f.properties.mag ?? -Infinity) >= minMag);
  }, [features, minMag]);

  return (
    <div className="app-root">
      <aside className="control-panel" role="region" aria-label="Controls">
        <h1>Earthquake Visualizer</h1>
        <div className="field">
          <label htmlFor="minMag">Min magnitude: {minMag.toFixed(1)}</label>
          <input
            id="minMag"
            type="range"
            min={0}
            max={8}
            step={0.1}
            value={minMag}
            onChange={(e) => setMinMag(parseFloat(e.target.value))}
          />
        </div>

        <MagnitudeLegend />

        <div className="meta">
          {loading && <span className="badge loading" aria-live="polite">Loading…</span>}
          {error && (
            <div className="error" role="alert">
              Failed to load data: {error}
              <button onClick={loadData} className="btn-retry">Retry</button>
            </div>
          )}
          {lastUpdated && !loading && !error && (
            <p className="timestamp">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
          )}
          <p className="hint">Pan/zoom map. Hover for details; click for more info.</p>
        </div>
      </aside>

      <main className="map-container">
        <MapView features={filtered} />
      </main>
    </div>
  );
}

function MagnitudeLegend(): JSX.Element {
  const stops = [0, 2, 4, 5, 6, 7];
  return (
    <div className="legend" aria-label="Magnitude color legend">
      <div className="legend-title">Magnitude</div>
      <div className="legend-rows">
        {stops.map((m, idx) => {
          const next = stops[idx + 1];
          const label = next ? `${m}–${next}` : `${m}+`;
          return (
            <div key={m} className="legend-row">
              <span className="swatch" style={{ backgroundColor: magToColor(m + 0.01) }} />
              <span className="label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function magToColor(mag: number | null): string {
  if (mag == null) return '#9aa0a6';
  if (mag >= 7) return '#7f0000';
  if (mag >= 6) return '#b30000';
  if (mag >= 5) return '#d7301f';
  if (mag >= 4) return '#ef6548';
  if (mag >= 2) return '#fc8d59';
  return '#fdbb84';
}

export type { EarthquakeFeature };


