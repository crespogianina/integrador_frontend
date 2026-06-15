import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loadNunitoFont } from "../lib/loadNunitoFont";
import Navbar from "./NavBar";

export default function ClientLayout() {
  const { hasRol } = useAuth();
  const esCliente = hasRol("CLIENT");

  useEffect(() => {
    if (esCliente) loadNunitoFont();
  }, [esCliente]);

  return (
    <div className="min-h-screen font-nunito">
      <Navbar />
      <Outlet />
    </div>
  );
}
