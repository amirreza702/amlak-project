"use client";

import { useState, type FormEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type PropertyType = "APARTMENT" | "HOUSE" | "VILLA" | "LAND" | "SHOP" | "OFFICE" | "GARDEN";

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: "APARTMENT", label: "آپارتمان" },
  { value: "HOUSE", label: "خانه" },
  { value: "VILLA", label: "ویلا" },
  { value: "LAND", label: "زمین" },
  { value: "SHOP", label: "مغازه" },
  { value: "OFFICE", label: "اداری" },
  { value: "GARDEN", label: "باغ" },
];

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#043873] focus:ring-2 focus:ring-blue-100";

interface PropertyRegistrationPanelProps {
  mode: "owner" | "agent";
}

export function PropertyRegistrationPanel({ mode }: PropertyRegistrationPanelProps) {
  const [propertyType, setPropertyType] = useState<PropertyType>("APARTMENT");
  const [city, setCity] = useState("شاهرود");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState("36.4243");
  const [longitude, setLongitude] = useState("54.9662");
  const [area, setArea] = useState("");
  const [rooms, setRooms] = useState("2");
  const [floor, setFloor] = useState("0");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    setCreatedPropertyId(null);

    try {
      const response = await fetch(`${API_URL}/properties`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        // شناسه مالک/مشاور ارسال نمی‌شود؛ Route آن را از نشست معتبر استخراج می‌کند.
        body: JSON.stringify({
          propertyType,
          city: city.trim(),
          district: district.trim(),
          address: address.trim(),
          postalCode: postalCode.trim() || null,
          latitudeExact: Number(latitude),
          longitudeExact: Number(longitude),
          area: area ? Number(area) : null,
          rooms: rooms === "" ? null : Number(rooms),
          floor: floor === "" ? null : Number(floor),
        }),
      });
      const body = await response.json().catch(() => ({})) as {
        message?: string;
        property?: { id?: string };
      };
      if (!response.ok) throw new Error(body.message || "ثبت ملک ناموفق بود.");

      const propertyId = body.property?.id;
      if (!propertyId) {
        throw new Error("پاسخ سرور شناسه ملک را برنگرداند؛ پیش از ثبت مجدد، فهرست املاک را بررسی کنید.");
      }

      setCreatedPropertyId(propertyId);
      setMessage(
        mode === "owner"
          ? "اطلاعات ملک و ادعای مالکیت ثبت شد. مالکیت باید توسط هشتی تأیید شود؛ ثبت آگهی و قیمت مرحله جداگانه‌ای است."
          : "اطلاعات ملک و ارتباط آن با حساب مشاور ثبت شد. ثبت آگهی و قیمت مرحله جداگانه‌ای است و دسترسی مشاور به ملک تابع تأییدهای لازم خواهد بود."
      );
      setDistrict("");
      setAddress("");
      setPostalCode("");
      setArea("");
      setRooms("2");
      setFloor("0");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ثبت ملک ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section dir="rtl" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-900">ثبت ملک جدید</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          {mode === "owner"
            ? "مشخصات ملک را ثبت کنید. ادعای مالکیت برای بررسی هشتی ارسال می‌شود و به‌صورت خودکار تأیید نخواهد شد."
            : "مشخصات ملک را ثبت کنید. هویت مشاور از نشست امن شما در سرور تعیین می‌شود؛ برای فعالیت روی ملک ممکن است تأییدهای مالک و هشتی لازم باشد."}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold">نوع ملک
            <select className={inputClass} value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)}>
              {propertyTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-semibold">شهر
            <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required maxLength={100} />
          </label>
          <label className="space-y-1.5 text-sm font-semibold">محله / منطقه
            <input className={inputClass} value={district} onChange={(e) => setDistrict(e.target.value)} required maxLength={120} />
          </label>
          <label className="space-y-1.5 text-sm font-semibold">نشانی ملک
            <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} required maxLength={500} />
          </label>
          <label className="space-y-1.5 text-sm font-semibold">کد پستی (اختیاری)
            <input className={inputClass} inputMode="numeric" pattern="[0-9]{10}" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="۱۰ رقم" />
          </label>
          <label className="space-y-1.5 text-sm font-semibold">متراژ (مترمربع)
            <input className={inputClass} type="number" min="1" step="0.1" value={area} onChange={(e) => setArea(e.target.value)} required />
          </label>
          <label className="space-y-1.5 text-sm font-semibold">تعداد اتاق
            <input className={inputClass} type="number" min="0" max="100" value={rooms} onChange={(e) => setRooms(e.target.value)} required />
          </label>
          <label className="space-y-1.5 text-sm font-semibold">طبقه
            <input className={inputClass} type="number" min="0" max="200" value={floor} onChange={(e) => setFloor(e.target.value)} required />
          </label>
        </div>

        <fieldset className="rounded-xl border border-slate-200 p-4">
          <legend className="px-2 text-sm font-bold">موقعیت جغرافیایی</legend>
          <p className="mb-3 text-xs leading-6 text-slate-500">فعلاً مختصات عددی وارد می‌شود؛ مقدار پیش‌فرض مرکز شاهرود است. پیش از ثبت، آن را با موقعیت واقعی ملک تطبیق دهید.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold">عرض جغرافیایی
              <input className={inputClass} type="number" min="-90" max="90" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} required dir="ltr" />
            </label>
            <label className="space-y-1.5 text-sm font-semibold">طول جغرافیایی
              <input className={inputClass} type="number" min="-180" max="180" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} required dir="ltr" />
            </label>
          </div>
        </fieldset>

        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-7 text-red-800">{error}</p>}
        {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-7 text-emerald-800">{message}{createdPropertyId && <span className="mt-2 block break-all font-mono text-xs" dir="ltr">شناسه ملک: {createdPropertyId}</span>}</p>}

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button type="submit" disabled={busy} className="min-h-11 rounded-xl bg-[#043873] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? "در حال ثبت..." : "ثبت اطلاعات ملک"}
          </button>
        </div>
      </form>
    </section>
  );
}
