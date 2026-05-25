import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InvitationsPanel from "@/features/projects/components/InvitationsPanel";
import {
    ProjectInvitationOutput,
    ProjectStudentBrief,
} from "@/services/projects/projects.dto";

function makeStudent(overrides: Partial<ProjectStudentBrief> = {}): ProjectStudentBrief {
    return {
        user_id: "u-1",
        student_id: "s-1",
        name: "Alice",
        email: "alice@example.edu",
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
        project: { title: "P", description: "", status: "open" },
        student: makeStudent(),
        responded_at: "",
        ...overrides,
    };
}

type InviteFn = (studentId: string, message: string) => Promise<void>;
type CancelFn = (invitationId: string) => void;

interface RenderOpts {
    students?: ProjectStudentBrief[];
    invitations?: ProjectInvitationOutput[];
    inviting?: boolean;
    inviteError?: string | null;
    invitationsLoading?: boolean;
    invitationsError?: string | null;
    studentsLoading?: boolean;
    studentsError?: string | null;
    cancellingInvitationId?: string | null;
    onInvite?: InviteFn;
    onCancelInvitation?: CancelFn;
}

function renderPanel(opts: RenderOpts = {}) {
    const onInvite: InviteFn = opts.onInvite ?? vi.fn(async () => undefined);
    const onCancelInvitation: CancelFn = opts.onCancelInvitation ?? vi.fn();

    render(
        <InvitationsPanel
            invitations={opts.invitations ?? []}
            invitationsLoading={opts.invitationsLoading ?? false}
            invitationsError={opts.invitationsError ?? null}
            inviting={opts.inviting ?? false}
            inviteError={opts.inviteError ?? null}
            cancellingInvitationId={opts.cancellingInvitationId ?? null}
            onInvite={onInvite}
            onCancelInvitation={onCancelInvitation}
            students={opts.students ?? []}
            studentsLoading={opts.studentsLoading ?? false}
            studentsError={opts.studentsError ?? null}
        />,
    );

    return { onInvite, onCancelInvitation };
}

