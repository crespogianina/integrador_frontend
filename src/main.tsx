import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { IngredientesProvider } from "./context/IngredienteContext.tsx";
import { CategoriasProvider } from "./context/CategoriaContext.tsx";
import { ProductosProvider } from "./context/ProductoContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CategoriasProvider>
        <IngredientesProvider>
          <ProductosProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ProductosProvider>
        </IngredientesProvider>
      </CategoriasProvider>
    </AuthProvider>
  </StrictMode>,
);
