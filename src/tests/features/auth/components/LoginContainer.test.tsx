import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/hooks/useAuth", () => ({
    useAuth: vi.fn(),
}));

vi.mock("@/services/auth/auth.service", () => ({
    authService: {
        login: vi.fn(),
    },
}));

import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth/auth.service";
import LoginContainer from "@/features/auth/components/LoginContainer";

const useAuthMock = vi.mocked(useAuth);
const loginServiceMock = vi.mocked(authService.login);
const authLoginFn = vi.fn();

function defaultAuth() {
    useAuthMock.mockReturnValue({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        role: null,
        loading: false,
        login: authLoginFn,
        logout: vi.fn(),
    });
}

describe("LoginContainer", () => {
    beforeEach(() => {
        routerPush.mockReset();
        useAuthMock.mockReset();
        loginServiceMock.mockReset();
        authLoginFn.mockReset();
        defaultAuth();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("calls authService.login with the entered credentials and persists the tokens", async () => {
        const user = userEvent.setup();
        loginServiceMock.mockResolvedValue({
            accessToken: "a",
            refreshToken: "r",
            role: "professor",
            type: "Bearer",
        });

        render(<LoginContainer />);

        await user.type(screen.getByLabelText(/email/i), "me@u.edu");
        await user.type(screen.getByLabelText(/password/i), "secret");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(loginServiceMock).toHaveBeenCalledWith({
                email: "me@u.edu",
                password: "secret",
            });
        });
        expect(authLoginFn).toHaveBeenCalledWith("a", "r", "professor");
    });

    it("routes professors to /professor/dashboard", async () => {
        const user = userEvent.setup();
        loginServiceMock.mockResolvedValue({
            accessToken: "a",
            refreshToken: "r",
            role: "professor",
            type: "Bearer",
        });

        render(<LoginContainer />);

        await user.type(screen.getByLabelText(/email/i), "p@u");
        await user.type(screen.getByLabelText(/password/i), "x");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() =>
            expect(routerPush).toHaveBeenCalledWith("/professor/dashboard"),
        );
    });

    it("routes students to /student/dashboard", async () => {
        const user = userEvent.setup();
        loginServiceMock.mockResolvedValue({
            accessToken: "a",
            refreshToken: "r",
            role: "student",
            type: "Bearer",
        });

        render(<LoginContainer />);

        await user.type(screen.getByLabelText(/email/i), "s@u");
        await user.type(screen.getByLabelText(/password/i), "x");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() =>
            expect(routerPush).toHaveBeenCalledWith("/student/dashboard"),
        );
    });

    it("routes admins to /admin/dashboard", async () => {
        const user = userEvent.setup();
        loginServiceMock.mockResolvedValue({
            accessToken: "a",
            refreshToken: "r",
            role: "admin",
            type: "Bearer",
        });

        render(<LoginContainer />);

        await user.type(screen.getByLabelText(/email/i), "a@u");
        await user.type(screen.getByLabelText(/password/i), "x");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() =>
            expect(routerPush).toHaveBeenCalledWith("/admin/dashboard"),
        );
    });

    it("does NOT redirect when the role comes back unknown", async () => {
        const user = userEvent.setup();
        loginServiceMock.mockResolvedValue({
            accessToken: "a",
            refreshToken: "r",
            role: "ghost",
            type: "Bearer",
        });

        render(<LoginContainer />);

        await user.type(screen.getByLabelText(/email/i), "x@u");
        await user.type(screen.getByLabelText(/password/i), "x");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => expect(authLoginFn).toHaveBeenCalled());
        expect(routerPush).not.toHaveBeenCalled();
    });

    it("surfaces the thrown error message and does not redirect", async () => {
        const user = userEvent.setup();
        loginServiceMock.mockRejectedValue(new Error("invalid credentials"));

        render(<LoginContainer />);

        await user.type(screen.getByLabelText(/email/i), "x@u");
        await user.type(screen.getByLabelText(/password/i), "wrong");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        expect(await screen.findByText("invalid credentials")).toBeInTheDocument();
        expect(routerPush).not.toHaveBeenCalled();
        expect(authLoginFn).not.toHaveBeenCalled();
    });

    it("falls back to 'An error occurred' for non-Error rejections", async () => {
        const user = userEvent.setup();
        loginServiceMock.mockRejectedValue("weird");

        render(<LoginContainer />);

        await user.type(screen.getByLabelText(/email/i), "x@u");
        await user.type(screen.getByLabelText(/password/i), "x");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        expect(
            await screen.findByText(/an error occurred/i),
        ).toBeInTheDocument();
    });
});
