import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where, } from "firebase/firestore";
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

export function updateTaskCompletion(
    taskId: string,
    completed: boolean
) {
    const taskReference = doc(db, "tasks", taskId);

    return updateDoc(taskReference, {
        completed,
    });
}

export function deleteTask(taskId: string) {
    const taskReference = doc(db, "tasks", taskId);

    return deleteDoc(taskReference);
}