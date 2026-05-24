"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Textarea from "@/components/ui/Textarea";
import { inputBaseClassName } from "@/components/ui/Input";
import {
    ProjectInvitationOutput,
    ProjectStudentBrief,
} from "@/services/projects/projects.dto";

interface InvitationsPanelProps {
    invitations: ProjectInvitationOutput[];
    invitationsLoading: boolean;
    invitationsError: string | null;
    inviting: boolean;
    inviteError: string | null;
    cancellingInvitationId: string | null;
    onInvite: (studentId: string, message: string) => Promise<void>;
    onCancelInvitation: (invitationId: string) => void;
    students: ProjectStudentBrief[];
    studentsLoading: boolean;
    studentsError: string | null;
}

const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-600",
};

export default function InvitationsPanel({
    invitations,
    invitationsLoading,
    invitationsError,
    inviting,
    inviteError,
    cancellingInvitationId,
    onInvite,
    onCancelInvitation,
    students,
    studentsLoading,
    studentsError,
}: InvitationsPanelProps) {
    const [studentId, setStudentId] = useState("");
    const [message, setMessage] = useState("");

    const invitedIds = new Set(
        invitations
            .filter((inv) => inv.status === "pending" || inv.status === "accepted")
            .map((inv) => inv.student.student_id),
    );

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            await onInvite(studentId.trim(), message);
            setStudentId("");
            setMessage("");
        } catch {
            // surfaced via inviteError
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Invitations</h2>

            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-lg bg-white p-6 shadow-sm"
            >
                <div>
                    <label
                        htmlFor="student-id"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Student
                    </label>
                    <select
                        id="student-id"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                        disabled={studentsLoading || students.length === 0}
                        className={inputBaseClassName}
                    >
                        <option value="">
                            {studentsLoading
                                ? "Loading students..."
                                : students.length === 0
                                  ? "No students available"
                                  : "Select a student"}
                        </option>
                        {students.map((s) => {
                            const alreadyInvited = invitedIds.has(s.student_id);
                            return (
                                <option
                                    key={s.student_id}
                                    value={s.student_id}
                                    disabled={alreadyInvited}
                                >
                                    {s.name || s.email}
                                    {s.email ? ` (${s.email})` : ""}
                                    {alreadyInvited ? " — already invited" : ""}
                                </option>
                            );
                        })}
                    </select>
                    {studentsError && (
                        <p className="mt-1 text-xs text-red-600">{studentsError}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="invite-message"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Message (optional)
                    </label>
                    <Textarea
                        id="invite-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        placeholder="Add a short note for the student..."
                    />
                </div>

                {inviteError && (
                    <div className="rounded-md bg-red-50 p-3">
                        <p className="text-sm font-medium text-red-800">{inviteError}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    loading={inviting}
                    disabled={inviting || studentId.trim() === ""}
                    fullWidth={false}
                >
                    {inviting ? "Sending..." : "Send invitation"}
                </Button>
            </form>

            <div>
                <div className="flex items-baseline justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Sent</h3>
                    <span className="text-xs text-gray-500">{invitations.length}</span>
                </div>

                {invitationsLoading && (
                    <div className="mt-3 flex justify-center">
                        <Spinner size={24} />
                    </div>
                )}

                {!invitationsLoading && invitationsError && (
                    <div className="mt-3 rounded-md bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">
                            {invitationsError}
                        </p>
                    </div>
                )}

                {!invitationsLoading &&
                    !invitationsError &&
                    invitations.length === 0 && (
                        <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                            <p className="text-sm text-gray-500">
                                No invitations sent yet.
                            </p>
                        </div>
                    )}

                {!invitationsLoading && !invitationsError && invitations.length > 0 && (
                    <ul className="mt-3 space-y-4">
                        {invitations.map((inv) => {
                            const isPending = inv.status === "pending";
                            const busy = cancellingInvitationId === inv.id;
                            return (
                                <li
                                    key={inv.id}
                                    className="rounded-lg bg-white p-6 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-base font-semibold text-gray-900">
                                                {inv.student.name || inv.student.email}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {inv.student.department}
                                                {inv.student.department &&
                                                    inv.student.university &&
                                                    " · "}
                                                {inv.student.university}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {inv.student.email}
                                            </p>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                                statusStyles[inv.status] ??
                                                "bg-gray-100 text-gray-600"
                                            }`}
                                        >
                                            {inv.status}
                                        </span>
                                    </div>

                                    {inv.message && (
                                        <div className="mt-4 rounded-md bg-gray-50 p-3">
                                            <p className="text-xs font-medium text-gray-500">
                                                Message
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                                                {inv.message}
                                            </p>
                                        </div>
                                    )}

                                    {isPending && (
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() =>
                                                    onCancelInvitation(inv.id)
                                                }
                                                className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {busy ? "Cancelling..." : "Cancel"}
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
