export interface RegisterRequest {
    email: string
    name: string
    password: string
}

export interface RegisterResponse {
    message: string
    user_id: string | null
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    type: string;
}
