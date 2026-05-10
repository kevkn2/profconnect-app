"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth/auth.service";
import RegisterStudentView, { type StudentRegisterFormData } from "./RegisterStudentView";

export default function RegisterStudentContainer() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleRegister(formData: StudentRegisterFormData) {
        setLoading(true);
        setError(null);

        try {
            await authService.registerStudent(formData);
            router.push("/login?registered=true");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return <RegisterStudentView onRegister={handleRegister} loading={loading} error={error} />;
}
