import type { Property } from "../types/property";

// فعلاً شبیه‌سازی Database
const properties: Property[] = [];


// پیدا کردن ملک با کد پستی
export function findPropertyByPostalCode(
  postalCode: string
): Property | undefined {

  return properties.find(
    (property) =>
      property.postalCode === postalCode
  );
}


// ایجاد Property جدید
export function createProperty(
  data: Omit<Property, "id">
): Property {

  const property: Property = {
    id: crypto.randomUUID(),

    postalCode: data.postalCode,

    area: data.area,

    rooms: data.rooms,

    floor: data.floor,
  };

  properties.push(property);

  return property;
}