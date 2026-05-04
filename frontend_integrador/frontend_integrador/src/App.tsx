import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import InsumoPage from "./pages/InsumoPage";
import IngredientePage from "./pages/IngredientePage";
import CategoriaPage from "./pages/CategoriaPage";
import RequireAuth from "./routes/RequireAuth";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/productos" element={<InsumoPage />} />
          <Route path="/ingredientes" element={<IngredientePage />} />
          <Route path="/categorias" element={<CategoriaPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/productos" replace />} />
    </Routes>
  );
}

export default App;
