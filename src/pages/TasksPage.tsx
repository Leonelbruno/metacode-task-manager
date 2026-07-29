import { useEffect, useState, type FormEvent } from "react";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { createTask, subscribeToTasks, } from "../services/taskService";
import type { Task } from "../types/Task";
import TaskForm from "../components/tasks/TaskForm";
import TaskItem from "../components/tasks/TaskItem";


function TasksPage() {
    const [error, setError] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);

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
            <TaskForm
                title={title}
                description={description}
                isCreating={isCreating}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onSubmit={handleCreateTask}
            />

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
                            <TaskItem
                                key={task.id}
                                task={task}
                                onError={setError}
                            />
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