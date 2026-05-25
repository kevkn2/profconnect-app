// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_URL } from "@/config/settings";
import { projectsService } from "@/services/projects/projects.service";

const TOKEN = "test-token";

type FetchMock = ReturnType<typeof vi.fn>;

function mockJsonResponse(body: unknown, init?: { status?: number }) {
    const status = init?.status ?? 200;
    return {
        ok: status < 400,
        status,
        json: async () => body,
    } as unknown as Response;
}

describe("projectsService", () => {
    let fetchMock: FetchMock;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("listProjects", () => {
        it("GETs /api/projects with the bearer token and returns the body", async () => {
            const body = { projects: [] };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(body));

            const result = await projectsService.listProjects(TOKEN);

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/projects`);
            expect(init.method).toBe("GET");
            expect(init.headers).toMatchObject({
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`,
            });
            expect(result).toEqual(body);
        });

        it("throws 'Failed to load projects: ...' on error", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "boom" }, { status: 500 }),
            );

            await expect(projectsService.listProjects(TOKEN)).rejects.toThrow(
                "Failed to load projects: boom",
            );
        });
    });

    describe("getProject", () => {
        it("GETs /api/projects/:id with the bearer token", async () => {
            const body = { id: "proj-1", title: "P" };
            fetchMock.mockResolvedValueOnce(mockJsonResponse(body));

            const result = await projectsService.getProject("proj-1", TOKEN);

            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`${API_URL}/api/projects/proj-1`);
            expect(init.method).toBe("GET");
            expect(init.headers).toMatchObject({
                Authorization: `Bearer ${TOKEN}`,
            });
            expect(result).toEqual(body);
        });

        it("throws 'Failed to load project: ...' on a 404", async () => {
            fetchMock.mockResolvedValueOnce(
                mockJsonResponse({ message: "not found" }, { status: 404 }),
            );

            await expect(projectsService.getProject("missing", TOKEN)).rejects.toThrow(
                "Failed to load project: not found",
            );
        });
    });
});
