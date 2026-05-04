import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { LoginForm } from "../types/auth";

const initialStateLoginForm: LoginForm = {
  email: "",
  password: "",
};

export default function Login() {
  const navigate = useNavigate();

  const { login, isAuthenticated } = useAuth();

  const [formulario, setFormulario] = useState<LoginForm>(
    initialStateLoginForm,
  );
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/productos", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = evento.target as HTMLInputElement;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
    setErrorServidor(null);
  };

  const validarErrores = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.email?.length) {
      nuevosErrores.email = "Debe ingresar un email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      nuevosErrores.email = "El email no es válido";
    }

    if (!formulario.password) {
      nuevosErrores.password = "Debe ingresar una contraseña";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorServidor(null);
    if (!validarErrores()) return;

    setEnviando(true);

    const resultado = await login({
      email: formulario.email.trim(),
      password: formulario.password,
    });

    setEnviando(false);

    if (resultado.ok) {
      navigate("/productos", { replace: true });
    } else {
      setErrorServidor(resultado.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-700 via-indigo-700 to-purple-800 px-4">
      <section className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Iniciar sesión</h1>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          {errorServidor && (
            <p
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {errorServidor}
            </p>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              type="text"
              placeholder="Ingresa tu correo"
              name="email"
              autoComplete="email"
              value={formulario.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            {errores.email && (
              <p className="mt-1 text-sm text-red-500">{errores.email}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>

            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              name="password"
              autoComplete="current-password"
              value={formulario.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            {errores.password && (
              <p className="mt-1 text-sm text-red-500">{errores.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            {enviando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}
