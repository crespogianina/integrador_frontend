import { useEffect, useState } from "react";
import { API_BASE, apiFetch } from "../../config/api";
import { brand } from "../../lib/brand";
import type { UsuarioPerfil, UsuarioPerfilUpdate } from "../../models/Usuario";
import UserAvatar from "../../components/UserAvatar";
import ClientPageHeader from "../../components/ClientPageHeader";

const USUARIO_ME_PATH = `${API_BASE}/usuario/me`;

const initialForm: UsuarioPerfilUpdate = {
  nombre: "",
  apellido: "",
  email: "",
  celular: "",
};

const inputClass = (hayError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
    hayError
      ? "border-red-500 bg-red-50"
      : `border-slate-200 bg-slate-50 ${brand.inputFocus}`
  }`;

export default function MiCuentaPage() {
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [formulario, setFormulario] = useState<UsuarioPerfilUpdate>(initialForm);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorRequest, setErrorRequest] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setCargando(true);
        const res = await apiFetch(USUARIO_ME_PATH, { credentials: "include" });

        if (!res.ok) {
          throw new Error("No se pudo cargar tu perfil");
        }

        const data: UsuarioPerfil = await res.json();
        setPerfil(data);
        setFormulario({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          celular: data.celular ?? "",
        });
      } catch (error) {
        setErrorRequest(
          error instanceof Error ? error.message : "Error al cargar el perfil",
        );
      } finally {
        setCargando(false);
      }
    };

    void cargarPerfil();
  }, []);

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 3000);
    return () => clearTimeout(timer);
  }, [errorRequest]);

  useEffect(() => {
    if (!exito) return;
    const timer = setTimeout(() => setExito(""), 3000);
    return () => clearTimeout(timer);
  }, [exito]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
  };

  const validar = () => {
    const nuevos: Record<string, string> = {};

    if (!formulario.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
    if (!formulario.apellido.trim()) nuevos.apellido = "El apellido es obligatorio";
    if (!formulario.email.trim()) {
      nuevos.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email.trim())) {
      nuevos.email = "Ingresá un email válido";
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    try {
      setGuardando(true);
      setErrorRequest("");

      const res = await apiFetch(USUARIO_ME_PATH, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          apellido: formulario.apellido.trim(),
          email: formulario.email.trim(),
          celular: formulario.celular.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "No se pudieron guardar los cambios",
        );
      }

      const actualizado: UsuarioPerfil = await res.json();
      setPerfil(actualizado);
      setFormulario({
        nombre: actualizado.nombre,
        apellido: actualizado.apellido,
        email: actualizado.email,
        celular: actualizado.celular ?? "",
      });
      setExito("Datos actualizados correctamente");
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al guardar los cambios",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className={`min-h-screen w-lvw p-6 ${brand.pageBg}`}>
      <section className="mx-auto max-w-2xl space-y-6">
        <ClientPageHeader
          title="Mi cuenta"
          description="Consultá y actualizá tus datos de contacto."
        />

        {cargando ? (
          <div className="space-y-3 rounded-2xl bg-white p-6 shadow">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl bg-white shadow"
          >
            <div className="border-b border-slate-200 p-5">
              {perfil ? (
                <div className="flex items-center gap-4">
                  <UserAvatar
                    nombre={formulario.nombre}
                    apellido={formulario.apellido}
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {formulario.nombre} {formulario.apellido}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Usuario:{" "}
                      <span className="font-medium text-slate-600">
                        {perfil.username}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <h2 className="text-lg font-semibold text-slate-800">Perfil</h2>
              )}
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <p className="mt-1 text-sm text-red-500">{errores.apellido}</p>
                  )}
                </div>
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
                  Celular
                </label>
                <input
                  name="celular"
                  type="tel"
                  value={formulario.celular}
                  onChange={handleChange}
                  placeholder="Ej: 11 2345 6789"
                  className={inputClass(false)}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-5">
              <button
                type="submit"
                disabled={guardando}
                className={`rounded-lg px-6 py-2 text-sm font-semibold ${brand.solid} disabled:opacity-50`}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}

        {errorRequest && (
          <div className="fixed bottom-10 right-5 z-50">
            <div className="rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
              {errorRequest}
            </div>
          </div>
        )}

        {exito && (
          <div className="fixed bottom-10 right-5 z-50">
            <div className="rounded-b-md bg-emerald-600 px-4 py-3 text-white shadow-lg">
              {exito}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
