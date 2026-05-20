"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { projectsService } from "@/services/projects/projects.service";
import { studentService } from "@/services/student/student.service";
import { ProjectApplicationOutput, ProjectOutput } from "@/services/projects/projects.dto";
import { checkRole } from "@/types/role";
import { DashboardView } from "./DashboardView";

export default function DashboardContainer() {
    const { accessToken, role, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<ProjectOutput[]>([]);
    const [applications, setApplications] = useState<ProjectApplicationOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!accessToken) {
            setLoading(false);
            setError("You are not signed in");
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        const tasks: Promise<unknown>[] = [
            projectsService
                .listProjects(accessToken)
                .then((data) => {
                    if (!cancelled) setProjects(data.projects ?? []);
                }),
        ];

        if (role === "student") {
            tasks.push(
                studentService
                    .listMyApplications(accessToken)
                    .then((data) => {
                        if (!cancelled) setApplications(data.applications ?? []);
                    }),
            );
        }

        Promise.all(tasks)
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load dashboard");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading, role]);

    return (
        <DashboardView
            role={checkRole(role)}
            projects={projects}
            applications={applications}
            loading={loading}
            error={error}
        />
    );
}
