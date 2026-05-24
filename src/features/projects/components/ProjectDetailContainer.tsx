"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { projectsService } from "@/services/projects/projects.service";
import { studentService } from "@/services/student/student.service";
import { professorService } from "@/services/professor/professor.service";
import {
    ProjectApplicationOutput,
    ProjectInvitationOutput,
    ProjectOutput,
    ProjectStudentBrief,
} from "@/services/projects/projects.dto";
import { checkRole } from "@/types/role";
import ProjectDetailView from "./ProjectDetailView";

interface ProjectDetailContainerProps {
    projectId: string;
}

export default function ProjectDetailContainer({ projectId }: ProjectDetailContainerProps) {
    const { accessToken, role, loading: authLoading } = useAuth();
    const [project, setProject] = useState<ProjectOutput | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [applying, setApplying] = useState(false);
    const [applyError, setApplyError] = useState<string | null>(null);
    const [applied, setApplied] = useState(false);

    const [pendingApplications, setPendingApplications] = useState<
        ProjectApplicationOutput[]
    >([]);
    const [approvedApplications, setApprovedApplications] = useState<
        ProjectApplicationOutput[]
    >([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [applicationsError, setApplicationsError] = useState<string | null>(null);
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);

    const [invitations, setInvitations] = useState<ProjectInvitationOutput[]>([]);
    const [invitationsLoading, setInvitationsLoading] = useState(false);
    const [invitationsError, setInvitationsError] = useState<string | null>(null);
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const [students, setStudents] = useState<ProjectStudentBrief[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState<string | null>(null);

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

        projectsService
            .getProject(projectId, accessToken)
            .then((data) => {
                if (!cancelled) setProject(data);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Failed to load project");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading, projectId]);

    useEffect(() => {
        if (authLoading || !accessToken || role !== "professor") return;

        let cancelled = false;
        setApplicationsLoading(true);
        setApplicationsError(null);

        professorService
            .listProjectApplications(projectId, accessToken)
            .then((data) => {
                if (cancelled) return;
                setPendingApplications(data.pending_applications ?? []);
                setApprovedApplications(data.approved_applications ?? []);
            })
            .catch((err) => {
                if (!cancelled) {
                    setApplicationsError(
                        err instanceof Error ? err.message : "Failed to load applications",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setApplicationsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading, projectId, role]);

    useEffect(() => {
        if (authLoading || !accessToken || role !== "professor") return;

        let cancelled = false;
        setStudentsLoading(true);
        setStudentsError(null);

        professorService
            .listStudents(accessToken)
            .then((data) => {
                if (!cancelled) setStudents(data.students ?? []);
            })
            .catch((err) => {
                if (!cancelled) {
                    setStudentsError(
                        err instanceof Error ? err.message : "Failed to load students",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setStudentsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading, role]);

    useEffect(() => {
        if (authLoading || !accessToken || role !== "professor") return;

        let cancelled = false;
        setInvitationsLoading(true);
        setInvitationsError(null);

        professorService
            .listProjectInvitations(projectId, accessToken)
            .then((data) => {
                if (!cancelled) setInvitations(data.invitations ?? []);
            })
            .catch((err) => {
                if (!cancelled) {
                    setInvitationsError(
                        err instanceof Error ? err.message : "Failed to load invitations",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setInvitationsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading, projectId, role]);

    useEffect(() => {
        if (authLoading || !accessToken || role !== "student") return;

        let cancelled = false;

        studentService
            .checkApplicationStatus(projectId, accessToken)
            .then((data) => {
                if (cancelled) return;
                setApplied(data.exists);
            })
            .catch((err) => {
                if (!cancelled) {
                    setApplicationsError(
                        err instanceof Error ? err.message : "Failed to load applications",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setApplicationsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [accessToken, authLoading, projectId, role]);

    async function handleApply(message: string) {
        if (!accessToken) return;
        setApplying(true);
        setApplyError(null);
        try {
            await studentService.applyToProject(projectId, { message }, accessToken);
            setApplied(true);
        } catch (err) {
            setApplyError(err instanceof Error ? err.message : "Failed to apply");
        } finally {
            setApplying(false);
        }
    }

    async function handleInvite(studentId: string, message: string) {
        if (!accessToken) return;
        setInviting(true);
        setInviteError(null);
        try {
            const created = await professorService.sendInvitation(
                projectId,
                { student_id: studentId, message },
                accessToken,
            );
            setInvitations((prev) => [created, ...prev]);
        } catch (err) {
            setInviteError(err instanceof Error ? err.message : "Failed to send invitation");
            throw err;
        } finally {
            setInviting(false);
        }
    }

    async function handleCancelInvitation(invitationId: string) {
        if (!accessToken) return;
        setCancellingId(invitationId);
        setInviteError(null);
        try {
            await professorService.cancelInvitation(projectId, invitationId, accessToken);
            setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
        } catch (err) {
            setInviteError(
                err instanceof Error ? err.message : "Failed to cancel invitation",
            );
        } finally {
            setCancellingId(null);
        }
    }

    async function handleReview(applicationId: string, status: "approved" | "rejected") {
        if (!accessToken) return;
        setReviewingId(applicationId);
        setReviewError(null);
        try {
            const updated = await professorService.reviewApplication(
                projectId,
                applicationId,
                { status },
                accessToken,
            );
            const reviewed = pendingApplications.find((a) => a.id === applicationId);
            setPendingApplications((prev) => prev.filter((a) => a.id !== applicationId));
            if (status === "approved" && reviewed) {
                setApprovedApplications((prev) => [...prev, { ...reviewed, ...updated }]);
            }
        } catch (err) {
            setReviewError(
                err instanceof Error ? err.message : "Failed to review application",
            );
        } finally {
            setReviewingId(null);
        }
    }

    return (
        <ProjectDetailView
            role={checkRole(role)}
            project={project}
            loading={loading}
            error={error}
            applying={applying}
            applyError={applyError}
            applied={applied}
            onApply={handleApply}
            pendingApplications={pendingApplications}
            approvedApplications={approvedApplications}
            applicationsLoading={applicationsLoading}
            applicationsError={applicationsError}
            reviewingId={reviewingId}
            reviewError={reviewError}
            onReview={handleReview}
            invitations={invitations}
            invitationsLoading={invitationsLoading}
            invitationsError={invitationsError}
            inviting={inviting}
            inviteError={inviteError}
            cancellingInvitationId={cancellingId}
            onInvite={handleInvite}
            onCancelInvitation={handleCancelInvitation}
            students={students}
            studentsLoading={studentsLoading}
            studentsError={studentsError}
        />
    );
}
