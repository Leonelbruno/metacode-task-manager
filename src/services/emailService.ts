import type { Task } from "../types/Task";

type SendSummaryResponse = {
    message?: string;
    error?: string;
};

export async function sendTaskSummary(
    email: string,
    tasks: Task[]
) {
    const summaryTasks = tasks.map((task) => ({
        title: task.title,
        description: task.description,
        completed: task.completed,
    }));

    const response = await fetch("/api/send-summary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            tasks: summaryTasks,
        }),
    });

    const data =
        (await response.json()) as SendSummaryResponse;

    if (!response.ok) {
        throw new Error(
            data.error ?? "No se pudo enviar el resumen"
        );
    }

    return data.message;
}