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
import { CartProvider } from "./context/CartContext.tsx";
import { DireccionesProvider } from "./context/DireccionesContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductosProvider>
          <IngredientesProvider>
            <DireccionesProvider>
              <CategoriasProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </CategoriasProvider>
            </DireccionesProvider>
          </IngredientesProvider>
        </ProductosProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
