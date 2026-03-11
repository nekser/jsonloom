export type ConsentSource = "banner" | "settings";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  version: 1;
  updatedAt: string;
  source: ConsentSource;
};

export const CONSENT_STORAGE_KEY = "jsonloom:consent:v1";
export const CONSENT_UPDATED_EVENT = "jsonloom:consent-updated";
export const OPEN_PRIVACY_SETTINGS_EVENT = "jsonloom:open-privacy-settings";

function isConsentSource(value: unknown): value is ConsentSource {
  return value === "banner" || value === "settings";
}

function isConsentState(value: unknown): value is ConsentState {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<ConsentState>;
  return data.necessary === true
    && typeof data.analytics === "boolean"
    && data.version === 1
    && typeof data.updatedAt === "string"
    && isConsentSource(data.source);
}

export function createConsentState(analytics: boolean, source: ConsentSource): ConsentState {
  return {
    necessary: true,
    analytics,
    version: 1,
    updatedAt: new Date().toISOString(),
    source,
  };
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isConsentState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveConsent(options: { analytics: boolean; source: ConsentSource }): ConsentState {
  const next = createConsentState(options.analytics, options.source);
  if (typeof window === "undefined") return next;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage write failures.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: next }));
  return next;
}

export function subscribeConsent(listener: (next: ConsentState | null) => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key && event.key !== CONSENT_STORAGE_KEY) return;
    listener(readConsent());
  };
  const onCustom = () => listener(readConsent());

  window.addEventListener("storage", onStorage);
  window.addEventListener(CONSENT_UPDATED_EVENT, onCustom as EventListener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CONSENT_UPDATED_EVENT, onCustom as EventListener);
  };
}

export function openPrivacySettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_PRIVACY_SETTINGS_EVENT));
}

export function onOpenPrivacySettings(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(OPEN_PRIVACY_SETTINGS_EVENT, listener as EventListener);
  return () => {
    window.removeEventListener(OPEN_PRIVACY_SETTINGS_EVENT, listener as EventListener);
  };
}

