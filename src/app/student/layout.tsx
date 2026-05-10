import Sidebar from "@/components/layout/Sidebar";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

const studentNavItems = [
    { label: "Dashboard", path: "/student/dashboard" },
    { label: "Settings", path: "/student/settings" },
    { label: "Profile", path: "/student/profile" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedLayout>
            <Sidebar navItems={studentNavItems}>{children}</Sidebar>
        </ProtectedLayout>
    );
}
