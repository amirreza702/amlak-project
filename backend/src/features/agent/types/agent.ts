// backend/src/features/agent/types/agent.ts

// مدل کامل موجودیت Agent در دیتابیس بک‌اند
export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  agencyName?: string | null;
  address?: string | null;
  isActive: boolean;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// خروجی امن به سمت کلاینت (بدون هش پسورد)
export type AgentPublic = Omit<Agent, "passwordHash">;

// داده‌های ورودی فرم لاگین
export interface LoginPayload {
  mobile: string;
  password: string;
}

// کلاس خطای سفارشی برای لایه احراز هویت
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}
