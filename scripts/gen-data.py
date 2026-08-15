# -*- coding: utf-8 -*-
"""Genera el dataset desde f1db usando RESULTADOS reales (carrera/sprint/quali),
excluyendo reservas que nunca largaron ni clasificaron."""
import os, glob, re, unicodedata, yaml

ROOT = "/tmp/f1src/f1db/src/data"
OUT = "/tmp/f1src/out"
os.makedirs(OUT, exist_ok=True)
CUTOFF = 2025

def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

countries = {load(p)["id"]: load(p) for p in glob.glob(f"{ROOT}/countries/*.yml")}
drivers_meta = {load(p)["id"]: load(p) for p in glob.glob(f"{ROOT}/drivers/*.yml")}
cons_meta = {load(p)["id"]: load(p) for p in glob.glob(f"{ROOT}/constructors/*.yml")}

def ccode(cid):
    c = countries.get(cid)
    return (c.get("alpha3Code") or c.get("iocCode")) if c else None

years = sorted(int(os.path.basename(d)) for d in glob.glob(f"{ROOT}/seasons/*") if os.path.isdir(d))
years = [y for y in years if y <= CUTOFF]

raced = set()                 # driverIds que largaron carrera/sprint
qualified = set()             # driverIds que clasificaron
driver_years = {}             # driverId -> set(year)
driver_team_years = {}        # driverId -> {cid: [minY,maxY]}
driver_team_chronology = {}   # driverId -> [(year, cid), ...] un punto por CADA cambio de equipo real
                               # (incluye cambios a mitad de temporada, ej. Fisichella
                               # Force India -> Ferrari en 2009: dos entradas, mismo anio)
cons_years = {}               # cid -> [minY,maxY]
champion_years = {}           # driverId -> [years]
wins = {}; podiums = {}; poles = {}  # driverId -> int

# Nombres de archivo que representan PARTICIPACION real (no práctica libre).
RESULT_FILES = ["race-results.yml", "sprint-race-results.yml", "qualifying-results.yml"]

def register(did, cid, y):
    driver_years.setdefault(did, set()).add(y)
    if cid:
        tt = driver_team_years.setdefault(did, {}).setdefault(cid, [y, y])
        tt[0] = min(tt[0], y); tt[1] = max(tt[1], y)
        cy = cons_years.setdefault(cid, [y, y])
        cy[0] = min(cy[0], y); cy[1] = max(cy[1], y)

for y in years:
    # NO ordenado (glob() tal cual, igual que siempre): esto alimenta
    # driver_team_years/wins/podiums/poles, que YA usan PitTexto y Bingo.
    # El orden de recorrido de carreras dentro de una temporada nunca importo
    # para esos calculos (son min/max o contadores), asi que cambiarlo ahora
    # solo introduciria diffs de orden sin motivo. La cronologia NUEVA
    # (con orden real de ronda, para preservar retornos a un equipo) se
    # calcula aparte, en un segundo recorrido mas abajo — así el dataset
    # existente queda bit a bit igual salvo por el campo agregado.
    for race_dir in glob.glob(f"{ROOT}/seasons/{y}/races/*"):
        rp = os.path.join(race_dir, "race.yml")
        if os.path.exists(rp):
            rinfo = load(rp) or {}
            if rinfo.get("circuitId") == "indianapolis" and y <= 1960:
                continue  # 500 Millas de óvalo (ronda WC 1950-60), no es F1
        for fname in RESULT_FILES:
            p = os.path.join(race_dir, fname)
            if not os.path.exists(p): continue
            rows = load(p) or []
            is_race = fname != "qualifying-results.yml"
            for r in rows:
                did = r.get("driverId"); cid = r.get("constructorId")
                if not did: continue
                (raced if is_race else qualified).add(did)
                register(did, cid, y)
                pos = r.get("position")
                if fname == "race-results.yml":      # solo GP principal
                    if pos == 1: wins[did] = wins.get(did, 0) + 1
                    if pos in (1, 2, 3): podiums[did] = podiums.get(did, 0) + 1
                elif fname == "qualifying-results.yml":
                    if pos == 1: poles[did] = poles.get(did, 0) + 1
    # campeon de la temporada
    st_path = f"{ROOT}/seasons/{y}/driver-standings.yml"
    if os.path.exists(st_path):
        for row in (load(st_path) or []):
            if row.get("position") == 1 and row.get("driverId"):
                champion_years.setdefault(row["driverId"], []).append(y)
                break

