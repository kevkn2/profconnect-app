import { API_URL } from "@/config/settings";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "./auth.dto";


export async function register(params: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error('Registration failed: ' + responseData.message);
    }

    return responseData;
}

export async function login(params: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(`Login failed: ${responseData.message}`);
    }

    return responseData;
}

export const authService = {
    register,
    login,
}