// DowgNut — centralised fetch helper with improved error handling.
// Injects the `x-session-id` header from sessionStorage on every call so that
// cart / favorites / orders stay scoped to the same anonymous browser session.
// Using sessionStorage instead of localStorage for better security (clears on tab close).

import { ERROR_MESSAGES } from "./constants";

export const SESSION_KEY = "dowgnut-session";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (window.crypto && "randomUUID" in window.crypto
          ? window.crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36));
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export class ApiError extends Error {
  status: number;
  code?: string;
  
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "ApiError";
  }
  
  getUserMessage(): string {
    if (this.status >= 500) return ERROR_MESSAGES.server;
    if (this.status === 404) return ERROR_MESSAGES.notFound;
    if (this.status === 401 || this.status === 403) return ERROR_MESSAGES.sessionExpired;
    return this.message || ERROR_MESSAGES.validation;
  }
}

export interface ApiFetchOptions extends RequestInit {
  /** Show user-friendly error toast on failure */
  showErrorToast?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: ApiFetchOptions = {}
): Promise<T> {
  const { 
    showErrorToast = false, 
    timeout = 10000,
    ...fetchInit 
  } = init;
  
  const headers = new Headers(fetchInit.headers || {});
  if (!headers.has("Content-Type") && fetchInit.body) {
    headers.set("Content-Type", "application/json");
  }
  const sid = getSessionId();
  if (sid) headers.set("x-session-id", sid);

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(path, { ...fetchInit, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    
    const isJson =
      res.headers.get("content-type")?.includes("application/json") ?? false;
    const data = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
      const message =
        (data && typeof data === "object" && "error" in data && String((data as any).error)) ||
        `Request failed (${res.status})`;
      const code = data && typeof data === "object" && "code" in data ? String((data as any).code) : undefined;
      throw new ApiError(message, res.status, code);
    }
    return (data as T) ?? (undefined as unknown as T);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors and timeouts
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408, "TIMEOUT");
    }
    
    if (error instanceof Error && !navigator.onLine) {
      throw new ApiError(ERROR_MESSAGES.network, 0, "NETWORK_ERROR");
    }
    
    throw new ApiError(ERROR_MESSAGES.server, 500, "UNKNOWN_ERROR");
  }
}
