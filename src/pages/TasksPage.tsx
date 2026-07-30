import { useEffect, useState, type FormEvent } from "react";
import { logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { createTask, subscribeToTasks, } from "../services/taskService";
import type { Task } from "../types/Task";
import TaskForm from "../components/tasks/TaskForm";
import TaskItem from "../components/tasks/TaskItem";
import { sendTaskSummary } from "../services/emailService";


function TasksPage() {
    const [error, setError] = useState("");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [isSendingSummary, setIsSendingSummary] = useState(false);
    const [summaryMessage, setSummaryMessage] = useState("");

    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

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

    async function handleCreateTask(
        event: FormEvent<HTMLFormElement>
    ) {
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

    async function handleSendSummary() {
        if (isSendingSummary) return;

        if (!user?.email) {
            setError("No se encontró el correo del usuario");
            return;
        }

        setError("");
        setSummaryMessage("");
        setIsSendingSummary(true);

        try {
            const message = await sendTaskSummary(
                user.email,
                tasks
            );

            setSummaryMessage(
                message ?? "Resumen enviado correctamente"
            );
        } catch (error) {
            console.error(error);

            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo enviar el resumen"
            );
        } finally {
            setIsSendingSummary(false);
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

    const completedTasks = tasks.filter(
        (task) => task.completed
    ).length;

    const pendingTasks = tasks.length - completedTasks;

    return (
        <main className="tasks-page">
            <div className="tasks-container">
                <header className="tasks-header">
                    <div>
                        <p className="brand">MateCode</p>
                        <h1>Mis tareas</h1>

                        <p className="tasks-subtitle">
                            {user?.email}
                        </p>
                    </div>

                    <button
                        className="button button--secondary"
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut
                            ? "Cerrando sesión..."
                            : "Cerrar sesión"}
                    </button>
                </header>

                {error && (
                    <p className="message message--error" role="alert">
                        {error}
                    </p>
                )}

                <div className="dashboard-grid">
                    <section className="panel">
                        <div className="section-heading">
                            <span className="eyebrow">
                                Organización
                            </span>
                            <h2>Nueva tarea</h2>
                            <p>Agregá algo que necesites completar.</p>
                        </div>

                        <TaskForm
                            title={title}
                            description={description}
                            isCreating={isCreating}
                            onTitleChange={setTitle}
                            onDescriptionChange={setDescription}
                            onSubmit={handleCreateTask}
                        />
                    </section>

                    <section className="panel summary-panel">
                        <div className="section-heading">
                            <span className="eyebrow">Resumen</span>
                            <h2>Tu progreso</h2>
                            <p>Revisá el estado general de tus tareas.</p>
                        </div>

                        <div className="task-stats">
                            <div className="stat-card">
                                <strong>{tasks.length}</strong>
                                <span>Total</span>
                            </div>

                            <div className="stat-card">
                                <strong>{completedTasks}</strong>
                                <span>Completadas</span>
                            </div>

                            <div className="stat-card">
                                <strong>{pendingTasks}</strong>
                                <span>Pendientes</span>
                            </div>
                        </div>

                        <button
                            className="button button--primary button--full"
                            type="button"
                            onClick={handleSendSummary}
                            disabled={
                                isSendingSummary || isLoadingTasks
                            }
                        >
                            {isSendingSummary
                                ? "Enviando resumen..."
                                : "Enviar resumen por correo"}
                        </button>

                        {summaryMessage && (
                            <p
                                className="message message--success"
                                role="status"
                            >
                                {summaryMessage}
                            </p>
                        )}
                    </section>
                </div>

                <section className="tasks-section">
                    <div className="section-heading section-heading--row">
                        <div>
                            <span className="eyebrow">Actividad</span>
                            <h2>Lista de tareas</h2>
                        </div>

                        <span className="task-count">
                            {tasks.length}
                        </span>
                    </div>

                    {isLoadingTasks && (
                        <p className="empty-state">
                            Cargando tareas...
                        </p>
                    )}

                    {!isLoadingTasks && tasks.length === 0 && (
                        <div className="empty-state">
                            <h3>Todavía no tenés tareas</h3>
                            <p>
                                Creá tu primera tarea usando el formulario.
                            </p>
                        </div>
                    )}

                    {!isLoadingTasks && tasks.length > 0 && (
                        <ul className="task-list">
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
            </div>
        </main>
    );
}

export default TasksPage;