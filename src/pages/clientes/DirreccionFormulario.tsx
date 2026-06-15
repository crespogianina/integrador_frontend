import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { DireccionCreate, DireccionUpdate } from "../../models/Direccion";

import { useDirecciones } from "../../context/DireccionesContext";
import { brand } from "../../lib/brand";

const initialState: DireccionCreate = {
  alias: "",
  linea1: "",
  linea2: "",
  ciudad: "",
  provincia: "",
  codigo_postal: "",
  es_principal: false,
};

const inputClass = (hayError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
    hayError
      ? "border-red-500 bg-red-50"
      : `border-slate-200 bg-slate-50 ${brand.inputFocus}`
  }`;

export default function DireccionFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    direccionEditar,
    setDireccionEditar,
    cargarDireccion,
    agregar,
    editar,
  } = useDirecciones();

  const [formulario, setFormulario] = useState<DireccionCreate>(initialState);

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorRequest, setErrorRequest] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDireccion(Number(id));
    }

    return () => {
      setDireccionEditar(null);
    };
  }, []);

  useEffect(() => {
    if (!direccionEditar) return;

    setFormulario({
      alias: direccionEditar.alias ?? "",
      linea1: direccionEditar.linea1,
      linea2: direccionEditar.linea2 ?? "",
      ciudad: direccionEditar.ciudad,
      provincia: direccionEditar.provincia ?? "",
      codigo_postal: direccionEditar.codigo_postal ?? "",
      es_principal: direccionEditar.es_principal,
    });
  }, [direccionEditar]);

  useEffect(() => {
    if (!errorRequest) return;

    const timer = setTimeout(() => {
      setErrorRequest("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [errorRequest]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validar = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.linea1.trim()) {
      nuevosErrores.linea1 = "La dirección es obligatoria";
    }

    if (!formulario.ciudad.trim()) {
      nuevosErrores.ciudad = "La ciudad es obligatoria";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validar()) return;

    try {
      setGuardando(true);

      if (direccionEditar) {
        const payload: DireccionUpdate = {
          alias: formulario.alias,
          linea1: formulario.linea1,
          linea2: formulario.linea2,
          ciudad: formulario.ciudad,
          provincia: formulario.provincia,
          codigo_postal: formulario.codigo_postal,
        };

        await editar(direccionEditar.id, payload);
      } else {
        await agregar(formulario);
      }

      navigate("/direcciones");
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al guardar la dirección",
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleCancel = () => {
    setDireccionEditar(null);
    navigate("/direcciones");
  };

  return (
    <main className={`min-h-screen w-lvw p-6 ${brand.pageBg}`}>
      <section className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-semibold text-slate-800">
              {direccionEditar ? "Editar dirección" : "Nueva dirección"}
            </h2>

            <p className="text-sm text-slate-500">
              Complete los datos de la dirección.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Alias
                </label>

                <input
                  name="alias"
                  value={formulario.alias ?? ""}
                  onChange={handleChange}
                  placeholder="Casa, Trabajo, etc."
                  className={inputClass(false)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Ciudad
                </label>

                <input
                  name="ciudad"
                  value={formulario.ciudad}
                  onChange={handleChange}
                  className={inputClass(Boolean(errores.ciudad))}
                />

                {errores.ciudad && (
                  <p className="mt-1 text-sm text-red-500">{errores.ciudad}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Dirección
                </label>

                <input
                  name="linea1"
                  value={formulario.linea1}
                  onChange={handleChange}
                  placeholder="Calle y número"
                  className={inputClass(Boolean(errores.linea1))}
                />

                {errores.linea1 && (
                  <p className="mt-1 text-sm text-red-500">{errores.linea1}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Referencia
                </label>

                <input
                  name="linea2"
                  value={formulario.linea2 ?? ""}
                  onChange={handleChange}
                  placeholder="Departamento, piso, referencia..."
                  className={inputClass(false)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Provincia
                </label>

                <input
                  name="provincia"
                  value={formulario.provincia ?? ""}
                  onChange={handleChange}
                  className={inputClass(false)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Código Postal
                </label>

                <input
                  name="codigo_postal"
                  value={formulario.codigo_postal ?? ""}
                  onChange={handleChange}
                  className={inputClass(false)}
                />
              </div>

              {!direccionEditar && (
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="es_principal"
                      checked={formulario.es_principal ?? false}
                      onChange={handleChange}
                    />

                    <span className="text-sm font-medium text-slate-700">
                      Establecer como dirección principal
                    </span>
                  </label>
                </div>
              )}
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
                disabled={guardando}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${brand.solid} disabled:opacity-50`}
              >
                {guardando
                  ? "Guardando..."
                  : direccionEditar
                    ? "Actualizar"
                    : "Crear"}
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
