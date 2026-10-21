import { prisma } from "../../../lib/prisma";
import { findVerificationQueueCases, type VerificationQueueQuery } from "../repository/verificationQueueRepository";

/**
 * پرونده‌های قدیمی آگهی‌هایی را که قبلاً ثبت شده‌اند اما پرونده بررسی ندارند
 * به صف اضافه می‌کند. پرونده‌های بررسی‌شده/ردشده دوباره باز نمی‌شوند.
 */
async function ensureListedPropertiesHaveVerificationCases(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const properties = await tx.property.findMany({
      where: {
        listing: { isNot: null },
        verificationCases: { none: {} },
      },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: 500,
    });

    for (const property of properties) {
      // بررسی دوباره داخل Transaction برای جلوگیری از ایجاد پرونده تکراری در درخواست‌های هم‌زمان.
      const existingCase = await tx.verificationCase.findFirst({
        where: { propertyId: property.id },
        select: { id: true },
      });

      if (!existingCase) {
        await tx.verificationCase.create({
          data: { propertyId: property.id },
        });
      }
    }
  });
}

export const getVerificationQueueService = async (query: VerificationQueueQuery) => {
  await ensureListedPropertiesHaveVerificationCases();
  return findVerificationQueueCases(query);
};
