/**
 * موجودیت اصلی ملک
 *
 * این Interface نماینده خود ملک است،
 * نه ثبت ملک توسط یک مشاور.
 */
export interface Property {

  id: string;

  postalCode: string;

  area: number;

  rooms: number;

  floor: number;
}