"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Textarea from "@/components/ui/Textarea";
import {
    ProjectApplicationOutput,
    ProjectOutput,
} from "@/services/projects/projects.dto";
import { RoleEnum } from "@/types/role";
import ApplicantCard from "./ApplicantCard";

interface ProjectDetailViewProps {
    role: RoleEnum;
    project: ProjectOutput | null;
    loading: boolean;
    error: string | null;
    applying: boolean;
    applyError: string | null;
    applied: boolean;
    onApply?: (message: string) => void;
    pendingApplications: ProjectApplicationOutput[];
    approvedApplications: ProjectApplicationOutput[];
    applicationsLoading: boolean;
    applicationsError: string | null;
    reviewingId: string | null;
    reviewError: string | null;
    onReview?: (applicationId: string, status: "approved" | "rejected") => void;
}

interface ApplicantsSectionProps {
    title: string;
    applications: ProjectApplicationOutput[];
    emptyLabel: string;
    reviewingId: string | null;
    onReview?: (applicationId: string, status: "approved" | "rejected") => void;
}

function ApplicantsSection({
    title,
    applications,
    emptyLabel,
    reviewingId,
    onReview,
}: ApplicantsSectionProps) {
    return (
        <div>
            <div className="flex items-baseline justify-between">
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <span className="text-xs text-gray-500">{applications.length}</span>
            </div>

            {applications.length === 0 ? (
                <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                    <p className="text-sm text-gray-500">{emptyLabel}</p>
                </div>
            ) : (
                <ul className="mt-3 space-y-4">
                    {applications.map((app) => (
                        <ApplicantCard
                            key={app.id}
                            application={app}
                            busy={reviewingId === app.id}
                            onReview={onReview}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function ProjectDetailView({
    role,
    project,
    loading,
    error,
    applying,
    applyError,
    applied,
    onApply,
    pendingApplications,
    approvedApplications,
    applicationsLoading,
    applicationsError,
    reviewingId,
    reviewError,
    onReview,
}: ProjectDetailViewProps) {
    const [message, setMessage] = useState("");

    if (loading) {
        return (
            <div className="flex w-full justify-center p-12">
                <Spinner size={24} />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="w-full p-8">
                <div className="mx-auto max-w-3xl rounded-md bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-800">
                        {error ?? "Project not found"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-8">
            <div className="mx-auto max-w-3xl">
                <Link
                    href={role === "professor" ? "/professor/projects" : "/student/projects"}
                    className="text-sm text-blue-600 hover:underline"
                >
                    ← All projects
                </Link>

                <div className="mt-4 rounded-lg bg-white p-8 shadow">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            {project.title}
                        </h1>
                        <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                project.status === "open"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {project.status}
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        {project.slots} slot{project.slots === 1 ? "" : "s"} available
                    </p>

                    <div className="mt-6">
                        <h2 className="text-sm font-medium text-gray-500">Description</h2>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                            {project.description}
                        </p>
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <h2 className="text-sm font-medium text-gray-500">Professor</h2>
                        <p className="mt-2 text-sm text-gray-900">{project.professor.name}</p>
                        <p className="text-xs text-gray-500">
                            {project.professor.department} · {project.professor.university}
                        </p>
                        <p className="text-xs text-gray-500">{project.professor.email}</p>
                    </div>

                    {role === "student" && (
                        <div className="mt-8 border-t border-gray-100 pt-6">
                            <h2 className="text-base font-semibold text-gray-900">
                                Apply to this project
                            </h2>

                            {applied && (
                                <div className="mt-4 rounded-md bg-green-50 p-4">
                                    <p className="text-sm font-medium text-green-800">
                                        Application submitted. You can track it under My
                                        Applications.
                                    </p>
                                </div>
                            )}

                            {!applied && (
                                <form
                                    className="mt-4 space-y-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        onApply?.(message);
                                    }}
                                >
                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Message to the professor
                                        </label>
                                        <Textarea
                                            id="message"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={5}
                                            required
                                            placeholder="Briefly explain why you're a good fit..."
                                        />
                                    </div>

                                    {applyError && (
                                        <div className="rounded-md bg-red-50 p-3">
                                            <p className="text-sm font-medium text-red-800">
                                                {applyError}
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        loading={applying}
                                        disabled={applying || message.trim() === ""}
                                        fullWidth={false}
                                    >
                                        {applying ? "Submitting..." : "Submit application"}
                                    </Button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {role === "professor" && (
                    <div className="mt-8 space-y-8">
                        <h2 className="text-xl font-semibold text-gray-900">Applicants</h2>

                        {applicationsLoading && (
                            <div className="flex justify-center">
                                <Spinner size={24} />
                            </div>
                        )}

                        {!applicationsLoading && applicationsError && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">
                                    {applicationsError}
                                </p>
                            </div>
                        )}

                        {reviewError && (
                            <div className="rounded-md bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">{reviewError}</p>
                            </div>
                        )}

                        {!applicationsLoading && !applicationsError && (
                            <>
                                <ApplicantsSection
                                    title="Pending"
                                    applications={pendingApplications}
                                    emptyLabel="No pending applications."
                                    reviewingId={reviewingId}
                                    onReview={onReview}
                                />
                                <ApplicantsSection
                                    title="Approved"
                                    applications={approvedApplications}
                                    emptyLabel="No approved applicants yet."
                                    reviewingId={reviewingId}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
