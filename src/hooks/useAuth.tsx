"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
    clearSession,
    loadSessionFromStorage,
    saveSession,
    subscribeSession,
    type AuthSession,
} from "@/services/auth/sessions/session";

interface AuthContextType {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    role: string | null;
    loading: boolean;
    login: (accessToken: string, refreshToken: string, role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// React-only auth manager. Session persistence lives in the service layer;
// this hook just mirrors that session into component state and exposes actions.
export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSessionState] = useState<AuthSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setSessionState(loadSessionFromStorage());
        setLoading(false);

        return subscribeSession(setSessionState);
    }, []);

    function login(accessToken: string, refreshToken: string, role: string) {
        saveSession({ accessToken, refreshToken, role });
    }

    function logout() {
        clearSession();
    }

    const isAuthenticated = Boolean(session?.accessToken);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                accessToken: session?.accessToken ?? null,
                refreshToken: session?.refreshToken ?? null,
                role: session?.role ?? null,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
