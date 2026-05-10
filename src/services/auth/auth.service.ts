import { API_URL } from "@/config/settings";
import {
    LoginRequest,
    LoginResponse,
    RegisterProfessorRequest,
    RegisterRequest,
    RegisterResponse,
    RegisterStudentRequest,
} from "./auth.dto";


async function postJson<TBody, TResponse>(path: string, body: TBody, errorPrefix: string): Promise<TResponse> {
    const response = await fetch(`${API_URL}/api/auth${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(`${errorPrefix}: ${responseData.message ?? 'Unknown error'}`);
    }

    return responseData as TResponse;
}

export async function register(params: Omit<RegisterRequest, 'role'>): Promise<RegisterResponse> {
    return postJson<RegisterRequest, RegisterResponse>(
        '/register/admin',
        { ...params, role: 'admin' },
        'Registration failed',
    );
}

export async function registerStudent(
    params: Omit<RegisterStudentRequest, 'role'>,
): Promise<RegisterResponse> {
    return postJson<RegisterStudentRequest, RegisterResponse>(
        '/register/student',
        { ...params, role: 'student' },
        'Registration failed',
    );
}

export async function registerProfessor(
    params: Omit<RegisterProfessorRequest, 'role'>,
): Promise<RegisterResponse> {
    return postJson<RegisterProfessorRequest, RegisterResponse>(
        '/register/professor',
        { ...params, role: 'professor' },
        'Registration failed',
    );
}

export async function login(params: LoginRequest): Promise<LoginResponse> {
    return postJson<LoginRequest, LoginResponse>('/login', params, 'Login failed');
}

export const authService = {
    register,
    registerStudent,
    registerProfessor,
    login,
};
