import type { FormEvent } from "react";

type TaskFormProps = {
    title: string;
    description: string;
    isCreating: boolean;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function TaskForm({
    title,
    description,
    isCreating,
    onTitleChange,
    onDescriptionChange,
    onSubmit,
}: TaskFormProps) {
    return (
        <form onSubmit={onSubmit}>
            <div>
                <label htmlFor="title">Título</label>

                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="description">Descripción</label>

                <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                        onDescriptionChange(event.target.value)
                    }
                />
            </div>

            <button type="submit" disabled={isCreating}>
                {isCreating ? "Creando tarea..." : "Agregar tarea"}
            </button>
        </form>
    );
}

export default TaskForm;