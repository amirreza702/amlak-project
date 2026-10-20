const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include", cache: "no-store", ...init });
  const body = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) {
    const message = body.message || "درخواست به سرور ناموفق بود.";
    if (message === "Authentication required") throw new Error("برای استفاده از پنل هشتی دوباره وارد شوید.");
    if (message === "You do not have permission to access this resource") throw new Error("این عملیات فقط برای تیم هشتی مجاز است.");
    if (message === "Session is invalid or expired") throw new Error("نشست منقضی شده است؛ دوباره وارد شوید.");
    throw new Error(message);
  }
  return body as T;
}
