import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { Rol } from "../types/auth";
import { brand } from "../lib/brand";
import ConfirmarSalidaModal from "./ConfirmarSalidaModal";

function IcoCatalogo() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function IcoStock() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function IcoProductos() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
function IcoPedidos() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="12" y2="16" />
    </svg>
  );
}
function IcoDirecciones() {
  return (
    <svg
      width="16"
      height="16"
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
function IcoCuenta() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IcoClientes() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IcoIngredientes() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
function IcoCategorias() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function IcoGestionPedidos() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <polyline points="9 11 12 14 22 4" />
    </svg>
  );
}

const LINKS: {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: Rol[];
}[] = [
  {
    to: "/catalogo",
    label: "Catálogo",
    icon: <IcoCatalogo />,
    roles: ["CLIENT"],
  },
  {
    to: "/mis-pedidos",
    label: "Mis pedidos",
    icon: <IcoPedidos />,
    roles: ["CLIENT"],
  },
  {
    to: "/direcciones",
    label: "Mis direcciones",
    icon: <IcoDirecciones />,
    roles: ["CLIENT"],
  },
  { to: "/cuenta", label: "Mi cuenta", icon: <IcoCuenta />, roles: ["CLIENT"] },
  {
    to: "/stock",
    label: "Control de stock",
    icon: <IcoStock />,
    roles: ["ADMIN", "STOCK"],
  },
  {
    to: "/admin/pedidos",
    label: "Gestión de pedidos",
    icon: <IcoGestionPedidos />,
    roles: ["ADMIN", "PEDIDOS"],
  },
  {
    to: "/productos",
    label: "Productos",
    icon: <IcoProductos />,
    roles: ["ADMIN"],
  },
  {
    to: "/ingredientes",
    label: "Ingredientes",
    icon: <IcoIngredientes />,
    roles: ["ADMIN"],
  },
  {
    to: "/categorias",
    label: "Categorías",
    icon: <IcoCategorias />,
    roles: ["ADMIN"],
  },
  {
    to: "/admin/clientes",
    label: "Clientes",
    icon: <IcoClientes />,
    roles: ["ADMIN"],
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, rol, hasRol, isAuthenticated } = useAuth();
  const { itemCount } = useCart();

  const esCliente = hasRol("CLIENT");

  const linksVisibles = LINKS.filter(
    (link) => !link.roles || hasRol(link.roles),
  );

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
    setOpen(false);
    setConfirmarSalida(false);
  }

  function solicitarSalida() {
    setConfirmarSalida(true);
  }

  function linkClass(active: boolean) {
    const base =
      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";
    if (active) {
      return `${base} ${esCliente ? brand.navActive : "bg-blue-100 text-blue-700"}`;
    }
    return `${base} text-slate-600 hover:bg-slate-100 hover:text-slate-900`;
  }

  function iconClass(active: boolean) {
    if (active) return "shrink-0";
    return "shrink-0 text-slate-400";
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <nav className="relative flex h-16 w-full items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <svg
            className="h-8 w-8 shrink-0 text-amber-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 8.5c0-2 3.13-3.5 7-3.5s7 1.5 7 3.5" />
            <path d="M4 11h16" />
            <path d="M4 14h16" />
            <path d="M5 17.5c0 2 3.13 3.5 7 3.5s7-1.5 7-3.5" />
            <circle cx="9" cy="8" r="0.75" fill="currentColor" stroke="none" />
            <circle
              cx="12"
              cy="7.5"
              r="0.75"
              fill="currentColor"
              stroke="none"
            />
            <circle cx="15" cy="8" r="0.75" fill="currentColor" stroke="none" />
          </svg>
          <span className="text-lg font-bold text-slate-800">Food Store</span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-4">
          {esCliente && isAuthenticated && user && (
            <p className="hidden text-base font-semibold text-slate-700 sm:block">
              ¡Hola!{" "}
              <span className="text-lg font-extrabold text-amber-600">
                {user.nombre ?? user.username}
              </span>
            </p>
          )}

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

          {esCliente && isAuthenticated && (
            <span
              className="hidden h-6 w-px shrink-0 bg-slate-200 md:block"
              aria-hidden
            />
          )}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-xl border border-slate-300 bg-white p-2 text-slate-700 hover:bg-slate-100"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
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
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <div className="absolute right-4 top-[4.25rem] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {user && (
                <div className="border-b border-slate-100 bg-amber-50 px-4 py-3">
                  {esCliente ? (
                    <Link
                      to="/cuenta"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 hover:opacity-80"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
                        {user.username?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {user.username}
                        </p>
                        {rol !== "CLIENT" && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                            {rol}
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">
                        {user.username?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {user.username}
                        </p>
                        <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {rol}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Links con íconos */}
              <nav className="flex flex-col p-2">
                {linksVisibles.map((link) => {
                  const active = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setOpen(false)}
                      className={linkClass(active)}
                    >
                      <span className={iconClass(active)}>{link.icon}</span>
                      {link.label}
                    </Link>
                  );
                })}

                <div className="my-2 border-t border-slate-100" />

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={solicitarSalida}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    <span className="shrink-0 text-red-400">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </span>
                    Cerrar sesión
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Ingresar
                  </Link>
                )}
              </nav>
            </div>
          </>
        )}
      </nav>

      <ConfirmarSalidaModal
        abierto={confirmarSalida}
        onCerrar={() => setConfirmarSalida(false)}
        onConfirmar={handleLogout}
      />
    </header>
  );
}
