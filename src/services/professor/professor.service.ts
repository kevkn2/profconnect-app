import { API_URL } from "@/config/settings";
import { ProfessorProfile } from "./professor.dto";
import {
    CreateProjectInput,
    ListInvitationsOutput,
    ListProjectApplicationsByProjectOutput,
    ListStudentsOutput,
    ProjectApplicationOutput,
    ProjectInvitationOutput,
    ProjectOutput,
    ReviewApplicationInput,
    SendInvitationInput,
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

export async function listProjectInvitations(
    projectId: string,
    token: string,
): Promise<ListInvitationsOutput> {
    return request<ListInvitationsOutput>(
        `/projects/${projectId}/invitations`,
        token,
        "Failed to load invitations",
    );
}

export async function sendInvitation(
    projectId: string,
    params: SendInvitationInput,
    token: string,
): Promise<ProjectInvitationOutput> {
    return request<ProjectInvitationOutput>(
        `/projects/${projectId}/invitations`,
        token,
        "Failed to send invitation",
        {
            method: "POST",
            body: JSON.stringify(params),
        },
    );
}

export async function listStudents(token: string): Promise<ListStudentsOutput> {
    return request<ListStudentsOutput>("/students", token, "Failed to load students");
}

export async function cancelInvitation(
    projectId: string,
    invitationId: string,
    token: string,
): Promise<void> {
    await request<unknown>(
        `/projects/${projectId}/invitations/${invitationId}`,
        token,
        "Failed to cancel invitation",
        { method: "DELETE" },
    );
}

export const professorService = {
    getProfile,
    createProject,
    listProjectApplications,
    reviewApplication,
    listProjectInvitations,
    sendInvitation,
    cancelInvitation,
    listStudents,
};
