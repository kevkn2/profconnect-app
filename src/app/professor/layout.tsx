import Sidebar from "@/components/layout/Sidebar";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

const professorNavItems = [
    { label: "Dashboard", path: "/professor/dashboard" },
    { label: "Projects", path: "/professor/projects" },
    { label: "Settings", path: "/professor/settings" },
    { label: "Profile", path: "/professor/profile" },
];

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedLayout>
            <Sidebar navItems={professorNavItems}>{children}</Sidebar>
        </ProtectedLayout>
    );
}
