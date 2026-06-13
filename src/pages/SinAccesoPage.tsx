import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SinAccesoPage() {
  const navigate = useNavigate();
  const { hasRol } = useAuth();

  const home = hasRol("CLIENT") ? "/catalogo" : "/productos";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6 text-center">
      <span className="text-6xl">🚫</span>
      <h1 className="mt-4 text-2xl font-bold text-slate-800">Sin acceso</h1>
      <p className="mt-2 text-slate-500">
        No tenés permisos para ver esta página.
      </p>
      <button
        type="button"
        onClick={() => navigate(home, { replace: true })}
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Volver al inicio
      </button>
    </main>
  );
}
