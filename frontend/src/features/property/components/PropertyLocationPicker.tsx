"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface PropertyCoordinates {
  latitude: number;
  longitude: number;
}

interface PropertyLocationPickerProps {
  value: PropertyCoordinates | null;
  onChange: (value: PropertyCoordinates) => void;
  city: string;
}

const defaultCenter: [number, number] = [36.4182, 54.9763];

function MapClickHandler({ onChange }: { onChange: (value: PropertyCoordinates) => void }) {
  useMapEvents({
    click(event) {
      onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

function MoveMap({ position }: { position: PropertyCoordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.latitude, position.longitude], Math.max(map.getZoom(), 15));
  }, [map, position]);
  return null;
}

export default function PropertyLocationPicker({ value, onChange, city }: PropertyLocationPickerProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [results, setResults] = useState<Array<{ label: string; lat: number; lon: number }>>([]);

  async function searchPlace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setSearching(true);
    setSearchError("");
    setResults([]);
    try {
      // جست‌وجوی نام مکان با Nominatim؛ کاربر قبل از ثبت باید نقطه دقیق را روی نقشه تأیید کند.
      const params = new URLSearchParams({ q: [term, city.trim(), "ایران"].filter(Boolean).join(", "), format: "jsonv2", limit: "5", "accept-language": "fa" });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("جست‌وجوی مکان در حال حاضر در دسترس نیست.");
      const data = await response.json() as Array<{ display_name: string; lat: string; lon: string }>;
      const places = data.map((item) => ({ label: item.display_name, lat: Number(item.lat), lon: Number(item.lon) }));
      setResults(places);
      if (places.length === 0) setSearchError("مکانی پیدا نشد؛ عبارت دیگری جست‌وجو کنید یا نقطه را روی نقشه انتخاب کنید.");
    } catch (cause) {
      setSearchError(cause instanceof Error ? cause.message : "جست‌وجوی مکان ناموفق بود.");
    } finally {
      setSearching(false);
    }
  }

  const center: [number, number] = value ? [value.latitude, value.longitude] : defaultCenter;

  return (
    <div className="space-y-3">
      <form onSubmit={searchPlace} className="flex flex-col gap-2 sm:flex-row">
        <input className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#043873]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی نشانی یا مکان روی نقشه" aria-label="جست‌وجوی مکان روی نقشه" />
        <button type="submit" disabled={searching || !query.trim()} className="rounded-xl bg-[#043873] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{searching ? "در حال جست‌وجو..." : "جست‌وجو"}</button>
      </form>
      {searchError && <p role="status" className="text-xs leading-6 text-amber-800">{searchError}</p>}
      {results.length > 0 && (
        <ul className="max-h-44 space-y-1 overflow-auto rounded-xl border border-slate-200 p-2">
          {results.map((item, index) => (
            <li key={`${item.lat}-${item.lon}-${index}`}>
              <button type="button" onClick={() => { onChange({ latitude: item.lat, longitude: item.lon }); setResults([]); }} className="w-full rounded-lg px-3 py-2 text-right text-sm leading-6 hover:bg-blue-50">{item.label}</button>
            </li>
          ))}
        </ul>
      )}
      <div className="h-72 overflow-hidden rounded-xl border border-slate-300 sm:h-96">
        <MapContainer center={center} zoom={value ? 15 : 13} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler onChange={onChange} />
          <MoveMap position={value} />
          {value && <CircleMarker center={[value.latitude, value.longitude]} radius={9} pathOptions={{ color: "#043873", fillColor: "#3b82f6", fillOpacity: 0.9 }} />}
        </MapContainer>
      </div>
      <p className="text-xs leading-6 text-slate-500">روی نقشه در محل دقیق ملک کلیک کنید؛ یا ابتدا نشانی را جست‌وجو و سپس نقطه را روی نقشه اصلاح کنید. انتخاب نقطه الزامی است.</p>
      {value && (
        <div className="grid gap-3 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
          <p>عرض جغرافیایی: <b dir="ltr" className="font-mono">{value.latitude.toFixed(6)}</b></p>
          <p>طول جغرافیایی: <b dir="ltr" className="font-mono">{value.longitude.toFixed(6)}</b></p>
        </div>
      )}
    </div>
  );
}
