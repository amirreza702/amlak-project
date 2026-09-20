import type { PropertyType } from "@prisma/client";

export interface UpdatePropertyInput {
  propertyType?: PropertyType;
  city?: string;
  district?: string;
  address?: string;
  postalCode?: string | null;

  latitudeExact?: number | null;
  longitudeExact?: number | null;
  latitudePublic?: number | null;
  longitudePublic?: number | null;

  area?: number | null;
  rooms?: number | null;
  floor?: number | null;
}