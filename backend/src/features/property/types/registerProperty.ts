/**
 * اطلاعات موردنیاز برای Use Case ثبت ملک
 *
 * این Type با Property متفاوت است.
 */
export interface RegisterPropertyInput {

  postalCode: string;

  area: number;

  rooms: number;

  floor: number;

  /**
   * فعلاً از Client دریافت می‌شود.
   *
   * بعد از Authentication این مقدار
   * از User/Session سمت Backend استخراج خواهد شد.
   */
  agentId: string;
}