"use client";

import { useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;border:3px solid white;border-radius:50% 50% 50% 0;background:#043873;transform:rotate(-45deg);box-shadow:0 1px 5px #0008"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click(event) { onSelect(event.latlng.lat, event.latlng.lng); } });
  return null;
}

export function PropertyLocationPicker({
  latitude,
  longitude,
  onSelect,
}: {
  latitude: number | null;
  longitude: number | null;
  onSelect: (lat: number, lng: number) => void;
}) {
  const handleSelect = useCallback((lat: number, lng: number) => onSelect(lat, lng), [onSelect]);
  return (
    <div className="space-y-2">
      <div className="h-72 overflow-hidden rounded-xl border border-slate-300">
        <MapContainer center={[36.4182, 54.9763]} zoom={13} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleSelect} />
          {latitude !== null && longitude !== null && <Marker position={[latitude, longitude]} icon={markerIcon} />}
        </MapContainer>
      </div>
      <p className="text-xs leading-6 text-slate-500">روی نقشه کلیک کنید تا محل ملک مشخص شود. نقشه فعلاً از محدوده شاهرود شروع می‌شود؛ می‌توانید آن را جابه‌جا کنید.</p>
      {latitude !== null && longitude !== null && (
        <p dir="ltr" className="text-xs text-slate-600"> {latitude.toFixed(6)}, {longitude.toFixed(6)} </p>
      )}
    </div>
  );
}
