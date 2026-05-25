import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

vi.mock("@/services/student/student.service", () => ({
    studentService: { getProfile: vi.fn() },
}));

vi.mock("@/services/professor/professor.service", () => ({
    professorService: { getProfile: vi.fn() },
}));

import { useAuth } from "@/hooks/useAuth";
import { studentService } from "@/services/student/student.service";
import { professorService } from "@/services/professor/professor.service";
import ProfileContainer from "@/features/profile/components/ProfileContainer";

const useAuthMock = vi.mocked(useAuth);
const studentGetProfileMock = vi.mocked(studentService.getProfile);
const professorGetProfileMock = vi.mocked(professorService.getProfile);

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

describe("ProfileContainer", () => {
    beforeEach(() => {
        useAuthMock.mockReset();
        studentGetProfileMock.mockReset();
        professorGetProfileMock.mockReset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("fetches the student profile and renders it for student role", async () => {
        signedInAs("student");
        studentGetProfileMock.mockResolvedValue({
            id: "s-1",
            user_id: "u-1",
            email: "alice@u.edu",
            name: "Alice",
            role: "student",
            university: "MIT",
            department: "CS",
            research_interests: "AI",
        });

        render(<ProfileContainer />);

        expect(await screen.findByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("alice@u.edu")).toBeInTheDocument();
        expect(screen.getByText("AI")).toBeInTheDocument();
        expect(studentGetProfileMock).toHaveBeenCalledWith("tok");
        expect(professorGetProfileMock).not.toHaveBeenCalled();
    });

    it("fetches the professor profile and renders it for professor role", async () => {
        signedInAs("professor");
        professorGetProfileMock.mockResolvedValue({
            id: "p-1",
            user_id: "u-2",
            email: "smith@u.edu",
            name: "Dr. Smith",
            role: "professor",
            university: "Stanford",
            department: "Physics",
        });

        render(<ProfileContainer />);

        expect(await screen.findByText("Dr. Smith")).toBeInTheDocument();
        expect(screen.getByText("Stanford")).toBeInTheDocument();
        expect(professorGetProfileMock).toHaveBeenCalledWith("tok");
        expect(studentGetProfileMock).not.toHaveBeenCalled();
    });

    it("renders 'Unsupported role' when the role isn't student/professor", async () => {
        signedInAs("admin");

        render(<ProfileContainer />);

        expect(await screen.findByText(/unsupported role/i)).toBeInTheDocument();
        expect(studentGetProfileMock).not.toHaveBeenCalled();
        expect(professorGetProfileMock).not.toHaveBeenCalled();
    });

    it("surfaces fetch errors instead of crashing", async () => {
        signedInAs("student");
        studentGetProfileMock.mockRejectedValue(new Error("network down"));

        render(<ProfileContainer />);

        expect(await screen.findByText("network down")).toBeInTheDocument();
    });

    it("falls back to 'Failed to load profile' for non-Error rejections", async () => {
        signedInAs("professor");
        professorGetProfileMock.mockRejectedValue("weird");

        render(<ProfileContainer />);

        expect(
            await screen.findByText(/failed to load profile/i),
        ).toBeInTheDocument();
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

        render(<ProfileContainer />);

        // Allow effects to flush — no service call should fire
        await waitFor(() => {
            expect(studentGetProfileMock).not.toHaveBeenCalled();
            expect(professorGetProfileMock).not.toHaveBeenCalled();
        });
    });

    it("renders 'You are not signed in' when no access token is available", async () => {
        signedInAs("student", null);

        render(<ProfileContainer />);

        expect(await screen.findByText(/you are not signed in/i)).toBeInTheDocument();
        expect(studentGetProfileMock).not.toHaveBeenCalled();
    });
});
