type ConfirmarSalidaModalProps = {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
};

export default function ConfirmarSalidaModal({
  abierto,
  onCerrar,
  onConfirmar,
}: ConfirmarSalidaModalProps) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-800">
          ¿Deseás cerrar sesión?
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Vas a salir de tu cuenta. Podés volver a ingresar cuando quieras.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Sí, salir
          </button>
        </div>
      </div>
    </div>
  );
}