describe("InvitationsPanel", () => {
    describe("student select", () => {
        it("shows 'Loading students...' while studentsLoading is true", () => {
            renderPanel({ studentsLoading: true });
            expect(
                screen.getByRole("option", { name: /loading students/i }),
            ).toBeInTheDocument();
            expect(screen.getByLabelText(/student/i)).toBeDisabled();
        });

        it("shows 'No students available' when students array is empty", () => {
            renderPanel();
            expect(
                screen.getByRole("option", { name: /no students available/i }),
            ).toBeInTheDocument();
            expect(screen.getByLabelText(/student/i)).toBeDisabled();
        });

        it("renders an option per student and disables ones already invited (pending/accepted)", () => {
            const students = [
                makeStudent({ student_id: "s-1", name: "Alice" }),
                makeStudent({
                    student_id: "s-2",
                    name: "Bob",
                    email: "bob@example.edu",
                }),
                makeStudent({
                    student_id: "s-3",
                    name: "Carol",
                    email: "carol@example.edu",
                }),
            ];
            const invitations = [
                makeInvitation({
                    id: "inv-1",
                    status: "pending",
                    student: makeStudent({ student_id: "s-1" }),
                }),
                makeInvitation({
                    id: "inv-2",
                    status: "accepted",
                    student: makeStudent({ student_id: "s-2" }),
                }),
                makeInvitation({
                    id: "inv-3",
                    status: "declined",
                    student: makeStudent({ student_id: "s-3" }),
                }),
            ];

            renderPanel({ students, invitations });

            const aliceOption = screen.getByRole("option", {
                name: /alice/i,
            }) as HTMLOptionElement;
            const bobOption = screen.getByRole("option", {
                name: /bob/i,
            }) as HTMLOptionElement;
            const carolOption = screen.getByRole("option", {
                name: /carol/i,
            }) as HTMLOptionElement;

            expect(aliceOption.disabled).toBe(true);
            expect(aliceOption.textContent).toMatch(/already invited/i);
            expect(bobOption.disabled).toBe(true);
            expect(bobOption.textContent).toMatch(/already invited/i);
            // Declined invitations should NOT block re-inviting
            expect(carolOption.disabled).toBe(false);
            expect(carolOption.textContent).not.toMatch(/already invited/i);
        });

        it("surfaces studentsError below the select", () => {
            renderPanel({ studentsError: "boom" });
            expect(screen.getByText("boom")).toBeInTheDocument();
        });
    });

    describe("invite submission", () => {
        it("disables Send while no student is picked, even with students loaded", () => {
            renderPanel({ students: [makeStudent()] });
            expect(
                screen.getByRole("button", { name: /send invitation/i }),
            ).toBeDisabled();
        });

        it("calls onInvite with the picked student_id + message and clears the form on success", async () => {
            const user = userEvent.setup();
            const onInvite = vi.fn().mockResolvedValue(undefined);
            renderPanel({
                students: [
                    makeStudent({ student_id: "s-1", name: "Alice" }),
                    makeStudent({
                        student_id: "s-2",
                        name: "Bob",
                        email: "bob@example.edu",
                    }),
                ],
                onInvite,
            });

            const select = screen.getByLabelText(/student/i) as HTMLSelectElement;
            await user.selectOptions(select, "s-2");
            await user.type(screen.getByLabelText(/message/i), "join us");

            const submit = screen.getByRole("button", { name: /send invitation/i });
            expect(submit).not.toBeDisabled();

            await user.click(submit);

            expect(onInvite).toHaveBeenCalledTimes(1);
            expect(onInvite).toHaveBeenCalledWith("s-2", "join us");

            // Form was reset after the resolved invite
            expect(select.value).toBe("");
            expect(screen.getByLabelText(/message/i)).toHaveValue("");
        });

        it("keeps the form populated when onInvite rejects", async () => {
            const user = userEvent.setup();
            const onInvite = vi.fn().mockRejectedValue(new Error("nope"));
            renderPanel({
                students: [makeStudent({ student_id: "s-1", name: "Alice" })],
                onInvite,
            });

            const select = screen.getByLabelText(/student/i) as HTMLSelectElement;
            await user.selectOptions(select, "s-1");
            await user.type(screen.getByLabelText(/message/i), "please");
            await user.click(screen.getByRole("button", { name: /send invitation/i }));

            expect(onInvite).toHaveBeenCalledWith("s-1", "please");
            // Failure must NOT clear the form — user can retry / edit
            expect(select.value).toBe("s-1");
            expect(screen.getByLabelText(/message/i)).toHaveValue("please");
        });

        it("renders inviteError above the Send button", () => {
            renderPanel({ inviteError: "student already invited" });
            expect(screen.getByText("student already invited")).toBeInTheDocument();
        });

        it("shows 'Sending...' and disables Send while inviting", () => {
            renderPanel({
                students: [makeStudent({ student_id: "s-1" })],
                inviting: true,
            });
            const submit = screen.getByRole("button", { name: /sending/i });
            expect(submit).toBeDisabled();
        });
    });

    describe("sent invitations list", () => {
        it("shows the empty state when no invitations have been sent", () => {
            renderPanel();
            expect(screen.getByText(/no invitations sent yet/i)).toBeInTheDocument();
        });

        it("only shows Cancel on pending invitations", () => {
            const invitations = [
                makeInvitation({
                    id: "inv-1",
                    status: "pending",
                    student: makeStudent({ name: "Alice" }),
                }),
                makeInvitation({
                    id: "inv-2",
                    status: "accepted",
                    student: makeStudent({ student_id: "s-2", name: "Bob" }),
                }),
            ];
            renderPanel({ invitations });

            // One cancel button for the pending invite, none for the accepted one
            const cancelButtons = screen.getAllByRole("button", { name: /^cancel$/i });
            expect(cancelButtons).toHaveLength(1);
        });

        it("calls onCancelInvitation with the invitation id when Cancel is clicked", async () => {
            const user = userEvent.setup();
            const onCancelInvitation = vi.fn();
            renderPanel({
                invitations: [makeInvitation({ id: "inv-1", status: "pending" })],
                onCancelInvitation,
            });

            await user.click(screen.getByRole("button", { name: /^cancel$/i }));

            expect(onCancelInvitation).toHaveBeenCalledTimes(1);
            expect(onCancelInvitation).toHaveBeenCalledWith("inv-1");
        });

        it("shows 'Cancelling...' on the row currently being cancelled", () => {
            const invitations = [
                makeInvitation({ id: "inv-1", status: "pending" }),
                makeInvitation({
                    id: "inv-2",
                    status: "pending",
                    student: makeStudent({ student_id: "s-2", name: "Bob" }),
                }),
            ];
            renderPanel({ invitations, cancellingInvitationId: "inv-2" });

            expect(
                screen.getByRole("button", { name: /cancelling/i }),
            ).toBeDisabled();
            // The other pending row still says "Cancel"
            expect(screen.getByRole("button", { name: /^cancel$/i })).not.toBeDisabled();
        });
    });
});
