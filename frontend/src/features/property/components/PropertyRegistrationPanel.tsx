"use client";

import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";
import { Building2, LoaderCircle, MapPin, ShieldCheck } from "lucide-react";
import { registerProperty, type PropertyRegistrationInput } from "../api/propertyRegistrationApi";

const PropertyLocationPicker = dynamic(
  () => import("./PropertyLocationPicker").then((module) => module.PropertyLocationPicker),
  { ssr: false, loading: () => <div className="flex h-72 items-center justify-center rounded-xl border text-sm text-slate-500">در حال بارگذاری نقشه...</div> }
);

const initialForm = {
  propertyType: "APARTMENT" as PropertyRegistrationInput["propertyType"],
  city: "شاهرود",
  district: "",
  address: "",
  postalCode: "",
  area: "",
  rooms: "",
  floor: "",
};

const propertyTypes: Array<{ value: PropertyRegistrationInput["propertyType"]; label: string }> = [
  { value: "APARTMENT", label: "آپارتمان" },
  { value: "HOUSE", label: "خانه" },
  { value: "VILLA", label: "ویلا" },
  { value: "LAND", label: "زمین" },
  { value: "SHOP", label: "مغازه" },
  { value: "OFFICE", label: "اداری" },
  { value: "GARDEN", label: "باغ" },
];

export function PropertyRegistrationPanel() {
  const [form, setForm] = useState(initialForm);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const update = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!coordinates) {
      setError("برای ثبت ملک، محل آن را روی نقشه انتخاب کنید.");
      return;
    }
    if (form.postalCode && !/^\d{10}$/.test(form.postalCode.trim())) {
      setError("کد پستی باید ۱۰ رقم باشد یا خالی بماند.");
      return;
    }
    if (form.area && Number(form.area) <= 0) {
      setError("متراژ باید بیشتر از صفر باشد.");
      return;
    }
    if (form.rooms && Number(form.rooms) < 0) {
      setError("تعداد اتاق معتبر نیست.");
      return;
    }
    if (form.floor && Number(form.floor) < 0) {
      setError("طبقه معتبر نیست.");
      return;
    }

    const payload: PropertyRegistrationInput = {
      propertyType: form.propertyType,
      city: form.city.trim(),
      district: form.district.trim(),
      address: form.address.trim(),
      latitudeExact: coordinates.latitude,
      longitudeExact: coordinates.longitude,
      ...(form.postalCode.trim() ? { postalCode: form.postalCode.trim() } : {}),
      ...(form.area ? { area: Number(form.area) } : {}),
      ...(form.rooms ? { rooms: Number(form.rooms) } : {}),
      ...(form.floor ? { floor: Number(form.floor) } : {}),
    };
    setSubmitting(true);
    try {
      const result = await registerProperty(payload);
      setSuccess(`اطلاعات ملک ثبت شد. شناسه ملک: ${result.property?.id ?? "ثبت‌شده"}؛ این پیام به معنی انتشار آگهی نیست و بررسی هشتی لازم است.`);
      setForm(initialForm);
      setCoordinates(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ثبت ملک انجام نشد.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section dir="rtl" className="space-y-4 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-[#043873]"><Building2 className="h-6 w-6" /></div>
        <div>
          <h2 className="text-lg font-bold">ثبت ملک جدید</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">اطلاعات پایه را ثبت کنید. ثبت ملک به‌تنهایی آگهی را منتشر نمی‌کند؛ تأیید هشتی جداگانه است.</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">نوع ملک <span className="text-red-600">*</span>
            <select required value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3">
              {propertyTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">شهر <span className="text-red-600">*</span>
            <input required value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3" />
          </label>
          <label className="space-y-1 text-sm font-medium">محله <span className="text-red-600">*</span>
            <input required value={form.district} onChange={(e) => update("district", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3" />
          </label>
          <label className="space-y-1 text-sm font-medium sm:col-span-2">نشانی <span className="text-red-600">*</span>
            <input required value={form.address} onChange={(e) => update("address", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3" />
          </label>
          <label className="space-y-1 text-sm font-medium">کد پستی (اختیاری)
            <input inputMode="numeric" maxLength={10} value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3" placeholder="۱۰ رقم" />
          </label>
          <label className="space-y-1 text-sm font-medium">متراژ (اختیاری)
            <input type="number" min="1" value={form.area} onChange={(e) => update("area", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3" />
          </label>
          <label className="space-y-1 text-sm font-medium">تعداد اتاق (اختیاری)
            <input type="number" min="0" value={form.rooms} onChange={(e) => update("rooms", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3" />
          </label>
          <label className="space-y-1 text-sm font-medium">طبقه (اختیاری)
            <input type="number" min="0" value={form.floor} onChange={(e) => update("floor", e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3" />
          </label>
        </div>
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-[#043873]" /> محل ملک روی نقشه <span className="text-red-600">*</span></h3>
          <PropertyLocationPicker latitude={coordinates?.latitude ?? null} longitude={coordinates?.longitude ?? null} onSelect={(latitude, longitude) => { setCoordinates({ latitude, longitude }); setError(null); }} />
        </div>
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p>وضعیت مالکیت و تأیید ملک باید توسط هشتی بررسی شود. این فرم هیچ تیک تأییدی را به‌صورت دستی فعال نمی‌کند.</p>
        </div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">{success}</p>}
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#043873] px-5 py-3 font-bold text-white disabled:opacity-60">
          {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
          {submitting ? "در حال ثبت..." : "ثبت ملک برای بررسی هشتی"}
        </button>
      </form>
    </section>
  );
}
