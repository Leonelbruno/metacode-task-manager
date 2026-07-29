import { useState, type FormEvent } from "react";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { createTask } from "../services/taskService";

function TasksPage() {
    const [error, setError] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const { user } = useAuth();

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