import "./LoginPage.css";
import { useNavigate, Link } from "react-router";
import { useActionState, useId } from "react";

interface LoginPageProps {
    isRegistering: boolean;
    onLoginSuccess: (token: string) => void;
}

export function LoginPage({ isRegistering, onLoginSuccess }: LoginPageProps) {
    const usernameInputId = useId();
    const passwordInputId = useId();
    const navigate = useNavigate();

    const [result, submitAction, isPending] = useActionState(
        async (_prevState: unknown, formData: FormData) => {
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;

            if (!username || !password) {
                return "Username and password are required.";
            }

            const endpoint = isRegistering ? "/auth/register" : "/auth/login";

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    return data.message || "Request failed.";
                }

                const data = await response.json();
                onLoginSuccess(data.token);
                navigate("/"); // Redirect to homepage

                return null;
            } catch {
                return "Server error. Please try again.";
            }
        },
        null
    );

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" action={submitAction}>
                <label htmlFor={usernameInputId}>Username</label>
                <input
                    id={usernameInputId}
                    name="username"
                    required
                    disabled={isPending}
                />

                <label htmlFor={passwordInputId}>Password</label>
                <input
                    id={passwordInputId}
                    name="password"
                    type="password"
                    required
                    disabled={isPending}
                />

                <input type="submit" value="Submit" disabled={isPending} />

                {result && (
                    <p style={{ color: "red" }} aria-live="polite">
                        {result}
                    </p>
                )}
            </form>

            {!isRegistering && (
                <p>
                    Don’t have an account? <Link to="/register">Register here</Link>
                </p>
            )}
        </>
    );
}