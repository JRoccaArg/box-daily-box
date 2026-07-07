// src/i18n/en.ts — English translations.

import type { Translations } from "./types";

const en: Translations = {
  // ─── Home ───────────────────────────────────────────────────────────
  "home.eyebrow": "Today's challenges",
  "home.title": "{{count}} challenges. One day.",
  "home.subtitle":
    "A fresh set of Formula 1 minigames every day at midnight. No sign-up needed: your progress is saved on this device.",
  "home.completed": "{{done}} of {{total}} completed",
  "home.streak": "{{count}}-day streak",
  "home.day_singular": "day",
  "home.day_plural": "days",
  "home.play_now": "Play now",
  "home.come_back": "Come back tomorrow",
  "home.solved": "Solved",
  "home.played": "Played",
  "home.unplayed": "Not played",
  "home.num.3": "Three",
  "home.num.4": "Four",
  "home.num.5": "Five",
  "home.num.6": "Six",
  "home.num.7": "Seven",
  "home.num.8": "Eight",

  // ─── Games: names and taglines ──────────────────────────────────────
  "game.pittexto.name": "Pit Text",
  "game.pittexto.tagline":
    "Guess the secret driver. Each attempt tells you how close you are.",
  "game.polewordle.name": "PoleWordle",
  "game.polewordle.tagline":
    "Guess the driver's last name, Wordle-style, in 6 attempts.",
  "game.el-intruso.name": "The Intruder",
  "game.el-intruso.tagline":
    "Nine out of ten drivers share something. Tap the one that doesn't belong.",
  "game.parrilla-bingo.name": "Grid Bingo",
  "game.parrilla-bingo.tagline":
    "Place a driver in each cell that matches both the team and the condition.",

  // ─── GameShell ──────────────────────────────────────────────────────
  "shell.daily_challenge": "Daily challenge",
  "shell.difficulty": "Difficulty",
  "shell.time": "Time",
  "shell.time_limit": "Time limit: {{seconds}} seconds",
  "shell.no_time_limit": "No time limit",
  "shell.start": "Start",
  "shell.surrender": "Give up",
  "shell.no": "No",
  "shell.back": "Home",
  "shell.back_label": "Back to home",

  "diff.facil": "Easy",
  "diff.medio": "Medium",
  "diff.dificil": "Hard",
  "diff.leyenda": "Legend",
  "diff.hint.facil": "Recent grid (last few seasons)",
  "diff.hint.medio": "Hybrid & V8 era (since 2006)",
  "diff.hint.dificil": "Modern era (since 1990)",
  "diff.hint.leyenda": "The entire history of F1",

  "result.won_title": "Challenge complete",
  "result.lost_title": "End of attempt",
  "result.won_msg": "Nice work!",
  "result.lost_msg": "Not this time.",
  "result.won_sub": "You added this challenge to your streak.",
  "result.lost_sub": "Review the correct answers on the board.",
  "result.points": "points",
  "result.not_ranked":
    "Another player already played this challenge from your connection today, so your result doesn't count for the global ranking. It's still saved in your history.",
  "result.view_board": "View the board",
  "result.view_ranking": "View today's ranking",
  "result.go_home": "Back to home",
  "result.come_back": "Come back tomorrow for a new challenge",

  "leave.title": "Leave and lose the challenge?",
  "leave.msg":
    "If you leave now, this challenge counts as lost and you won't be able to play it until tomorrow. Your streak will be broken.",
  "leave.confirm": "Yes, leave and forfeit",
  "leave.cancel": "Keep playing",

  "locked.won": "You already solved today's challenge.",
  "locked.lost": "You already played today's challenge.",
  "locked.wait": "Come back tomorrow for a new challenge",

  "banner.won": "Challenge complete",
  "banner.lost": "Challenge failed",
  "banner.summary": "View summary",

  // ─── Header ─────────────────────────────────────────────────────────
  "header.home_label": "Box Daily Box - home",
  "header.streak_title": "{{count}}-day streak",
  "header.profile_label": "Edit profile",
  "header.stats_label": "View statistics",
  "header.stats": "Stats",

  // ─── Footer ─────────────────────────────────────────────────────────
  "footer.line1":
    "Box Box Daily · Fan project, not officially affiliated with Formula 1.",
  "footer.line2": "A new challenge every day at midnight.",

  // ─── Profile (IdentityModal) ────────────────────────────────────────
  "profile.title": "Your profile",
  "profile.subtitle":
    "You'll appear in the global ranking with this name and country.",
  "profile.name_label": "Username (visible in ranking)",
  "profile.name_placeholder": "Choose a username",
  "profile.name_unique_hint": "Must be unique: no one else can have the same username.",
  "profile.name_taken": "That username is already taken. Try another one.",
  "profile.name_checking": "Checking availability...",
  "profile.name_available": "✓ Available",
  "profile.name_locked":
    "You can change it again in {{month}}. You already used your name change this month.",
  "profile.name_warn":
    "⚠️ You can only change your name once per month. Choose wisely before saving.",
  "profile.country_label": "Country",
  "profile.country_detecting": "(detecting...)",
  "profile.country_select": "Select your country",
  "profile.country_fixed": "(fixed)",
  "profile.country_warn": "⚠️ Once saved, you can't change it.",
  "profile.save": "Save",
  "profile.saving": "Saving...",
  "profile.cancel": "Cancel",
  "profile.save_error": "Could not save. Please try again.",
  "profile.sync_label": "Sync across devices",
  "profile.logged_as": "Signed in as:",
  "profile.logout": "Sign out",
  "profile.google_login": "Sign in with Google",
  "profile.logged_hint": "Your progress is synced across all your devices.",
  "profile.login_hint":
    "Optional. Signing in lets you play on multiple devices with the same account.",

  // ─── Stats (StatsModal) ─────────────────────────────────────────────
  "stats.title": "Statistics",
  "stats.no_name": "No name",
  "stats.edit_profile": "Edit profile",
  "stats.tab_global": "Global Ranking",
  "stats.tab_personal": "My Progress",
  "stats.won": "Won",
  "stats.lost": "Lost",
  "stats.win_rate": "Win %",
  "stats.streak": "Streak",
  "stats.best_streak": "Best streak",
  "stats.days": "days",
  "stats.no_persistent":
    "Persistent storage is not available in this browser. Your progress will only be saved during this session.",
  "stats.reset_confirm":
    "This will delete your statistics and points. Challenges you already played today will remain locked until tomorrow. This action cannot be undone.",
  "stats.reset_yes": "Yes, delete everything",
  "stats.reset_cancel": "Cancel",
  "stats.reset": "Reset progress",

  // ─── Global Ranking ─────────────────────────────────────────────────
  "ranking.title": "Global Ranking",
  "ranking.tab_today": "Today",
  "ranking.all_countries": "All countries",
  "ranking.loading": "Loading ranking...",
  "ranking.error": "Could not load ranking",
  "ranking.retry": "Retry",
  "ranking.empty_daily": "Nobody has played today yet. Be the first!",
  "ranking.empty_monthly": "No results this month.",
  "ranking.anonymous": "Anonymous",
  "ranking.you": "(you)",
  "ranking.challenges_won": "{{count}} {{label}} won",
  "ranking.challenge_singular": "challenge",
  "ranking.challenge_plural": "challenges",
  "ranking.pts": "pts",
  "ranking.monthly_note": "The monthly ranking resets on the 1st of each month.",
  "ranking.daily_note": "The daily ranking shows today's results.",

  // ─── Monthly Ranking (personal) ─────────────────────────────────────
  "monthly.title": "{{month}} ranking",
  "monthly.challenges_won": "{{count}} challenges won",
  "monthly.points_month": "points this month",
  "monthly.no_wins": "You haven't won any challenges this month yet. Score your first points!",
  "monthly.best_day": "Best day: {{day}} ({{points}} pts)",
  "monthly.scoring_title": "How is scoring calculated?",
  "monthly.scoring_body":
    "Only won challenges count. Base points by difficulty: Easy {{easy}}, Medium {{medium}}, Hard {{hard}}, Legend {{legend}}. The faster you finish, the more speed bonus you get (up to +120). Giving up counts as a loss (0 points).",
  "monthly.disclaimer":
    "This ranking is personal and local (saved on your device) and includes all your points, even those that didn't count for the global ranking (for example, when another account from your connection played that challenge first). The global ranking is calculated on the server, which independently verifies each answer. Small point differences with the global ranking are normal (different time measurement).",

  // ─── RankBadge ──────────────────────────────────────────────────────
  "rank.position": "Rank #{{rank}}",
  "rank.your_position": "Your position today",
  "rank.world_ranking": "World ranking",
  "rank.of_players": "of {{count}}",
  "rank.badge_title": "Position in the daily ranking of {{count}} players",

  // ─── Auth Callback ──────────────────────────────────────────────────
  "auth.loading": "Signing in...",
  "auth.linking": "Linking your Google account",
  "auth.error": "Error",
  "auth.cancelled": "Authentication cancelled",
  "auth.no_code": "No authorization code",
  "auth.failed": "Could not sign in",
  "auth.redirecting": "Redirecting...",

  // ─── Individual games ───────────────────────────────────────────────
  "pittexto.placeholder": "Type a last name…",
  "pittexto.found": "You found it:",
  "pittexto.answer_was": "The driver was:",

  "polewordle.not_in_list": "Not in the driver list",

  "intruso.confirm": "Confirm intruder",
  "intruso.select": "Select a driver",

  "bingo.pick_driver": "Pick a driver",
  "bingo.drove_for": "drove for {{team}}",
  "bingo.nationality": "nationality {{name}}",
  "bingo.world_champion": "world champion",

  // ─── Months ─────────────────────────────────────────────────────────
  "month.0": "January",
  "month.1": "February",
  "month.2": "March",
  "month.3": "April",
  "month.4": "May",
  "month.5": "June",
  "month.6": "July",
  "month.7": "August",
  "month.8": "September",
  "month.9": "October",
  "month.10": "November",
  "month.11": "December",

  // ─── PitTexto extra ──────────────────────────────────────────────────
  "pittexto.eyebrow": "Guess the driver",
  "pittexto.hint":
    "Each attempt shows how similar the driver is to the secret one. Hotter = closer.",
  "pittexto.attempt": "Attempt {{current}} of {{max}}",

  // ─── PoleWordle extra ─────────────────────────────────────────────────
  "polewordle.eyebrow": "Driver's last name",
  "polewordle.hint":
    "Guess the last name in {{max}} attempts. Green = correct letter and position; yellow = the letter is present but elsewhere; gray = not present.",
  "polewordle.grid_info": "{{len}} letters · {{max}} attempts",
  "polewordle.length_error": "The last name has {{len}} letters",
  "polewordle.was": "It was",
  "polewordle.correct": "Correct!",
  "polewordle.input_label": "Type the last name",
  "polewordle.grid_label": "Open keyboard to type",

  // ─── ElIntruso extra ──────────────────────────────────────────────────
  "intruso.eyebrow": "The Intruder",
  "intruso.hint":
    "9 out of these 10 drivers share something in common. Find the one that doesn't belong.",
  "intruso.rule_label": "The other 9",

  // ─── ParrillaBingo extra ──────────────────────────────────────────────
  "bingo.eyebrow": "Grid Bingo",
  "bingo.hint":
    "Fill each cell with a driver that matches the team in its row and the condition in its column. No repeating drivers.",
  "bingo.cells_count": "{{filled}} of 9 cells",
  "bingo.reveal_hint": "Gray cells show a valid example.",
  "bingo.search_placeholder": "Search a driver…",
  "bingo.no_match": "No matching drivers.",
  "bingo.already_used": "{{name}} is already in another cell.",
  "bingo.does_not_match": "{{name}} doesn't match: {{rule}}.",
  "bingo.in_cell": "In the cell:",
  "bingo.remove": "Remove",
  "bingo.empty_cell": "Empty cell",
  "bingo.example": "e.g.",
  "bingo.champion_label": "Champion",

  // ─── Language ───────────────────────────────────────────────────────
    "game.gp-resultado.name": "GP Result",
  "game.gp-resultado.tagline": "Complete the top 10 of a historic Grand Prix before time runs out.",
  "gpresultado.eyebrow": "Grand Prix",
  "gpresultado.search_placeholder": "Type a driver name…",
  "gpresultado.found_count": "{{found}} of {{total}} found",
  "gpresultado.not_in_top": "{{name}} did not finish in the top 10.",
  "gpresultado.time_up": "Time is up. Missing positions are shown above.",

  "game.top10-standings.name": "Top 10 Standings",
  "game.top10-standings.tagline": "Guess the accumulated top 10 points standings over a 1-4 year period.",
  "top10standings.eyebrow": "Drivers' Championship",
  "top10standings.subtitle": "Accumulated top 10 points for the period",
  "top10standings.search_placeholder": "Type a driver name…",
  "top10standings.found_count": "{{found}} of {{total}} found",
  "top10standings.not_in_top": "{{name}} is not in the accumulated top 10.",
  "top10standings.points_label": "{{points}} pts",
  "top10standings.time_up": "Time is up. Missing positions are shown above.",

  "lang.label": "Language",

  // ─── SEO (title/description per page) ─────────────────────────────────
  "seo.home.title": "Box Daily Box — Daily Formula 1 Minigames | 6 Free Puzzles",
  "seo.home.description":
    "Six daily Formula 1 minigames: guess drivers, complete the top 10, find the odd one out, and more. Free global ranking, no sign-up.",
  "seo.game.pittexto.title": "PitTexto — Guess the Secret F1 Driver | Box Daily Box",
  "seo.game.pittexto.description":
    "Guess today's secret Formula 1 driver. Each guess tells you how close you are. A new challenge every 24 hours.",
  "seo.game.polewordle.title": "PoleWordle — The Formula 1 Wordle | Box Daily Box",
  "seo.game.polewordle.description":
    "Guess today's F1 driver's last name, Wordle-style, in 6 tries. A new free daily puzzle.",
  "seo.game.el-intruso.title": "The Intruder — Spot the Odd F1 Driver Out | Box Daily Box",
  "seo.game.el-intruso.description":
    "Nine out of ten F1 drivers share something in common. Find the intruder in this daily Formula 1 puzzle.",
  "seo.game.parrilla-bingo.title": "Grid Bingo — F1 Team Bingo | Box Daily Box",
  "seo.game.parrilla-bingo.description":
    "Fill each cell with a driver that matches both the team and the condition. The daily Formula 1 bingo.",
  "seo.game.gp-resultado.title": "GP Result — Guess a Grand Prix Top 10 | Box Daily Box",
  "seo.game.gp-resultado.description":
    "Complete the top 10 finishers of a historic F1 Grand Prix before time runs out. A new free daily puzzle.",
  "seo.game.top10-standings.title": "Top 10 Standings — F1 Championship Puzzle | Box Daily Box",
  "seo.game.top10-standings.description":
    "Guess the top 10 accumulated points in the F1 drivers' championship over a 1-4 year span.",

  // ─── GamePage (not found) ──────────────────────────────────────────────
  "gamepage.not_found_title": "Game not found",
  "gamepage.not_found_body": "The challenge you're looking for doesn't exist or moved.",
  "gamepage.see_all": "See all challenges",
};

export default en;
