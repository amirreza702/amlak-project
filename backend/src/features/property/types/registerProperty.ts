/**
 * ============================================================
 * Register Property Input
 * ============================================================
 *
 * Type ورودی Use Case ثبت ملک توسط مشاور.
 *
 * این فایل نباید مستقیماً به Prisma وابسته باشد.
 * ============================================================
 */

export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "VILLA"
  | "LAND"
  | "SHOP"
  | "OFFICE"
  | "GARDEN";

/**
 * اطلاعات موردنیاز برای ثبت ملک توسط مشاور
 */
export interface RegisterPropertyInput {
  /**
   * نوع ملک
   */
  propertyType: PropertyType;

  /**
   * اطلاعات مکانی
   */
  city: string;
  district: string;
  address: string;

  /**
   * کد پستی اختیاری است.
   */
  postalCode?: string | null;

  /**
   * مشخصات ملک
   */
  area?: number | null;
  rooms?: number | null;
  floor?: number | null;

  /**
   * شناسه مشاور
   */
  agentId: string;
}