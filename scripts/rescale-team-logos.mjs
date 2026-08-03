// scripts/rescale-team-logos.mjs
//
// Toma los logos crudos que el usuario descarga a mano (cualquier tamaño,
// cualquier proporción) y los reescala a un tamaño uniforme para el juego
// "Career Path". Salida: PNG cuadrado, fondo transparente, logo centrado
// con padding, mismo tamaño para todas las escuderías.
//
// Uso: node scripts/rescale-team-logos.mjs
// Lee de:  RAW_DIR (logos crudos, nombrados "Logo_<Nombre>.png")
// Escribe en: public/team-logos/<team-id>.png (id exacto del dataset)
//
// El mapeo FILENAME -> team-id es manual (no hay forma confiable de
// adivinarlo): agregar una entrada nueva acá cada vez que llegue un logo
// nuevo. Si un archivo del RAW_DIR no está en el mapa, se avisa y se
// ignora (no rompe el resto).

import { readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const RAW_DIR = "C:\\Users\\juanr\\Downloads\\logos";
const OUT_DIR = join(process.cwd(), "public", "team-logos");
const SIZE = 200; // px, cuadrado. Elegido por el usuario en Etapa 2.

// Filename (sin extensión) -> uno o mas team-id del dataset (src/data/teams.ts).
// Un mismo archivo puede mapear a varios ids cuando dos identidades
// historicas comparten logo (excepcion acordada: RB 2024 y Racing Bulls
// 2025+ usan el mismo archivo porque el logo real es practicamente igual).
const FILENAME_TO_TEAM_IDS = {
  Logo_Alfa_Romeo: ["alfa-romeo"],
  Logo_Alpha_Tauri: ["alphatauri"],
  Logo_Alpine: ["alpine"],
  Logo_Arrows: ["arrows"],
  Logo_Aston_Martin: ["aston-martin"],
  Logo_BAR: ["bar"],
  Logo_BMW_Sauber: ["bmw-sauber"],
  Logo_Benetton: ["benetton"],
  Logo_Brawn: ["brawn"],
  Logo_Caterham: ["caterham"],
  Logo_Ferrari: ["ferrari"],
  Logo_Force_India: ["force-india"],
  Logo_Forti: ["forti"],
  Logo_HRT: ["hrt"],
  Logo_Haas: ["haas"],
  Logo_Honda: ["honda"],
  Logo_Jaguar: ["jaguar"],
  Logo_Jordan: ["jordan"],
  Logo_Kick_Sauber: ["kick-sauber"],
  Logo_Lola: ["lola"],
  Logo_Lotus: ["lotus"],
  Logo_Lotus_Racing: ["lotus-racing"],
  Logo_Manor: ["manor"],
  Logo_Marrusia: ["marussia"],
  Logo_Mclaren: ["mclaren"],
  Logo_Mercedes: ["mercedes"],
  Logo_Midland: ["midland"],
  Logo_Minardi: ["minardi"],
  Logo_Prost: ["prost"],
  // RB (2024) y Racing Bulls (2025+): excepcion acordada, mismo logo real.
  Logo_RB: ["racing-bulls", "rb"],
  Logo_Racing_Point: ["racing-point"],
  Logo_RedBull: ["red-bull"],
  Logo_Renault: ["renault"],
  Logo_Sauber: ["sauber"],
  Logo_Spyker: ["spyker"],
  Logo_Stewart: ["stewart"],
  Logo_Super_Aguri: ["super-aguri"],
  Logo_Toro_Rosso: ["toro-rosso"],
  Logo_Toyota: ["toyota"],
  Logo_Virgin: ["virgin"],
  Logo_Williams: ["williams"],
};

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(RAW_DIR).filter((f) => f.toLowerCase().endsWith(".png"));
  const seenKeys = new Set(Object.keys(FILENAME_TO_TEAM_IDS));
  let written = 0;
  const unmapped = [];

  for (const file of files) {
    const key = file.replace(/\.png$/i, "");
    const teamIds = FILENAME_TO_TEAM_IDS[key];
    if (!teamIds) {
      unmapped.push(file);
      continue;
    }
    seenKeys.delete(key);
    const buf = await sharp(join(RAW_DIR, file))
      .resize(SIZE, SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toBuffer();
    for (const teamId of teamIds) {
      await sharp(buf).toFile(join(OUT_DIR, `${teamId}.png`));
      written++;
      console.log(`  ✅ ${file} -> team-logos/${teamId}.png`);
    }
  }

  if (unmapped.length) {
    console.log(`\n⚠️  Archivos en ${RAW_DIR} sin mapeo (ignorados):`);
    for (const f of unmapped) console.log(`  - ${f}`);
  }
  if (seenKeys.size) {
    console.log(`\n⚠️  Entradas del mapa sin archivo correspondiente en ${RAW_DIR}:`);
    for (const k of seenKeys) console.log(`  - ${k}`);
  }

  console.log(`\n${written} logos escritos en ${OUT_DIR} (${SIZE}x${SIZE}px, fondo transparente).`);
}

main();
