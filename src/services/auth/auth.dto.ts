export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
    role: string;
}

export interface RegisterStudentRequest {
    email: string;
    name: string;
    password: string;
    role: string;
    university: string;
    department: string;
    research_interests: string;
}

export interface RegisterProfessorRequest {
    email: string;
    name: string;
    password: string;
    role: string;
    university: string;
    department: string;
}

export interface RegisterResponse {
    message: string;
    user_id: string | null;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    role: string;
    type: string;
}
