import { useState, type FormEvent } from "react";
import { registerUser } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
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
        <main className="auth-page">
            <section className="auth-card">
                <p className="brand">MateCode</p>

                <div className="auth-heading">
                    <h1>Crear cuenta</h1>
                    <p>Registrate para comenzar a organizar tus tareas.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="email">Correo electrónico</label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            placeholder="usuario@correo.com"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">Contraseña</label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="new-password"
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="confirmPassword">
                            Confirmar contraseña
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            autoComplete="new-password"
                            placeholder="Repetí tu contraseña"
                            required
                        />
                    </div>

                    {error && (
                        <p className="message message--error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        className="button button--primary button--full"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

                <p className="auth-switch">
                    ¿Ya tenés una cuenta?{" "}
                    <Link to="/login">Iniciá sesión</Link>
                </p>
            </section>
        </main>
    );
}

export default RegisterPage;