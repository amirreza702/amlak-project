/**
 * اطلاعات موردنیاز برای Use Case ثبت ملک
 *
 * این Type با Property متفاوت است.
 */
export interface RegisterPropertyInput {
  postalCode: string;
  address?: string | null;
  area: number;
  rooms: number;
  floor: number;
  agentId: string;
}
