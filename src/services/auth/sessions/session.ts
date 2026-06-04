import type { AuthSession, AuthSessionListener } from "./session.dto";

export type { AuthSession, AuthSessionListener } from "./session.dto";

const STORAGE_KEYS = {
    accessToken: "accessToken",
    refreshToken: "refreshToken",
    role: "role",
} as const;

let currentSession: AuthSession | null = null;
const listeners = new Set<AuthSessionListener>();

function canUseStorage() {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

// Service-layer persistence helpers. These are intentionally framework-agnostic
// so both React and plain service code can share the same session source of truth.
function readSessionFromStorage(): AuthSession | null {
    if (!canUseStorage()) {
        return null;
    }

    const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    const role = localStorage.getItem(STORAGE_KEYS.role);

    if (!accessToken || !refreshToken || !role) {
        return null;
    }

    return { accessToken, refreshToken, role };
}

function writeSessionToStorage(session: AuthSession | null) {
    if (!canUseStorage()) {
        return;
    }

    if (!session) {
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
        localStorage.removeItem(STORAGE_KEYS.role);
        return;
    }

    localStorage.setItem(STORAGE_KEYS.accessToken, session.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, session.refreshToken);
    localStorage.setItem(STORAGE_KEYS.role, session.role);
}

function notifyListeners() {
    listeners.forEach((listener) => listener(currentSession));
}

export function loadSessionFromStorage(): AuthSession | null {
    currentSession = readSessionFromStorage();
    return currentSession;
}

export function getSession(): AuthSession | null {
    return currentSession ?? readSessionFromStorage();
}

export function saveSession(session: AuthSession) {
    currentSession = session;
    writeSessionToStorage(session);
    notifyListeners();
}

export function clearSession() {
    currentSession = null;
    writeSessionToStorage(null);
    notifyListeners();
}

export function subscribeSession(listener: AuthSessionListener) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}
