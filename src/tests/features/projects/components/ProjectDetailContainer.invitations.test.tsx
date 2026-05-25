import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

vi.mock("@/services/projects/projects.service", () => ({
    projectsService: {
        getProject: vi.fn(),
    },
}));

vi.mock("@/services/professor/professor.service", () => ({
    professorService: {
        listProjectApplications: vi.fn(),
        reviewApplication: vi.fn(),
        listProjectInvitations: vi.fn(),
        sendInvitation: vi.fn(),
        cancelInvitation: vi.fn(),
        listStudents: vi.fn(),
    },
}));

vi.mock("@/services/student/student.service", () => ({
    studentService: {
        checkApplicationStatus: vi.fn(),
        applyToProject: vi.fn(),
    },
}));

import { useAuth } from "@/hooks/useAuth";
import { projectsService } from "@/services/projects/projects.service";
import { professorService } from "@/services/professor/professor.service";
import { studentService } from "@/services/student/student.service";
import ProjectDetailContainer from "@/features/projects/components/ProjectDetailContainer";
import {
    ProjectInvitationOutput,
    ProjectOutput,
    ProjectStudentBrief,
} from "@/services/projects/projects.dto";

const useAuthMock = vi.mocked(useAuth);
const getProjectMock = vi.mocked(projectsService.getProject);
const listProjectApplicationsMock = vi.mocked(professorService.listProjectApplications);
const listProjectInvitationsMock = vi.mocked(professorService.listProjectInvitations);
const sendInvitationMock = vi.mocked(professorService.sendInvitation);
const cancelInvitationMock = vi.mocked(professorService.cancelInvitation);
const listStudentsMock = vi.mocked(professorService.listStudents);
const checkApplicationStatusMock = vi.mocked(studentService.checkApplicationStatus);

function makeProject(overrides: Partial<ProjectOutput> = {}): ProjectOutput {
    return {
        id: "proj-1",
        title: "Quantum",
        description: "physics",
        slots: 3,
        status: "open",
        professor_id: "p-1",
        professor: {
            user_id: "p-1",
            name: "Dr. Smith",
            email: "smith@u.edu",
            university: "U",
            department: "Physics",
        },
        ...overrides,
    };
}

function makeStudent(overrides: Partial<ProjectStudentBrief> = {}): ProjectStudentBrief {
    return {
        user_id: "u-1",
        student_id: "s-1",
        name: "Alice",
        email: "alice@u.edu",
        university: "U",
        department: "D",
        research_interests: "",
        ...overrides,
    };
}

function makeInvitation(
    overrides: Partial<ProjectInvitationOutput> = {},
): ProjectInvitationOutput {
    return {
        id: "inv-1",
        status: "pending",
        message: "",
        project: { title: "Quantum", description: "physics", status: "open" },
        student: makeStudent(),
        responded_at: "",
        ...overrides,
    };
}

function signedInAsProfessor() {
    useAuthMock.mockReturnValue({
        isAuthenticated: true,
        accessToken: "tok",
        refreshToken: "ref",
        role: "professor",
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
    });
}

