import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

vi.mock("@/services/projects/projects.service", () => ({
    projectsService: { listProjects: vi.fn() },
}));

vi.mock("@/services/student/student.service", () => ({
    studentService: { listMyApplications: vi.fn() },
}));

import { useAuth } from "@/hooks/useAuth";
import { projectsService } from "@/services/projects/projects.service";
import { studentService } from "@/services/student/student.service";
import DashboardContainer from "@/features/dashboard/components/DashboardContainer";
import {
    ProjectApplicationOutput,
    ProjectOutput,
} from "@/services/projects/projects.dto";

const useAuthMock = vi.mocked(useAuth);
const listProjectsMock = vi.mocked(projectsService.listProjects);
const listMyApplicationsMock = vi.mocked(studentService.listMyApplications);

function makeProject(overrides: Partial<ProjectOutput> = {}): ProjectOutput {
    return {
        id: "proj-1",
        title: "Quantum",
        description: "physics",
        slots: 2,
        status: "open",
        professor_id: "p-1",
        professor: {
            user_id: "p-1",
            name: "Dr. Smith",
            email: "p@u",
            university: "U",
            department: "Physics",
        },
        ...overrides,
    };
}

function makeApplication(
    overrides: Partial<ProjectApplicationOutput> = {},
): ProjectApplicationOutput {
    return {
        id: "app-1",
        status: "pending",
        message: "please",
        project: { title: "Quantum", description: "physics", status: "open" },
        student: {
            user_id: "u-1",
            student_id: "s-1",
            name: "Alice",
            email: "a@u",
            university: "U",
            department: "D",
            research_interests: "",
        },
        ...overrides,
    };
}

function signedInAs(role: "student" | "professor" | "admin", accessToken: string | null = "tok") {
    useAuthMock.mockReturnValue({
        isAuthenticated: !!accessToken,
        accessToken,
        refreshToken: accessToken ? "ref" : null,
        role,
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
    });
}

describe("DashboardContainer", () => {
    beforeEach(() => {
        useAuthMock.mockReset();
        listProjectsMock.mockReset();
        listMyApplicationsMock.mockReset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("loads projects (only) for professors and renders their titles", async () => {
        signedInAs("professor");
        listProjectsMock.mockResolvedValue({
            projects: [
                makeProject({ id: "p-1", title: "Alpha" }),
                makeProject({ id: "p-2", title: "Beta" }),
            ],
        });

        render(<DashboardContainer />);

        expect(await screen.findByText("Alpha")).toBeInTheDocument();
        expect(screen.getByText("Beta")).toBeInTheDocument();
        expect(listProjectsMock).toHaveBeenCalledWith("tok");
        expect(listMyApplicationsMock).not.toHaveBeenCalled();
    });

    it("loads projects AND applications for students", async () => {
        signedInAs("student");
        listProjectsMock.mockResolvedValue({
            projects: [makeProject({ id: "p-1", title: "Alpha" })],
        });
        listMyApplicationsMock.mockResolvedValue({
            applications: [
                makeApplication({
                    id: "app-1",
                    project: {
                        title: "Alpha",
                        description: "physics",
                        status: "open",
                    },
                }),
            ],
        });

        render(<DashboardContainer />);

        // Project title shows in both the projects grid and the applications list,
        // so just assert both service calls fired.
        await waitFor(() => {
            expect(listProjectsMock).toHaveBeenCalledWith("tok");
            expect(listMyApplicationsMock).toHaveBeenCalledWith("tok");
        });
        expect(await screen.findByText(/my applications/i)).toBeInTheDocument();
    });

    it("shows the 'no projects yet' empty state when the projects list is empty", async () => {
        signedInAs("professor");
        listProjectsMock.mockResolvedValue({ projects: [] });

        render(<DashboardContainer />);

        expect(await screen.findByText(/no projects yet/i)).toBeInTheDocument();
    });

    it("surfaces a service error and skips the rest of the dashboard", async () => {
        signedInAs("professor");
        listProjectsMock.mockRejectedValue(new Error("server boom"));

        render(<DashboardContainer />);

        expect(await screen.findByText("server boom")).toBeInTheDocument();
        expect(screen.queryByText(/recent projects/i)).not.toBeInTheDocument();
    });

    it("falls back to 'Failed to load dashboard' for non-Error rejections", async () => {
        signedInAs("student");
        listProjectsMock.mockRejectedValue("weird");
        listMyApplicationsMock.mockResolvedValue({ applications: [] });

        render(<DashboardContainer />);

        expect(
            await screen.findByText(/failed to load dashboard/i),
        ).toBeInTheDocument();
    });

    it("renders 'You are not signed in' when there is no access token", async () => {
        signedInAs("student", null);

        render(<DashboardContainer />);

        expect(
            await screen.findByText(/you are not signed in/i),
        ).toBeInTheDocument();
        expect(listProjectsMock).not.toHaveBeenCalled();
    });

    it("does not fetch while auth is still loading", async () => {
        useAuthMock.mockReturnValue({
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            role: "student",
            loading: true,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(<DashboardContainer />);

        await waitFor(() => {
            expect(listProjectsMock).not.toHaveBeenCalled();
            expect(listMyApplicationsMock).not.toHaveBeenCalled();
        });
    });
});