# Inclusion: largo carrera/sprint O clasifico al menos una vez.
included = sorted(raced | qualified)

# ---------- cronologia real de equipos (segundo recorrido, aislado) ----------
# Recorrido independiente del de arriba: mismo ROOT, pero con carreras
# ORDENADAS por ronda dentro de cada temporada (los nombres de carpeta son
# "01-australia", "02-malaysia", ... asi que el orden alfabetico coincide con
# el orden cronologico real). Solo alimenta driver_team_chronology — no toca
# ninguna estructura usada por el resto del script.
for y in years:
    for race_dir in sorted(glob.glob(f"{ROOT}/seasons/{y}/races/*")):
        rp = os.path.join(race_dir, "race.yml")
        if os.path.exists(rp):
            rinfo = load(rp) or {}
            if rinfo.get("circuitId") == "indianapolis" and y <= 1960:
                continue
        for fname in RESULT_FILES:
            p = os.path.join(race_dir, fname)
            if not os.path.exists(p): continue
            for r in (load(p) or []):
                did = r.get("driverId"); cid = r.get("constructorId")
                if not did or not cid: continue
                chron = driver_team_chronology.setdefault(did, [])
                if not chron or chron[-1][1] != cid:
                    chron.append((y, cid))

# ---------- helpers de salida ----------
def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))
def wordle_key(last):
    return re.sub(r"[^A-Z]", "", strip_accents(last).upper())
def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')
def flag_emoji(a2):
    if not a2 or len(a2) != 2: return "🏁"
    try: return "".join(chr(0x1F1E6 + (ord(ch) - ord("A"))) for ch in a2.upper())
    except Exception: return "🏁"

ES_NAME = {
 "GBR":"Reino Unido","DEU":"Alemania","NLD":"Países Bajos","ESP":"España","FIN":"Finlandia",
 "FRA":"Francia","BRA":"Brasil","AUS":"Australia","MEX":"México","MCO":"Mónaco","CAN":"Canadá",
 "AUT":"Austria","ITA":"Italia","JPN":"Japón","DNK":"Dinamarca","THA":"Tailandia","CHN":"China",
 "USA":"Estados Unidos","ARG":"Argentina","CHE":"Suiza","SWE":"Suecia","COL":"Colombia",
 "POL":"Polonia","IRL":"Irlanda","NZL":"Nueva Zelanda","RUS":"Rusia","IND":"India","BEL":"Bélgica",
 "ZAF":"Sudáfrica","VEN":"Venezuela","PRT":"Portugal","CZE":"Chequia","HUN":"Hungría",
 "LIE":"Liechtenstein","URY":"Uruguay","CHL":"Chile","ZWE":"Zimbabue","MYS":"Malasia",
 "IDN":"Indonesia","MAR":"Marruecos",
}

# nacionalidades usadas
used = {}
for did in included:
    dm = drivers_meta.get(did)
    if not dm: continue
    cid_ = dm.get("nationalityCountryId"); c = countries.get(cid_)
    if not c: continue
    code = ccode(cid_)
    if code: used[code] = c.get("alpha2Code")

nat_lines = [f'  {code}: {{ code: "{code}", name: "{esc(ES_NAME.get(code) or (countries_name(code)))}", flag: "{flag_emoji(a2)}" }},'
             for code, a2 in sorted(used.items())] if False else []
# (construido abajo de forma simple)
def country_name_en(code):
    for c in countries.values():
        if (c.get("alpha3Code") or c.get("iocCode")) == code: return c.get("name")
    return code
nat_lines = []
for code, a2 in sorted(used.items()):
    name = ES_NAME.get(code) or country_name_en(code)
    nat_lines.append(f'  {code}: {{ code: "{code}", name: "{esc(name)}", flag: "{flag_emoji(a2)}" }},')

nat_ts = ('import type { Nationality } from "@/types";\n\n'
 "/** Nacionalidades del dataset (generado desde f1db). */\n"
 "export const NATIONALITIES: Record<string, Nationality> = {\n" + "\n".join(nat_lines) +
 '\n};\n\nexport function nationality(code: string): Nationality {\n'
 '  return NATIONALITIES[code] ?? { code, name: code, flag: "🏁" };\n}\n')
