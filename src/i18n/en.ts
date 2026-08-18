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
  "home.new_badge": "New",
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
  "shell.untimed": "Untimed",
  "shell.fails_left": "{{count}} of {{total}} attempts left",
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
  "header.pending_requests": "{{count}} pending friend requests",

  // ─── Sound/haptics settings ─────────────────────────────────────────
  "settings.trigger_label": "Sound and vibration",
  "settings.sound": "Sound",
  "settings.haptics": "Vibration",
  "settings.on": "On",
  "settings.off": "Off",

  // ─── Footer ─────────────────────────────────────────────────────────
  "footer.line1":
    "Box Box Daily · Fan project, not officially affiliated with Formula 1.",
  "footer.line2": "A new challenge every day at midnight.",
  "footer.info": "How to play",
  "footer.terms": "Terms and Conditions",
  "footer.privacy": "Privacy Policy",
  "footer.contact": "Contact",
  "footer.support": "Support the project",
  "support.title": "Support the project",
  "support.body": "Box Daily Box is and will remain free. If you enjoy it, you can leave a voluntary contribution — it doesn't give any advantage inside the game, it's just a way to help fund the project.",
  "support.disclaimer": "It does not grant access to exclusive content, extra attempts, or preferential ranking.",
  "support.cafecito": "Cafecito (Argentina)",
  "support.kofi": "Ko-fi (international)",

  // ─── Legal pages ────────────────────────────────────────────────────
  "legal.updated": "Last updated: {{date}}",

  // ─── Contact page ─────────────────────────────────────────────────────
  "contact.title": "Contact",
  "contact.intro": "Found a bug, have an idea for a new game, or any other question? Email us:",

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
  "ranking.streak_title": "{{count}}-day winning streak",
  "ranking.monthly_note": "The monthly ranking resets on the 1st of each month.",
  "ranking.daily_note": "The daily ranking shows today's results.",
  "ranking.add_friend": "Add friend",
  "ranking.add_friend_label": "Add {{name}} as a friend",
  "ranking.already_friends": "Already friends",
  "ranking.request_pending": "Request sent, awaiting response",

  // ─── Badges ─────────────────────────────────────────────────────────
  "badge.monthly_gold": "Gold",
  "badge.monthly_silver": "Silver",
  "badge.monthly_bronze": "Bronze",
  "badge.admin": "Admin",
  "badge.superadmin": "Superadmin",
  "badge.more": "+{{count}}",
  "badge.gallery_title": "My Badges",
  "badge.gallery_empty":
    "You haven't earned any badges yet. Finish in the top 3 of the monthly ranking!",
  "badge.gallery_hint": "Tap a badge to feature it on the ranking (up to 3).",
  "badge.featured_count": "{{count}}/3 featured",
  "badge.won_months": "Earned in: {{months}}",
  "badge.show_grouped": "Grouped (×{{count}})",
  "badge.show_individual": "Individual",
  "badge.max_reached": "You already picked the max of 3 featured badges",
  "badge.save": "Save selection",
  "badge.saving": "Saving...",
  "badge.save_error": "Couldn't save. Try again.",
  "badge.saved": "Selection saved",
  "badge.tooltip_admin": "Site administrator",
  "badge.tooltip_superadmin": "Super administrator",
  "badge.tooltip_gold_one": "Winner of {{month}}",
  "badge.tooltip_gold_many": "Winner of: {{months}}",
  "badge.tooltip_silver_one": "2nd place in {{month}}",
  "badge.tooltip_silver_many": "2nd place in: {{months}}",
  "badge.tooltip_bronze_one": "3rd place in {{month}}",
  "badge.tooltip_bronze_many": "3rd place in: {{months}}",

  // ─── Monthly Ranking (personal) ─────────────────────────────────────
  "monthly.title": "{{month}} ranking",
  "monthly.challenges_won": "{{count}} challenges won",
  "monthly.points_month": "points this month",
  "monthly.no_wins": "You haven't won any challenges this month yet. Score your first points!",
  "monthly.best_day": "Best day: {{day}} ({{points}} pts)",
  "monthly.daily_title": "By day",
  "monthly.weekly_title": "By week",
  "monthly.week_tooltip": "Week {{n}}: {{points}} pts",
  "monthly.by_difficulty": "By difficulty",
  "monthly.by_game": "By game",
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

  "teamradio.eyebrow": "Team Radio",
  "teamradio.hint": "This is a real team radio message. Guess which Grand Prix it was said at.",
  "teamradio.said_by": "Said on {{driver}}'s radio",
  "teamradio.select": "Select a Grand Prix",
  "teamradio.confirm": "Confirm",
  "teamradio.answer_was": "It was:",
  "teamradio.correct": "Correct",

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
  "pittexto.factor.nationality": "Nationality",
  "pittexto.factor.team": "Team",
  "pittexto.factor.debut": "Debut",
  "pittexto.factor.titles": "Titles",
  "pittexto.factor.mates": "Teammates",
  "pittexto.no_team_match": "No match",
  "common.yes": "Yes",
  "common.no": "No",

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
  "intruso.rule.team": "Drove for {{team}}",
  "intruso.rule.champ": "Were world champions",
  "intruso.rule.non_champ": "Were never world champions",
  "intruso.rule.winner": "Won at least one Grand Prix",
  "intruso.rule.non_winner": "Never won a Grand Prix",
  "intruso.rule.poleman": "Took at least one pole position",
  "intruso.rule.non_poleman": "Never took a pole position",
  "intruso.rule.podium": "Finished on the podium at least once",
  "intruso.rule.non_podium": "Never finished on the podium",
  "intruso.rule.none": "No rule available",

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
  "bingo.stat.winner": "Won a GP",
  "bingo.stat.podium": "Reached the podium",
  "bingo.stat.pole": "Took a pole",

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

  "game.career-path.name": "Career Path",
  "game.career-path.tagline": "Look at a driver's team history and guess who it is.",
  "careerpath.eyebrow": "Career Path",
  "careerpath.hint": "These are the teams the driver raced for, in order. Guess who it is.",
  "careerpath.attempt": "Attempt {{current}} of {{max}}",
  "careerpath.placeholder": "Type a driver…",
  "careerpath.found": "You found them:",
  "careerpath.answer_was": "The driver was:",

  "game.team-radio.name": "Team Radio",
  "game.team-radio.tagline": "Read an iconic F1 team radio and guess which Grand Prix it was said at.",

  "lang.label": "Language",

  // ─── SEO (title/description per page) ─────────────────────────────────
  // Legal pages (noindex, but the title is still used for the browser tab).
  "seo.terms.title": "Terms and Conditions | Box Daily Box",
  "seo.terms.description":
    "Terms and conditions of use for Box Daily Box, a free platform of daily Formula 1 minigames.",
  "seo.privacy.title": "Privacy Policy | Box Daily Box",
  "seo.contact.title": "Contact | Box Daily Box",
  "seo.contact.description": "Have a technical issue or an idea for Box Daily Box? Get in touch.",
  "seo.privacy.description":
    "How Box Daily Box handles your personal data: what it collects, why, and your rights.",
  "seo.home.title": "Box Daily Box — Daily Formula 1 Minigames | 8 Free Puzzles",
  "seo.home.description":
    "Eight daily Formula 1 minigames: guess drivers, complete the top 10, find the odd one out, and more. Free global ranking, no sign-up.",
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
  "seo.game.career-path.title": "Career Path — Guess the F1 driver by their team history | Box Daily Box",
  "seo.game.career-path.description":
    "Look at the chain of F1 teams a driver raced for and guess who it is. Free daily puzzle.",
  "seo.game.team-radio.title": "Team Radio — Guess the Grand Prix from the team radio | Box Daily Box",
  "seo.game.team-radio.description":
    "Read an iconic F1 team radio message and guess which Grand Prix it was said at, out of 6 options. Free daily puzzle.",

  // ─── GamePage (not found) ──────────────────────────────────────────────
  "gamepage.not_found_title": "Game not found",
  "gamepage.not_found_body": "The challenge you're looking for doesn't exist or moved.",
  "gamepage.see_all": "See all challenges",

  // ─── Country names (driver nationality flags) ─────────────────────────
  "country.ARG": "Argentina",
  "country.AUS": "Australia",
  "country.AUT": "Austria",
  "country.BEL": "Belgium",
  "country.BRA": "Brazil",
  "country.CAN": "Canada",
  "country.CHE": "Switzerland",
  "country.CHL": "Chile",
  "country.CHN": "China",
  "country.COL": "Colombia",
  "country.CZE": "Czechia",
  "country.DEU": "Germany",
  "country.DNK": "Denmark",
  "country.ESP": "Spain",
  "country.FIN": "Finland",
  "country.FRA": "France",
  "country.GBR": "United Kingdom",
  "country.HUN": "Hungary",
  "country.IDN": "Indonesia",
  "country.IND": "India",
  "country.IRL": "Ireland",
  "country.ITA": "Italy",
  "country.JPN": "Japan",
  "country.LIE": "Liechtenstein",
  "country.MAR": "Morocco",
  "country.MCO": "Monaco",
  "country.MEX": "Mexico",
  "country.MYS": "Malaysia",
  "country.NLD": "Netherlands",
  "country.NZL": "New Zealand",
  "country.POL": "Poland",
  "country.PRT": "Portugal",
  "country.RUS": "Russia",
  "country.SWE": "Sweden",
  "country.THA": "Thailand",
  "country.URY": "Uruguay",
  "country.USA": "United States",
  "country.VEN": "Venezuela",
  "country.ZAF": "South Africa",
  "country.ZWE": "Zimbabwe",

  // ─── Friends and Duels (Roadmap §4) ─────────────────────────────────
  "friends.tab_title": "Friends",
  "friends.add_by_code": "Add",
  "friends.code_placeholder": "CODE",
  "friends.invalid_code": "The code must be 6 characters",
  "friends.your_code": "Your code: {{code}}",
  "friends.copy_code": "Copy",
  "friends.code_copied": "Code copied",
  "friends.pending_requests": "Pending requests ({{count}})",
  "friends.sent_requests": "Sent, waiting for reply",
  "friends.accept": "Accept",
  "friends.reject": "Reject",
  "friends.no_friends": "You haven't added any friends yet. Share your code so they can add you.",
  "friends.anon_warning": "You're anonymous: if you clear your browser or change device, you lose this list. Sign in with Google to keep it.",
  "friends.need_to_play": "Play a challenge first to unlock Friends.",
  "friends.request_sent": "Request sent",
  "friends.request_accepted": "You're now friends!",
  "friends.remove": "Remove friend",
  "friends.online": "Online",
  "friends.offline": "Offline",
  "friends.remove_confirm": "Remove this friend?",
  "friends.list_empty_short": "No friends yet",

  "duel.invitation_label": "Duel challenge",
  "duel.invitation_from": "{{name}} challenged you to {{game}}",
  "duel.someone": "Someone",
  "duel.expires_in": "Expires in {{seconds}}s",
  "duel.more_pending": "+{{count}} more",
  "duel.accept_or_reject_accept": "Accept",
  "duel.accept_or_reject_reject": "Reject",
  "duel.challenge_button": "Challenge",
  "duel.pick_game": "Pick game, difficulty and time",
  "duel.game_label": "Game",
  "duel.challenging_friend": "You're about to challenge {{name}}",
  "duel.open_link": "Generate open link (for anyone)",
  "duel.error_generic": "Couldn't create the duel. Try again.",
  "duel.loading": "Loading duel…",
  "duel.not_found": "This duel doesn't exist or is no longer available.",
  "duel.error_start": "Couldn't load the duel. Try again from the home page.",
  "duel.waiting_opponent": "Waiting for them to accept…",
  "duel.waiting_finish": "Waiting for your opponent to finish…",
  "duel.cancel": "Cancel",
  // Leaving a duel in progress (button + confirmation dialog).
  "duel.leave_button": "Leave",
  "duel.leave_title": "Leave the duel?",
  "duel.leave_msg":
    "If you leave now, you forfeit the duel and your opponent wins. This can't be undone.",
  "duel.leave_confirm": "Yes, leave and lose",
  "duel.leave_cancel": "Keep playing",
  // Accepting a duel while in a game (daily challenge or duel in progress).
  "duel.accept_while_playing_title": "Accept the duel?",
  "duel.accept_while_playing_msg":
    "You're in the middle of a game. If you accept this duel, you lose your current game and its attempt. This can't be undone.",
  "duel.accept_while_playing_confirm": "Yes, accept and lose my game",
  "duel.accept_while_playing_cancel": "Keep playing",
  "duel.cancelled_by_you": "You cancelled the duel.",
  "duel.expired": "The duel expired.",
  "duel.cancelled": "The duel was cancelled.",
  "duel.condition": "{{game}} · {{difficulty}} · {{time}}s",
  "duel.you_won": "You won!",
  "duel.you_lost": "You lost",
  "duel.tied": "Tied",
  // Reason for the outcome (shown under the result when it applies).
  "duel.reason_nobody_played": "Neither player completed the challenge in time.",
  "duel.reason_opponent_absent": "Your opponent never played.",
  "duel.reason_you_absent": "You never played.",
  "duel.reason_opponent_forfeit": "Your opponent left the duel.",
  "duel.reason_you_forfeit": "You left the duel.",
  "duel.rematch": "Rematch",
  "duel.rematch_sent": "Rematch invitation sent",
  "duel.your_score": "You: {{points}} pts in {{seconds}}s",
  "duel.opponent_score": "Opponent: {{points}} pts in {{seconds}}s",
  "duel.go_home": "Back to home",
  "duel.share_link": "Share link",
  "duel.link_copied": "Link copied to clipboard",
};

export default en;
