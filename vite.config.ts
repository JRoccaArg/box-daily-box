import { defineConfig, searchForWorkspaceRoot } from "vite";
import { realpathSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
// Side-effect import: trae la ampliación de tipos de `ssgOptions` en
// `UserConfig` (declarada en vite-react-ssg). Sin esto, tsc no la ve porque
// este archivo compila en un proyecto TS separado del resto de la app.
import type {} from "vite-react-ssg/node";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Worktrees may share installed dependencies through a junction.
      // Permit the flag package's SVGs, without opening the parent directory.
      allow: [searchForWorkspaceRoot(process.cwd()), realpathSync(fileURLToPath(new URL("./node_modules/flag-icons", import.meta.url)))],
    },
  },
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
