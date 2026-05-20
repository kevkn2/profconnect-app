import Link from "next/link";
import { ProjectOutput } from "@/services/projects/projects.dto";

interface ProjectCardProps {
    project: ProjectOutput;
    href: string;
    actionLabel?: string;
}

export function ProjectCard({ project, href, actionLabel = "View" }: ProjectCardProps) {
    return (
        <Link
            href={href}
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-gray-900">
                        {project.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                        {project.professor.name} · {project.professor.department}
                    </p>
                </div>
                <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        project.status === "open"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                >
                    {project.status}
                </span>
            </div>

            <p className="mt-3 line-clamp-3 text-sm text-gray-700">{project.description}</p>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>{project.slots} slot{project.slots === 1 ? "" : "s"}</span>
                <span className="font-medium text-blue-600">{actionLabel} →</span>
            </div>
        </Link>
    );
}

export default ProjectCard;
