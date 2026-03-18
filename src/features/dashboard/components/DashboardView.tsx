"use client"

import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import Sidebar from "@/components/layout/Sidebar"


export const DashboardView = () => {
    return (
        <ProtectedLayout>
            <Sidebar isOpen={true} onClose={() => { }} navItems={[
                { label: "Dashboard", path: "/dashboard" },
                { label: "Settings", path: "/settings" },
                { label: "Profile", path: "/profile" },
            ]} />
        </ProtectedLayout>
    )
}
