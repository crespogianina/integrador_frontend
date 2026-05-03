import Login from "./pages/Login";
import InsumoPage from "./pages/InsumoPage";
import Layout from "./components/Layout";
import { Route, Routes } from "react-router-dom";
import IngredientePage from "./pages/IngredientePage";
import CategoriaPage from "./pages/CategoriaPage";

function App() {
  return (
    <Routes>
      {/* rutas sin navbar */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* rutas con navbar */}
      <Route element={<Layout />}>
        <Route path="/productos" element={<InsumoPage />} />
        <Route path="/ingredientes" element={<IngredientePage />} />
        <Route path="/categorias" element={<CategoriaPage />} />
      </Route>
    </Routes>
  );
}

export default App;
