import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const links = [
  { to: "/ingredientes", label: "Ingredientes" },
  { to: "/productos", label: "Productos" },
  { to: "/categorias", label: "Categorías" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("auth");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/ingredientes" className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-800">Food Store</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-xl border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Abrir menú"
        >
          {open ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {open && (
          <div className="absolute right-1 top-17 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <div className="space-y-1">
              {links.map((link) => {
                const active = location.pathname === link.to;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={logout}
                className="w-full rounded-xl bg-red-100 px-4 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-200"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
