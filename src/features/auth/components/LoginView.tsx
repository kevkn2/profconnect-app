"use client";

import { useState } from "react";
import type { LoginRequest } from "@/services/auth.dto";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

interface LoginViewProps {
    onLogin: (formData: LoginRequest) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export default function LoginView({ onLogin, loading, error }: LoginViewProps) {
    const [formData, setFormData] = useState<LoginRequest>({
        email: "",
        password: "",
    });

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        await onLogin(formData);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Sign in to ProfConnect
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Connect with professionals and grow your network
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm mt-1"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm mt-1"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" disabled={loading}>
                        {loading ? <Spinner size={18} /> : "Sign in"}
                    </Button>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Sign up
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
