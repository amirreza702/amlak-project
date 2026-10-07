import bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

interface RegisterInput {
  mobile: string;
  password: string;
  role: UserRole;
}

export const registerUserService = async ({
  mobile,
  password,
  role,
}: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      mobile,
    },
  });

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      mobile,
      passwordHash,
      role,
    },
    select: {
      id: true,
      mobile: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
};