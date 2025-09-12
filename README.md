# Earthquake Visualizer

An interactive, production-ready web app for exploring recent global seismic activity designed for Casey (a geography student). It fetches live earthquake data from USGS and renders scalable CircleMarkers on a performant Leaflet map with intuitive controls and accessibility.

## Why each choice was made
- React + Vite: Fast dev server, instant HMR, small production bundles. React hooks keep state simple without external state libraries.
- TypeScript: Safer data handling for GeoJSON properties; clearer component contracts.
- Leaflet + react-leaflet: Mature mapping with zero proprietary services. CircleMarkers render quickly and don’t require image assets.
- OpenStreetMap tiles: Free, widely available base layer with appropriate attribution.
- Single `styles.css`: Keeps styling approachable and portable; reduces complexity while achieving responsive, accessible UI.
- Hooks-only state: The app is a single-screen visualization; local component state is sufficient and more maintainable than Redux/MobX.

## Features
- Pan/zoom world map using CircleMarkers (not image markers) for performance
- Hover tooltips (quick glance) and click popups (full details + USGS link)
- Adjustable minimum magnitude filter via a slider (0–8, step 0.1)
- Color legend that matches the magnitude color scale used by markers
- Loading and error states with a retry button
- Last updated timestamp (from the USGS feed metadata)
- Sticky control panel, responsive layout (single column on small screens)
- Keyboard focus styles and focusable map container for better a11y

## Architecture overview
- `index.html`: Minimal HTML shell that loads the React bundle and Leaflet CSS.
- `src/main.tsx`: React entry, mounts `<App />`, imports global CSS.
- `src/App.tsx`: Top-level state and controls. Fetches USGS feed, handles loading/error, filtering by magnitude, and renders the legend and `<MapView />`.
- `src/MapView.tsx`: Leaflet map via `react-leaflet`. Renders `CircleMarker` for each earthquake with `Tooltip` and `Popup`.
- `src/styles.css`: Global styles for layout, panel, tooltips/popups, and focus outlines.

## Data flow
1. App loads → `useEffect` triggers a fetch to the USGS all-day GeoJSON feed.
2. On success, we store `features` and the `metadata.generated` timestamp.
3. `minMag` slider updates local state; a memoized filter returns only quakes with `mag >= minMag`.
4. Filtered features are passed to `MapView` for rendering as CircleMarkers.
5. Auto-refresh runs every 5 minutes to keep the map current.

## Mapping details
- Base layer: OpenStreetMap via `TileLayer` at `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` with attribution.
- Center/zoom: Starts at `[20, 0]`, zoom `2`, and `worldCopyJump` to allow seamless panning across the antimeridian.
- CircleMarkers: Size scales with magnitude for legibility, with a minimum radius to keep small magnitudes visible.

### Magnitude → color scale
We map magnitude to a warm sequential scale for immediate visual recognition:
- `mag >= 7` → `#7f0000`
- `mag >= 6` → `#b30000`
- `mag >= 5` → `#d7301f`
- `mag >= 4` → `#ef6548`
- `mag >= 2` → `#fc8d59`
- `< 2` → `#fdbb84`
- `null` → `#9aa0a6` (muted)

### Marker radius formula
```
radius = max(3, (mag || 0) * 2 + 3)
```
Rationale: keeps tiny quakes visible, scales smoothly with magnitude without overwhelming the map for large events.

## Accessibility and UX
- Focus ring: Keyboard users get visible outlines for inputs and buttons.
- Map focus: The Leaflet container is assigned `tabIndex=0` and `aria-label` so it’s reachable by keyboard.
- Sticky panel: Controls remain visible while exploring the map.
- Responsive: On small screens, the layout stacks with the panel on top.

## Error handling and resilience
- Fetch uses `cache: 'no-store'` for freshness.
- Failed requests show an inline error with a Retry button.
- Auto-refresh every 5 minutes keeps content live without user action.

## Local development
```bash
npm install
npm run dev
```
This starts Vite at `http://localhost:5173` (strict port in `vite.config.ts`).

## Production build and preview
```bash
npm run build
npm run preview
```
The build outputs to `dist/`. Preview serves the production build for a final check.

## Data source
USGS All Day GeoJSON feed: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson

Notes:
- No API key or auth required.
- CORS is allowed by USGS; requests are made directly from the browser.

## Deploying/hosting on CodeSandbox (Sandbox)
You have two simple options to host this app on CodeSandbox:

### Option A: Create a new Vite + React sandbox and paste files
1. Open CodeSandbox and create a new sandbox → choose the “Vite + React + TypeScript” template.
2. In the sandbox file tree, replace the template files with the contents of this project:
   - Overwrite `index.html`, `vite.config.ts`, `tsconfig.json`.
   - Create `src/` folder with: `main.tsx`, `App.tsx`, `MapView.tsx`, `styles.css`.
   - Update `package.json` dependencies to match this repo (React, react-dom, react-leaflet, leaflet, plugin-react, types).
3. Ensure the scripts include:
   - `"dev": "vite --host"`
   - `"build": "tsc -b && vite build"`
   - `"preview": "vite preview --port 5173 --strictPort"`
4. The sandbox should auto-install. If not, run the install task in the terminal.
5. Start the dev server (it should run automatically). The preview pane will show the app. If it fails to bind, verify `--host` is present on the dev script so CodeSandbox can proxy the server.

### Option B: Import from GitHub (recommended if you’ll iterate)
1. Push this project to a GitHub repository.
2. In CodeSandbox, choose “Import from GitHub” and paste the repo URL.
3. Once imported, check `package.json` scripts:
   - Ensure `dev` uses `vite --host` so the sandbox can expose the port.
4. The sandbox will install dependencies and start the Vite server. Open the browser preview.

### Troubleshooting in CodeSandbox
- White screen or 404 in preview: Ensure `index.html` is in the project root and `src/main.tsx` path matches the script tag.
- Tiles not loading: Check network tab; some corporate networks block OpenStreetMap. Try a different network.
- Map not full height: Confirm `.map-container .leaflet-container { height: 100%; }` exists and parent containers have a defined height.
- Data not appearing: Verify the USGS feed URL is correct and requests aren’t blocked by an extension.

## Customization ideas for Casey
- Add a time window selector (past hour/day/week) using other USGS feeds.
- Add depth-based styling (stroke or ring) and a depth legend.
- Enable clustering for lower magnitudes if you expand the time window.
- Add a “Share” button copying a link with current filters and viewport.

## License and attribution
- Base tiles © OpenStreetMap contributors (see attribution on the map).
- Data © United States Geological Survey (USGS).

