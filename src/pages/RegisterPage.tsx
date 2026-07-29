import { useState, type FormEvent } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";

function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        try {
            await registerUser(email, password);
            console.log("Usuario creado correctamente");
            navigate("/tasks");
        } catch (error) {
            console.error(error);

            if (
                error instanceof FirebaseError &&
                error.code === "auth/email-already-in-use"
            ) {
                setError("Ese correo electrónico ya está registrado");
            } else {
                setError("No se pudo crear la cuenta");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main>
            <h1>Registrarse</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Correo electrónico</label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>

                <label htmlFor="password">Contraseña</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />

                <label htmlFor="confirmPassword">Verifique Contraseña</label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                />

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
            </form>
        </main>
    );
}

export default RegisterPage;