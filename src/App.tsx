import Layout from "./components/Layout";
import { Route, Routes } from "react-router-dom";
import IngredientePage from "./pages/ingredientes/IngredientePage";
import CategoriaPage from "./pages/categorias/CategoriaPage";
import { IngredienteFormulario } from "./pages/ingredientes/IngredienteFormulario";
import CategoriaFormulario from "./pages/categorias/CategoriaFormulario";
import ProductoPage from "./pages/productos/ProductoPage";
import ProductoFormulario from "./pages/productos/ProductoFormulario";
import PrivateRoute from "./routes/PrivateRouter";
import RootRedirect from "./routes/RootRedirect";
import { PedidoTrackingPage } from "./pages/pedidos/PedidoTrackingPage";
import { MisPedidosPage } from "./pages/pedidos/PedidosPage";
import { PedidoConfirmacionPage } from "./pages/pedidos/PedidoConfirmacionPage";
import { ClientesPage } from "./pages/clientes/ClientesPage";
import { CheckoutPage } from "./pages/pagos/CheckoutPage";
import { PagoRetornoPage } from "./pages/pagos/PagoRetornoPage";
import { AdminPedidosPage } from "./pages/pedidos/AdminPedidosPage";
import Login from "./pages/login/Login";
import ClienteEditPage from "./pages/clientes/ClienteFormularioPage";
import ProductoClientePage from "./pages/productos/ProductoClientePage";
import DireccionesPage from "./pages/clientes/DireccionesPage";
import DireccionFormulario from "./pages/clientes/DirreccionFormulario";
import SinAccesoPage from "./pages/SinAccesoPage";
import StockControlPage from "./pages/stock/StockControlPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* ── CLIENT ── */}
        <Route
          path="/catalogo"
          element={
            <PrivateRoute roles="CLIENT">
              <ProductoClientePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/pedidos"
          element={
            <PrivateRoute roles="CLIENT">
              <MisPedidosPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/pedidos/:id"
          element={
            <PrivateRoute roles="CLIENT">
              <PedidoTrackingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute roles="CLIENT">
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/:pedidoId/:status"
          element={
            <PrivateRoute roles="CLIENT">
              <PagoRetornoPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/direcciones"
          element={
            <PrivateRoute roles="CLIENT">
              <DireccionesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/direcciones/nueva"
          element={
            <PrivateRoute roles="CLIENT">
              <DireccionFormulario />
            </PrivateRoute>
          }
        />
        <Route
          path="/direcciones/editar/:id"
          element={
            <PrivateRoute roles="CLIENT">
              <DireccionFormulario />
            </PrivateRoute>
          }
        />

        {/* ── ADMIN + STOCK ── */}
        <Route
          path="/stock"
          element={
            <PrivateRoute roles={["ADMIN", "STOCK"]}>
              <StockControlPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ingredientes"
          element={
            <PrivateRoute roles="ADMIN">
              <IngredientePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ingredientes/nuevo"
          element={
            <PrivateRoute roles="ADMIN">
              <IngredienteFormulario />
            </PrivateRoute>
          }
        />
        <Route
          path="/ingredientes/editar/:id"
          element={
            <PrivateRoute roles="ADMIN">
              <IngredienteFormulario />
            </PrivateRoute>
          }
        />

        {/* ── ADMIN + PEDIDOS ── */}
        <Route
          path="/admin/pedidos"
          element={
            <PrivateRoute roles={["ADMIN", "PEDIDOS"]}>
              <AdminPedidosPage />
            </PrivateRoute>
          }
        />

        {/* ── ADMIN only ── */}
        <Route
          path="/productos"
          element={
            <PrivateRoute roles="ADMIN">
              <ProductoPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/productos/nuevo"
          element={
            <PrivateRoute roles="ADMIN">
              <ProductoFormulario />
            </PrivateRoute>
          }
        />
        <Route
          path="/productos/editar/:id"
          element={
            <PrivateRoute roles="ADMIN">
              <ProductoFormulario />
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <PrivateRoute roles="ADMIN">
              <CategoriaPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias/nuevo"
          element={
            <PrivateRoute roles="ADMIN">
              <CategoriaFormulario />
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias/editar/:id"
          element={
            <PrivateRoute roles="ADMIN">
              <CategoriaFormulario />
            </PrivateRoute>
          }
        />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:pedidoId/:status" element={<PagoRetornoPage />} />
        <Route path="/pedidos" element={<MisPedidosPage />} />
        <Route
          path="/pedidos/confirmacion/:id"
          element={<PedidoConfirmacionPage />}
        />
        <Route path="/pedidos/:id" element={<PedidoTrackingPage />} />
        <Route
          path="/admin/pedidos"
          element={
            <PrivateRoute roles={["ADMIN", "PEDIDOS"]}>
              <AdminPedidosPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/clientes"
          element={
            <PrivateRoute roles="ADMIN">
              <ClientesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/clientes/nuevo"
          element={
            <PrivateRoute roles="ADMIN">
              <ClienteEditPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/clientes/editar/:id"
          element={
            <PrivateRoute roles="ADMIN">
              <ClienteEditPage />
            </PrivateRoute>
          }
        />
      </Route>
      <Route path="/sin-acceso" element={<SinAccesoPage />} />
    </Routes>
  );
}

export default App;