open(f"{OUT}/nationalities.ts","w",encoding="utf-8").write(nat_ts)

# Color de marca conocido con confianza (28 modernos + escuderias historicas
# reconocibles). Minardi fue corregido: #1A1A1A era casi invisible sobre el
# fondo de las tarjetas (#1A1A1D).
CURATED = {"ferrari":"#E8002D","mercedes":"#27F4D2","red-bull":"#3671C6","mclaren":"#FF8000",
 "williams":"#64C4FF","alpine":"#0093CC","renault":"#FFD800","aston-martin":"#229971",
 "alphatauri":"#6692FF","toro-rosso":"#0000FF","haas":"#B6BABD","sauber":"#52E252",
 "force-india":"#FF80C7","benetton":"#00A0DE","brawn":"#B8FD6E","lotus":"#FFB800",
 "brabham":"#1E3A5F","tyrrell":"#003F87","jordan":"#FFD500","jaguar":"#005A2B",
 "racing-point":"#F596C8","rb":"#6692FF","ligier":"#0055A4","arrows":"#FF6600",
 "minardi":"#4A5568","toyota":"#EB0A1E","bar":"#E40046","stewart":"#D0D0D0",
 "maserati":"#B71C1C","alfa-romeo":"#C41E3A","cooper":"#00693E","brm":"#145A32",
 "vanwall":"#1B4332","matra":"#2962FF","leyton-house":"#6FA8DC","wolf":"#C1272D",
 "hesketh":"#B22222","eagle":"#1B63C7","spyker":"#EE7203","caterham":"#006633",
 "virgin":"#E4002B","marussia":"#B71234","bmw-sauber":"#0A5FBF","kick-sauber":"#00E676",
 "lotus-f1":"#C9A227","lotus-racing":"#0A6E31","penske":"#FBC02D","prost":"#2979FF",
 "super-aguri":"#F0F0F0"}

# Colores nacionales de carreras (convencion FIA vigente hasta ~1968, cuando
# los equipos sin marca dominante corrian con el color de su pais). Se aplica
# solo a equipos que arrancaron antes de ese anio y no estan en CURATED.
NATIONAL_COLOR = {"GBR":"#1B5E20","ITA":"#C62828","FRA":"#2962FF","DEU":"#B0BEC5",
 "BEL":"#FDD835","NLD":"#FF6D00","USA":"#1565C0","JPN":"#ECEFF1"}
NATIONAL_CUTOFF = 1968

PALETTE = ["#C2185B","#D81B60","#8E24AA","#7B1FA2","#512DA8","#3949AB","#303F9F","#1976D2",
 "#039BE5","#0288D1","#00ACC1","#0097A7","#00796B","#00897B","#388E3C","#43A047",
 "#689F38","#7CB342","#AFB42B","#FDD835","#FB8C00","#F57C00","#E64A19","#F4511E"]

def _fnv1a(s):
    """Hash estable (a diferencia de hash() de Python, que esta saleado por
    proceso via PYTHONHASHSEED): mismo id siempre da el mismo color."""
    h = 0x811c9dc5
    for ch in s.encode("utf-8"):
        h ^= ch
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h

def tcolor(cid, country, start_year):
    if cid in CURATED:
        return CURATED[cid]
    if start_year < NATIONAL_CUTOFF and country in NATIONAL_COLOR:
        return NATIONAL_COLOR[country]
    return PALETTE[_fnv1a(cid) % len(PALETTE)]

def is_brand_team(cid, country, start_year):
    return cid in CURATED or (start_year < NATIONAL_CUTOFF and country in NATIONAL_COLOR)

team_lines = []; brand_ids = []
for cid in sorted(cons_years):
    cm = cons_meta.get(cid, {}); name = cm.get("name", cid)
    cc = ccode(cm.get("countryId")) or "ITA"
    s,e = cons_years[cid]; ev = "null" if e >= CUTOFF else str(e)
    if is_brand_team(cid, cc, s): brand_ids.append(cid)
    team_lines.append(f'  "{cid}": {{ id: "{cid}", name: "{esc(name)}", countryCode: "{cc}", color: "{tcolor(cid, cc, s)}", active: {{ start: {s}, end: {ev} }} }},')
