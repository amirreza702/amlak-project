import {
  ListingStatus,
} from "@prisma/client";

import {
  findPropertyListingByPropertyId,
  updatePropertyListing,
} from "../repository/propertyListingRepository";

import {
  updateProperty,
} from "../repository/propertyRepository";

import type {
  UpdatePropertyListingStatusInput,
} from "../types/updatePropertyListingStatus";

/**
 * وضعیت‌های مجاز برای تغییر Listing
 */
const allowedTransitions: Record<
  ListingStatus,
  ListingStatus[]
> = {
  [ListingStatus.DRAFT]: [
    ListingStatus.PENDING_OWNER_APPROVAL,
  ],

  [ListingStatus.PENDING_OWNER_APPROVAL]: [
    ListingStatus.PENDING_HASHTI_VERIFICATION,
    ListingStatus.REJECTED,
  ],

  [ListingStatus.PENDING_HASHTI_VERIFICATION]: [
    ListingStatus.PUBLISHED,
    ListingStatus.REJECTED,
  ],

  [ListingStatus.PUBLISHED]: [
    ListingStatus.PAUSED,
    ListingStatus.EXPIRED,
    ListingStatus.SOLD,
    ListingStatus.RENTED,
  ],

  [ListingStatus.REJECTED]: [
    ListingStatus.DRAFT,
  ],

  [ListingStatus.EXPIRED]: [
    ListingStatus.DRAFT,
  ],

  [ListingStatus.PAUSED]: [
    ListingStatus.PUBLISHED,
    ListingStatus.EXPIRED,
  ],

  [ListingStatus.SOLD]: [],

  [ListingStatus.RENTED]: [],
};

/**
 * مدت اعتبار تأیید ملک
 *
 * فعلاً طبق تصمیم فعلی پروژه:
 * ۳۰ روز
 */
const PROPERTY_CONFIRMATION_DAYS = 30;

/**
 * محاسبه تاریخ پایان مهلت تأیید
 */
function calculateConfirmUntil(
  from: Date
): Date {
  const confirmUntil = new Date(from);

  confirmUntil.setDate(
    confirmUntil.getDate() +
      PROPERTY_CONFIRMATION_DAYS
  );

  return confirmUntil;
}

export async function updatePropertyListingStatus(
  propertyId: string,
  data: UpdatePropertyListingStatusInput
) {
  const listing =
    await findPropertyListingByPropertyId(propertyId);

  if (!listing) {
    throw new Error(
      "برای این ملک اطلاعات معامله ثبت نشده است."
    );
  }

  /**
   * اگر وضعیت جدید با وضعیت فعلی یکی باشد،
   * هیچ تغییری انجام نمی‌دهیم.
   */
  if (listing.status === data.status) {
    return {
      listing,
      statusChanged: false,
    };
  }

  /**
   * بررسی Transition مجاز
   */
  const allowedStatuses =
    allowedTransitions[listing.status];

  if (!allowedStatuses.includes(data.status)) {
    throw new Error(
      `تغییر وضعیت از ${listing.status} به ${data.status} مجاز نیست.`
    );
  }

  const updateData: Parameters<
    typeof updatePropertyListing
  >[1] = {
    status: data.status,
  };

  /**
   * وقتی Listing منتشر می‌شود:
   *
   * 1. publishedAt ثبت می‌شود.
   */
  if (data.status === ListingStatus.PUBLISHED) {
    updateData.publishedAt =
      listing.publishedAt ?? new Date();
  }

  const updatedListing =
    await updatePropertyListing(
      listing.id,
      updateData
    );

  /**
   * وقتی Listing منتشر می‌شود،
   * ملک نیز برای ۳۰ روز معتبر خواهد بود
   * و بعد از آن نیاز به تأیید مجدد دارد.
   */
  if (data.status === ListingStatus.PUBLISHED) {
    const confirmUntil =
      calculateConfirmUntil(new Date());

    await updateProperty(
      propertyId,
      {
        confirmUntil,
      }
    );

    return {
      listing: updatedListing,
      statusChanged: true,
      confirmUntil,
    };
  }

  return {
    listing: updatedListing,
    statusChanged: true,
  };
}