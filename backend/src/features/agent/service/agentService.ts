
import {
  createAgent,
  findAgentById,
  findAgentByMobile,
} from "../repository/agentRepository";
// ایمپورت تایپ‌های مشاور
import type { Agent, AgentPublic } from "../types/agent";

// کلید مخفی امضای توکن‌ها از محیط یا مقدار پیش‌فرض
const JWT_SECRET = process.env.JWT_SECRET || "hashti-default-secret-key-12345";



// تابع حذف فیلد پسورد هش‌شده برای بازگرداندن آبجکت عمومی و امن
export const sanitizeAgent = (agent: Agent): AgentPublic => {
  // تفکیک هش رمز عبور از باقی مشخصات مشاور
  const { passwordHash: _, ...publicData } = agent;
  // بازگرداندن آبجکت بدون اطلاعات حساس
  return publicData;
};

// سرویس دریافت مشخصات مشاور با شناسه یکتا
export const getAgentById = async (id: string): Promise<AgentPublic> => {
  // جستجوی مشاور در ریپازیتوری
  const agent = await findAgentById(id);
  // اگر مشاور یافت نشد، پرتاب خطای ۴۰۴
 if (!agent) {
  throw new Error("مشاور با این مشخصات یافت نشد.");
}
  // بازگرداندن داده‌های امن‌شده مشاور
  return sanitizeAgent(agent);
};


