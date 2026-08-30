// src/features/property/repository/propertyRepository.ts
import { prisma } from "../../../lib/prisma";
import { Property } from "../types/property";

export class PropertyRepository {
  async create(data: Omit<Property, "id" | "createdAt">): Promise<Property> {
    return await prisma.property.create({
      data: {
        postalCode: data.postalCode,
        area: data.area,
        rooms: data.rooms,
        floor: data.floor,
      },
    });
  }

  async findByPostalCode(postalCode: string): Promise<Property | null> {
    return await prisma.property.findUnique({
      where: { postalCode },
    });
  }

  async findById(id: string): Promise<Property | null> {
    return await prisma.property.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<Property[]> {
    return await prisma.property.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
