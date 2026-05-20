"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { CreateProjectInput } from "@/services/projects/projects.dto";

interface ProjectCreateViewProps {
    submitting: boolean;
    error: string | null;
    onSubmit: (params: CreateProjectInput) => void;
}

export default function ProjectCreateView({
    submitting,
    error,
    onSubmit,
}: ProjectCreateViewProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [slots, setSlots] = useState(1);

    return (
        <div className="w-full p-8">
            <div className="mx-auto max-w-2xl">
                <Link
                    href="/professor/projects"
                    className="text-sm text-blue-600 hover:underline"
                >
                    ← All projects
                </Link>

                <div className="mt-4 rounded-lg bg-white p-8 shadow">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        New project
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Post a research opportunity for students to apply to.
                    </p>

                    <form
                        className="mt-6 space-y-5"
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit({ title, description, slots });
                        }}
                    >
                        <div>
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Title
                            </label>
                            <Input
                                id="title"
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>
                            <Textarea
                                id="description"
                                rows={6}
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the project, goals, and any requirements..."
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="slots"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Slots
                            </label>
                            <Input
                                id="slots"
                                type="number"
                                min={1}
                                required
                                value={slots}
                                onChange={(e) => setSlots(Number(e.target.value))}
                            />
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            loading={submitting}
                            disabled={submitting}
                            fullWidth={false}
                        >
                            {submitting ? "Creating..." : "Create project"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
