"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RegisterRequest } from "@/services/auth.dto";
import { authService } from "@/services/auth.service";
import RegisterView from "./RegisterView";

export default function RegisterContainer() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleRegister(formData: RegisterRequest) {
        setLoading(true);
        setError(null);

        try {
            const data = await authService.register(formData);

            // Redirect to login page
            router.push("/login?registered=true");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return <RegisterView onRegister={handleRegister} loading={loading} error={error} />;
}
