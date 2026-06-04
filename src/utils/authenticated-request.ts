import { API_URL } from "@/config/settings";
import { authService } from "@/services/auth/auth.service";
import {
    clearSession,
    getSession,
    saveSession,
} from "@/services/auth/sessions/session";

type JsonObject = Record<string, unknown>;

async function parseJson(response: Response): Promise<JsonObject> {
    return response.json().catch(() => ({}));
}

async function doRequest(path: string, token: string, init: RequestInit = {}) {
    return fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(init.headers ?? {}),
        },
    });
}

export async function requestWithAuth<T>(
    path: string,
    token: string,
    errorPrefix: string,
    init: RequestInit = {},
): Promise<T> {
    let response = await doRequest(path, token, init);
    let data = await parseJson(response);

    if (response.status === 401) {
        const session = getSession();

        if (session?.refreshToken) {
            try {
                const refreshed = await authService.refreshSession({
                    refreshToken: session.refreshToken,
                });

                saveSession({
                    accessToken: refreshed.accessToken,
                    refreshToken: refreshed.refreshToken,
                    role: refreshed.role,
                });

                response = await doRequest(path, refreshed.accessToken, init);
                data = await parseJson(response);
            } catch {
                clearSession();
                throw new Error("Session expired. Please sign in again.");
            }
        }
    }

    if (!response.ok) {
        throw new Error(`${errorPrefix}: ${data.message ?? "Unknown error"}`);
    }

    return data as T;
}
