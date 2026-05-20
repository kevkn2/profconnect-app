import { API_URL } from "@/config/settings";
import { ListProjectsOutput, ProjectOutput } from "./projects.dto";

async function getJson<T>(path: string, token: string, errorPrefix: string): Promise<T> {
    const response = await fetch(`${API_URL}/api${path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`${errorPrefix}: ${data.message ?? "Unknown error"}`);
    }

    return data as T;
}

export async function listProjects(token: string): Promise<ListProjectsOutput> {
    return getJson<ListProjectsOutput>("/projects", token, "Failed to load projects");
}

export async function getProject(id: string, token: string): Promise<ProjectOutput> {
    return getJson<ProjectOutput>(`/projects/${id}`, token, "Failed to load project");
}

export const projectsService = {
    listProjects,
    getProject,
};
