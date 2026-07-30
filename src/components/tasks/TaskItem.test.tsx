import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import TaskItem from "./TaskItem";
import type { Task } from "../../types/Task";

import {
    updateTaskCompletion,
    updateTaskDetails,
} from "../../services/taskService";

vi.mock("../../services/taskService", () => ({
    deleteTask: vi.fn(),
    updateTaskCompletion: vi.fn(),
    updateTaskDetails: vi.fn(),
}));

const task: Task = {
    id: "task-1",
    title: "Estudiar testing",
    description: "Practicar Vitest",
    completed: false,
    userId: "user-1",
    createdAt: null,
};

describe("TaskItem", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("marca una tarea pendiente como completada", async () => {
        const user = userEvent.setup();
        const handleError = vi.fn();

        render(
            <TaskItem
                task={task}
                onError={handleError}
            />
        );

        await user.click(
            screen.getByRole("button", {
                name: /marcar como completada/i,
            })
        );

        await waitFor(() => {
            expect(updateTaskCompletion).toHaveBeenCalledWith(
                "task-1",
                true
            );
        });

        expect(updateTaskCompletion).toHaveBeenCalledTimes(1);
    });

    it("muestra un error cuando no puede actualizar la tarea", async () => {
        const user = userEvent.setup();
        const handleError = vi.fn();

        vi.mocked(updateTaskCompletion).mockRejectedValueOnce(
            new Error("Error de Firebase")
        );

        vi.spyOn(console, "error").mockImplementation(() => { });

        render(
            <TaskItem
                task={task}
                onError={handleError}
            />
        );

        await user.click(
            screen.getByRole("button", {
                name: /marcar como completada/i,
            })
        );

        await waitFor(() => {
            expect(handleError).toHaveBeenLastCalledWith(
                "No se pudo actualizar la tarea"
            );
        });
    });

    it("permite editar el título y la descripción", async () => {
        const user = userEvent.setup();
        const handleError = vi.fn();

        render(
            <TaskItem
                task={task}
                onError={handleError}
            />
        );

        await user.click(
            screen.getByRole("button", {
                name: /^editar$/i,
            })
        );

        const titleInput = screen.getByRole("textbox", {
            name: /editar título/i,
        });

        const descriptionInput = screen.getByRole("textbox", {
            name: /editar descripción/i,
        });

        await user.clear(titleInput);
        await user.type(titleInput, "Aprender testing");

        await user.clear(descriptionInput);
        await user.type(
            descriptionInput,
            "Practicar React Testing Library"
        );

        await user.click(
            screen.getByRole("button", {
                name: /guardar cambios/i,
            })
        );

        await waitFor(() => {
            expect(updateTaskDetails).toHaveBeenCalledWith(
                "task-1",
                "Aprender testing",
                "Practicar React Testing Library"
            );
        });

        expect(updateTaskDetails).toHaveBeenCalledTimes(1);
    });
});