import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isLoading) return;

        setError("");
        setIsLoading(true);

        try {
            await loginUser(email, password);
            navigate("/tasks");
        } catch (error) {
            console.error(error);
            setError("Correo electrónico o contraseña incorrectos");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <p className="brand">MateCode</p>

                <div className="auth-heading">
                    <h1>Iniciar sesión</h1>
                    <p>Organizá tus tareas de manera simple.</p>
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
                            autoComplete="current-password"
                            placeholder="Tu contraseña"
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
                        {isLoading ? "Ingresando..." : "Iniciar sesión"}
                    </button>
                </form>

                <p className="auth-switch">
                    ¿No tenés una cuenta?{" "}
                    <Link to="/register">Registrate</Link>
                </p>
            </section>
        </main>
    );
}

export default LoginPage;