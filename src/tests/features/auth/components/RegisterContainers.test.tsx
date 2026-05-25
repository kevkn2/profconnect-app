import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const routerPush = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: routerPush }),
}));

vi.mock("@/services/auth/auth.service", () => ({
    authService: {
        register: vi.fn(),
        registerStudent: vi.fn(),
        registerProfessor: vi.fn(),
    },
}));

import { authService } from "@/services/auth/auth.service";
import RegisterContainer from "@/features/auth/components/RegisterContainer";
import RegisterStudentContainer from "@/features/auth/components/RegisterStudentContainer";
import RegisterProfessorContainer from "@/features/auth/components/RegisterProfessorContainer";

const registerMock = vi.mocked(authService.register);
const registerStudentMock = vi.mocked(authService.registerStudent);
const registerProfessorMock = vi.mocked(authService.registerProfessor);

async function fillCommonFields(
    user: ReturnType<typeof userEvent.setup>,
    overrides: { name?: string; email?: string; password?: string } = {},
) {
    await user.type(screen.getByLabelText(/full name/i), overrides.name ?? "Alice");
    await user.type(screen.getByLabelText(/email address/i), overrides.email ?? "alice@u.edu");
    await user.type(screen.getByLabelText(/^password$/i), overrides.password ?? "secret123");
}

describe("RegisterContainer (admin)", () => {
    beforeEach(() => {
        routerPush.mockReset();
        registerMock.mockReset();
    });
    afterEach(() => vi.clearAllMocks());

    it("submits the form to authService.register and pushes to /login on success", async () => {
        const user = userEvent.setup();
        registerMock.mockResolvedValue({ message: "ok", user_id: "u-1" });

        render(<RegisterContainer />);
        await fillCommonFields(user);
        await user.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            expect(registerMock).toHaveBeenCalledWith({
                name: "Alice",
                email: "alice@u.edu",
                password: "secret123",
            });
        });
        await waitFor(() => {
            expect(routerPush).toHaveBeenCalledWith("/login?registered=true");
        });
    });

    it("surfaces backend errors and does NOT redirect", async () => {
        const user = userEvent.setup();
        registerMock.mockRejectedValue(new Error("email taken"));

        render(<RegisterContainer />);
        await fillCommonFields(user);
        await user.click(screen.getByRole("button", { name: /sign up/i }));

        expect(await screen.findByText("email taken")).toBeInTheDocument();
        expect(routerPush).not.toHaveBeenCalled();
    });
});

describe("RegisterStudentContainer", () => {
    beforeEach(() => {
        routerPush.mockReset();
        registerStudentMock.mockReset();
    });
    afterEach(() => vi.clearAllMocks());

    it("submits all student fields and pushes to /login on success", async () => {
        const user = userEvent.setup();
        registerStudentMock.mockResolvedValue({ message: "ok", user_id: "u-2" });

        render(<RegisterStudentContainer />);
        await fillCommonFields(user, { name: "Bob", email: "bob@u.edu" });
        await user.type(screen.getByLabelText(/university/i), "MIT");
        await user.type(screen.getByLabelText(/department/i), "CS");
        await user.type(screen.getByLabelText(/research interests/i), "AI");

        await user.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            expect(registerStudentMock).toHaveBeenCalledWith({
                name: "Bob",
                email: "bob@u.edu",
                password: "secret123",
                university: "MIT",
                department: "CS",
                research_interests: "AI",
            });
        });
        await waitFor(() =>
            expect(routerPush).toHaveBeenCalledWith("/login?registered=true"),
        );
    });

    it("surfaces backend errors", async () => {
        const user = userEvent.setup();
        registerStudentMock.mockRejectedValue(new Error("weak password"));

        render(<RegisterStudentContainer />);
        await fillCommonFields(user);
        await user.type(screen.getByLabelText(/university/i), "MIT");
        await user.type(screen.getByLabelText(/department/i), "CS");
        await user.type(screen.getByLabelText(/research interests/i), "AI");
        await user.click(screen.getByRole("button", { name: /sign up/i }));

        expect(await screen.findByText("weak password")).toBeInTheDocument();
        expect(routerPush).not.toHaveBeenCalled();
    });
});

describe("RegisterProfessorContainer", () => {
    beforeEach(() => {
        routerPush.mockReset();
        registerProfessorMock.mockReset();
    });
    afterEach(() => vi.clearAllMocks());

    it("submits professor fields (no research_interests) and pushes to /login on success", async () => {
        const user = userEvent.setup();
        registerProfessorMock.mockResolvedValue({ message: "ok", user_id: "u-3" });

        render(<RegisterProfessorContainer />);
        await fillCommonFields(user, { name: "Dr. Smith", email: "smith@u.edu" });
        await user.type(screen.getByLabelText(/university/i), "Stanford");
        await user.type(screen.getByLabelText(/department/i), "Physics");

        await user.click(screen.getByRole("button", { name: /sign up/i }));

        await waitFor(() => {
            expect(registerProfessorMock).toHaveBeenCalledWith({
                name: "Dr. Smith",
                email: "smith@u.edu",
                password: "secret123",
                university: "Stanford",
                department: "Physics",
            });
        });
        await waitFor(() =>
            expect(routerPush).toHaveBeenCalledWith("/login?registered=true"),
        );
    });

    it("falls back to 'An error occurred' on non-Error rejections", async () => {
        const user = userEvent.setup();
        registerProfessorMock.mockRejectedValue("weird");

        render(<RegisterProfessorContainer />);
        await fillCommonFields(user);
        await user.type(screen.getByLabelText(/university/i), "Stanford");
        await user.type(screen.getByLabelText(/department/i), "Physics");
        await user.click(screen.getByRole("button", { name: /sign up/i }));

        expect(
            await screen.findByText(/an error occurred/i),
        ).toBeInTheDocument();
    });
});
