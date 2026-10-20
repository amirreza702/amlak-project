"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface OwnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  user?: { mobile: string };
}

async function requestOwnerJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...init,
  });
  const body = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(body.message || "درخواست به سرور ناموفق بود.");
  return body as T;
}

/** منطق دریافت و ویرایش پروفایل مالک، مستقل از رابط کاربری پنل. */
export function useOwnerProfile(mobile: string) {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const result = await requestOwnerJson<OwnerProfile>("/owners/me/profile");
      setProfile(result);
      setFirstName(result.firstName);
      setLastName(result.lastName);
    } catch (error: unknown) {
      setProfile(null);
      setProfileError(error instanceof Error ? error.message : "دریافت پروفایل مالک انجام نشد.");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile, mobile]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setMessage(null);
    try {
      const result = await requestOwnerJson<OwnerProfile>("/owners/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
      });
      setProfile((current) => current ? { ...current, firstName: result.firstName, lastName: result.lastName } : current);
      setFirstName(result.firstName);
      setLastName(result.lastName);
      setMessage("اطلاعات پروفایل ذخیره شد.");
    } catch (error: unknown) {
      setProfileError(error instanceof Error ? error.message : "ذخیرهٔ پروفایل انجام نشد.");
    } finally {
      setSavingProfile(false);
    }
  };

  return {
    profile,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    loadingProfile,
    savingProfile,
    profileError,
    message,
    saveProfile,
    reloadProfile: loadProfile,
  };
}
