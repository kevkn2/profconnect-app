"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { projectsService } from "@/services/projects/projects.service";
import { ProjectOutput } from "@/services/projects/projects.dto";
import { checkRole } from "@/types/role";
import ProjectListView from "./ProjectListView";

export default function ProjectListContainer() {
    const { accessToken, role, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<ProjectOutput[]>([]);
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

        projectsService
            .listProjects(accessToken)
            .then((data) => {
                if (!cancelled) setProjects(data.projects ?? []);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load projects");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading]);

    return (
        <ProjectListView
            role={checkRole(role)}
            projects={projects}
            loading={loading}
            error={error}
        />
    );
}
