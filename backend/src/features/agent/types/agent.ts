export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
  agencyName?: string;
  isActive: boolean;
  passwordHash: string; // فقط در بک‌اند نگه‌داری می‌شود
}

// مدلی که به فرانت‌اند برگردانده می‌شود (بدون هش پسورد)
export type AgentPublic = Omit<Agent, "passwordHash">;

export interface LoginPayload {
  mobile: string;
  password: string;
}
