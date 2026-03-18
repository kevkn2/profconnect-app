"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LoginRequest } from "@/services/auth.dto";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import LoginView from "./LoginView";

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

            // Use auth provider to set token
            login(data.token);

            // Redirect to dashboard
            router.push("/dashboard");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return <LoginView onLogin={handleLogin} loading={loading} error={error} />;
}
