// src/i18n/es.ts — Traducciones en español (idioma base).

import type { Translations } from "./types";

const es: Translations = {
  // ─── Home ───────────────────────────────────────────────────────────
  "home.eyebrow": "Retos de hoy",
  "home.title": "{{count}} desafios. Un dia.",
  "home.subtitle":
    "Un set nuevo de minijuegos de Formula 1 cada dia a la medianoche. Sin registro: tu progreso se guarda en este dispositivo.",
  "home.completed": "{{done}} de {{total}} completados",
  "home.streak": "Racha de {{count}} {{day}}",
  "home.day_singular": "dia",
  "home.day_plural": "dias",
  "home.play_now": "Jugar ahora",
  "home.come_back": "Vuelve manana",
  "home.solved": "Resuelto",
  "home.played": "Jugado",
  "home.unplayed": "Sin jugar",
  // Numeros en palabras para el titulo
  "home.num.3": "Tres",
  "home.num.4": "Cuatro",
  "home.num.5": "Cinco",
  "home.num.6": "Seis",
  "home.num.7": "Siete",
  "home.num.8": "Ocho",

  // ─── Juegos: nombres y taglines ─────────────────────────────────────
  "game.pittexto.name": "PitTexto",
  "game.pittexto.tagline":
    "Adivina al piloto secreto. Cada intento te dice que tan cerca estas.",
  "game.polewordle.name": "PoleWordle",
  "game.polewordle.tagline":
    "Adivina el apellido del piloto del dia, estilo Wordle, en 6 intentos.",
  "game.el-intruso.name": "El Intruso",
  "game.el-intruso.tagline":
    "Nueve de diez pilotos comparten algo. Toca al que no encaja.",
  "game.parrilla-bingo.name": "Parrilla Bingo",
  "game.parrilla-bingo.tagline":
    "Pon en cada celda un piloto que cumpla su escuderia y su condicion.",

  // ─── GameShell ──────────────────────────────────────────────────────
  "shell.daily_challenge": "Reto del dia",
  "shell.difficulty": "Dificultad",
  "shell.time": "Tiempo",
  "shell.time_limit": "Tiempo limite: {{seconds}} segundos",
  "shell.no_time_limit": "Sin limite de tiempo",
  "shell.start": "Comenzar",
  "shell.surrender": "Rendirse",
  "shell.no": "No",
  "shell.back": "Inicio",
  "shell.back_label": "Volver al inicio",

  // Dificultades
  "diff.facil": "Facil",
  "diff.medio": "Medio",
  "diff.dificil": "Dificil",
  "diff.leyenda": "Leyenda",
  "diff.hint.facil": "Parrilla reciente (ultimas temporadas)",
  "diff.hint.medio": "Era hibrida y V8 (desde 2006)",
  "diff.hint.dificil": "Era moderna (desde 1990)",
  "diff.hint.leyenda": "Toda la historia de la F1",

  // Resultado
  "result.won_title": "Reto superado",
  "result.lost_title": "Fin del intento",
  "result.won_msg": "Buen trabajo!",
  "result.lost_msg": "No esta vez.",
  "result.won_sub": "Sumaste este reto a tu racha.",
  "result.lost_sub": "Repasa las respuestas correctas en el tablero.",
  "result.points": "puntos",
  "result.not_ranked":
    "Otro jugador ya jugó este reto desde tu conexión hoy, así que tu resultado no cuenta para el ranking global. Igual quedó guardado en tu historial.",
  "result.view_board": "Ver el tablero",
  "result.view_ranking": "Ver ranking del día",
  "result.go_home": "Volver al inicio",
  "result.come_back": "Vuelve manana para un nuevo reto",

  // Abandono
  "leave.title": "¿Salir y perder el reto?",
  "leave.msg":
    "Si salis ahora, este reto cuenta como perdido y ya no podras jugarlo hasta manana. La racha se interrumpe.",
  "leave.confirm": "Si, salir y dar por perdido",
  "leave.cancel": "Seguir jugando",

  // Bloqueado
  "locked.won": "Ya resolviste el reto de hoy.",
  "locked.lost": "Ya jugaste el reto de hoy.",
  "locked.wait": "Vuelve manana para un nuevo desafio",

  // Banner resultado
  "banner.won": "Reto superado",
  "banner.lost": "Reto fallido",
  "banner.summary": "Ver resumen",

  // ─── Header ─────────────────────────────────────────────────────────
  "header.home_label": "Box Daily Box - inicio",
  "header.streak_title": "Racha de {{count}} dias",
  "header.profile_label": "Editar perfil",
  "header.stats_label": "Ver estadisticas",
  "header.stats": "Stats",

  // ─── Footer ─────────────────────────────────────────────────────────
  "footer.line1":
    "Box Box Daily · Proyecto de fans, sin afiliacion oficial con la Formula 1.",
  "footer.line2": "Un reto nuevo cada dia a la medianoche.",
  "footer.photo_credit": "Fotos de pilotos: Wikimedia Commons (CC BY-SA / dominio publico).",
  "header.progress": "{{played}} de {{total}} juegos jugados hoy",

  // ─── Perfil (IdentityModal) ─────────────────────────────────────────
  "profile.title": "Tu perfil",
  "profile.subtitle":
    "Aparecerás en el ranking global con este nombre y país.",
  "profile.name_label": "Nombre de usuario (visible en ranking)",
  "profile.name_placeholder": "Elegí un nombre de usuario",
  "profile.name_unique_hint": "Debe ser único: nadie más puede tener este mismo nombre.",
  "profile.name_taken": "Ese nombre de usuario ya está en uso. Probá con otro.",
  "profile.name_checking": "Comprobando disponibilidad...",
  "profile.name_available": "✓ Disponible",
  "profile.name_locked":
    "Podrás volver a cambiarlo en {{month}}. Este mes ya usaste tu cambio de nombre.",
  "profile.name_warn":
    "⚠️ Solo podés cambiar tu nombre 1 vez por mes. Elegí bien antes de guardar.",
  "profile.country_label": "País",
  "profile.country_detecting": "(detectando...)",
  "profile.country_select": "Selecciona tu país",
  "profile.country_fixed": "(fijo)",
  "profile.country_warn": "⚠️ Una vez guardado, no podés cambiarlo.",
  "profile.save": "Guardar",
  "profile.saving": "Guardando...",
  "profile.cancel": "Cancelar",
  "profile.save_error": "No se pudo guardar. Intentá de nuevo.",
  "profile.sync_label": "Sincronizar entre dispositivos",
  "profile.logged_as": "Sesión iniciada como:",
  "profile.logout": "Cerrar sesión",
  "profile.google_login": "Iniciar sesión con Google",
  "profile.logged_hint":
    "Tu progreso se sincroniza en todos tus dispositivos.",
  "profile.login_hint":
    "Opcional. Iniciar sesión te permite jugar en varios dispositivos con la misma cuenta.",

  // ─── Stats (StatsModal) ─────────────────────────────────────────────
  "stats.title": "Estadísticas",
  "stats.no_name": "Sin nombre",
  "stats.edit_profile": "Editar perfil",
  "stats.tab_global": "Ranking Global",
  "stats.tab_personal": "Mi Progreso",
  "stats.won": "Ganados",
  "stats.lost": "Perdidos",
  "stats.win_rate": "% Victorias",
  "stats.streak": "Racha",
  "stats.best_streak": "Mejor racha",
  "stats.days": "dias",
  "stats.no_persistent":
    "El almacenamiento persistente no esta disponible en este navegador. Tu progreso se guardara solo durante esta sesion.",
  "stats.reset_confirm":
    "Esto borra tus estadísticas y puntos. Los retos que ya jugaste hoy seguirán bloqueados hasta mañana. Esta acción no se puede deshacer.",
  "stats.reset_yes": "Si, borrar todo",
  "stats.reset_cancel": "Cancelar",
  "stats.reset": "Reiniciar progreso",

  // ─── Ranking Global ─────────────────────────────────────────────────
  "ranking.title": "Ranking Global",
  "ranking.tab_today": "Hoy",
  "ranking.all_countries": "Todos los paises",
  "ranking.loading": "Cargando ranking...",
  "ranking.error": "No se pudo cargar el ranking",
  "ranking.retry": "Reintentar",
  "ranking.empty_daily": "Nadie jugo hoy todavia. Se el primero!",
  "ranking.empty_monthly": "Sin resultados este mes.",
  "ranking.anonymous": "Anónimo",
  "ranking.you": "(vos)",
  "ranking.challenges_won": "{{count}} {{label}} ganados",
  "ranking.challenge_singular": "reto",
  "ranking.challenge_plural": "retos",
  "ranking.played_no_win": "Jugó, sin victorias",
  "ranking.pts": "pts",
  "ranking.monthly_note":
    "El ranking mensual se reinicia el 1 de cada mes.",
  "ranking.daily_note": "El ranking diario muestra los resultados de hoy.",

  // ─── Ranking Mensual (personal) ─────────────────────────────────────
  "monthly.title": "Ranking de {{month}}",
  "monthly.challenges_won": "{{count}} retos ganados",
  "monthly.points_month": "puntos este mes",
  "monthly.no_wins":
    "Todavía no ganaste retos este mes. ¡Sumá tus primeros puntos!",
  "monthly.best_day": "Mejor día: {{day}} ({{points}} pts)",
  "monthly.scoring_title": "¿Cómo se puntúa?",
  "monthly.scoring_body":
    "Solo suman los retos ganados. Puntos base por dificultad: Fácil {{easy}}, Medio {{medium}}, Difícil {{hard}}, Leyenda {{legend}}. Cuanto menos tardes, más bonus de rapidez (hasta +120). Abandonar un reto cuenta como derrota (0 puntos).",
  "monthly.disclaimer":
    "Este ranking es personal y local (se guarda en tu dispositivo) y suma todos tus puntos, incluidos los que no entraron al ranking global (por ejemplo, cuando otra cuenta de tu conexión jugó primero ese reto). El ranking global se calcula en el servidor, que verifica cada respuesta de forma independiente. Pequeñas diferencias de puntos con el global son normales (distinta medición de tiempo).",

  // ─── RankBadge ──────────────────────────────────────────────────────
  "rank.position": "Puesto #{{rank}}",
  "rank.your_position": "Tu posición hoy",
  "rank.world_ranking": "Ranking mundial",
  "rank.of_players": "de {{count}}",
  "rank.badge_title":
    "Posición en el ranking diario de {{count}} jugadores",

  // ─── Auth Callback ──────────────────────────────────────────────────
  "auth.loading": "Iniciando sesión...",
  "auth.linking": "Vinculando tu cuenta de Google",
  "auth.error": "Error",
  "auth.cancelled": "Autenticación cancelada",
  "auth.no_code": "Sin código de autorización",
  "auth.failed": "No se pudo iniciar sesión",
  "auth.redirecting": "Redirigiendo...",

  // ─── Juegos individuales ────────────────────────────────────────────
  // PitTexto
  "pittexto.placeholder": "Escribe un apellido…",
  "pittexto.found": "Lo encontraste:",
  "pittexto.answer_was": "El piloto era:",

  // PoleWordle
  "polewordle.not_in_list": "No esta en la lista de pilotos",

  // El Intruso
  "intruso.confirm": "Confirmar intruso",
  "intruso.select": "Selecciona un piloto",

  // Parrilla Bingo
  "bingo.pick_driver": "Elegir piloto",
  "bingo.drove_for": "corrió en {{team}}",
  "bingo.nationality": "nacionalidad {{name}}",
  "bingo.world_champion": "campeón del mundo",

  // ─── Meses ──────────────────────────────────────────────────────────
  "month.0": "enero",
  "month.1": "febrero",
  "month.2": "marzo",
  "month.3": "abril",
  "month.4": "mayo",
  "month.5": "junio",
  "month.6": "julio",
  "month.7": "agosto",
  "month.8": "septiembre",
  "month.9": "octubre",
  "month.10": "noviembre",
  "month.11": "diciembre",

  // ─── PitTexto extra ──────────────────────────────────────────────────
  "pittexto.eyebrow": "Adivina el piloto",
  "pittexto.hint":
    "Cada intento muestra cuanto se parece al piloto secreto. Mas caliente = mas cerca.",
  "pittexto.attempt": "Intento {{current}} de {{max}}",
  "pittexto.factor.nationality": "Nacionalidad",
  "pittexto.factor.team": "Escuderia",
  "pittexto.factor.debut": "Debut",
  "pittexto.factor.titles": "Titulos",
  "pittexto.factor.mates": "Companeros",
  "pittexto.no_team_match": "Sin coincidencia",
  "common.yes": "Si",
  "common.no": "No",

  // ─── PoleWordle extra ─────────────────────────────────────────────────
  "polewordle.eyebrow": "Apellido del piloto",
  "polewordle.hint":
    "Adivina el apellido en {{max}} intentos. Verde = letra y posicion correctas; amarillo = la letra esta pero en otro lugar; gris = no esta.",
  "polewordle.grid_info": "{{len}} letras · {{max}} intentos",
  "polewordle.length_error": "El apellido tiene {{len}} letras",
  "polewordle.was": "Era",
  "polewordle.correct": "Correcto!",
  "polewordle.input_label": "Escribí el apellido",
  "polewordle.grid_label": "Abrir teclado para escribir",

  // ─── ElIntruso extra ──────────────────────────────────────────────────
  "intruso.eyebrow": "El intruso",
  "intruso.hint":
    "9 de estos 10 pilotos comparten algo en comun. Encontra al que no encaja.",
  "intruso.rule_label": "Los otros 9",
  "intruso.rule.team": "Condujeron para {{team}}",
  "intruso.rule.champ": "Fueron campeones del mundo",
  "intruso.rule.non_champ": "Nunca fueron campeones del mundo",
  "intruso.rule.nationality": "Son de la misma nacionalidad ({{nat}})",
  "intruso.rule.none": "Sin regla disponible",

  // ─── ParrillaBingo extra ──────────────────────────────────────────────
  "bingo.eyebrow": "Parrilla Bingo",
  "bingo.hint":
    "Completa cada casilla con un piloto que cumpla la escuderia de su fila y la condicion de su columna. No puedes repetir pilotos.",
  "bingo.cells_count": "{{filled}} de 9 casillas",
  "bingo.reveal_hint": "Las casillas en gris muestran un ejemplo valido.",
  "bingo.search_placeholder": "Busca un piloto…",
  "bingo.no_match": "Sin pilotos que coincidan.",
  "bingo.already_used": "{{name}} ya esta en otra casilla.",
  "bingo.does_not_match": "{{name}} no cumple: {{rule}}.",
  "bingo.in_cell": "En la casilla:",
  "bingo.remove": "Quitar",
  "bingo.empty_cell": "Casilla vacia",
  "bingo.example": "ej.",
  "bingo.champion_label": "Campeon",
  "bingo.stat.winner": "Gano un GP",
  "bingo.stat.podium": "Subio al podio",
  "bingo.stat.pole": "Hizo una pole",

  // ─── Idioma ─────────────────────────────────────────────────────────
    "game.gp-resultado.name": "GP Resultado",
  "game.gp-resultado.tagline": "Completa el top 10 de un Gran Premio histórico antes de que se acabe el tiempo.",
  "gpresultado.eyebrow": "Gran Premio",
  "gpresultado.search_placeholder": "Escribí un piloto…",
  "gpresultado.found_count": "{{found}} de {{total}} encontrados",
  "gpresultado.not_in_top": "{{name}} no terminó en el top 10.",
  "gpresultado.time_up": "Tiempo agotado. Las posiciones faltantes se muestran arriba.",

  "game.top10-standings.name": "Top 10 Standings",
  "game.top10-standings.tagline": "Adivina el top 10 acumulado de puntos de un período de 1 a 4 años.",
  "top10standings.eyebrow": "Campeonato de Pilotos",
  "top10standings.subtitle": "Top 10 acumulado de puntos del período",
  "top10standings.search_placeholder": "Escribí un piloto…",
  "top10standings.found_count": "{{found}} de {{total}} encontrados",
  "top10standings.not_in_top": "{{name}} no está en el top 10 acumulado.",
  "top10standings.points_label": "{{points}} pts",
  "top10standings.time_up": "Tiempo agotado. Las posiciones faltantes se muestran arriba.",

  "lang.label": "Idioma",

  // ─── SEO (title/description por página) ──────────────────────────────
  "seo.home.title": "Box Daily Box — Minijuegos diarios de Fórmula 1 | 6 puzzles gratis",
  "seo.home.description":
    "Seis minijuegos diarios de Fórmula 1: adiviná pilotos, completá el top 10, encontrá al intruso y más. Ranking global gratis, sin registro.",
  "seo.game.pittexto.title": "PitTexto — Adiviná al piloto secreto de F1 | Box Daily Box",
  "seo.game.pittexto.description":
    "Adiviná el piloto de Fórmula 1 secreto del día. Cada intento te dice qué tan cerca estás. Nuevo reto cada 24 horas.",
  "seo.game.polewordle.title": "PoleWordle — El Wordle de Fórmula 1 | Box Daily Box",
  "seo.game.polewordle.description":
    "Adiviná el apellido del piloto de F1 del día, estilo Wordle, en 6 intentos. Puzzle diario gratis.",
  "seo.game.el-intruso.title": "El Intruso — Encontrá al piloto que no encaja | Box Daily Box",
  "seo.game.el-intruso.description":
    "Nueve de diez pilotos de F1 comparten algo en común. Encontrá al intruso en este puzzle diario de Fórmula 1.",
  "seo.game.parrilla-bingo.title": "Parrilla Bingo — Bingo de escuderías de F1 | Box Daily Box",
  "seo.game.parrilla-bingo.description":
    "Completá cada casilla con un piloto que cumpla su escudería y su condición. El bingo diario de Fórmula 1.",
  "seo.game.gp-resultado.title": "GP Resultado — Adiviná el top 10 de un Gran Premio | Box Daily Box",
  "seo.game.gp-resultado.description":
    "Completá el top 10 de un Gran Premio histórico de F1 antes de que se acabe el tiempo. Puzzle diario gratis.",
  "seo.game.top10-standings.title": "Top 10 Standings — Campeonato acumulado de F1 | Box Daily Box",
  "seo.game.top10-standings.description":
    "Adiviná el top 10 acumulado de puntos del campeonato de pilotos de F1 en un período de 1 a 4 años.",

  // ─── GamePage (no encontrado) ─────────────────────────────────────────
  "gamepage.not_found_title": "Juego no encontrado",
  "gamepage.not_found_body": "El reto que buscás no existe o cambió de dirección.",
  "gamepage.see_all": "Ver todos los retos",

  // ─── Country names (driver nationality flags) ─────────────────────────
  "country.ARG": "Argentina",
  "country.AUS": "Australia",
  "country.AUT": "Austria",
  "country.BEL": "Bélgica",
  "country.BRA": "Brasil",
  "country.CAN": "Canadá",
  "country.CHE": "Suiza",
  "country.CHL": "Chile",
  "country.CHN": "China",
  "country.COL": "Colombia",
  "country.CZE": "Chequia",
  "country.DEU": "Alemania",
  "country.DNK": "Dinamarca",
  "country.ESP": "España",
  "country.FIN": "Finlandia",
  "country.FRA": "Francia",
  "country.GBR": "Reino Unido",
  "country.HUN": "Hungría",
  "country.IDN": "Indonesia",
  "country.IND": "India",
  "country.IRL": "Irlanda",
  "country.ITA": "Italia",
  "country.JPN": "Japón",
  "country.LIE": "Liechtenstein",
  "country.MAR": "Marruecos",
  "country.MCO": "Mónaco",
  "country.MEX": "México",
  "country.MYS": "Malasia",
  "country.NLD": "Países Bajos",
  "country.NZL": "Nueva Zelanda",
  "country.POL": "Polonia",
  "country.PRT": "Portugal",
  "country.RUS": "Rusia",
  "country.SWE": "Suecia",
  "country.THA": "Tailandia",
  "country.URY": "Uruguay",
  "country.USA": "Estados Unidos",
  "country.VEN": "Venezuela",
  "country.ZAF": "Sudáfrica",
  "country.ZWE": "Zimbabue",
};

export default es;
