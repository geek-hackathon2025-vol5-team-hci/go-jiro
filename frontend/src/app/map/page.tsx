"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapPage() {
  return (
    <main
      style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}
    >
      <MapContainer
        center={[35.681236, 139.767125]} // 東京駅
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
        touchZoom={true}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[35.681236, 139.767125]}>
          <Popup>東京駅</Popup>
        </Marker>
      </MapContainer>
    </main>
  );
}
