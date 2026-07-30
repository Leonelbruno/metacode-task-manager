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
        <form className="task-form" onSubmit={onSubmit}>
            <div className="form-field">
                <label htmlFor="title">Título</label>

                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                        onTitleChange(event.target.value)
                    }
                    placeholder="Ejemplo: Estudiar testing"
                    required
                />
            </div>

            <div className="form-field">
                <label htmlFor="description">
                    Descripción
                    <span className="optional-label">Opcional</span>
                </label>

                <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                        onDescriptionChange(event.target.value)
                    }
                    placeholder="Agregá más detalles sobre la tarea"
                    rows={4}
                />
            </div>

            <button
                className="button button--primary button--full"
                type="submit"
                disabled={isCreating}
            >
                {isCreating ? "Creando tarea..." : "Agregar tarea"}
            </button>
        </form>
    );
}

export default TaskForm;