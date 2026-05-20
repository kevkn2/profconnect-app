import { ProjectApplicationOutput } from "@/services/projects/projects.dto";

interface ApplicantCardProps {
    application: ProjectApplicationOutput;
    busy?: boolean;
    onReview?: (applicationId: string, status: "approved" | "rejected") => void;
}

const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-gray-100 text-gray-600",
};

export default function ApplicantCard({
    application,
    busy = false,
    onReview,
}: ApplicantCardProps) {
    const isPending = application.status === "pending";

    return (
        <li className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-900">
                        {application.student.name}
                    </p>
                    <p className="text-xs text-gray-500">
                        {application.student.department} · {application.student.university}
                    </p>
                    <p className="text-xs text-gray-500">{application.student.email}</p>
                </div>
                <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyles[application.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                >
                    {application.status}
                </span>
            </div>

            {application.student.research_interests && (
                <p className="mt-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Research interests:</span>{" "}
                    {application.student.research_interests}
                </p>
            )}

            <div className="mt-4 rounded-md bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                    {application.message || "—"}
                </p>
            </div>

            {isPending && onReview && (
                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onReview(application.id, "approved")}
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {busy ? "Working..." : "Approve"}
                    </button>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={() => onReview(application.id, "rejected")}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {busy ? "Working..." : "Reject"}
                    </button>
                </div>
            )}
        </li>
    );
}
