import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

vi.mock("@/services/student/student.service", () => ({
    studentService: {
        listMyInvitations: vi.fn(),
        respondInvitation: vi.fn(),
    },
}));

import { useAuth } from "@/hooks/useAuth";
import { studentService } from "@/services/student/student.service";
import MyInvitationsContainer from "@/features/projects/components/MyInvitationsContainer";
import { ProjectInvitationOutput } from "@/services/projects/projects.dto";

const useAuthMock = vi.mocked(useAuth);
const listMyInvitationsMock = vi.mocked(studentService.listMyInvitations);
const respondInvitationMock = vi.mocked(studentService.respondInvitation);

function makeInvitation(
    overrides: Partial<ProjectInvitationOutput> = {},
): ProjectInvitationOutput {
    return {
        id: "inv-1",
        status: "pending",
        message: "Please join",
        project: {
            title: "Quantum Project",
            description: "Cool stuff",
            status: "open",
        },
        student: {
            user_id: "u-1",
            student_id: "s-1",
            name: "Me",
            email: "me@example.edu",
            university: "U",
            department: "D",
            research_interests: "",
        },
        responded_at: "",
        ...overrides,
    };
}

function signedIn() {
    useAuthMock.mockReturnValue({
        isAuthenticated: true,
        accessToken: "tok",
        refreshToken: "ref",
        role: "student",
        loading: false,
        login: vi.fn(),
        logout: vi.fn(),
    });
}

describe("MyInvitationsContainer", () => {
    beforeEach(() => {
        listMyInvitationsMock.mockReset();
        respondInvitationMock.mockReset();
        useAuthMock.mockReset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("fetches invitations with the access token and renders them", async () => {
        signedIn();
        listMyInvitationsMock.mockResolvedValue({
            invitations: [
                makeInvitation({ id: "inv-1", project: { title: "Alpha", description: "", status: "open" } }),
                makeInvitation({ id: "inv-2", project: { title: "Beta", description: "", status: "open" } }),
            ],
        });

        render(<MyInvitationsContainer />);

        expect(await screen.findByText("Alpha")).toBeInTheDocument();
        expect(screen.getByText("Beta")).toBeInTheDocument();
        expect(listMyInvitationsMock).toHaveBeenCalledWith("tok");
    });

    it("shows the 'not signed in' state when there is no access token", async () => {
        useAuthMock.mockReturnValue({
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            role: null,
            loading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(<MyInvitationsContainer />);

        expect(await screen.findByText(/not signed in/i)).toBeInTheDocument();
        expect(listMyInvitationsMock).not.toHaveBeenCalled();
    });

    it("does not fetch while auth is still loading", () => {
        useAuthMock.mockReturnValue({
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            role: null,
            loading: true,
            login: vi.fn(),
            logout: vi.fn(),
        });

        render(<MyInvitationsContainer />);

        expect(listMyInvitationsMock).not.toHaveBeenCalled();
    });

    it("surfaces an error message when the fetch fails", async () => {
        signedIn();
        listMyInvitationsMock.mockRejectedValue(new Error("boom"));

        render(<MyInvitationsContainer />);

        expect(await screen.findByText("boom")).toBeInTheDocument();
    });

    it("falls back to 'Failed to load invitations' for non-Error rejections", async () => {
        signedIn();
        listMyInvitationsMock.mockRejectedValue("weird");

        render(<MyInvitationsContainer />);

        expect(
            await screen.findByText(/failed to load invitations/i),
        ).toBeInTheDocument();
    });

    it("renders the empty state when the API returns no invitations", async () => {
        signedIn();
        listMyInvitationsMock.mockResolvedValue({ invitations: [] });

        render(<MyInvitationsContainer />);

        expect(
            await screen.findByText(/you don't have any invitations yet/i),
        ).toBeInTheDocument();
    });

    describe("accept / decline", () => {
        it("PATCHes the invitation with 'accepted' and updates the row", async () => {
            const user = userEvent.setup();
            signedIn();
            listMyInvitationsMock.mockResolvedValue({
                invitations: [makeInvitation({ id: "inv-1", status: "pending" })],
            });
            respondInvitationMock.mockResolvedValue(
                makeInvitation({
                    id: "inv-1",
                    status: "accepted",
                    responded_at: "2026-05-25T00:00:00Z",
                }),
            );

            render(<MyInvitationsContainer />);
            await screen.findByText("Quantum Project");

            await user.click(screen.getByRole("button", { name: /accept/i }));

            await waitFor(() => {
                expect(respondInvitationMock).toHaveBeenCalledWith(
                    "inv-1",
                    { status: "accepted" },
                    "tok",
                );
            });

            // Buttons gone because the row is no longer pending
            await waitFor(() => {
                expect(
                    screen.queryByRole("button", { name: /accept/i }),
                ).not.toBeInTheDocument();
            });
        });

        it("PATCHes the invitation with 'declined' on Decline click", async () => {
            const user = userEvent.setup();
            signedIn();
            listMyInvitationsMock.mockResolvedValue({
                invitations: [makeInvitation({ id: "inv-1", status: "pending" })],
            });
            respondInvitationMock.mockResolvedValue(
                makeInvitation({ id: "inv-1", status: "declined" }),
            );

            render(<MyInvitationsContainer />);
            await screen.findByText("Quantum Project");

            await user.click(screen.getByRole("button", { name: /decline/i }));

            await waitFor(() => {
                expect(respondInvitationMock).toHaveBeenCalledWith(
                    "inv-1",
                    { status: "declined" },
                    "tok",
                );
            });
        });

        it("surfaces respond errors without removing the row", async () => {
            const user = userEvent.setup();
            signedIn();
            listMyInvitationsMock.mockResolvedValue({
                invitations: [makeInvitation({ id: "inv-1", status: "pending" })],
            });
            respondInvitationMock.mockRejectedValue(new Error("already responded"));

            render(<MyInvitationsContainer />);
            await screen.findByText("Quantum Project");

            await user.click(screen.getByRole("button", { name: /accept/i }));

            expect(await screen.findByText("already responded")).toBeInTheDocument();
            // Row still pending, so buttons are still around
            expect(screen.getByRole("button", { name: /accept/i })).toBeInTheDocument();
        });
    });
});
