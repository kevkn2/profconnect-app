"use client"

import Sidebar from "@/components/layout/Sidebar"
import { RoleEnum } from "@/features/profile/types";

interface DashboardViewProps {
    role: RoleEnum;
}

export const DashboardView = ({ role }: DashboardViewProps) => {
    return (
        <Sidebar
            navItems={[
                { label: "Dashboard", path: `/${role}/dashboard` },
                { label: "Settings", path: `/${role}/settings` },
                { label: "Profile", path: `/${role}/profile` },
            ]}
        >
            <div className="min-h-screen w-full bg-gray-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome back. Manage your activity from here.
                    </p>
                </div>
            </div>
        </Sidebar>
    )
}
