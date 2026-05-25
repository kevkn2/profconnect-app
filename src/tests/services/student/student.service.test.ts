// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_URL } from "@/config/settings";
import { studentService } from "@/services/student/student.service";

const TOKEN = "test-token";

type FetchMock = ReturnType<typeof vi.fn>;

function mockJsonResponse(body: unknown, init?: { status?: number; ok?: boolean }) {
    const status = init?.status ?? 200;
    return {
        ok: init?.ok ?? status < 400,
        status,
        json: async () => body,
    } as unknown as Response;
}

describe("studentService — invitations", () => {
    let fetchMock: FetchMock;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("listMyInvitations", () => {
        it("GETs the student invitations endpoint with bearer token", async () => {
            const body = {
                invitations: [
                    {
                        id: "inv-1",
                        status: "pending",
                        message: "join",
                        project: { title: "P", description: "", status: "open" },
                        student: {
                            user_id: "u-1",
                            student_id: "s-1",
                            name: "Me",
                            email: "me@e",
                            university: "",
                            department: "",
                            research_interests: "",
                        },
                        responded_at: "",
                    },
                ],
            };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(body));

            const result = await studentService.listMyInvitations(TOKEN);

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/student/invitations`);
            expect(init.method ?? "GET").toBe("GET");
            expect(init.headers).toMatchObject({
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`,
            });
            expect(result).toEqual(body);
        });

        it("throws when the API returns an error", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "unauthorized" }, { status: 401 }),
            );

            await expect(studentService.listMyInvitations(TOKEN)).rejects.toThrow(
                "Failed to load invitations: unauthorized",
            );
        });

        it("tolerates an unparseable error body and falls back to 'Unknown error'", async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => {
                    throw new Error("not json");
                },
            } as unknown as Response);

            await expect(studentService.listMyInvitations(TOKEN)).rejects.toThrow(
                "Failed to load invitations: Unknown error",
            );
        });
    });

    describe("respondInvitation", () => {
        it("PATCHes the invitation with the chosen status and returns the updated record", async () => {
            const updated = {
                id: "inv-1",
                status: "accepted",
                message: "join",
                project: { title: "P", description: "", status: "open" },
                student: {
                    user_id: "u-1",
                    student_id: "s-1",
                    name: "Me",
                    email: "me@e",
                    university: "",
                    department: "",
                    research_interests: "",
                },
                responded_at: "2026-05-24T00:00:00Z",
            };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(updated));

            const result = await studentService.respondInvitation(
                "inv-1",
                { status: "accepted" },
                TOKEN,
            );

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/student/invitations/inv-1`);
            expect(init.method).toBe("PATCH");
            expect(init.body).toBe(JSON.stringify({ status: "accepted" }));
            expect(init.headers).toMatchObject({
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`,
            });
            expect(result).toEqual(updated);
        });

        it("sends 'declined' when declining and surfaces backend errors", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "already responded" }, { status: 409 }),
            );

            await expect(
                studentService.respondInvitation("inv-1", { status: "declined" }, TOKEN),
            ).rejects.toThrow("Failed to respond to invitation: already responded");

            const [, init] = fetchMock.mock.calls[0];
            expect(init.body).toBe(JSON.stringify({ status: "declined" }));
        });
    });
});

describe("studentService — profile & applications", () => {
    let fetchMock: FetchMock;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("getProfile", () => {
        it("GETs /api/student/profile with the bearer token", async () => {
            const body = {
                id: "s-1",
                user_id: "u-1",
                email: "s@u",
                name: "Alice",
                role: "student",
                university: "U",
                department: "D",
                research_interests: "AI",
            };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(body));

            const result = await studentService.getProfile(TOKEN);

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/student/profile`);
            expect(init.method ?? "GET").toBe("GET");
            expect(init.headers).toMatchObject({
                Authorization: `Bearer ${TOKEN}`,
            });
            expect(result).toEqual(body);
        });

        it("throws 'Failed to load profile: ...' on error", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "unauthorized" }, { status: 401 }),
            );

            await expect(studentService.getProfile(TOKEN)).rejects.toThrow(
                "Failed to load profile: unauthorized",
            );
        });
    });

    describe("applyToProject", () => {
        it("POSTs /api/student/projects/:id/applications with the message body", async () => {
            const created = {
                id: "app-9",
                status: "pending",
                message: "please pick me",
                project: { title: "P", description: "", status: "open" },
                student: {
                    user_id: "u-1",
                    student_id: "s-1",
                    name: "Alice",
                    email: "a@u",
                    university: "",
                    department: "",
                    research_interests: "",
                },
            };
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse(created, { status: 201 }),
            );

            const result = await studentService.applyToProject(
                "proj-1",
                { message: "please pick me" },
                TOKEN,
            );

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(
                `${API_URL}/api/student/projects/proj-1/applications`,
            );
            expect(init.method).toBe("POST");
            expect(init.body).toBe(
                JSON.stringify({ message: "please pick me" }),
            );
            expect(result).toEqual(created);
        });

        it("throws 'Failed to submit application: ...' on validation error", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse(
                    { message: "already applied" },
                    { status: 409 },
                ),
            );

            await expect(
                studentService.applyToProject(
                    "proj-1",
                    { message: "hi" },
                    TOKEN,
                ),
            ).rejects.toThrow("Failed to submit application: already applied");
        });
    });

    describe("withdrawApplication", () => {
        it("DELETEs /api/student/projects/:id/applications/:appId and tolerates an empty body", async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                status: 204,
                json: async () => {
                    throw new Error("no body");
                },
            } as unknown as Response);

            await expect(
                studentService.withdrawApplication("proj-1", "app-9", TOKEN),
            ).resolves.toBeUndefined();

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(
                `${API_URL}/api/student/projects/proj-1/applications/app-9`,
            );
            expect(init.method).toBe("DELETE");
        });

        it("throws 'Failed to withdraw application: ...' on error", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse(
                    { message: "already approved" },
                    { status: 409 },
                ),
            );

            await expect(
                studentService.withdrawApplication("proj-1", "app-9", TOKEN),
            ).rejects.toThrow(
                "Failed to withdraw application: already approved",
            );
        });
    });

    describe("listMyApplications", () => {
        it("GETs /api/student/applications and returns the body", async () => {
            const body = { applications: [] };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(body));

            const result = await studentService.listMyApplications(TOKEN);

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/student/applications`);
            expect(init.method ?? "GET").toBe("GET");
            expect(result).toEqual(body);
        });

        it("throws 'Failed to load applications: ...' on error", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "boom" }, { status: 500 }),
            );

            await expect(
                studentService.listMyApplications(TOKEN),
            ).rejects.toThrow("Failed to load applications: boom");
        });
    });

    describe("checkApplicationStatus", () => {
        it("GETs /api/student/projects/:id/applications and returns { exists }", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ exists: true }),
            );

            const result = await studentService.checkApplicationStatus(
                "proj-1",
                TOKEN,
            );

            const [url] = fetchMock.mock.calls[0];
            expect(url).toBe(
                `${API_URL}/api/student/projects/proj-1/applications`,
            );
            expect(result).toEqual({ exists: true });
        });

        it("throws 'Failed to load applications: ...' on error", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "boom" }, { status: 500 }),
            );

            await expect(
                studentService.checkApplicationStatus("proj-1", TOKEN),
            ).rejects.toThrow("Failed to load applications: boom");
        });
    });
});
