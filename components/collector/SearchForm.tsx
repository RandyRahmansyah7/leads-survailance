"use client";

import { useState, type FormEvent } from "react";

export type SearchPayload = {
  query: string;
  area?: string;
  lat?: number;
  lng?: number;
  radius?: number;
};

const LABEL =
  "mb-0.5 block text-[10px] font-semibold tracking-wide text-[#5b626b] uppercase";
const FIELD =
  "h-[24px] w-full rounded-sm border border-[#d7dade] bg-white px-2 text-[11px] outline-none focus:border-[#3a7bdd]";

function optionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function SearchForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (payload: SearchPayload) => void;
  submitting: boolean;
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("");
  const [provider, setProvider] = useState("overpass");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = query.trim();
    if (!keyword) return;

    const payload: SearchPayload = { query: keyword };
    const areaValue = area.trim();
    if (areaValue) payload.area = areaValue;
    const latValue = optionalNumber(lat);
    const lngValue = optionalNumber(lng);
    const radiusValue = optionalNumber(radius);
    if (latValue !== undefined) payload.lat = latValue;
    if (lngValue !== undefined) payload.lng = lngValue;
    if (radiusValue !== undefined) payload.radius = radiusValue;

    onSubmit(payload);
  }

  return (
    <form onSubmit={submit}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="collect-query" className={LABEL}>
            Keyword <span className="text-[#c0392b]">*</span>
          </label>
          <input
            id="collect-query"
            required
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="mis. kafe, bengkel, restoran"
            className={FIELD}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="collect-area" className={LABEL}>
            Area (opsional)
          </label>
          <input
            id="collect-area"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            placeholder="mis. Bandung"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="collect-lat" className={LABEL}>
            Latitude (opsional)
          </label>
          <input
            id="collect-lat"
            type="number"
            step="any"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            placeholder="-6.9"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="collect-lng" className={LABEL}>
            Longitude (opsional)
          </label>
          <input
            id="collect-lng"
            type="number"
            step="any"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            placeholder="107.6"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="collect-radius" className={LABEL}>
            Radius meter (opsional)
          </label>
          <input
            id="collect-radius"
            type="number"
            min="0"
            value={radius}
            onChange={(event) => setRadius(event.target.value)}
            placeholder="5000"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="collect-provider" className={LABEL}>
            Penyedia data
          </label>
          <select
            id="collect-provider"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            className={FIELD}
          >
            <option value="overpass">Overpass / OpenStreetMap</option>
            <option value="google" disabled>
              Google Places (belum aktif)
            </option>
          </select>
          <p className="mt-0.5 text-[10px] text-[#9aa0aa]">
            Google Places belum aktif — ditambahkan pada fase berikutnya.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-[26px] items-center justify-center rounded-sm border border-[#2b6cb0] bg-[#3a7bdd] px-3 text-[11px] font-medium text-white hover:bg-[#3270cc] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Mencari…" : "Cari prospek"}
        </button>
        <p className="text-[10px] text-[#9aa0aa]">
          Keyword wajib diisi; area dan koordinat bersifat opsional.
        </p>
      </div>
    </form>
  );
}
