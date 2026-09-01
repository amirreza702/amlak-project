/**
 * موجودیت اصلی ملک
 *
 * این Interface نماینده خود ملک است،
 * نه ثبت ملک توسط یک مشاور.
 */
export interface Property {
  id: string;
  postalCode: string;
  address?: string | null;
  area: number;
  rooms: number;
  floor: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}