import { useState, type FormEvent } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import TaskForm from "./TaskForm";

type TaskFormTestWrapperProps = {
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function TaskFormTestWrapper({
    onSubmit,
}: TaskFormTestWrapperProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    return (
        <TaskForm
            title={title}
            description={description}
            isCreating={false}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onSubmit={onSubmit}
        />
    );
}

describe("TaskForm", () => {
    it("permite escribir y enviar el formulario", async () => {
        const user = userEvent.setup();

        const handleSubmit = vi.fn(
            (event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
            }
        );

        render(
            <TaskFormTestWrapper onSubmit={handleSubmit} />
        );

        const titleInput = screen.getByRole("textbox", {
            name: /título/i,
        });

        const descriptionInput = screen.getByRole("textbox", {
            name: /descripción/i,
        });

        await user.type(titleInput, "Estudiar testing");
        await user.type(
            descriptionInput,
            "Practicar Vitest y Testing Library"
        );

        expect(titleInput).toHaveValue("Estudiar testing");

        expect(descriptionInput).toHaveValue(
            "Practicar Vitest y Testing Library"
        );

        await user.click(
            screen.getByRole("button", {
                name: /agregar tarea/i,
            })
        );

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it("deshabilita el botón mientras crea la tarea", () => {
        render(
            <TaskForm
                title=""
                description=""
                isCreating={true}
                onTitleChange={vi.fn()}
                onDescriptionChange={vi.fn()}
                onSubmit={vi.fn()}
            />
        );

        const button = screen.getByRole("button", {
            name: /creando tarea/i,
        });

        expect(button).toBeDisabled();
        expect(button).toHaveTextContent("Creando tarea...");
    });
});