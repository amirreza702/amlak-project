/**
 * ارتباط بین Property و Agent
 *
 * یک Property می‌تواند چند Agent داشته باشد
 * و یک Agent نیز می‌تواند چند Property داشته باشد.
 */
export interface PropertyAgent {

  propertyId: string;

  agentId: string;

  registeredAt: Date;

  /**
   * آیا این مشاور اولین ثبت‌کننده این ملک بوده؟
   */
  isFirstRegistrant: boolean;
}