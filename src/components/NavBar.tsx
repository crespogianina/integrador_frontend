import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { Rol } from "../types/auth";

const LINKS: { to: string; label: string; roles?: Rol[] }[] = [
  { to: "/productos", label: "Productos" },
  { to: "/pedidos", label: "Mis pedidos", roles: ["CLIENT"] },
  { to: "/ingredientes", label: "Ingredientes", roles: ["ADMIN", "STOCK"] },
  { to: "/categorias", label: "Categorías", roles: ["ADMIN"] },
  {
    to: "/admin/pedidos",
    label: "Gestión de pedidos",
    roles: ["ADMIN", "PEDIDOS"],
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, rol, hasRol, isAuthenticated } = useAuth();
  const { itemCount } = useCart();

  const esCliente = hasRol("CLIENT");

  // Filtra los links según el rol del usuario logueado
  const linksVisibles = LINKS.filter(
    (link) => !link.roles || hasRol(link.roles),
  );

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/productos" className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-800">Food Store</span>
        </Link>

        <div className="flex items-center gap-2">
          {esCliente && (
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              aria-label={`Carrito (${itemCount} items)`}
              className="relative rounded-xl border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          )}

          {/* Hamburguesa */}
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
        </div>

        {open && (
          <div className="absolute right-1 top-17 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            {user && (
              <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">{user.username}</p>
                <p>Rol: {rol}</p>
              </div>
            )}

            <div className="space-y-1">
              {linksVisibles.map((link) => {
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
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-red-100 px-4 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-200"
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
