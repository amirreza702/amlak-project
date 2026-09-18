import {
  ListingStatus,
} from "@prisma/client";

import {
  findPropertyById,
} from "../repository/propertyRepository";

import {
  findPropertyListingByPropertyId,
  updatePropertyListing,
} from "../repository/propertyListingRepository";

/**
 * بررسی می‌کند که آیا اعتبار تأیید ملک تمام شده
 * و در صورت نیاز Listing را منقضی می‌کند.
 *
 * منطق:
 *
 * Property.confirmUntil
 *        ↓
 * آیا تاریخ گذشته؟
 *        ↓
 *       بله
 *        ↓
 * Listing → EXPIRED
 */
export async function expirePropertyListing(
  propertyId: string
) {
  const property =
    await findPropertyById(propertyId);

  if (!property) {
    throw new Error(
      "ملک مورد نظر پیدا نشد."
    );
  }

  const listing =
    await findPropertyListingByPropertyId(
      propertyId
    );

  if (!listing) {
    throw new Error(
      "برای این ملک اطلاعات معامله ثبت نشده است."
    );
  }

  /**
   * اگر ملک هنوز مهلت تأیید ندارد،
   * چیزی برای منقضی کردن وجود ندارد.
   */
  if (!property.confirmUntil) {
    return {
      expired: false,
      statusChanged: false,
      listing,
      confirmUntil: null,
    };
  }

  const now = new Date();

  /**
   * اگر هنوز زمان تأیید تمام نشده باشد،
   * Listing را تغییر نمی‌دهیم.
   */
  if (property.confirmUntil > now) {
    return {
      expired: false,
      statusChanged: false,
      listing,
      confirmUntil: property.confirmUntil,
    };
  }

  /**
   * فقط Listingهایی که در وضعیت PUBLISHED هستند
   * با پایان اعتبار ملک، EXPIRED می‌شوند.
   *
   * اگر مثلاً قبلاً PAUSED یا SOLD شده باشد،
   * نباید وضعیت آن را به EXPIRED تغییر دهیم.
   */
  if (listing.status !== ListingStatus.PUBLISHED) {
    return {
      expired: true,
      statusChanged: false,
      listing,
      confirmUntil: property.confirmUntil,
    };
  }

  const updatedListing =
    await updatePropertyListing(
      listing.id,
      {
        status: ListingStatus.EXPIRED,
        expiredAt: now,
      }
    );

  return {
    expired: true,
    statusChanged: true,
    listing: updatedListing,
    confirmUntil: property.confirmUntil,
  };
}