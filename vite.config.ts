import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
// Side-effect import: trae la ampliación de tipos de `ssgOptions` en
// `UserConfig` (declarada en vite-react-ssg). Sin esto, tsc no la ve porque
// este archivo compila en un proyecto TS separado del resto de la app.
import type {} from "vite-react-ssg/node";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  ssgOptions: {
    entry: "src/main.tsx",
    // /en/juego/pittexto -> en/juego/pittexto/index.html (URLs limpias).
    dirStyle: "nested",
    // 'none': el default 'prettify' puede romper la hidratación (ver docs).
    formatting: "none",
  },
});
