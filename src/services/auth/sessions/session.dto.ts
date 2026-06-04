export interface AuthSession {
    accessToken: string;
    refreshToken: string;
    role: string;
}

export type AuthSessionListener = (session: AuthSession | null) => void;
