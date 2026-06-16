import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import { iniciarPagoMercadoPago } from "../../lib/pedidosUtils";
import { brand } from "../../lib/brand";

type StatusRetorno = "success" | "failure" | "pending";

export function PagoRetornoPage() {
  const navigate = useNavigate();
  const { pedidoId, status } = useParams();
  const [searchParams] = useSearchParams();

  const [cargando, setCargando] = useState(true);
  const [pagando, setPagando] = useState(false);
  const [tipo, setTipo] = useState<StatusRetorno>("success");

  useEffect(() => {
    const confirmar = async () => {
      const paymentId = searchParams.get("payment_id");
      const s = (status ?? "success") as StatusRetorno;
      setTipo(s);

      if (paymentId && pedidoId) {
        try {
          await apiFetch(`${API_BASE}/pagos/confirm`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pedido_id: Number(pedidoId),
              payment_id: Number(paymentId),
            }),
          });
        } catch {
          /* webhook puede confirmar después */
        }
      }

      setCargando(false);
    };

    void confirmar();
  }, [pedidoId, searchParams, status]);

  const reintentar = async () => {
    if (!pedidoId) return;
    setPagando(true);
    try {
      await iniciarPagoMercadoPago(Number(pedidoId));
    } catch {
      setPagando(false);
    }
  };

  const config = {
    success: {
      icon: "✓",
      titulo: "¡Pago aprobado!",
      texto: "Tu pedido fue confirmado. Podés seguir el estado en tiempo real.",
      color: "emerald",
    },
    failure: {
      icon: "✕",
      titulo: "Pago rechazado",
      texto: "No se pudo procesar el pago. Podés reintentarlo cuando quieras.",
      color: "red",
    },
    pending: {
      icon: "⏳",
      titulo: "Pago en proceso",
      texto:
        "Estamos esperando la confirmación. Te avisamos en el seguimiento.",
      color: "amber",
    },
  }[tipo];

  return (
    <main className="flex min-h-screen w-lvw items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow">
        {cargando ? (
          <>
            <div
              className={`mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 ${brand.spinner}`}
            />
            <p className="font-medium text-slate-700">Confirmando tu pago…</p>
          </>
        ) : (
          <>
            <span
              className={`inline-flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                config.color === "emerald"
                  ? "bg-emerald-100 text-emerald-700"
                  : config.color === "red"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-800"
              }`}
            >
              {config.icon}
            </span>
            <h1 className="mt-4 text-xl font-bold text-slate-800">
              {config.titulo}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{config.texto}</p>

            <div className="mt-8 flex flex-col gap-3">
              {tipo === "failure" && (
                <button
                  type="button"
                  disabled={pagando}
                  onClick={() => void reintentar()}
                  className={`w-full rounded-lg py-2.5 font-semibold ${brand.solid} disabled:opacity-50`}
                >
                  {pagando ? "Redirigiendo…" : "Reintentar pago"}
                </button>
              )}
              <Link
                to={`/pedidos/${pedidoId}`}
                className="w-full rounded-lg border border-slate-300 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ver seguimiento del pedido
              </Link>
              <button
                type="button"
                onClick={() => navigate("/mis-pedidos")}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Ir a mis pedidos
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
