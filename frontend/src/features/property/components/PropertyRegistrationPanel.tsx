"use client";

import { useState, type FormEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type PropertyType = "APARTMENT" | "HOUSE" | "VILLA" | "LAND" | "SHOP" | "OFFICE" | "GARDEN";
type TransactionType = "SALE" | "FULL_DEPOSIT" | "RENT";

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: "APARTMENT", label: "آپارتمان" },
  { value: "HOUSE", label: "خانه" },
  { value: "VILLA", label: "ویلا" },
  { value: "LAND", label: "زمین" },
  { value: "SHOP", label: "مغازه" },
  { value: "OFFICE", label: "اداری" },
  { value: "GARDEN", label: "باغ" },
];

const transactions: { value: TransactionType; label: string }[] = [
  { value: "SALE", label: "فروش" },
  { value: "FULL_DEPOSIT", label: "رهن کامل" },
  { value: "RENT", label: "اجاره" },
];

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#043873] focus:ring-2 focus:ring-blue-100";

async function readResponse(response: Response): Promise<Record<string, unknown>> {
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(typeof body.message === "string" ? body.message : "درخواست به سرور ناموفق بود.");
  }
  return body;
}

/**
 * فرم مشترک ثبت ملک برای مالک و مشاور.
 * شناسه پروفایل ثبت‌کننده عمداً از فرانت‌اند ارسال نمی‌شود؛
 * بک‌اند آن را از نشست احراز هویت‌شده استخراج می‌کند.
 */
export function PropertyRegistrationPanel() {
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
  const [transactionType, setTransactionType] = useState<TransactionType>("SALE");
  const [price, setPrice] = useState("");
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
      const propertyResponse = await fetch(`${API_URL}/properties`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
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

      const propertyBody = await readResponse(propertyResponse);
      const property = propertyBody.property as { id?: string } | undefined;
      const propertyId = property?.id;

      if (!propertyId) {
        throw new Error("ملک ثبت شد، اما شناسه آن از سرور دریافت نشد؛ پیش از ثبت دوباره، فهرست املاک را بررسی کنید.");
      }
      setCreatedPropertyId(propertyId);

      const listingPayload: Record<string, string> = { transactionType };
      if (transactionType === "SALE") listingPayload.salePrice = price;
      if (transactionType === "FULL_DEPOSIT") listingPayload.depositAmount = price;
      if (transactionType === "RENT") listingPayload.rentAmount = price;

      try {
        await readResponse(await fetch(`${API_URL}/properties/${encodeURIComponent(propertyId)}/listing`, {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(listingPayload),
        }));
        setMessage("ملک و اطلاعات معامله با موفقیت ثبت شد. آگهی در وضعیت پیش‌نویس است و تا انتشار مجاز در جست‌وجوی عمومی نمایش داده نمی‌شود.");
        setDistrict("");
        setAddress("");
        setPostalCode("");
        setArea("");
        setPrice("");
      } catch (listingError) {
        setError(`ملک با شناسه ${propertyId} ثبت شد، اما ثبت اطلاعات معامله ناموفق بود: ${listingError instanceof Error ? listingError.message : "خطای نامشخص"}. برای جلوگیری از ثبت ملک تکراری، دوباره فرم را ارسال نکنید.`);
      }
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
        <p className="mt-2 text-sm leading-7 text-slate-600">مشخصات ملک و اطلاعات معامله را وارد کنید. شناسه مالک یا مشاور از نشست امن شما در سرور تعیین می‌شود.</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold">نوع ملک
            <select className={inputClass} value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)}>{propertyTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
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
          <p className="mb-3 text-xs leading-6 text-slate-500">فعلاً مختصات عددی ثبت می‌شود؛ مقدار پیش‌فرض مرکز شاهرود است. پیش از ثبت، آن را با موقعیت واقعی ملک تطبیق دهید.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold">عرض جغرافیایی
              <input className={inputClass} type="number" min="-90" max="90" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} required dir="ltr" />
            </label>
            <label className="space-y-1.5 text-sm font-semibold">طول جغرافیایی
              <input className={inputClass} type="number" min="-180" max="180" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} required dir="ltr" />
            </label>
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-semibold">نوع معامله
            <select className={inputClass} value={transactionType} onChange={(e) => { setTransactionType(e.target.value as TransactionType); setPrice(""); }}>{
              transactions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)
            }</select>
          </label>
          <label className="space-y-1.5 text-sm font-semibold">{transactionType === "SALE" ? "قیمت فروش (ریال)" : transactionType === "FULL_DEPOSIT" ? "مبلغ رهن (ریال)" : "اجاره ماهانه (ریال)"}
            <input className={inputClass} type="number" min="1" step="1" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </label>
        </div>

        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-7 text-red-800">{error}</p>}
        {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-7 text-emerald-800">{message}{createdPropertyId && <span className="mt-1 block break-all font-mono text-xs" dir="ltr">شناسه ملک: {createdPropertyId}</span>}</p>}
        {createdPropertyId && error && <p className="break-all text-xs text-slate-500" dir="ltr">شناسه ملک ثبت‌شده: {createdPropertyId}</p>}

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button type="submit" disabled={busy} className="min-h-11 rounded-xl bg-[#043873] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "در حال ثبت..." : "ثبت ملک و اطلاعات معامله"}</button>
        </div>
      </form>
    </section>
  );
}
