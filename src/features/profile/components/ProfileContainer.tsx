"use client";

import { useEffect, useState } from "react";
import ProfileView from "./ProfileView";
import { useAuth } from "@/hooks/useAuth";
import { studentService } from "@/services/student/student.service";
import { professorService } from "@/services/professor/professor.service";
import { ProfessorProfile } from "@/services/professor/professor.dto";
import { StudentProfile } from "@/services/student/student.dto";
import { checkRole } from "@/types/role";

export default function ProfileContainer() {
    const { accessToken, role, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<
        ProfessorProfile | StudentProfile | null
    >(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;

        if (!accessToken) {
            setLoading(false);
            setError("You are not signed in");
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        const fetcher =
            role === "student"
                ? studentService.getProfile(accessToken)
                : role === "professor"
                    ? professorService.getProfile(accessToken)
                    : null;

        if (!fetcher) {
            setLoading(false);
            setError("Unsupported role");
            return;
        }

        fetcher
            .then((data) => {
                if (!cancelled) setProfile(data);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err.message : "Failed to load profile",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading, role]);

    return (
        <ProfileView
            role={checkRole(role)}
            profile={profile}
            loading={loading}
            error={error}
        />
    );
}
