import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export interface LoginForm {
  username: string;
  password: string;
}

const initialStateLoginForm = {
  username: "",
  password: "",
};

export default function Login() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState<LoginForm>(
    initialStateLoginForm,
  );
  const [errores, setErrores] = useState<Record<string, string>>();

  const { login } = useAuth();

  const onIngresarClick = (event: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!validarErrores()) return;

    login(formulario);
    navigate(`/insumos`);
  };

  const handleChange = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = evento.target as HTMLInputElement;

    setFormulario((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  //Ver de agregar regex o no depende como lleguemos
  const validarErrores = () => {
    const nuevosErrores: Record<string, string> = {};

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

    if (!formulario.username) {
      nuevosErrores.username = "Debe ingresar un usuario";
    }

    if (!formulario.password) {
      nuevosErrores.password = "Debe ingresar una contraseña";
    }
    // else if (!passwordRegex.test(formulario.password)) {
    //   nuevosErrores.password =
    //     "La contraseña debe tener al menos una mayúscula, una minúscula y un número";
    // }
    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-700 via-indigo-700 to-purple-800 px-4">
      <section className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Iniciar sesión</h1>
        </div>

        <form className="space-y-5" onSubmit={(e) => onIngresarClick(e)}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Usuario
            </label>

            <input
              type="text"
              placeholder="Ingresa tu usuario"
              name="username"
              value={formulario.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            {errores?.username && (
              <p className="mt-1 text-sm text-red-500">{errores.username}</p>
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
              value={formulario.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            {errores?.password && (
              <p className="mt-1 text-sm text-red-500">{errores.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-[0.98]"
          >
            Ingresar
          </button>
        </form>
      </section>
    </main>
  );
}
