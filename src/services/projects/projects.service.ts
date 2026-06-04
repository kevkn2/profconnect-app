import { ListProjectsOutput, ProjectOutput } from "./projects.dto";
import { requestWithAuth } from "@/utils/authenticated-request";

export async function listProjects(token: string): Promise<ListProjectsOutput> {
    return requestWithAuth<ListProjectsOutput>("/api/projects", token, "Failed to load projects");
}

export async function getProject(id: string, token: string): Promise<ProjectOutput> {
    return requestWithAuth<ProjectOutput>(`/api/projects/${id}`, token, "Failed to load project");
}

export const projectsService = {
    listProjects,
    getProject,
};
