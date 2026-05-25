// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_URL } from "@/config/settings";
import { authService } from "@/services/auth/auth.service";

type FetchMock = ReturnType<typeof vi.fn>;

function mockJsonResponse(body: unknown, init?: { status?: number }) {
    const status = init?.status ?? 200;
    return {
        ok: status < 400,
        status,
        json: async () => body,
    } as unknown as Response;
}

describe("authService", () => {
    let fetchMock: FetchMock;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("login", () => {
        it("POSTs to /api/auth/login and returns the token payload", async () => {
            const body = {
                accessToken: "a",
                refreshToken: "r",
                role: "student",
                type: "Bearer",
            };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(body));

            const result = await authService.login({
                email: "me@x",
                password: "pw",
            });

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/auth/login`);
            expect(init.method).toBe("POST");
            expect(init.headers).toMatchObject({
                "Content-Type": "application/json",
            });
            expect(init.body).toBe(
                JSON.stringify({ email: "me@x", password: "pw" }),
            );
            expect(result).toEqual(body);
        });

        it("throws 'Login failed: <message>' on non-OK responses", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "invalid credentials" }, { status: 401 }),
            );

            await expect(
                authService.login({ email: "x", password: "y" }),
            ).rejects.toThrow("Login failed: invalid credentials");
        });

        it("falls back to 'Unknown error' when no message is returned", async () => {
            fetchMock.mockResolvedValueOnce(mockJsonResponse({}, { status: 500 }));

            await expect(
                authService.login({ email: "x", password: "y" }),
            ).rejects.toThrow("Login failed: Unknown error");
        });
    });

    describe("register (admin)", () => {
        it("POSTs to /register/admin and injects role: 'admin'", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "ok", user_id: "u-1" }, { status: 201 }),
            );

            await authService.register({
                email: "admin@x",
                name: "Admin",
                password: "pw",
            });

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/auth/register/admin`);
            expect(JSON.parse(init.body)).toEqual({
                email: "admin@x",
                name: "Admin",
                password: "pw",
                role: "admin",
            });
        });

        it("throws 'Registration failed: ...' on error", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "email taken" }, { status: 409 }),
            );

            await expect(
                authService.register({ email: "x", name: "n", password: "p" }),
            ).rejects.toThrow("Registration failed: email taken");
        });
    });

    describe("registerStudent", () => {
        it("POSTs to /register/student with role: 'student' and student fields", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "ok", user_id: "u-2" }, { status: 201 }),
            );

            await authService.registerStudent({
                email: "s@x",
                name: "S",
                password: "pw",
                university: "U",
                department: "D",
                research_interests: "AI",
            });

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/auth/register/student`);
            expect(JSON.parse(init.body)).toEqual({
                email: "s@x",
                name: "S",
                password: "pw",
                role: "student",
                university: "U",
                department: "D",
                research_interests: "AI",
            });
        });
    });

    describe("registerProfessor", () => {
        it("POSTs to /register/professor with role: 'professor' and professor fields", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "ok", user_id: "u-3" }, { status: 201 }),
            );

            await authService.registerProfessor({
                email: "p@x",
                name: "P",
                password: "pw",
                university: "U",
                department: "Physics",
            });

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/auth/register/professor`);
            expect(JSON.parse(init.body)).toEqual({
                email: "p@x",
                name: "P",
                password: "pw",
                role: "professor",
                university: "U",
                department: "Physics",
            });
        });

        it("throws 'Registration failed: ...' on error", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "weak password" }, { status: 422 }),
            );

            await expect(
                authService.registerProfessor({
                    email: "p@x",
                    name: "P",
                    password: "short",
                    university: "U",
                    department: "D",
                }),
            ).rejects.toThrow("Registration failed: weak password");
        });
    });
});
