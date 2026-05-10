"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
    label: string;
    path: string;
    icon?: React.ReactNode;
}

interface SidebarProps {
    navItems: NavItem[];
    children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, children }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="flex min-h-screen w-full overflow-hidden">
            <aside className="flex min-h-screen w-64 flex-shrink-0 flex-col bg-white shadow-lg">
                <div className="border-b p-4">
                    <h2 className="text-lg font-semibold">Menu</h2>
                </div>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.path);

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`
                                    flex items-center gap-2 rounded-md px-3 py-2
                                    text-sm font-medium transition
                                    ${isActive
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }
                                `}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t p-4">
                    <button
                        onClick={handleLogout}
                        className="
                            flex w-full items-center justify-center gap-2
                            rounded-md bg-red-500 px-4 py-2
                            text-sm font-medium text-white
                            hover:bg-red-600 transition
                        "
                    >
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 w-full overflow-y-auto bg-gray-50">
                {children}
            </main>
        </div>
    );
};

export default Sidebar;
