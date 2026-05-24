import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import {
    InvitationResponseStatus,
    ProjectInvitationOutput,
} from "@/services/projects/projects.dto";

interface MyInvitationsViewProps {
    invitations: ProjectInvitationOutput[];
    loading: boolean;
    error: string | null;
    respondingId: string | null;
    respondError: string | null;
    onRespond: (invitationId: string, status: InvitationResponseStatus) => void;
}

const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-600",
};

export default function MyInvitationsView({
    invitations,
    loading,
    error,
    respondingId,
    respondError,
    onRespond,
}: MyInvitationsViewProps) {
    return (
        <div className="w-full p-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    My invitations
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Projects professors have invited you to join.
                </p>

                {loading && (
                    <div className="mt-12 flex justify-center">
                        <Spinner size={24} />
                    </div>
                )}

                {!loading && error && (
                    <div className="mt-6 rounded-md bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}

                {!loading && respondError && (
                    <div className="mt-6 rounded-md bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">{respondError}</p>
                    </div>
                )}

                {!loading && !error && invitations.length === 0 && (
                    <div className="mt-12 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
                        <p className="text-sm text-gray-500">
                            You don&apos;t have any invitations yet.
                        </p>
                        <Link
                            href="/student/projects"
                            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                        >
                            Browse projects →
                        </Link>
                    </div>
                )}

                {!loading && !error && invitations.length > 0 && (
                    <ul className="mt-8 space-y-4">
                        {invitations.map((inv) => {
                            const isPending = inv.status === "pending";
                            const busy = respondingId === inv.id;
                            return (
                                <li
                                    key={inv.id}
                                    className="rounded-lg bg-white p-6 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-base font-semibold text-gray-900">
                                                {inv.project.title}
                                            </h3>
                                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                                {inv.project.description}
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
                                                Message from the professor
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                                                {inv.message}
                                            </p>
                                        </div>
                                    )}

                                    {isPending && (
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => onRespond(inv.id, "accepted")}
                                                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {busy ? "Working..." : "Accept"}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => onRespond(inv.id, "declined")}
                                                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {busy ? "Working..." : "Decline"}
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
