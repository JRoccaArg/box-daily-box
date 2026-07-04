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

  // ─── Perfil (IdentityModal) ─────────────────────────────────────────
  "profile.title": "Tu perfil",
  "profile.subtitle":
    "Aparecerás en el ranking global con este nombre y país.",
  "profile.name_label": "Nombre (visible en ranking)",
  "profile.name_placeholder": "Tu nombre o apodo",
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

  // ─── Idioma ─────────────────────────────────────────────────────────
    "game.gp-resultado.name": "GP Resultado",
  "game.gp-resultado.tagline": "Completa el top 10 de un Gran Premio histórico antes de que se acabe el tiempo.",
  "gpresultado.eyebrow": "Gran Premio",
  "gpresultado.search_placeholder": "Escribí un piloto…",
  "gpresultado.found_count": "{{found}} de {{total}} encontrados",
  "gpresultado.not_in_top": "{{name}} no terminó en el top 10.",
  "gpresultado.time_up": "Tiempo agotado. Las posiciones faltantes se muestran arriba.",

  "lang.label": "Idioma",
};

export default es;
