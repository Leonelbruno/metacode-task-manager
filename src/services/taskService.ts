import {
    addDoc,
    collection,
    serverTimestamp,
} from "firebase/firestore";

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