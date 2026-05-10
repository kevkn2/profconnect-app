"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LoginRequest } from "@/services/auth/auth.dto";
import { authService } from "@/services/auth/auth.service";
import LoginView from "./LoginView";
import { useAuth } from "@/hooks/useAuth";

export default function LoginContainer() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(formData: LoginRequest) {
        setLoading(true);
        setError(null);

        try {
            const data = await authService.login(formData);

            console.log("Login successful:", data);

            // Use auth provider to set token
            login(data.accessToken, data.refreshToken, data.role);

            // Redirect to dashboard
            if (data.role === "professor") {
                router.push("/professor/dashboard");
            } else if (data.role === "student") {
                router.push("/student/dashboard");
            } else if (data.role === "admin") {
                router.push("/admin/dashboard");
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return <LoginView onLogin={handleLogin} loading={loading} error={error} />;
}
