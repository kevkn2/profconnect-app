// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_URL } from "@/config/settings";
import { professorService } from "@/services/professor/professor.service";

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

function mockEmptyResponse(status = 204) {
    return {
        ok: status < 400,
        status,
        json: async () => {
            throw new Error("no body");
        },
    } as unknown as Response;
}

describe("professorService — invitations", () => {
    let fetchMock: FetchMock;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("listProjectInvitations", () => {
        it("GETs the project invitations endpoint with bearer token and returns the body", async () => {
            const body = {
                invitations: [
                    {
                        id: "inv-1",
                        status: "pending",
                        message: "hi",
                        project: { title: "P", description: "", status: "open" },
                        student: {
                            user_id: "u-1",
                            student_id: "s-1",
                            name: "Alice",
                            email: "a@e",
                            university: "U",
                            department: "D",
                            research_interests: "",
                        },
                        responded_at: "",
                    },
                ],
            };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(body));

            const result = await professorService.listProjectInvitations("proj-1", TOKEN);

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/professor/projects/proj-1/invitations`);
            expect(init.method ?? "GET").toBe("GET");
            expect(init.headers).toMatchObject({
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`,
            });
            expect(result).toEqual(body);
        });

        it("throws with the prefixed message when the API returns non-OK", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "forbidden" }, { status: 403 }),
            );

            await expect(
                professorService.listProjectInvitations("proj-1", TOKEN),
            ).rejects.toThrow("Failed to load invitations: forbidden");
        });

        it("falls back to 'Unknown error' when the error body has no message", async () => {
            fetchMock.mockResolvedValueOnce(mockJsonResponse({}, { status: 500 }));

            await expect(
                professorService.listProjectInvitations("proj-1", TOKEN),
            ).rejects.toThrow("Failed to load invitations: Unknown error");
        });
    });

    describe("sendInvitation", () => {
        it("POSTs the student_id + message body and returns the created invitation", async () => {
            const created = {
                id: "inv-9",
                status: "pending",
                message: "join",
                project: { title: "P", description: "", status: "open" },
                student: {
                    user_id: "u-9",
                    student_id: "s-9",
                    name: "Bob",
                    email: "b@e",
                    university: "",
                    department: "",
                    research_interests: "",
                },
                responded_at: "",
            };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(created, { status: 201 }));

            const result = await professorService.sendInvitation(
                "proj-1",
                { student_id: "s-9", message: "join" },
                TOKEN,
            );

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/professor/projects/proj-1/invitations`);
            expect(init.method).toBe("POST");
            expect(init.body).toBe(JSON.stringify({ student_id: "s-9", message: "join" }));
            expect(init.headers).toMatchObject({
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`,
            });
            expect(result).toEqual(created);
        });

        it("surfaces API validation errors via the thrown message", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse(
                    { message: "student already invited" },
                    { status: 422 },
                ),
            );

            await expect(
                professorService.sendInvitation(
                    "proj-1",
                    { student_id: "s-9", message: "" },
                    TOKEN,
                ),
            ).rejects.toThrow("Failed to send invitation: student already invited");
        });
    });

    describe("cancelInvitation", () => {
        it("DELETEs the invitation and tolerates an empty body", async () => {
            fetchMock.mockResolvedValueOnce(mockEmptyResponse(204));

            await expect(
                professorService.cancelInvitation("proj-1", "inv-9", TOKEN),
            ).resolves.toBeUndefined();

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/professor/projects/proj-1/invitations/inv-9`);
            expect(init.method).toBe("DELETE");
            expect(init.headers).toMatchObject({
                Authorization: `Bearer ${TOKEN}`,
            });
        });

        it("throws when the cancel call fails", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "not pending" }, { status: 409 }),
            );

            await expect(
                professorService.cancelInvitation("proj-1", "inv-9", TOKEN),
            ).rejects.toThrow("Failed to cancel invitation: not pending");
        });
    });

    describe("listStudents", () => {
        it("GETs the professor students directory and returns the students array", async () => {
            const body = {
                students: [
                    {
                        user_id: "u-1",
                        student_id: "s-1",
                        name: "Alice",
                        email: "a@e",
                        university: "U",
                        department: "D",
                        research_interests: "",
                    },
                ],
            };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(body));

            const result = await professorService.listStudents(TOKEN);

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/professor/students`);
            expect(init.method ?? "GET").toBe("GET");
            expect(result).toEqual(body);
        });

        it("throws when the directory call is unauthorized", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "unauthorized" }, { status: 401 }),
            );

            await expect(professorService.listStudents(TOKEN)).rejects.toThrow(
                "Failed to load students: unauthorized",
            );
        });
    });
});

