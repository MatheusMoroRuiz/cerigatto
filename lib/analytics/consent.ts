"use client";

/**
 * Consentimento para ferramentas de terceiros (GA4, GTM, Meta Pixel).
 * Só é solicitado quando alguma delas estiver configurada.
 */
const CONSENT_KEY = "cerigatto:consent:v1";
const CONSENT_EVENT = "cerigatto:consent-change";

export type ConsentValue = "granted" | "denied";

export function getConsent(): ConsentValue | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return typeof window !== "undefined" && getConsent() === "granted";
}

export function setConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // ignora
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function subscribeConsent(listener: () => void) {
  window.addEventListener(CONSENT_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CONSENT_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
