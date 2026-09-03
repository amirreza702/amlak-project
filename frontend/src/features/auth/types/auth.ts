export type UserRole = "agent" | "customer" | "owner";

export interface AgentRegisterData {
  firstName: string;
  lastName: string;
  mobile: string;
  agencyName?: string;
  password: string;
}

export interface AgentLoginData {
  mobile: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    mobile: string;
    agencyName?: string;
    isActive: boolean;
  };
}
