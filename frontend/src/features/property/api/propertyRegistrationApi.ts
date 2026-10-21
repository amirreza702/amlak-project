export type PropertyRegistrationInput = {
  propertyType: "APARTMENT" | "HOUSE" | "VILLA" | "LAND" | "SHOP" | "OFFICE" | "GARDEN";
  city: string;
  district: string;
  address: string;
  postalCode?: string;
  latitudeExact: number;
  longitudeExact: number;
  area?: number;
  rooms?: number;
  floor?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

/** Uses the existing POST /properties endpoint; role/profile are resolved by the server session. */
export async function registerProperty(input: PropertyRegistrationInput) {
  const response = await fetch(`${API_URL}/properties`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const result = await response.json().catch(() => ({})) as { message?: string; property?: { id: string } };
  if (!response.ok) throw new Error(result.message || "ثبت ملک انجام نشد.");
  return result;
}
