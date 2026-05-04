import Login from "./pages/Login";
import Layout from "./components/Layout";
import { Route, Routes } from "react-router-dom";
import IngredientePage from "./pages/ingredientes/IngredientePage";
import CategoriaPage from "./pages/categorias/CategoriaPage";
import { IngredienteFormulario } from "./pages/ingredientes/IngredienteFormulario";
import CategoriaFormulario from "./pages/categorias/CategoriaFormulario";
import ProductoPage from "./pages/productos/ProductoPage";
import ProductoFormulario from "./pages/productos/ProductoFormulario";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/productos" element={<ProductoPage />} />
        <Route path="/productos/nuevo" element={<ProductoFormulario />} />
        <Route path="/productos/editar/:id" element={<ProductoFormulario />} />

        <Route path="/ingredientes" element={<IngredientePage />} />
        <Route path="/ingredientes/nuevo" element={<IngredienteFormulario />} />
        <Route
          path="/ingredientes/editar/:id"
          element={<IngredienteFormulario />}
        />

        <Route path="/categorias" element={<CategoriaPage />} />
        <Route path="/categorias/nuevo" element={<CategoriaFormulario />} />
        <Route
          path="/categorias/editar/:id"
          element={<CategoriaFormulario />}
        />
      </Route>
    </Routes>
  );
}

export default App;
