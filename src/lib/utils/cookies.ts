/**
 * Cookie utility functions for authentication persistence
 */

export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with the given name, value, and options
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`;
  }

  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += '; secure';
  }

  if (options.httpOnly) {
    cookieString += '; httponly';
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, options: Omit<CookieOptions, 'expires' | 'maxAge'> = {}): void {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
  });
}

/**
 * Check if cookies are available
 */
export function areCookiesAvailable(): boolean {
  if (typeof document === 'undefined') return false;

  try {
    const testCookie = '__cookie_test__';
    setCookie(testCookie, 'test');
    const hasSupport = getCookie(testCookie) === 'test';
    deleteCookie(testCookie);
    return hasSupport;
  } catch {
    return false;
  }
}

// Auth-specific cookie utilities
export const AUTH_COOKIE_NAME = 'whatsapp_crm_auth';
export const TOKEN_COOKIE_NAME = 'whatsapp_crm_token';

/**
 * Set authentication cookies
 */
export function setAuthCookies(user: any, token: string): void {
  const cookieOptions: CookieOptions = {
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  setCookie(AUTH_COOKIE_NAME, JSON.stringify(user), cookieOptions);
  setCookie(TOKEN_COOKIE_NAME, token, cookieOptions);
}

/**
 * Get authentication data from cookies
 */
export function getAuthFromCookies(): { user: any; token: string } | null {
  const userCookie = getCookie(AUTH_COOKIE_NAME);
  const tokenCookie = getCookie(TOKEN_COOKIE_NAME);

  if (!userCookie || !tokenCookie) {
    return null;
  }

  try {
    const user = JSON.parse(userCookie);
    return { user, token: tokenCookie };
  } catch {
    // Invalid JSON in cookie, clear it
    clearAuthCookies();
    return null;
  }
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(): void {
  deleteCookie(AUTH_COOKIE_NAME, { path: '/' });
  deleteCookie(TOKEN_COOKIE_NAME, { path: '/' });
}
