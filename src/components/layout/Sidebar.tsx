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
    isOpen: boolean;
    onClose: () => void;
    navItems: NavItem[] | null;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    navItems,
}) => {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = () => {
        // Example: clear auth
        logout();
        router.push("/login");
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/40"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">Menu</h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1 p-4">
                    {navItems?.map((item) => {
                        const isActive = pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={onClose}
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

                {/* Footer */}
                <div className="mt-auto border-t p-4">
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
        </>
    );
};

export default Sidebar;