import type { Campaign, Paginated, User } from "./types";

export const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const serverApiUrl = process.env.API_INTERNAL_URL ?? publicApiUrl;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export async function serverApi<T>(path: string): Promise<T> {
  const response = await fetch(`${serverApiUrl}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new ApiError("PitchPond data is temporarily unavailable.", response.status);
  return response.json() as Promise<T>;
}

let csrfReady = false;
export async function browserApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && !csrfReady) {
    const csrf = await fetch(`${publicApiUrl}/sanctum/csrf-cookie`, { credentials: "include" });
    if (!csrf.ok) throw new ApiError("Could not establish a secure session.", csrf.status);
    csrfReady = true;
  }

  const xsrf = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];
  const response = await fetch(`${publicApiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(xsrf ? { "X-XSRF-TOKEN": decodeURIComponent(xsrf) } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.message ?? "Something went wrong.", response.status, payload.errors);
  }
  return payload as T;
}

export async function getCampaigns(query = ""): Promise<Paginated<Campaign>> {
  return serverApi<Paginated<Campaign>>(`/api/v1/campaigns${query}`);
}

export async function getCampaign(slug: string): Promise<{ data: Campaign }> {
  return serverApi<{ data: Campaign }>(`/api/v1/campaigns/${slug}`);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await browserApi<{ data: User }>("/api/v1/auth/me");
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}
