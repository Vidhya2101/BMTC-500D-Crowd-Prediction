import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Accurate coordinates for your stops
const stops = [
  { name: "Silk Board", coords: [12.9177, 77.6239] },
  { name: "Agara", coords: [12.9249, 77.6515] },
  { name: "Marathahalli", coords: [12.9562, 77.7019] },
  { name: "Tin Factory", coords: [13.0085, 77.6632] },
  { name: "Hebbal", coords: [13.0358, 77.5970] }
];

// Build polyline from stop coordinates
const routeCoords = stops.map(s => s.coords);

export default function MapView() {
  return (
    <MapContainer
      center={[12.96, 77.64]}
      zoom={12}
      style={{ height: "350px", width: "100%", marginTop: "20px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Draw route */}
      <Polyline positions={routeCoords} />

      {/* Draw stop markers */}
      {stops.map((stop, i) => (
        <Marker key={i} position={stop.coords}>
          <Popup>{stop.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
