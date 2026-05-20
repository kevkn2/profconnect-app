import { API_URL } from "@/config/settings";
import { ProfessorProfile } from "./professor.dto";
import {
    CreateProjectInput,
    ListProjectApplicationsByProjectOutput,
    ProjectApplicationOutput,
    ProjectOutput,
    ReviewApplicationInput,
} from "@/services/projects/projects.dto";

async function request<T>(
    path: string,
    token: string,
    errorPrefix: string,
    init: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${API_URL}/api/professor${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(init.headers ?? {}),
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(`${errorPrefix}: ${data.message ?? "Unknown error"}`);
    }

    return data as T;
}

export async function getProfile(token: string): Promise<ProfessorProfile> {
    return request<ProfessorProfile>("/profile", token, "Failed to load profile");
}

export async function createProject(
    params: CreateProjectInput,
    token: string,
): Promise<ProjectOutput> {
    return request<ProjectOutput>("/projects", token, "Failed to create project", {
        method: "POST",
        body: JSON.stringify(params),
    });
}

export async function listProjectApplications(
    projectId: string,
    token: string,
): Promise<ListProjectApplicationsByProjectOutput> {
    return request<ListProjectApplicationsByProjectOutput>(
        `/projects/${projectId}/applications`,
        token,
        "Failed to load applications",
    );
}

export async function reviewApplication(
    projectId: string,
    applicationId: string,
    params: ReviewApplicationInput,
    token: string,
): Promise<ProjectApplicationOutput> {
    return request<ProjectApplicationOutput>(
        `/projects/${projectId}/applications/${applicationId}`,
        token,
        "Failed to review application",
        {
            method: "PATCH",
            body: JSON.stringify(params),
        },
    );
}

export const professorService = {
    getProfile,
    createProject,
    listProjectApplications,
    reviewApplication,
};
