import { useState } from "react";

type Props = {
  pedidoId: number;
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: (motivo: string) => Promise<void>;
};

export function ModalCancelarPedido({
  pedidoId,
  abierto,
  onCerrar,
  onConfirmar,
}: Props) {
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  if (!abierto) return null;

  const confirmar = async () => {
    if (!motivo.trim()) {
      setError("El motivo es obligatorio");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      await onConfirmar(motivo.trim());
      setMotivo("");
      onCerrar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cancelar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-800">
          Cancelar pedido #{pedidoId}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Indicá el motivo de la cancelación (obligatorio).
        </p>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={3}
          placeholder="Ej: producto agotado, cliente solicitó cancelar…"
          className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            disabled={enviando}
            onClick={onCerrar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Volver
          </button>
          <button
            type="button"
            disabled={enviando}
            onClick={() => void confirmar()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {enviando ? "Cancelando…" : "Confirmar cancelación"}
          </button>
        </div>
      </div>
    </div>
  );
}
