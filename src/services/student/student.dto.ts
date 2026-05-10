export interface StudentProfile {
    id: string;
    user_id: string;
    email: string;
    name: string;
    role: "student";
    university: string;
    department: string;
    research_interests: string;
}