import Login from "./pages/Login";
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
        <Route path="/productos" element={<ProductoPage />} />
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

        <Route path="/ingredientes" element={<IngredientePage />} />
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

        <Route path="/categorias" element={<CategoriaPage />} />
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
      </Route>
    </Routes>
  );
}

export default App;

// usuarios machete
// {
//   "email": "giani@gmail.com",
//   "password": "1234",
//   "rol": "ADMIN"
// }

// {
//   "email": "test@example.com",
//   "password": "1234",
//   "rol": "CLIENT"
// }
