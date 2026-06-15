import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { LoginForm } from "../../types/auth";
import { useAuth } from "../../context/AuthContext";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { brand } from "../../lib/brand";
import { loadNunitoFont } from "../../lib/loadNunitoFont";

const initialStateLoginForm: LoginForm = {
  username: "",
  password: "",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const registroOk = (location.state as { registroOk?: boolean } | null)
    ?.registroOk;

  const [formulario, setFormulario] = useState<LoginForm>(
    initialStateLoginForm,
  );
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(
    registroOk ? "¡Cuenta creada! Ya podés iniciar sesión." : null,
  );
  const [enviando, setEnviando] = useState(false);
  const [showPassword, setPasswordVisibility] = useState(false);

  const { login } = useAuth();

  useEffect(() => {
    loadNunitoFont();
  }, []);

  const handleChange = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = evento.target as HTMLInputElement;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
    setErrorServidor(null);
    setMensajeExito(null);
  };

  const validarErrores = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.username?.length) {
      nuevosErrores.username = "Debe ingresar tu usuario";
    }

    if (!formulario.password) {
      nuevosErrores.password = "Debe ingresar tu contraseña";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorServidor(null);
    setMensajeExito(null);
    if (!validarErrores()) return;

    setEnviando(true);

    const resultado = await login({
      username: formulario.username.trim(),
      password: formulario.password,
    });

    setEnviando(false);

    if (resultado.ok) {
      const roles = resultado.user.roles;

      if (roles.includes("CLIENT")) {
        navigate("/catalogo", { replace: true });
      } else if (roles.includes("ADMIN")) {
        navigate("/productos", { replace: true });
      } else if (roles.includes("STOCK")) {
        navigate("/stock", { replace: true });
      } else if (roles.includes("PEDIDOS")) {
        navigate("/admin/pedidos", { replace: true });
      } else {
        navigate("/catalogo", { replace: true });
      }
    } else {
      setErrorServidor(resultado.message);
    }
  };

  const inputClassName = `w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 ${brand.inputFocus}`;

  return (
    <AuthPageShell>
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            ¡Bienvenido de nuevo!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Inicia sesión para continuar
          </p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          {mensajeExito && (
            <p
              className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700"
              role="status"
            >
              {mensajeExito}
            </p>
          )}

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
              Usuario
            </label>

            <input
              type="text"
              placeholder="ej: juanp"
              name="username"
              autoComplete="username"
              value={formulario.username}
              onChange={handleChange}
              className={inputClassName}
            />
            {errores.username && (
              <p className="mt-1 text-sm text-red-500">{errores.username}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Shhh"
                name="password"
                autoComplete="current-password"
                value={formulario.password}
                onChange={handleChange}
                className={`${inputClassName} hide-native-password-reveal pr-12`}
              />
              <button
                type="button"
                className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full pt-0.5 pl-0.5 outline-none hover:bg-slate-200"
                onClick={() => setPasswordVisibility(!showPassword)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                <span className="material-symbols-outlined text-slate-500">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errores.password && (
              <p className="mt-1 text-sm text-red-500">{errores.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className={`w-full rounded-xl py-3 font-semibold shadow-lg shadow-amber-500/25 transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${brand.solid}`}
          >
            {enviando ? "Ingresando…" : "Iniciar sesión"}
          </button>

          <p className="text-center text-sm text-slate-600">
            ¿No tenés cuenta?{" "}
            <Link
              to="/register"
              className="font-semibold text-amber-600 hover:text-amber-700"
            >
              Registrate aquí
            </Link>
          </p>
        </form>
      </section>
    </AuthPageShell>
  );
}
