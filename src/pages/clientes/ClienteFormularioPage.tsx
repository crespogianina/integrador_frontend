import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE, apiFetch } from "../../config/api";

const USUARIOS_PATH = `${API_BASE}/usuario/admin/usuarios`;

const inputClass = (hayError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
    hayError
      ? "border-red-500 bg-red-50"
      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
  }`;

const initialState = {
  nombre: "",
  apellido: "",
  email: "",
  rol: "",
};

export default function ClienteEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorRequest, setErrorRequest] = useState("");

  useEffect(() => {
    if (!id) return;

    const cargarCliente = async () => {
      try {
        setLoading(true);

        const res = await apiFetch(`${USUARIOS_PATH}/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("No se pudo cargar el usuario");
        }

        const usuario = await res.json();

        setFormulario({
          nombre: usuario.nombre ?? "",
          apellido: usuario.apellido ?? "",
          email: usuario.email ?? "",
          rol: usuario.roles?.[0] ?? "",
        });
      } catch (error) {
        setErrorRequest(
          error instanceof Error ? error.message : "Error al cargar el usuario",
        );
      } finally {
        setLoading(false);
      }
    };

    cargarCliente();
  }, [id]);

  useEffect(() => {
    if (!errorRequest) return;

    const timer = setTimeout(() => {
      setErrorRequest("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [errorRequest]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!formulario.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es obligatorio";
    }

    if (!formulario.email.trim()) {
      nuevosErrores.email = "El email es obligatorio";
    }

    if (!formulario.rol) {
      nuevosErrores.rol = "Debe seleccionar un rol";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id || !validarFormulario()) return;

    try {
      setSaving(true);

      const res = await apiFetch(`${USUARIOS_PATH}/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formulario.nombre,
          apellido: formulario.apellido,
          email: formulario.email,
          roles: [formulario.rol],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);

        throw new Error(data?.detail || "No se pudo actualizar el usuario");
      }

      navigate("/clientes");
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al actualizar el usuario",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/clientes");
  };

  if (loading) {
    return (
      <main className="min-h-screen w-lvw bg-slate-100 p-6">
        <section className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-6 shadow">
            Cargando usuario...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-semibold text-slate-800">
              Editar usuario
            </h2>

            <p className="text-sm text-slate-500">
              Modifique los datos del usuario.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre
                </label>

                <input
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
                  className={inputClass(Boolean(errores.nombre))}
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
                  name="apellido"
                  value={formulario.apellido}
                  onChange={handleChange}
                  className={inputClass(Boolean(errores.apellido))}
                />

                {errores.apellido && (
                  <p className="mt-1 text-sm text-red-500">
                    {errores.apellido}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  name="email"
                  type="email"
                  value={formulario.email}
                  onChange={handleChange}
                  className={inputClass(Boolean(errores.email))}
                />

                {errores.email && (
                  <p className="mt-1 text-sm text-red-500">{errores.email}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Rol
                </label>

                <select
                  name="rol"
                  value={formulario.rol}
                  onChange={handleChange}
                  className={inputClass(Boolean(errores.rol))}
                >
                  <option value="">Seleccione un rol</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="CLIENT">CLIENTE</option>
                  <option value="STOCK">STOCK</option>
                  <option value="PEDIDOS">PEDIDOS</option>
                </select>

                {errores.rol && (
                  <p className="mt-1 text-sm text-red-500">{errores.rol}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Actualizar"}
              </button>
            </div>
          </form>
        </div>

        {errorRequest && (
          <div className="fixed bottom-10 right-5 z-50">
            <div className="rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
              {errorRequest}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
