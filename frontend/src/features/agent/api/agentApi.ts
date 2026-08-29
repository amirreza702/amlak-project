import type { Agent } from "../types/agent";

/**
 * دریافت مشاور فعلی
 *
 * فعلاً برای توسعه و تست UI استفاده می‌شود.
 * بعداً این تابع مستقیماً به Authentication / Session متصل می‌شود.
 */
export async function getCurrentAgent(): Promise<Agent> {
  return {
    id: "agent-demo-001",
    firstName: "رضا",
    lastName: "احمدی",
    mobile: "09120000000",
    agencyName: "املاک هشتی",
    isActive: true,
  };
}