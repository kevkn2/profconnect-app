"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { professorService } from "@/services/professor/professor.service";
import { CreateProjectInput } from "@/services/projects/projects.dto";
import ProjectCreateView from "./ProjectCreateView";

export default function ProjectCreateContainer() {
    const { accessToken } = useAuth();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(params: CreateProjectInput) {
        if (!accessToken) {
            setError("You are not signed in");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const project = await professorService.createProject(params, accessToken);
            router.push(`/professor/projects/${project.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create project");
            setSubmitting(false);
        }
    }

    return (
        <ProjectCreateView submitting={submitting} error={error} onSubmit={handleSubmit} />
    );
}
