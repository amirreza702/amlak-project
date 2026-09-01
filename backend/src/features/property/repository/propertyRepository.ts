import { prisma } from "../../../lib/prisma";
import type { Property } from "../types/property";

export const findPropertyByPostalCode = async (
  postalCode: string
): Promise<Property | null> => {
  return prisma.property.findUnique({ where: { postalCode } });
};

export const findPropertyById = async (id: string): Promise<Property | null> => {
  return prisma.property.findUnique({ where: { id } });
};

export const createProperty = async (
  data: Omit<Property, "id" | "createdAt" | "updatedAt">
): Promise<Property> => {
  return prisma.property.create({ data });
};

export const findAllProperties = async (): Promise<Property[]> => {
  return prisma.property.findMany({ orderBy: { createdAt: "desc" } });
};
