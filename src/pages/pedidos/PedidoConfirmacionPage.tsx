import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import type { PedidoDetail } from "../../models/Pedido";
import { ESTADO_LABEL } from "../../models/Pedido";
import { fechaCorta, iniciarPagoMercadoPago, precio } from "../../lib/pedidosUtils";

const PEDIDOS_PATH = `${API_BASE}/pedidos/`;

export function PedidoConfirmacionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pedidoId = Number(id);

  const [pedido, setPedido] = useState<PedidoDetail | null>(null);
  const [cargando, setCargando] = useState(true);
  const [pagando, setPagando] = useState(false);
  const [errorRequest, setErrorRequest] = useState("");

  const cargar = useCallback(async () => {
    try {
      const res = await apiFetch(`${PEDIDOS_PATH}${pedidoId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("No se pudo cargar el pedido");
      setPedido(await res.json());
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al cargar el pedido",
      );
    } finally {
      setCargando(false);
    }
  }, [pedidoId]);

  useEffect(() => {
    if (!pedidoId) return;
    void cargar();
  }, [pedidoId, cargar]);

  const pagar = async () => {
    setPagando(true);
    setErrorRequest("");
    try {
      await iniciarPagoMercadoPago(pedidoId);
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al iniciar el pago",
      );
      setPagando(false);
    }
  };

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="mx-auto max-w-lg p-6 text-center text-slate-500">
        No encontramos el pedido.
      </main>
    );
  }

  const esMp = pedido.forma_pago_codigo === "MP";

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-lg space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <span className="text-4xl">✓</span>
          <h1 className="mt-2 text-xl font-bold text-emerald-900">
            ¡Pedido creado!
          </h1>
          <p className="mt-1 text-sm text-emerald-800">
            Pedido #{pedido.id} · {ESTADO_LABEL[pedido.estado_codigo]}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
          <h2 className="mb-3 font-semibold text-slate-800">Resumen</h2>
          <ul className="space-y-2">
            {pedido.detalles.map((item, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span>
                  {item.cantidad}× {item.nombre_snapshot}
                </span>
                <span>{precio(item.subtotal_snap)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t pt-3 font-bold">
            <span>Total</span>
            <span>{precio(pedido.total)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {fechaCorta(pedido.created_at)}
          </p>
        </div>

        {pedido.estado_codigo === "PENDIENTE" && esMp && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Tu pedido está <strong>pendiente de pago</strong>. Completá el pago
            con MercadoPago para confirmarlo.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {pedido.estado_codigo === "PENDIENTE" && esMp && (
            <button
              type="button"
              disabled={pagando}
              onClick={() => void pagar()}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {pagando ? "Redirigiendo a MercadoPago…" : "Pagar con MercadoPago"}
            </button>
          )}
          <Link
            to={`/pedidos/${pedido.id}`}
            className="w-full rounded-lg border border-slate-300 bg-white py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ver detalle del pedido
          </Link>
          <button
            type="button"
            onClick={() => navigate("/pedidos")}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Ir a mis pedidos
          </button>
        </div>
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
