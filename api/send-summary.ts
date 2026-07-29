import { SESClient, SendEmailCommand, } from "@aws-sdk/client-ses";

type SummaryTask = {
    title: string;
    description: string;
    completed: boolean;
};

type SummaryRequestBody = {
    email: string;
    tasks: SummaryTask[];
};

export default {
    async fetch(request: Request) {
        if (request.method !== "POST") {
            return Response.json(
                { error: "Método no permitido" },
                {
                    status: 405,
                    headers: {
                        Allow: "POST",
                    },
                }
            );
        }

        try {
            const body =
                (await request.json()) as SummaryRequestBody;

            const { email, tasks } = body;

            if (
                typeof email !== "string" ||
                !email.trim() ||
                !Array.isArray(tasks)
            ) {
                return Response.json(
                    { error: "Los datos enviados no son válidos" },
                    { status: 400 }
                );
            }

            const region = process.env.AWS_REGION;
            const fromEmail = process.env.AWS_SES_FROM_EMAIL;

            if (!region || !fromEmail) {
                console.error(
                    "Faltan variables de entorno de Amazon SES"
                );

                return Response.json(
                    { error: "El servicio de correo no está configurado" },
                    { status: 500 }
                );
            }

            const completedTasks = tasks.filter(
                (task) => task.completed
            ).length;

            const pendingTasks =
                tasks.length - completedTasks;

            const taskList =
                tasks.length === 0
                    ? "No tenés tareas cargadas."
                    : tasks
                        .map((task, index) => {
                            const status = task.completed
                                ? "Completada"
                                : "Pendiente";

                            const description = task.description.trim()
                                ? `\n   Descripción: ${task.description.trim()}`
                                : "";

                            return `${index + 1}. [${status}] ${task.title}${description}`;
                        })
                        .join("\n\n");

            const emailContent = `
Resumen de tareas de MateCode

Total de tareas: ${tasks.length}
Completadas: ${completedTasks}
Pendientes: ${pendingTasks}

${taskList}
      `.trim();

            const sesClient = new SESClient({
                region,
            });

            const command = new SendEmailCommand({
                Source: fromEmail,
                Destination: {
                    ToAddresses: [email],
                },
                Message: {
                    Subject: {
                        Charset: "UTF-8",
                        Data: "Resumen de tus tareas - MateCode",
                    },
                    Body: {
                        Text: {
                            Charset: "UTF-8",
                            Data: emailContent,
                        },
                    },
                },
            });

            await sesClient.send(command);

            return Response.json({
                message: "Resumen enviado correctamente",
            });
        } catch (error) {
            console.error("Error al enviar el resumen:", error);

            return Response.json(
                { error: "No se pudo enviar el resumen" },
                { status: 500 }
            );
        }
    },
};