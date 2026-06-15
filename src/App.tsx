import Layout from "./components/Layout";
import ClientLayout from "./components/ClientLayout";
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
import Register from "./pages/login/Register";
import ClienteEditPage from "./pages/clientes/ClienteFormularioPage";
import ProductoClientePage from "./pages/productos/ProductoClientePage";
import DireccionesPage from "./pages/clientes/DireccionesPage";
import DireccionFormulario from "./pages/clientes/DirreccionFormulario";
import MiCuentaPage from "./pages/cuenta/MiCuentaPage";
import SinAccesoPage from "./pages/SinAccesoPage";
import ProductoDetallePage from "./pages/productos/ProductoDetalle";
import StockControlPage from "./pages/stock/StockControlPage";
import { EstadisticasPage } from "./pages/estadisticas/EstadisticasPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <PrivateRoute roles="CLIENT">
            <ClientLayout />
          </PrivateRoute>
        }
      >
        <Route path="/catalogo" element={<ProductoClientePage />} />
        <Route path="/catalogo/:id" element={<ProductoDetallePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:pedidoId/:status" element={<PagoRetornoPage />} />
        <Route path="/mis-pedidos" element={<MisPedidosPage />} />
        <Route path="/pedidos/:id" element={<PedidoTrackingPage />} />
        <Route
          path="/pedidos/confirmacion/:id"
          element={<PedidoConfirmacionPage />}
        />
        <Route path="/direcciones" element={<DireccionesPage />} />
        <Route path="/direcciones/nueva" element={<DireccionFormulario />} />
        <Route
          path="/direcciones/editar/:id"
          element={<DireccionFormulario />}
        />
        <Route path="/cuenta" element={<MiCuentaPage />} />
      </Route>

      <Route
        element={
          <PrivateRoute roles={["ADMIN", "STOCK", "PEDIDOS"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route
          path="/stock"
          element={
            <PrivateRoute roles={["ADMIN", "STOCK"]}>
              <StockControlPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/pedidos"
          element={
            <PrivateRoute roles={["ADMIN", "PEDIDOS"]}>
              <AdminPedidosPage />
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
        <Route
          path="/admin/estadisticas"
          element={
            <PrivateRoute roles="ADMIN">
              <EstadisticasPage />
            </PrivateRoute>
          }
        />
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
