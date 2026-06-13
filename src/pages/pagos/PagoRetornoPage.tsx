import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";

export function PagoRetornoPage() {
  const navigate = useNavigate();
  const { pedidoId, status } = useParams();
  const [searchParams] = useSearchParams();
  const [mensaje, setMensaje] = useState("Confirmando tu pago…");

  useEffect(() => {
    const confirmar = async () => {
      const paymentId = searchParams.get("payment_id");

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
        } catch {}
      }

      if (status === "failure") {
        setMensaje(
          "El pago fue rechazado. Podés reintentarlo desde tu pedido.",
        );
      } else if (status === "pending") {
        setMensaje("Tu pago está en proceso. Te avisamos en el seguimiento.");
      } else {
        setMensaje("¡Pago aprobado! Redirigiendo al seguimiento…");
      }

      setTimeout(
        () => navigate(`/pedidos/${pedidoId}`, { replace: true }),
        1800,
      );
    };

    confirmar();
  }, []);

  return (
    <main className="flex min-h-screen w-lvw items-center justify-center bg-slate-100 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white px-10 py-12 text-center shadow">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        <p className="font-medium text-slate-700">{mensaje}</p>
      </div>
    </main>
  );
}
