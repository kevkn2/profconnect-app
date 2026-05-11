export type RoleEnum = "student" | "professor" | "admin";

export function checkRole(role: string | null): RoleEnum {
    if (role === "student" || role === "professor" || role === "admin") {
        return role;
    }
    throw new Error("Invalid user role");
}
