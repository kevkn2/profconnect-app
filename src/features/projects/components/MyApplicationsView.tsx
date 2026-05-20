import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import { ProjectApplicationOutput } from "@/services/projects/projects.dto";

interface MyApplicationsViewProps {
    applications: ProjectApplicationOutput[];
    loading: boolean;
    error: string | null;
}

const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-gray-100 text-gray-600",
};

export default function MyApplicationsView({
    applications,
    loading,
    error,
}: MyApplicationsViewProps) {
    return (
        <div className="w-full p-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    My applications
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Track the status of projects you have applied to.
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

                {!loading && !error && applications.length === 0 && (
                    <div className="mt-12 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
                        <p className="text-sm text-gray-500">
                            You haven&apos;t applied to any projects yet.
                        </p>
                        <Link
                            href="/student/projects"
                            className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                        >
                            Browse projects →
                        </Link>
                    </div>
                )}

                {!loading && !error && applications.length > 0 && (
                    <ul className="mt-8 space-y-4">
                        {applications.map((app) => (
                            <li
                                key={app.id}
                                className="rounded-lg bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-base font-semibold text-gray-900">
                                            {app.project.title}
                                        </h3>
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                            {app.project.description}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                            statusStyles[app.status] ??
                                            "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {app.status}
                                    </span>
                                </div>

                                <div className="mt-4 rounded-md bg-gray-50 p-3">
                                    <p className="text-xs font-medium text-gray-500">
                                        Your message
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                                        {app.message || "—"}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
