import Login from "./pages/Login";
import Layout from "./components/Layout";
import { Route, Routes } from "react-router-dom";
import IngredientePage from "./pages/ingredientes/IngredientePage";
import InsumoPage from "./pages/productos/InsumoPage";
import CategoriaPage from "./pages/categorias/CategoriaPage";
import { IngredienteFormulario } from "./pages/ingredientes/IngredienteForm";
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
        <Route path="/productos" element={<InsumoPage />} />
        <Route path="/ingredientes" element={<IngredientePage />} />
        <Route
          path="/ingredientes/nuevo"
          element={
            <PrivateRoute roles="ADMIN">
              <IngredienteFormulario />
            </PrivateRoute>
          }
        />
        <Route path="/categorias" element={<CategoriaPage />} />
      </Route>
    </Routes>
  );
}

export default App;
