/**
 * اطلاعات مشاور در سیستم هشتی
 *
 * این Type مربوط به Domain مشاور است
 * و مدل مستقیم Database نیست.
 */
export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  agencyName?: string;
  isActive: boolean;
}