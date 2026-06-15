import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { RegisterForm } from "../../types/auth";
import { useAuth } from "../../context/AuthContext";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { brand } from "../../lib/brand";
import { loadNunitoFont } from "../../lib/loadNunitoFont";

const initialState: RegisterForm = {
  nombre: "",
  apellido: "",
  username: "",
  email: "",
  celular: "",
  password: "",
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formulario, setFormulario] = useState<RegisterForm>(initialState);
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [showPassword, setPasswordVisibility] = useState(false);

  useEffect(() => {
    loadNunitoFont();
  }, []);

  const handleChange = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evento.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
    setErrorServidor(null);
  };

  const validarErrores = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = "Ingresá tu nombre";
    }

    if (!formulario.apellido.trim()) {
      nuevosErrores.apellido = "Ingresá tu apellido";
    }

    if (!formulario.username.trim()) {
      nuevosErrores.username = "Ingresá un usuario";
    }

    if (!formulario.email.trim()) {
      nuevosErrores.email = "Ingresá tu email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email.trim())) {
      nuevosErrores.email = "El email no es válido";
    }

    if (!formulario.password) {
      nuevosErrores.password = "Ingresá una contraseña";
    } else if (formulario.password.length < 8) {
      nuevosErrores.password = "Mínimo 8 caracteres";
    }

    if (!confirmarPassword) {
      nuevosErrores.confirmarPassword = "Confirmá tu contraseña";
    } else if (confirmarPassword !== formulario.password) {
      nuevosErrores.confirmarPassword = "Las contraseñas no coinciden";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorServidor(null);
    if (!validarErrores()) return;

    setEnviando(true);
    const resultado = await register(formulario);
    setEnviando(false);

    if (resultado.ok) {
      navigate("/login", {
        replace: true,
        state: { registroOk: true },
      });
    } else {
      setErrorServidor(resultado.message);
    }
  };

  const inputClassName = `w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 ${brand.inputFocus}`;

  return (
    <AuthPageShell>
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Crear cuenta</h1>
          <p className="mt-2 text-sm text-slate-500">
            Registrate para empezar a pedir
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {errorServidor && (
            <p
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {errorServidor}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                className={inputClassName}
                autoComplete="given-name"
              />
              {errores.nombre && (
                <p className="mt-1 text-sm text-red-500">{errores.nombre}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                value={formulario.apellido}
                onChange={handleChange}
                className={inputClassName}
                autoComplete="family-name"
              />
              {errores.apellido && (
                <p className="mt-1 text-sm text-red-500">{errores.apellido}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Usuario
            </label>
            <input
              type="text"
              name="username"
              placeholder="ej: juanp"
              value={formulario.username}
              onChange={handleChange}
              className={inputClassName}
              autoComplete="username"
            />
            {errores.username && (
              <p className="mt-1 text-sm text-red-500">{errores.username}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="ej: juan@example.com"
              value={formulario.email}
              onChange={handleChange}
              className={inputClassName}
              autoComplete="email"
            />
            {errores.email && (
              <p className="mt-1 text-sm text-red-500">{errores.email}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Celular <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              type="tel"
              name="celular"
              placeholder="ej: 3511234567"
              value={formulario.celular}
              onChange={handleChange}
              className={inputClassName}
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Shhh"
                value={formulario.password}
                onChange={handleChange}
                className={`${inputClassName} hide-native-password-reveal pr-12`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full outline-none hover:bg-slate-200"
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Confirmar contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmarPassword"
              placeholder="Shhh otra vez"
              value={confirmarPassword}
              onChange={(e) => {
                setConfirmarPassword(e.target.value);
                setErrores((prev) => ({ ...prev, confirmarPassword: "" }));
                setErrorServidor(null);
              }}
              className={`${inputClassName} hide-native-password-reveal`}
              autoComplete="new-password"
            />
            {errores.confirmarPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errores.confirmarPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={enviando}
            className={`w-full rounded-xl py-3 font-semibold shadow-lg shadow-amber-500/25 transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${brand.solid}`}
          >
            {enviando ? "Creando cuenta…" : "Registrarse"}
          </button>

          <p className="text-center text-sm text-slate-600">
            ¿Ya tenés cuenta?{" "}
            <Link
              to="/login"
              className="font-semibold text-amber-600 hover:text-amber-700"
            >
              Iniciá sesión
            </Link>
          </p>
        </form>
      </section>
    </AuthPageShell>
  );
}
