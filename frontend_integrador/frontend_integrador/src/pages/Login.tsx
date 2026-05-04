import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { LoginCredentials } from "../types/auth";

const initial: LoginCredentials = { email: "", password: "" };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from
    ?.pathname;

  const [form, setForm] = useState<LoginCredentials>(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from ?? "/productos", { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    const email = form.email.trim();

    if (!email) err.email = "Ingresá tu email.";
    else if (!emailRegex.test(email)) err.email = "Email no válido.";

    if (!form.password) err.password = "Ingresá tu contraseña.";
    else if (form.password.length < 8)
      err.password = "La contraseña debe tener al menos 8 caracteres.";

    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFieldErrors((p) => ({ ...p, [name]: "" }));
    setFormError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    const result = await login({
      email: form.email.trim(),
      password: form.password,
    });
    setLoading(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    navigate(from ?? "/productos", { replace: true });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-700 via-indigo-700 to-purple-800 px-4">
      <section className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-slate-500">
            Usá el email y contraseña de tu cuenta Food Store
          </p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          {formError && (
            <p
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {formError}
            </p>
          )}

          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="password"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>

          <p className="text-center text-xs text-slate-500">
            ¿Primera vez? Podés crear cuenta con{" "}
            <code className="rounded bg-slate-100 px-1">POST /api/v1/auth/register</code>{" "}
            (Swagger en <code className="rounded bg-slate-100 px-1">/docs</code>).
          </p>
        </form>
      </section>
    </main>
  );
}
