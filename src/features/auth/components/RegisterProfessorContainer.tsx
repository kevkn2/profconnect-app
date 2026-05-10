"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import RegisterProfessorView, { type ProfessorRegisterFormData } from "./RegisterProfessorView";

export default function RegisterProfessorContainer() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleRegister(formData: ProfessorRegisterFormData) {
        setLoading(true);
        setError(null);

        try {
            await authService.registerProfessor(formData);
            router.push("/login?registered=true");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return <RegisterProfessorView onRegister={handleRegister} loading={loading} error={error} />;
}