describe("professorService — profile, projects & applications", () => {
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
        it("GETs /api/professor/profile with the bearer token", async () => {
            const body = {
                id: "p-1",
                user_id: "u-1",
                email: "p@u",
                name: "Dr. Smith",
                role: "professor",
                university: "U",
                department: "Physics",
            };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(body));

            const result = await professorService.getProfile(TOKEN);

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/professor/profile`);
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

            await expect(professorService.getProfile(TOKEN)).rejects.toThrow(
                "Failed to load profile: unauthorized",
            );
        });
    });

    describe("createProject", () => {
        it("POSTs /api/professor/projects with the project body", async () => {
            const created = {
                id: "proj-9",
                title: "New",
                description: "d",
                slots: 2,
                status: "open",
                professor_id: "p-1",
                professor: {
                    user_id: "p-1",
                    name: "Dr. Smith",
                    email: "p@u",
                    university: "U",
                    department: "P",
                },
            };
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse(created, { status: 201 }),
            );

            const result = await professorService.createProject(
                { title: "New", description: "d", slots: 2 },
                TOKEN,
            );

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/professor/projects`);
            expect(init.method).toBe("POST");
            expect(JSON.parse(init.body)).toEqual({
                title: "New",
                description: "d",
                slots: 2,
            });
            expect(result).toEqual(created);
        });

        it("surfaces validation errors from the API", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse(
                    { message: "title is required" },
                    { status: 422 },
                ),
            );

            await expect(
                professorService.createProject(
                    { title: "", description: "", slots: 0 },
                    TOKEN,
                ),
            ).rejects.toThrow("Failed to create project: title is required");
        });
    });

    describe("listProjectApplications", () => {
        it("GETs /api/professor/projects/:id/applications and returns pending + approved buckets", async () => {
            const body = {
                pending_applications: [],
                approved_applications: [],
            };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(body));

            const result = await professorService.listProjectApplications(
                "proj-1",
                TOKEN,
            );

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(
                `${API_URL}/api/professor/projects/proj-1/applications`,
            );
            expect(init.method ?? "GET").toBe("GET");
            expect(result).toEqual(body);
        });

        it("throws 'Failed to load applications: ...' on error", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "forbidden" }, { status: 403 }),
            );

            await expect(
                professorService.listProjectApplications("proj-1", TOKEN),
            ).rejects.toThrow("Failed to load applications: forbidden");
        });
    });

    describe("reviewApplication", () => {
        it("PATCHes /api/professor/projects/:id/applications/:appId with the new status", async () => {
            const updated = {
                id: "app-1",
                status: "approved",
                message: "looks good",
                project: { title: "P", description: "", status: "open" },
                student: {
                    user_id: "u-1",
                    student_id: "s-1",
                    name: "Alice",
                    email: "a@u",
                    university: "U",
                    department: "D",
                    research_interests: "",
                },
            };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(updated));

            const result = await professorService.reviewApplication(
                "proj-1",
                "app-1",
                { status: "approved" },
                TOKEN,
            );

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(
                `${API_URL}/api/professor/projects/proj-1/applications/app-1`,
            );
            expect(init.method).toBe("PATCH");
            expect(init.body).toBe(JSON.stringify({ status: "approved" }));
            expect(result).toEqual(updated);
        });

        it("sends 'rejected' on reject and surfaces backend errors", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse(
                    { message: "already reviewed" },
                    { status: 409 },
                ),
            );

            await expect(
                professorService.reviewApplication(
                    "proj-1",
                    "app-1",
                    { status: "rejected" },
                    TOKEN,
                ),
            ).rejects.toThrow("Failed to review application: already reviewed");

            const [, init] = fetchMock.mock.calls[0];
            expect(init.body).toBe(JSON.stringify({ status: "rejected" }));
        });
    });
});
