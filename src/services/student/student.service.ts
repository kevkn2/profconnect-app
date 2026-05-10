import { API_URL } from "@/config/settings";
import { StudentProfile } from "./student.dto";

async function getJson<T>(path: string, token: string, errorPrefix: string): Promise<T> {
    const response = await fetch(`${API_URL}/api/student${path}`, {
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

export async function getProfile(token: string): Promise<StudentProfile> {
    return getJson<StudentProfile>("/profile", token, "Failed to load profile");
}

export const studentService = {
    getProfile,
}