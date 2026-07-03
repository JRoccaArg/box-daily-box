import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StatsProvider } from "@/context/StatsContext";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { GamePage } from "@/pages/GamePage";
import { AuthCallback } from "@/pages/AuthCallback";

/**
 * Raiz de la aplicacion. Compone los proveedores globales y el ruteo.
 *  - StatsProvider: estado de progreso/estadisticas (lee y escribe localStorage).
 *  - Layout: marco visual comun (header + footer).
 *  - Routes: home, pagina de juego, y callback de OAuth.
 */
export function App() {
  return (
    <BrowserRouter>
      <StatsProvider>
        <Routes>
          {/* Callback OAuth SIN Layout (pantalla completa) */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* Rutas normales CON Layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/juego/:gameId" element={<GamePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </StatsProvider>
    </BrowserRouter>
  );
}
