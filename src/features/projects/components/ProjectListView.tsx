import Link from "next/link";
import Spinner from "@/components/ui/Spinner";
import { ProjectOutput } from "@/services/projects/projects.dto";
import { RoleEnum } from "@/types/role";
import { ProjectCard } from "./ProjectCard";

interface ProjectListViewProps {
    role: RoleEnum;
    projects: ProjectOutput[];
    loading: boolean;
    error: string | null;
}

export default function ProjectListView({
    role,
    projects,
    loading,
    error,
}: ProjectListViewProps) {
    const basePath = role === "professor" ? "/professor/projects" : "/student/projects";
    const actionLabel = role === "student" ? "Apply" : "Manage";

    return (
        <div className="w-full p-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Projects
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {role === "professor"
                                ? "Browse projects and manage your own."
                                : "Browse open research projects and apply."}
                        </p>
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

                {!loading && !error && projects.length === 0 && (
                    <div className="mt-12 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
                        <p className="text-sm text-gray-500">No projects yet.</p>
                    </div>
                )}

                {!loading && !error && projects.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                href={`${basePath}/${project.id}`}
                                actionLabel={actionLabel}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
