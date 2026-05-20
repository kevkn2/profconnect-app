import { API_URL } from "@/config/settings";
import { StudentProfile } from "./student.dto";
import {
    ApplyProjectInput,
    ListApplicationsOutput,
    ProjectApplicationOutput,
} from "@/services/projects/projects.dto";

async function request<T>(
    path: string,
    token: string,
    errorPrefix: string,
    init: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${API_URL}/api/student${path}`, {
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

export async function getProfile(token: string): Promise<StudentProfile> {
    return request<StudentProfile>("/profile", token, "Failed to load profile");
}

export async function applyToProject(
    projectId: string,
    params: ApplyProjectInput,
    token: string,
): Promise<ProjectApplicationOutput> {
    return request<ProjectApplicationOutput>(
        `/projects/${projectId}/applications`,
        token,
        "Failed to submit application",
        {
            method: "POST",
            body: JSON.stringify(params),
        },
    );
}

export async function withdrawApplication(
    projectId: string,
    applicationId: string,
    token: string,
): Promise<void> {
    await request<unknown>(
        `/projects/${projectId}/applications/${applicationId}`,
        token,
        "Failed to withdraw application",
        { method: "DELETE" },
    );
}

export async function listMyApplications(token: string): Promise<ListApplicationsOutput> {
    return request<ListApplicationsOutput>(
        "/applications",
        token,
        "Failed to load applications",
    );
}

export const studentService = {
    getProfile,
    applyToProject,
    withdrawApplication,
    listMyApplications,
};
