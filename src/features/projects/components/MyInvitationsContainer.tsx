"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { studentService } from "@/services/student/student.service";
import {
    InvitationResponseStatus,
    ProjectInvitationOutput,
} from "@/services/projects/projects.dto";
import MyInvitationsView from "./MyInvitationsView";

export default function MyInvitationsContainer() {
    const { accessToken, loading: authLoading } = useAuth();
    const [invitations, setInvitations] = useState<ProjectInvitationOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [respondingId, setRespondingId] = useState<string | null>(null);
    const [respondError, setRespondError] = useState<string | null>(null);

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
            .listMyInvitations(accessToken)
            .then((data) => {
                if (!cancelled) setInvitations(data.invitations ?? []);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err.message : "Failed to load invitations",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading]);

    async function handleRespond(
        invitationId: string,
        status: InvitationResponseStatus,
    ) {
        if (!accessToken) return;
        setRespondingId(invitationId);
        setRespondError(null);
        try {
            const updated = await studentService.respondInvitation(
                invitationId,
                { status },
                accessToken,
            );
            setInvitations((prev) =>
                prev.map((inv) =>
                    inv.id === invitationId ? { ...inv, ...updated } : inv,
                ),
            );
        } catch (err) {
            setRespondError(
                err instanceof Error ? err.message : "Failed to respond to invitation",
            );
        } finally {
            setRespondingId(null);
        }
    }

    return (
        <MyInvitationsView
            invitations={invitations}
            loading={loading}
            error={error}
            respondingId={respondingId}
            respondError={respondError}
            onRespond={handleRespond}
        />
    );
}
