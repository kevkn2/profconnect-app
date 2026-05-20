import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { ProjectApplicationOutput, ProjectOutput } from "@/services/projects/projects.dto";
import { RoleEnum } from "@/types/role";

interface DashboardViewProps {
    role: RoleEnum;
    projects: ProjectOutput[];
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

export const DashboardView = ({
    role,
    projects,
    applications,
    loading,
    error,
}: DashboardViewProps) => {
    const basePath = role === "professor" ? "/professor/projects" : "/student/projects";
    const headline =
        role === "professor"
            ? "Manage your research projects and review applicants."
            : "Browse open research projects and track your applications.";

    return (
        <div className="w-full p-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Dashboard
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">{headline}</p>
                    </div>
                    {role === "professor" && (
                        <Link
                            href="/professor/projects/new"
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                        >
                            + New project
                        </Link>
                    )}
                </div>

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

                {!loading && !error && (
                    <div className="mt-8 space-y-10">
                        <section>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Recent projects
                                </h2>
                                <Link
                                    href={basePath}
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                >
                                    View all →
                                </Link>
                            </div>

                            {projects.length === 0 ? (
                                <p className="mt-4 text-sm text-gray-500">No projects yet.</p>
                            ) : (
                                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {projects.slice(0, 3).map((project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            href={`${basePath}/${project.id}`}
                                            actionLabel={role === "student" ? "Apply" : "View"}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        {role === "student" && (
                            <section>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        My applications
                                    </h2>
                                    <Link
                                        href="/student/applications"
                                        className="text-sm font-medium text-blue-600 hover:underline"
                                    >
                                        View all →
                                    </Link>
                                </div>

                                {applications.length === 0 ? (
                                    <p className="mt-4 text-sm text-gray-500">
                                        You haven&apos;t applied to any projects yet.
                                    </p>
                                ) : (
                                    <ul className="mt-4 space-y-3">
                                        {applications.slice(0, 5).map((app) => (
                                            <li
                                                key={app.id}
                                                className="flex items-start justify-between gap-4 rounded-lg bg-white p-4 shadow-sm"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-gray-900">
                                                        {app.project.title}
                                                    </p>
                                                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                                                        {app.project.description}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        statusStyles[app.status] ??
                                                        "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {app.status}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
