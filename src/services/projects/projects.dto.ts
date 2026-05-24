export type ApplicationStatus = "pending" | "approved" | "rejected" | "withdrawn";

export type InvitationStatus = "pending" | "accepted" | "declined" | "cancelled";

export type InvitationResponseStatus = "accepted" | "declined";

export interface ProjectProfessorBrief {
    user_id: string;
    name: string;
    email: string;
    university: string;
    department: string;
}

export interface ProjectStudentBrief {
    user_id: string;
    student_id: string;
    name: string;
    email: string;
    university: string;
    department: string;
    research_interests: string;
}

export interface ProjectShortForApp {
    title: string;
    description: string;
    status: string;
}

export interface ProjectOutput {
    id: string;
    title: string;
    description: string;
    slots: number;
    status: string;
    professor_id: string;
    professor: ProjectProfessorBrief;
}

export interface ProjectApplicationOutput {
    id: string;
    status: ApplicationStatus;
    message: string;
    project: ProjectShortForApp;
    student: ProjectStudentBrief;
}

export interface ListProjectsOutput {
    projects: ProjectOutput[];
}

export interface ListApplicationsOutput {
    applications: ProjectApplicationOutput[];
}

export interface ListProjectApplicationsByProjectOutput {
    pending_applications: ProjectApplicationOutput[];
    approved_applications: ProjectApplicationOutput[];
}

export interface CreateProjectInput {
    title: string;
    description: string;
    slots: number;
}

export interface ApplyProjectInput {
    message: string;
}

export interface ReviewApplicationInput {
    status: "approved" | "rejected";
}

export interface ProjectInvitationOutput {
    id: string;
    status: InvitationStatus;
    message: string;
    project: ProjectShortForApp;
    student: ProjectStudentBrief;
    responded_at: string;
}

export interface ListInvitationsOutput {
    invitations: ProjectInvitationOutput[];
}

export interface ListStudentsOutput {
    students: ProjectStudentBrief[];
}

export interface SendInvitationInput {
    student_id: string;
    message: string;
}

export interface RespondInvitationInput {
    status: InvitationResponseStatus;
}
