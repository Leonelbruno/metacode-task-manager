import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { sendTaskSummary } from "./emailService";
import type { Task } from "../types/Task";

const tasks: Task[] = [
    {
        id: "task-1",
        title: "Estudiar testing",
        description: "Practicar Vitest",
        completed: false,
        userId: "user-1",
        createdAt: null,
    },
    {
        id: "task-2",
        title: "Probar MateCode",
        description: "Comprobar el resumen",
        completed: true,
        userId: "user-1",
        createdAt: null,
    },
];

describe("emailService", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("envía el resumen de tareas correctamente", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: "Resumen enviado correctamente",
            }),
        } as Response);

        const result = await sendTaskSummary(
            "usuario@ejemplo.com",
            tasks
        );

        expect(fetch).toHaveBeenCalledTimes(1);

        expect(fetch).toHaveBeenCalledWith(
            "/api/send-summary",
            expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
        );

        const fetchOptions = vi.mocked(fetch).mock.calls[0][1];

        const requestBody = JSON.parse(
            fetchOptions?.body as string
        );

        expect(requestBody).toEqual({
            email: "usuario@ejemplo.com",
            tasks: [
                {
                    title: "Estudiar testing",
                    description: "Practicar Vitest",
                    completed: false,
                },
                {
                    title: "Probar MateCode",
                    description: "Comprobar el resumen",
                    completed: true,
                },
            ],
        });

        expect(result).toBe(
            "Resumen enviado correctamente"
        );
    });

    it("lanza un error cuando el servidor rechaza el envío", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: false,
            json: async () => ({
                error: "No se pudo enviar el resumen",
            }),
        } as Response);

        await expect(
            sendTaskSummary("usuario@ejemplo.com", tasks)
        ).rejects.toThrow("No se pudo enviar el resumen");
    });
});