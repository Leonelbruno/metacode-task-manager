import { addDoc, collection, onSnapshot, query, serverTimestamp, where, } from "firebase/firestore";
import type { Task } from "../types/Task";
import { db } from "./firebase";

export function createTask(
    title: string,
    description: string,
    userId: string
) {
    return addDoc(collection(db, "tasks"), {
        title,
        description,
        completed: false,
        userId,
        createdAt: serverTimestamp(),
    });
}

export function subscribeToTasks(
    userId: string,
    onTasksChange: (tasks: Task[]) => void,
    onError: (error: Error) => void
) {
    const tasksQuery = query(
        collection(db, "tasks"),
        where("userId", "==", userId)
    );

    return onSnapshot(
        tasksQuery,
        (snapshot) => {
            const tasks = snapshot.docs.map((document) => ({
                id: document.id,
                ...(document.data() as Omit<Task, "id">),
            }));

            tasks.sort(
                (taskA, taskB) =>
                    (taskB.createdAt?.toMillis() ?? 0) -
                    (taskA.createdAt?.toMillis() ?? 0)
            );

            onTasksChange(tasks);
        },
        onError
    );
}