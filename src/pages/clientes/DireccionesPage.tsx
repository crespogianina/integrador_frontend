import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Direccion } from "../../models/Direccion";
import { useDirecciones } from "../../context/DireccionesContext";
import { brand } from "../../lib/brand";
import ClientPageHeader from "../../components/ClientPageHeader";

const ELEMENTOS_POR_PAGINA = 10;

function IcoPin() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IcoEdit() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IcoTrash() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IcoStar() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IcoPlus() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      aria-hidden
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function DireccionCard({
  direccion,
  accionando,
  onEditar,
  onEliminar,
  onMarcarPrincipal,
}: {
  direccion: Direccion;
  accionando: boolean;
  onEditar: () => void;
  onEliminar: () => void;
  onMarcarPrincipal: () => void;
}) {
  const linea2 = direccion.linea2?.trim();
  const cp = direccion.codigo_postal?.trim();
  const provincia = direccion.provincia?.trim();

  return (
    <div
      className={`relative rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md ${
        direccion.es_principal
          ? "border-amber-300 shadow-sm"
          : "border-slate-200"
      }`}
    >
      {direccion.es_principal && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          <IcoStar />
          Principal
        </span>
      )}

      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            direccion.es_principal
              ? "bg-amber-100 text-amber-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <IcoPin />
        </div>

        <div className="min-w-0 flex-1 pr-20">
          {direccion.alias && (
            <p className="mb-0.5 text-sm font-semibold text-slate-800 capitalize">
              {direccion.alias}
            </p>
          )}

          <p
            className={`text-sm ${direccion.alias ? "text-slate-600" : "font-medium text-slate-800"}`}
          >
            {direccion.linea1}
          </p>

          {linea2 && <p className="text-sm text-slate-500">{linea2}</p>}

          <p className="mt-1 text-xs text-slate-400">
            {[direccion.ciudad, provincia, cp ? `CP ${cp}` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onEditar}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <IcoEdit />
          Editar
        </button>

        <button
          type="button"
          onClick={onEliminar}
          disabled={accionando}
          className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
        >
          <IcoTrash />
          Eliminar
        </button>

        {!direccion.es_principal && (
          <button
            type="button"
            onClick={onMarcarPrincipal}
            disabled={accionando}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
          >
            <IcoStar />
            {accionando ? "Procesando..." : "Marcar como principal"}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onNueva }: { onNueva: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <p className="mb-1 text-sm font-semibold text-slate-700">
        Sin direcciones
      </p>
      <p className="mb-5 text-sm text-slate-400">
        Agregá tu primera dirección de entrega.
      </p>
      <button
        type="button"
        onClick={onNueva}
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${brand.solid}`}
      >
        <IcoPlus />
        Nueva dirección
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-24 rounded bg-slate-200" />
          <div className="h-3 w-48 rounded bg-slate-200" />
          <div className="h-3 w-32 rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <div className="h-7 w-16 rounded-lg bg-slate-200" />
        <div className="h-7 w-20 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

function Paginacion({
  pagina,
  total,
  onPrev,
  onNext,
  onPage,
}: {
  pagina: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (p: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={pagina === 1}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        ←
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPage(p)}
          className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
            p === pagina
              ? `${brand.paginationActive}`
              : "border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={onNext}
        disabled={pagina === total}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
      >
        →
      </button>
    </div>
  );
}

export default function DireccionesPage() {
  const navigate = useNavigate();

  const { direcciones, total, cargarDirecciones, eliminar, marcarPrincipal } =
    useDirecciones();

  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [errorRequest, setErrorRequest] = useState("");
  const [accionando, setAccionando] = useState<number | null>(null);

  const totalPaginas = Math.ceil(total / ELEMENTOS_POR_PAGINA);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        await cargarDirecciones(paginaActual, ELEMENTOS_POR_PAGINA);
      } catch (error) {
        setErrorRequest(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las direcciones",
        );
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [paginaActual]);

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 3000);
    return () => clearTimeout(timer);
  }, [errorRequest]);

  const handleEliminar = async (direccion: Direccion) => {
    try {
      setAccionando(direccion.id);
      await eliminar(direccion.id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la dirección",
      );
    } finally {
      setAccionando(null);
    }
  };

  const handlePrincipal = async (direccion: Direccion) => {
    try {
      setAccionando(direccion.id);
      await marcarPrincipal(direccion.id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "No se pudo marcar la dirección como principal",
      );
    } finally {
      setAccionando(null);
    }
  };

  return (
    <main className={`min-h-screen w-lvw p-6 ${brand.pageBg}`}>
      <section className="mx-auto max-w-2xl space-y-4">
        <ClientPageHeader
          title="Mis direcciones"
          description="Administrá tus direcciones de entrega."
          action={
            direcciones.length > 0 ? (
              <button
                type="button"
                onClick={() => navigate("/direcciones/nueva")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${brand.solid}`}
              >
                <IcoPlus />
                Nueva dirección
              </button>
            ) : null
          }
        />

        {cargando ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : direcciones.length === 0 ? (
          <EmptyState onNueva={() => navigate("/direcciones/nueva")} />
        ) : (
          <>
            <div className="space-y-3">
              {direcciones.map((d) => (
                <DireccionCard
                  key={d.id}
                  direccion={d}
                  accionando={accionando === d.id}
                  onEditar={() => navigate(`/direcciones/editar/${d.id}`)}
                  onEliminar={() => handleEliminar(d)}
                  onMarcarPrincipal={() => handlePrincipal(d)}
                />
              ))}
            </div>

            <Paginacion
              pagina={paginaActual}
              total={totalPaginas}
              onPrev={() => setPaginaActual((p) => p - 1)}
              onNext={() => setPaginaActual((p) => p + 1)}
              onPage={setPaginaActual}
            />
          </>
        )}
      </section>

      {errorRequest && (
        <div className="fixed bottom-10 right-5 z-50">
          <div className="rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
            {errorRequest}
          </div>
        </div>
      )}
    </main>
  );
}
