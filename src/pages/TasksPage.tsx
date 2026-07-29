import { useEffect, useState, type FormEvent } from "react";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { createTask, deleteTask, subscribeToTasks, updateTaskCompletion } from "../services/taskService";
import type { Task } from "../types/Task";


function TasksPage() {
    const [error, setError] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [updatingTaskId, setUpdatingTaskId] =
        useState<string | null>(null);
    const [deletingTaskId, setDeletingTaskId] =
        useState<string | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setTasks([]);
            setIsLoadingTasks(false);
            return;
        }

        setIsLoadingTasks(true);

        const unsubscribe = subscribeToTasks(
            user.uid,

            (receivedTasks) => {
                setTasks(receivedTasks);
                setIsLoadingTasks(false);
            },

            (error) => {
                console.error(error);
                setError("No se pudieron cargar las tareas");
                setIsLoadingTasks(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user]);

    async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isCreating) return;

        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            setError("El título de la tarea es obligatorio");
            return;
        }

        if (!user) {
            setError("No se encontró el usuario autenticado");
            return;
        }

        setError("");
        setIsCreating(true);

        try {
            await createTask(
                trimmedTitle,
                description.trim(),
                user.uid
            );

            setTitle("");
            setDescription("");
        } catch (error) {
            console.error(error);
            setError("No se pudo crear la tarea");
        } finally {
            setIsCreating(false);
        }
    }

    async function handleToggleTask(task: Task) {
        if (updatingTaskId) return;

        setError("");
        setUpdatingTaskId(task.id);

        try {
            await updateTaskCompletion(
                task.id,
                !task.completed
            );
        } catch (error) {
            console.error(error);
            setError("No se pudo actualizar la tarea");
        } finally {
            setUpdatingTaskId(null);
        }
    }

    async function handleDeleteTask(task: Task) {
        const confirmed = window.confirm(
            `¿Seguro que querés eliminar la tarea "${task.title}"?`
        );

        if (!confirmed || deletingTaskId) return;

        setError("");
        setDeletingTaskId(task.id);

        try {
            await deleteTask(task.id);
        } catch (error) {
            console.error(error);
            setError("No se pudo eliminar la tarea");
        } finally {
            setDeletingTaskId(null);
        }
    }

    async function handleLogout() {
        if (isLoggingOut) return;

        setError("");
        setIsLoggingOut(true);

        try {
            await logoutUser();
        } catch (error) {
            console.error(error);
            setError("No se pudo cerrar la sesión");
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <main>
            <h1>Mis tareas</h1>
            <p>Aquí aparecerán tus tareas</p>
            <form onSubmit={handleCreateTask}>
                <div>
                    <label htmlFor="title">Título</label>

                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description">Descripción</label>

                    <textarea
                        id="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </div>

                <button type="submit" disabled={isCreating}>
                    {isCreating ? "Creando tarea..." : "Agregar tarea"}
                </button>
            </form>

            {error && <p role="alert">{error}</p>}

            <section>
                <h2>Lista de tareas</h2>

                {isLoadingTasks && <p>Cargando tareas...</p>}

                {!isLoadingTasks && tasks.length === 0 && (
                    <p>Todavía no tenés tareas.</p>
                )}

                {!isLoadingTasks && tasks.length > 0 && (
                    <ul>
                        {tasks.map((task) => (
                            <li key={task.id}>
                                <h3>{task.title}</h3>

                                {task.description && <p>{task.description}</p>}

                                <p>
                                    Estado: {task.completed ? "Completada" : "Pendiente"}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => handleToggleTask(task)}
                                    disabled={updatingTaskId !== null}
                                >
                                    {updatingTaskId === task.id
                                        ? "Actualizando..."
                                        : task.completed
                                            ? "Marcar como pendiente"
                                            : "Marcar como completada"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDeleteTask(task)}
                                    disabled={deletingTaskId !== null}
                                >
                                    {deletingTaskId === task.id
                                        ? "Eliminando..."
                                        : "Eliminar"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>
        </main>
    );
}

export default TasksPage;