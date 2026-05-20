"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { studentService } from "@/services/student/student.service";
import { ProjectApplicationOutput } from "@/services/projects/projects.dto";
import MyApplicationsView from "./MyApplicationsView";

export default function MyApplicationsContainer() {
    const { accessToken, loading: authLoading } = useAuth();
    const [applications, setApplications] = useState<ProjectApplicationOutput[]>([]);
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

        studentService
            .listMyApplications(accessToken)
            .then((data) => {
                if (!cancelled) setApplications(data.applications ?? []);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load applications");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading]);

    return (
        <MyApplicationsView
            applications={applications}
            loading={loading}
            error={error}
        />
    );
}