brand_lines = "\n".join(f'  "{cid}",' for cid in sorted(brand_ids))
teams_ts = ('import type { Team } from "@/types";\n\n'
 "/** Escuderías del dataset, generado desde f1db (años de participación reales). */\n"
 "export const TEAMS: Record<string, Team> = {\n" + "\n".join(team_lines) +
 "\n};\n\n"
 "/** Ids con color de marca real o de nacionalidad historica (no asignado al azar). */\n"
 "export const BRAND_TEAM_IDS: string[] = [\n" + brand_lines + "\n];\n\n"
 "export function team(id: string): Team | undefined {\n  return TEAMS[id];\n}\n\n"
 "export function teamName(id: string): string {\n  return TEAMS[id]?.name ?? id;\n}\n")
open(f"{OUT}/teams.ts","w",encoding="utf-8").write(teams_ts)

drv_lines = []; n_champ = 0; n_qonly = 0
for did in included:
    dm = drivers_meta.get(did)
    if not dm: continue
    first = dm.get("firstName") or ""; last = dm.get("lastName") or dm.get("name") or did
    code = ccode(dm.get("nationalityCountryId")) or "ITA"
    ys = sorted(driver_years[did]); a0,a1 = ys[0], ys[-1]
    a1v = "null" if a1 >= CUTOFF else str(a1)
    tsorted = sorted(driver_team_years.get(did,{}).items(), key=lambda kv:(kv[1][0],kv[1][1]))
    parts = []
    for cid,(s,e) in tsorted:
        ev = "null" if e >= CUTOFF else str(e)
        parts.append(f'{{ teamId: "{cid}", years: {{ start: {s}, end: {ev} }} }}')
    champs = sorted(champion_years.get(did,[])); nch = len(champs)
    if nch: n_champ += 1
    if did not in raced: n_qonly += 1
    cy = f", championYears: [{', '.join(map(str,champs))}]" if nch else ""
    w = wins.get(did, 0); po = podiums.get(did, 0); pl = poles.get(did, 0)
    extra = (f", wins: {w}" if w else "") + (f", podiums: {po}" if po else "") + (f", poles: {pl}" if pl else "")
    wk = wordle_key(last) or strip_accents(last).upper()
    chron_list = driver_team_chronology.get(did, [])
    chron_parts = [f'{{ season: {yy}, teamId: "{tid}" }}' for yy, tid in chron_list]
    chron = f', teamsChronology: [{", ".join(chron_parts)}]' if chron_parts else ""
    drv_lines.append(f'  {{ id: "{did}", firstName: "{esc(first)}", lastName: "{esc(last)}", '
        f'wordleKey: "{wk}", nationalityCode: "{code}", teams: [{", ".join(parts)}], '
        f'active: {{ start: {a0}, end: {a1v} }}, championships: {nch}{cy}{extra}{chron} }},')

drivers_ts = ('import type { Driver } from "@/types";\n\n'
 "/**\n * Dataset de pilotos de F1. GENERADO desde f1db (github.com/f1db/f1db,\n"
 " * CC-BY-NC-SA-4.0). Datos reales 1950–" + str(CUTOFF) + ".\n"
 " * INCLUSION: solo pilotos que LARGARON al menos una carrera/sprint o\n"
 " * CLASIFICARON al menos una vez (se excluyen reservas de practica libre).\n"
 " * Equipos/años: derivados de esos resultados reales.\n"
 " * Campeonatos: posicion 1 de la clasificacion final de cada año.\n */\n"
 "export const DATA_AS_OF_SEASON = " + str(CUTOFF) + ";\n\n"
 "export const DRIVERS: Driver[] = [\n" + "\n".join(drv_lines) + "\n];\n\n"
 "export const DRIVERS_BY_ID: Record<string, Driver> = Object.fromEntries(\n"
 "  DRIVERS.map((d) => [d.id, d]),\n);\n\n"
 "export function driver(id: string): Driver | undefined {\n  return DRIVERS_BY_ID[id];\n}\n")
open(f"{OUT}/drivers.ts","w",encoding="utf-8").write(drivers_ts)

print(f"Incluidos: {len(included)} (largaron: {len(raced)} | solo quali: {n_qonly})")
print(f"Campeones: {n_champ} | Escuderias: {len(cons_years)} | Nacionalidades: {len(used)}")
