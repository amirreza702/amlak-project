import type { PropertyType } from "@prisma/client";

/**
 * ============================================================
 * UpdatePropertyInput
 * ============================================================
 *
 * اطلاعاتی که برای ویرایش خود Property دریافت می‌شوند.
 *
 * فقط فیلدهای قابل ویرایش در این Use Case قرار می‌گیرند.
 *
 * نکته:
 * اطلاعات Listing مثل قیمت و وضعیت معامله
 * در Serviceهای مربوط به PropertyListing مدیریت می‌شوند
 * و در اینجا قرار نمی‌گیرند.
 */
export interface UpdatePropertyInput {
  propertyType?: PropertyType;
  city?: string;
  district?: string;
  address?: string;
  postalCode?: string | null;
  area?: number | null;
  rooms?: number | null;
  floor?: number | null;
}