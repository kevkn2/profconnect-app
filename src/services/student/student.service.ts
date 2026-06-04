import { CheckApplicationStatusOutput, StudentProfile } from "./student.dto";
import {
    ApplyProjectInput,
    ListApplicationsOutput,
    ListInvitationsOutput,
    ProjectApplicationOutput,
    ProjectInvitationOutput,
    RespondInvitationInput,
} from "@/services/projects/projects.dto";
import { requestWithAuth } from "@/utils/authenticated-request";

export async function getProfile(token: string): Promise<StudentProfile> {
    return requestWithAuth<StudentProfile>("/api/student/profile", token, "Failed to load profile");
}

export async function applyToProject(
    projectId: string,
    params: ApplyProjectInput,
    token: string,
): Promise<ProjectApplicationOutput> {
    return requestWithAuth<ProjectApplicationOutput>(
        `/api/student/projects/${projectId}/applications`,
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
    await requestWithAuth<unknown>(
        `/api/student/projects/${projectId}/applications/${applicationId}`,
        token,
        "Failed to withdraw application",
        { method: "DELETE" },
    );
}

export async function listMyApplications(token: string): Promise<ListApplicationsOutput> {
    return requestWithAuth<ListApplicationsOutput>(
        "/api/student/applications",
        token,
        "Failed to load applications",
    );
}

export async function checkApplicationStatus(
    projectId: string,
    token: string
): Promise<CheckApplicationStatusOutput> {
    return requestWithAuth<CheckApplicationStatusOutput>(
        `/api/student/projects/${projectId}/applications`,
        token,
        "Failed to load applications",
    );
}

export async function listMyInvitations(token: string): Promise<ListInvitationsOutput> {
    return requestWithAuth<ListInvitationsOutput>(
        "/api/student/invitations",
        token,
        "Failed to load invitations",
    );
}

export async function respondInvitation(
    invitationId: string,
    params: RespondInvitationInput,
    token: string,
): Promise<ProjectInvitationOutput> {
    return requestWithAuth<ProjectInvitationOutput>(
        `/api/student/invitations/${invitationId}`,
        token,
        "Failed to respond to invitation",
        {
            method: "PATCH",
            body: JSON.stringify(params),
        },
    );
}

export const studentService = {
    getProfile,
    applyToProject,
    withdrawApplication,
    listMyApplications,
    checkApplicationStatus,
    listMyInvitations,
    respondInvitation,
};
