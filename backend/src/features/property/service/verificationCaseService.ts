import {
  ListingStatus,
  PropertyHistoryAction,
  VerificationStatus,
} from "@prisma/client";

import { prisma } from "../../../lib/prisma";

import {
  createVerificationCase,
  findLatestVerificationCase,
  findVerificationCaseById,
  reviewVerificationCase,
} from "../repository/verificationCaseRepository";

import { findPropertyById } from "../repository/propertyRepository";
import { createPropertyHistory } from "../repository/propertyHistoryRepository";

import type { VerificationCase } from "../types/verificationCase";

/**
 * ایجاد پرونده بررسی هشتی؛ اگر پرونده‌ای در انتظار باشد همان را برمی‌گرداند.
 */
export const createVerificationCaseService = async (
  propertyId: string
): Promise<VerificationCase> => {
  const property = await findPropertyById(propertyId);

  if (!property) {
    throw new Error("ملک مورد نظر پیدا نشد.");
  }

  const existingCase = await findLatestVerificationCase(propertyId);

  if (
    existingCase &&
    existingCase.status === VerificationStatus.PENDING
  ) {
    return existingCase;
  }

  return createVerificationCase(propertyId);
};

export interface ReviewVerificationCaseInput {
  verificationCaseId: string;
  status: VerificationStatus;
  reviewedBy: string;
  notes: string | null;
}

const PROPERTY_CONFIRMATION_DAYS = 30;

function calculateConfirmUntil(from: Date): Date {
  const confirmUntil = new Date(from);
  confirmUntil.setDate(confirmUntil.getDate() + PROPERTY_CONFIRMATION_DAYS);
  return confirmUntil;
}

/**
 * بررسی پرونده هشتی و هماهنگ‌سازی وضعیت آگهی در یک تراکنش.
 * فقط آگهی‌ای که قبلاً به مرحله PENDING_HASHTI_VERIFICATION رسیده
 * می‌تواند با تأیید هشتی منتشر شود؛ تأیید هویت/پرونده به‌تنهایی
 * نباید دور زدن تأیید مالک یا ساخت اطلاعات معامله را ممکن کند.
 */
export const reviewVerificationCaseService = async (
  data: ReviewVerificationCaseInput
): Promise<VerificationCase> => {
  const verificationCase = await findVerificationCaseById(
    data.verificationCaseId
  );

  if (!verificationCase) {
    throw new Error("پرونده تأیید مورد نظر پیدا نشد.");
  }

  if (verificationCase.status !== VerificationStatus.PENDING) {
    throw new Error("این پرونده قبلاً بررسی شده است.");
  }

  if (
    data.status !== VerificationStatus.VERIFIED &&
    data.status !== VerificationStatus.REJECTED
  ) {
    throw new Error("وضعیت بررسی پرونده معتبر نیست.");
  }

  return prisma.$transaction(async (tx) => {
    const reviewedCase = await reviewVerificationCase(
      data.verificationCaseId,
      data.status,
      data.reviewedBy,
      data.notes,
      tx
    );

    await createPropertyHistory(
      {
        propertyId: verificationCase.propertyId,
        action: PropertyHistoryAction.VERIFICATION_CHANGED,
        field: "verificationCase.status",
        oldValue: VerificationStatus.PENDING,
        newValue: data.status,
        performedBy: data.reviewedBy,
        reason: data.notes ?? "بررسی پرونده تأیید توسط هشتی",
      },
      tx
    );

    // پرونده بررسی و آگهی دو وضعیت مستقل‌اند. پس از تصمیم هشتی،
    // وضعیت آگهی فقط وقتی تغییر می‌کند که منتظر همین تصمیم بوده باشد.
    const listing = await tx.propertyListing.findUnique({
      where: { propertyId: verificationCase.propertyId },
    });

    if (
      listing &&
      listing.status === ListingStatus.PENDING_HASHTI_VERIFICATION
    ) {
      const nextListingStatus =
        data.status === VerificationStatus.VERIFIED
          ? ListingStatus.PUBLISHED
          : ListingStatus.REJECTED;

      const now = new Date();

      await tx.propertyListing.update({
        where: { id: listing.id },
        data: {
          status: nextListingStatus,
          ...(nextListingStatus === ListingStatus.PUBLISHED
            ? { publishedAt: listing.publishedAt ?? now }
            : {}),
        },
      });

      if (nextListingStatus === ListingStatus.PUBLISHED) {
        await tx.property.update({
          where: { id: verificationCase.propertyId },
          data: { confirmUntil: calculateConfirmUntil(now) },
        });
      }

      await createPropertyHistory(
        {
          propertyId: verificationCase.propertyId,
          action: PropertyHistoryAction.LISTING_CHANGED,
          field: "listing.status",
          oldValue: listing.status,
          newValue: nextListingStatus,
          performedBy: data.reviewedBy,
          reason:
            data.status === VerificationStatus.VERIFIED
              ? "انتشار آگهی پس از تأیید هشتی"
              : "رد آگهی پس از رد پرونده هشتی",
        },
        tx
      );
    }

    const actor = await tx.user.findUnique({
      where: { id: data.reviewedBy },
      select: { id: true, mobile: true, role: true },
    });

    if (actor?.role === "HASHTI") {
      await tx.adminAuditLog.create({
        data: {
          actorUserId: actor.id,
          actorMobile: actor.mobile,
          actorRole: actor.role,
          action: "PROPERTY_VERIFICATION_CASE_REVIEWED",
          targetType: "PROPERTY_VERIFICATION_CASE",
          targetId: data.verificationCaseId,
          details: {
            propertyId: verificationCase.propertyId,
            previousStatus: verificationCase.status,
            newStatus: data.status,
            notes: data.notes,
          },
        },
      });
    }

    return reviewedCase;
  });
};
