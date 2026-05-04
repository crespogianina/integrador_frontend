import Login from "./pages/Login";
import Layout from "./components/Layout";
import { Route, Routes } from "react-router-dom";
import IngredientePage from "./pages/ingredientes/IngredientePage";
import InsumoPage from "./pages/productos/InsumoPage";
import CategoriaPage from "./pages/categorias/CategoriaPage";
import { IngredienteFormulario } from "./pages/ingredientes/IngredienteFormulario";
import CategoriaFormulario from "./pages/categorias/CategoriaFormulario";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/productos" element={<InsumoPage />} />

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