describe("ProjectDetailContainer — invitation slice", () => {
    beforeEach(() => {
        useAuthMock.mockReset();
        getProjectMock.mockReset();
        listProjectApplicationsMock.mockReset();
        listProjectInvitationsMock.mockReset();
        sendInvitationMock.mockReset();
        cancelInvitationMock.mockReset();
        listStudentsMock.mockReset();
        checkApplicationStatusMock.mockReset();

        // Sensible defaults for the non-invitation calls so the page renders
        getProjectMock.mockResolvedValue(makeProject());
        listProjectApplicationsMock.mockResolvedValue({
            pending_applications: [],
            approved_applications: [],
        });
        checkApplicationStatusMock.mockResolvedValue({ exists: false });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("loads students and invitations for the project on mount (professor view)", async () => {
        signedInAsProfessor();
        listStudentsMock.mockResolvedValue({ students: [makeStudent()] });
        listProjectInvitationsMock.mockResolvedValue({ invitations: [] });

        render(<ProjectDetailContainer projectId="proj-1" />);

        await waitFor(() => {
            expect(listStudentsMock).toHaveBeenCalledWith("tok");
            expect(listProjectInvitationsMock).toHaveBeenCalledWith("proj-1", "tok");
        });

        expect(await screen.findByText(/no invitations sent yet/i)).toBeInTheDocument();
    });

    it("sends an invitation with student_id + message and prepends it to the list", async () => {
        const user = userEvent.setup();
        signedInAsProfessor();
        listStudentsMock.mockResolvedValue({
            students: [
                makeStudent({ student_id: "s-1", name: "Alice" }),
                makeStudent({
                    student_id: "s-2",
                    name: "Bob",
                    email: "bob@u.edu",
                }),
            ],
        });
        listProjectInvitationsMock.mockResolvedValue({ invitations: [] });
        sendInvitationMock.mockResolvedValue(
            makeInvitation({
                id: "inv-new",
                status: "pending",
                student: makeStudent({ student_id: "s-2", name: "Bob" }),
            }),
        );

        render(<ProjectDetailContainer projectId="proj-1" />);

        const select = (await screen.findByLabelText(/student/i)) as HTMLSelectElement;
        await user.selectOptions(select, "s-2");
        await user.click(screen.getByRole("button", { name: /send invitation/i }));

        await waitFor(() => {
            expect(sendInvitationMock).toHaveBeenCalledWith(
                "proj-1",
                { student_id: "s-2", message: "" },
                "tok",
            );
        });

        // The new invite shows up in the Sent list
        await waitFor(() => {
            expect(
                screen.queryByText(/no invitations sent yet/i),
            ).not.toBeInTheDocument();
        });
        expect(screen.getAllByText(/bob/i).length).toBeGreaterThan(0);
    });

    it("surfaces send errors and does NOT add the row", async () => {
        const user = userEvent.setup();
        signedInAsProfessor();
        listStudentsMock.mockResolvedValue({
            students: [makeStudent({ student_id: "s-1", name: "Alice" })],
        });
        listProjectInvitationsMock.mockResolvedValue({ invitations: [] });
        sendInvitationMock.mockRejectedValue(new Error("already invited"));

        render(<ProjectDetailContainer projectId="proj-1" />);

        const select = (await screen.findByLabelText(/student/i)) as HTMLSelectElement;
        await user.selectOptions(select, "s-1");
        await user.click(screen.getByRole("button", { name: /send invitation/i }));

        expect(await screen.findByText("already invited")).toBeInTheDocument();
        expect(screen.getByText(/no invitations sent yet/i)).toBeInTheDocument();
    });

    it("cancels an invitation and removes it from the list", async () => {
        const user = userEvent.setup();
        signedInAsProfessor();
        listStudentsMock.mockResolvedValue({ students: [] });
        listProjectInvitationsMock.mockResolvedValue({
            invitations: [
                makeInvitation({
                    id: "inv-1",
                    status: "pending",
                    student: makeStudent({ name: "Alice" }),
                }),
            ],
        });
        cancelInvitationMock.mockResolvedValue(undefined);

        render(<ProjectDetailContainer projectId="proj-1" />);

        await user.click(await screen.findByRole("button", { name: /^cancel$/i }));

        await waitFor(() => {
            expect(cancelInvitationMock).toHaveBeenCalledWith(
                "proj-1",
                "inv-1",
                "tok",
            );
        });

        await waitFor(() => {
            expect(
                screen.queryByRole("button", { name: /^cancel$/i }),
            ).not.toBeInTheDocument();
        });
        expect(screen.getByText(/no invitations sent yet/i)).toBeInTheDocument();
    });

    it("surfaces cancel errors without removing the row", async () => {
        const user = userEvent.setup();
        signedInAsProfessor();
        listStudentsMock.mockResolvedValue({ students: [] });
        listProjectInvitationsMock.mockResolvedValue({
            invitations: [makeInvitation({ id: "inv-1", status: "pending" })],
        });
        cancelInvitationMock.mockRejectedValue(new Error("server down"));

        render(<ProjectDetailContainer projectId="proj-1" />);

        await user.click(await screen.findByRole("button", { name: /^cancel$/i }));

        expect(await screen.findByText("server down")).toBeInTheDocument();
        // Row is still there
        expect(screen.getByRole("button", { name: /^cancel$/i })).toBeInTheDocument();
    });

    it("does not call invitation endpoints when the viewer is a student", async () => {
        useAuthMock.mockReturnValue({
            isAuthenticated: true,
            accessToken: "tok",
            refreshToken: "ref",
            role: "student",
            loading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(<ProjectDetailContainer projectId="proj-1" />);

        // Wait for the project load to settle
        await screen.findByText("Quantum");

        expect(listStudentsMock).not.toHaveBeenCalled();
        expect(listProjectInvitationsMock).not.toHaveBeenCalled();
    });
});
