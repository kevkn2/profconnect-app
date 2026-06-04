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
import { requestWithAuth } from "@/utils/authenticated-request";

export async function getProfile(token: string): Promise<ProfessorProfile> {
    return requestWithAuth<ProfessorProfile>("/api/professor/profile", token, "Failed to load profile");
}

export async function createProject(
    params: CreateProjectInput,
    token: string,
): Promise<ProjectOutput> {
    return requestWithAuth<ProjectOutput>("/api/professor/projects", token, "Failed to create project", {
        method: "POST",
        body: JSON.stringify(params),
    });
}

export async function listProjectApplications(
    projectId: string,
    token: string,
): Promise<ListProjectApplicationsByProjectOutput> {
    return requestWithAuth<ListProjectApplicationsByProjectOutput>(
        `/api/professor/projects/${projectId}/applications`,
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
    return requestWithAuth<ProjectApplicationOutput>(
        `/api/professor/projects/${projectId}/applications/${applicationId}`,
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
    return requestWithAuth<ListInvitationsOutput>(
        `/api/professor/projects/${projectId}/invitations`,
        token,
        "Failed to load invitations",
    );
}

export async function sendInvitation(
    projectId: string,
    params: SendInvitationInput,
    token: string,
): Promise<ProjectInvitationOutput> {
    return requestWithAuth<ProjectInvitationOutput>(
        `/api/professor/projects/${projectId}/invitations`,
        token,
        "Failed to send invitation",
        {
            method: "POST",
            body: JSON.stringify(params),
        },
    );
}

export async function listStudents(token: string): Promise<ListStudentsOutput> {
    return requestWithAuth<ListStudentsOutput>("/api/professor/students", token, "Failed to load students");
}

export async function cancelInvitation(
    projectId: string,
    invitationId: string,
    token: string,
): Promise<void> {
    await requestWithAuth<unknown>(
        `/api/professor/projects/${projectId}/invitations/${invitationId}`,
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
