import { useState, type FormEvent } from "react";
import type { Task } from "../../types/Task";
import {
    deleteTask,
    updateTaskCompletion,
    updateTaskDetails,
} from "../../services/taskService";

type TaskItemProps = {
    task: Task;
    onError: (message: string) => void;
};

function TaskItem({ task, onError }: TaskItemProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    async function handleToggleTask() {
        if (isUpdating) return;

        onError("");
        setIsUpdating(true);

        try {
            await updateTaskCompletion(task.id, !task.completed);
        } catch (error) {
            console.error(error);
            onError("No se pudo actualizar la tarea");
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleDeleteTask() {
        const confirmed = window.confirm(
            `¿Seguro que querés eliminar la tarea "${task.title}"?`
        );

        if (!confirmed || isDeleting) return;

        onError("");
        setIsDeleting(true);

        try {
            await deleteTask(task.id);
        } catch (error) {
            console.error(error);
            onError("No se pudo eliminar la tarea");
        } finally {
            setIsDeleting(false);
        }
    }

    function startEditingTask() {
        setEditTitle(task.title);
        setEditDescription(task.description);
        setIsEditing(true);
        onError("");
    }

    function cancelEditingTask() {
        setIsEditing(false);
        setEditTitle(task.title);
        setEditDescription(task.description);
    }

    async function handleEditTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSavingEdit) return;

        const trimmedTitle = editTitle.trim();

        if (!trimmedTitle) {
            onError("El título de la tarea es obligatorio");
            return;
        }

        onError("");
        setIsSavingEdit(true);

        try {
            await updateTaskDetails(
                task.id,
                trimmedTitle,
                editDescription.trim()
            );

            setIsEditing(false);
        } catch (error) {
            console.error(error);
            onError("No se pudo editar la tarea");
        } finally {
            setIsSavingEdit(false);
        }
    }

    return (
        <li
            className={`task-card ${task.completed ? "task-card--completed" : ""
                }`}
        >
            <div className="task-content">
                <div className="task-card__heading">
                    <h3>{task.title}</h3>

                    <span
                        className={`task-status ${task.completed
                                ? "task-status--completed"
                                : "task-status--pending"
                            }`}
                    >
                        {task.completed ? "Completada" : "Pendiente"}
                    </span>
                </div>

                {task.description && (
                    <p className="task-description">
                        {task.description}
                    </p>
                )}
            </div>

            {isEditing ? (
                <form
                    className="task-edit-form"
                    onSubmit={handleEditTask}
                >
                    <div className="form-field">
                        <label htmlFor={`edit-title-${task.id}`}>
                            Editar título
                        </label>

                        <input
                            id={`edit-title-${task.id}`}
                            type="text"
                            value={editTitle}
                            onChange={(event) =>
                                setEditTitle(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label
                            htmlFor={`edit-description-${task.id}`}
                        >
                            Editar descripción
                        </label>

                        <textarea
                            id={`edit-description-${task.id}`}
                            value={editDescription}
                            onChange={(event) =>
                                setEditDescription(event.target.value)
                            }
                            rows={3}
                        />
                    </div>

                    <div className="task-actions">
                        <button
                            className="button button--primary"
                            type="submit"
                            disabled={isSavingEdit}
                        >
                            {isSavingEdit
                                ? "Guardando..."
                                : "Guardar cambios"}
                        </button>

                        <button
                            className="button button--secondary"
                            type="button"
                            onClick={cancelEditingTask}
                            disabled={isSavingEdit}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    className="button button--secondary"
                    type="button"
                    onClick={startEditingTask}
                >
                    Editar
                </button>
            )}

            <div className="task-actions">
                <button
                    className="button button--secondary"
                    type="button"
                    onClick={handleToggleTask}
                    disabled={isUpdating}
                >
                    {isUpdating
                        ? "Actualizando..."
                        : task.completed
                            ? "Marcar como pendiente"
                            : "Marcar como completada"}
                </button>

                <button
                    className="button button--danger"
                    type="button"
                    onClick={handleDeleteTask}
                    disabled={isDeleting}
                >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                </button>
            </div>
        </li>
    );
}

export default TaskItem;