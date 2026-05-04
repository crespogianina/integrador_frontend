import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { IngredientesProvider } from "./context/IngredienteContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <IngredientesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </IngredientesProvider>
    </AuthProvider>
  </StrictMode>,
);
