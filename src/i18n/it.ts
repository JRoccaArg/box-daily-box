// src/i18n/it.ts — Traduzioni in italiano.

import type { Translations } from "./types";

const it: Translations = {
  "home.eyebrow": "Sfide di oggi",
  "home.title": "{{count}} sfide. Un giorno.",
  "home.subtitle":
    "Un nuovo set di minigiochi di Formula 1 ogni giorno a mezzanotte. Senza registrazione: i tuoi progressi vengono salvati su questo dispositivo.",
  "home.completed": "{{done}} di {{total}} completati",
  "home.streak": "Serie di {{count}} {{day}}",
  "home.day_singular": "giorno",
  "home.day_plural": "giorni",
  "home.play_now": "Gioca ora",
  "home.come_back": "Torna domani",
  "home.solved": "Risolto",
  "home.played": "Giocato",
  "home.unplayed": "Non giocato",
  "home.num.3": "Tre",
  "home.num.4": "Quattro",
  "home.num.5": "Cinque",
  "home.num.6": "Sei",
  "home.num.7": "Sette",
  "home.num.8": "Otto",

  "game.pittexto.name": "Pit Testo",
  "game.pittexto.tagline":
    "Indovina il pilota segreto. Ogni tentativo ti dice quanto sei vicino.",
  "game.polewordle.name": "PoleWordle",
  "game.polewordle.tagline":
    "Indovina il cognome del pilota del giorno, stile Wordle, in 6 tentativi.",
  "game.el-intruso.name": "L'Intruso",
  "game.el-intruso.tagline":
    "Nove piloti su dieci hanno qualcosa in comune. Tocca quello che non c'entra.",
  "game.parrilla-bingo.name": "Griglia Bingo",
  "game.parrilla-bingo.tagline":
    "Inserisci in ogni cella un pilota che corrisponda sia alla scuderia che alla condizione.",

  "shell.daily_challenge": "Sfida del giorno",
  "shell.difficulty": "Difficoltà",
  "shell.time": "Tempo",
  "shell.time_limit": "Limite di tempo: {{seconds}} secondi",
  "shell.no_time_limit": "Senza limite di tempo",
  "shell.start": "Inizia",
  "shell.surrender": "Arrendersi",
  "shell.no": "No",
  "shell.back": "Home",
  "shell.back_label": "Torna alla home",

  "diff.facil": "Facile",
  "diff.medio": "Medio",
  "diff.dificil": "Difficile",
  "diff.leyenda": "Leggenda",
  "diff.hint.facil": "Griglia recente (ultime stagioni)",
  "diff.hint.medio": "Era ibrida e V8 (dal 2006)",
  "diff.hint.dificil": "Era moderna (dal 1990)",
  "diff.hint.leyenda": "Tutta la storia della F1",

  "result.won_title": "Sfida superata",
  "result.lost_title": "Fine del tentativo",
  "result.won_msg": "Ottimo lavoro!",
  "result.lost_msg": "Non questa volta.",
  "result.won_sub": "Hai aggiunto questa sfida alla tua serie.",
  "result.lost_sub": "Rivedi le risposte corrette sulla griglia.",
  "result.points": "punti",
  "result.not_ranked":
    "Un altro giocatore ha già giocato questa sfida dalla tua connessione oggi, quindi il tuo risultato non conta per la classifica globale. È comunque salvato nel tuo storico.",
  "result.view_board": "Vedi la griglia",
  "result.view_ranking": "Vedi classifica del giorno",
  "result.go_home": "Torna alla home",
  "result.come_back": "Torna domani per una nuova sfida",

  "leave.title": "Uscire e perdere la sfida?",
  "leave.msg":
    "Se esci ora, questa sfida conta come persa e non potrai giocarla fino a domani. La serie si interrompe.",
  "leave.confirm": "Sì, esci e perdi",
  "leave.cancel": "Continua a giocare",

  "locked.won": "Hai già risolto la sfida di oggi.",
  "locked.lost": "Hai già giocato la sfida di oggi.",
  "locked.wait": "Torna domani per una nuova sfida",

  "banner.won": "Sfida superata",
  "banner.lost": "Sfida fallita",
  "banner.summary": "Vedi riepilogo",

  "header.home_label": "Box Daily Box - home",
  "header.streak_title": "Serie di {{count}} giorni",
  "header.profile_label": "Modifica profilo",
  "header.stats_label": "Vedi statistiche",
  "header.stats": "Stats",

  "footer.line1":
    "Box Box Daily · Progetto di fan, senza affiliazione ufficiale con la Formula 1.",
  "footer.line2": "Una nuova sfida ogni giorno a mezzanotte.",

  "profile.title": "Il tuo profilo",
  "profile.subtitle":
    "Apparirai nella classifica globale con questo nome e paese.",
  "profile.name_label": "Nome (visibile in classifica)",
  "profile.name_placeholder": "Il tuo nome o soprannome",
  "profile.name_locked":
    "Potrai cambiarlo di nuovo a {{month}}. Questo mese hai già usato il cambio nome.",
  "profile.name_warn":
    "⚠️ Puoi cambiare nome solo 1 volta al mese. Scegli bene prima di salvare.",
  "profile.country_label": "Paese",
  "profile.country_detecting": "(rilevamento...)",
  "profile.country_select": "Seleziona il tuo paese",
  "profile.country_fixed": "(fisso)",
  "profile.country_warn": "⚠️ Una volta salvato, non puoi cambiarlo.",
  "profile.save": "Salva",
  "profile.saving": "Salvataggio...",
  "profile.cancel": "Annulla",
  "profile.save_error": "Impossibile salvare. Riprova.",
  "profile.sync_label": "Sincronizza tra dispositivi",
  "profile.logged_as": "Accesso effettuato come:",
  "profile.logout": "Esci",
  "profile.google_login": "Accedi con Google",
  "profile.logged_hint":
    "I tuoi progressi sono sincronizzati su tutti i tuoi dispositivi.",
  "profile.login_hint":
    "Opzionale. L'accesso ti permette di giocare su più dispositivi con lo stesso account.",

  "stats.title": "Statistiche",
  "stats.no_name": "Senza nome",
  "stats.edit_profile": "Modifica profilo",
  "stats.tab_global": "Classifica Globale",
  "stats.tab_personal": "I Miei Progressi",
  "stats.won": "Vinti",
  "stats.lost": "Persi",
  "stats.win_rate": "% Vittorie",
  "stats.streak": "Serie",
  "stats.best_streak": "Miglior serie",
  "stats.days": "giorni",
  "stats.no_persistent":
    "L'archiviazione persistente non è disponibile in questo browser. I tuoi progressi verranno salvati solo durante questa sessione.",
  "stats.reset_confirm":
    "Questo cancellerà le tue statistiche e i tuoi punti. Le sfide giocate oggi resteranno bloccate fino a domani. Questa azione non può essere annullata.",
  "stats.reset_yes": "Sì, cancella tutto",
  "stats.reset_cancel": "Annulla",
  "stats.reset": "Reimposta progressi",

  "ranking.title": "Classifica Globale",
  "ranking.tab_today": "Oggi",
  "ranking.all_countries": "Tutti i paesi",
  "ranking.loading": "Caricamento classifica...",
  "ranking.error": "Impossibile caricare la classifica",
  "ranking.retry": "Riprova",
  "ranking.empty_daily": "Nessuno ha giocato oggi. Sii il primo!",
  "ranking.empty_monthly": "Nessun risultato questo mese.",
  "ranking.anonymous": "Anonimo",
  "ranking.you": "(tu)",
  "ranking.challenges_won": "{{count}} {{label}} vinti",
  "ranking.challenge_singular": "sfida",
  "ranking.challenge_plural": "sfide",
  "ranking.pts": "pts",
  "ranking.monthly_note":
    "La classifica mensile si azzera il 1° di ogni mese.",
  "ranking.daily_note": "La classifica giornaliera mostra i risultati di oggi.",

  "monthly.title": "Classifica di {{month}}",
  "monthly.challenges_won": "{{count}} sfide vinte",
  "monthly.points_month": "punti questo mese",
  "monthly.no_wins":
    "Non hai ancora vinto sfide questo mese. Ottieni i tuoi primi punti!",
  "monthly.best_day": "Miglior giorno: {{day}} ({{points}} pts)",
  "monthly.scoring_title": "Come funziona il punteggio?",
  "monthly.scoring_body":
    "Contano solo le sfide vinte. Punti base per difficoltà: Facile {{easy}}, Medio {{medium}}, Difficile {{hard}}, Leggenda {{legend}}. Più veloce finisci, più bonus velocità (fino a +120). Arrendersi conta come sconfitta (0 punti).",
  "monthly.disclaimer":
    "Questa classifica è personale e locale (salvata sul tuo dispositivo) e include tutti i tuoi punti, anche quelli non conteggiati nella classifica globale. La classifica globale è calcolata sul server, che verifica ogni risposta in modo indipendente. Piccole differenze di punti con il globale sono normali.",

  "rank.position": "Posizione #{{rank}}",
  "rank.your_position": "La tua posizione oggi",
  "rank.world_ranking": "Classifica mondiale",
  "rank.of_players": "di {{count}}",
  "rank.badge_title":
    "Posizione nella classifica giornaliera di {{count}} giocatori",

  "auth.loading": "Accesso in corso...",
  "auth.linking": "Collegamento del tuo account Google",
  "auth.error": "Errore",
  "auth.cancelled": "Autenticazione annullata",
  "auth.no_code": "Nessun codice di autorizzazione",
  "auth.failed": "Impossibile accedere",
  "auth.redirecting": "Reindirizzamento...",

  "pittexto.placeholder": "Scrivi un cognome…",
  "pittexto.found": "Lo hai trovato:",
  "pittexto.answer_was": "Il pilota era:",

  "polewordle.not_in_list": "Non è nella lista dei piloti",

  "intruso.confirm": "Conferma intruso",
  "intruso.select": "Seleziona un pilota",

  "bingo.pick_driver": "Scegli un pilota",
  "bingo.drove_for": "ha corso in {{team}}",
  "bingo.nationality": "nazionalità {{name}}",
  "bingo.world_champion": "campione del mondo",

  "month.0": "gennaio",
  "month.1": "febbraio",
  "month.2": "marzo",
  "month.3": "aprile",
  "month.4": "maggio",
  "month.5": "giugno",
  "month.6": "luglio",
  "month.7": "agosto",
  "month.8": "settembre",
  "month.9": "ottobre",
  "month.10": "novembre",
  "month.11": "dicembre",

  "pittexto.eyebrow": "Indovina il pilota",
  "pittexto.hint":
    "Ogni tentativo mostra quanto il pilota è simile a quello segreto. Più caldo = più vicino.",
  "pittexto.attempt": "Tentativo {{current}} di {{max}}",

  "polewordle.eyebrow": "Cognome del pilota",
  "polewordle.hint":
    "Indovina il cognome in {{max}} tentativi. Verde = lettera e posizione corrette; giallo = la lettera c'è ma in un'altra posizione; grigio = non c'è.",
  "polewordle.grid_info": "{{len}} lettere · {{max}} tentativi",
  "polewordle.length_error": "Il cognome ha {{len}} lettere",
  "polewordle.was": "Era",
  "polewordle.correct": "Corretto!",
  "polewordle.input_label": "Scrivi il cognome",
  "polewordle.grid_label": "Apri la tastiera per scrivere",

  "intruso.eyebrow": "L'Intruso",
  "intruso.hint":
    "9 di questi 10 piloti hanno qualcosa in comune. Trova quello che non c'entra.",
  "intruso.rule_label": "Gli altri 9",

  "bingo.eyebrow": "Griglia Bingo",
  "bingo.hint":
    "Inserisci in ogni cella un pilota che corrisponda alla scuderia della riga e alla condizione della colonna. Non puoi ripetere piloti.",
  "bingo.cells_count": "{{filled}} di 9 celle",
  "bingo.reveal_hint": "Le celle grigie mostrano un esempio valido.",
  "bingo.search_placeholder": "Cerca un pilota…",
  "bingo.no_match": "Nessun pilota trovato.",
  "bingo.already_used": "{{name}} è già in un'altra cella.",
  "bingo.does_not_match": "{{name}} non corrisponde: {{rule}}.",
  "bingo.in_cell": "Nella cella:",
  "bingo.remove": "Rimuovi",
  "bingo.empty_cell": "Cella vuota",
  "bingo.example": "es.",
  "bingo.champion_label": "Campione",

    "game.gp-resultado.name": "GP Risultato",
  "game.gp-resultado.tagline": "Completa la top 10 di un Gran Premio storico prima che scada il tempo.",
  "gpresultado.eyebrow": "Gran Premio",
  "gpresultado.search_placeholder": "Scrivi un pilota…",
  "gpresultado.found_count": "{{found}} di {{total}} trovati",
  "gpresultado.not_in_top": "{{name}} non ha finito nella top 10.",
  "gpresultado.time_up": "Tempo scaduto. Le posizioni mancanti sono mostrate sopra.",

  "lang.label": "Lingua",

  "profile.name_unique_hint": "Deve essere unico: nessun altro può avere lo stesso nome utente.",
  "profile.name_taken": "Quel nome utente è già in uso. Prova un altro.",
  "profile.name_checking": "Verifica disponibilità...",
  "profile.name_available": "✓ Disponibile",

  "game.top10-standings.name": "Top 10 Standings",
  "game.top10-standings.tagline":
    "Indovina la top 10 accumulata di punti del campionato piloti in un periodo di 1-4 anni.",
  "top10standings.eyebrow": "Campionato Piloti",
  "top10standings.subtitle": "Top 10 accumulata di punti del periodo",
  "top10standings.search_placeholder": "Scrivi un pilota…",
  "top10standings.found_count": "{{found}} di {{total}} trovati",
  "top10standings.not_in_top": "{{name}} non è nella top 10 accumulata.",
  "top10standings.points_label": "{{points}} pt",
  "top10standings.time_up": "Tempo scaduto. Le posizioni mancanti sono mostrate sopra.",

  "seo.home.title": "Box Daily Box — Minigiochi giornalieri di Formula 1 | 6 puzzle gratis",
  "seo.home.description":
    "Sei minigiochi giornalieri di Formula 1: indovina i piloti, completa la top 10, trova l'intruso e altro ancora. Classifica globale gratuita, senza registrazione.",
  "seo.game.pittexto.title": "PitTexto — Indovina il pilota segreto di F1 | Box Daily Box",
  "seo.game.pittexto.description":
    "Indovina il pilota di Formula 1 segreto del giorno. Ogni tentativo ti dice quanto sei vicino. Nuova sfida ogni 24 ore.",
  "seo.game.polewordle.title": "PoleWordle — Il Wordle della Formula 1 | Box Daily Box",
  "seo.game.polewordle.description":
    "Indovina il cognome del pilota di F1 del giorno, stile Wordle, in 6 tentativi. Un nuovo puzzle giornaliero gratuito.",
  "seo.game.el-intruso.title": "El Intruso — Trova il pilota che non c'entra | Box Daily Box",
  "seo.game.el-intruso.description":
    "Nove piloti di F1 su dieci hanno qualcosa in comune. Trova l'intruso in questo puzzle giornaliero di Formula 1.",
  "seo.game.parrilla-bingo.title": "Parrilla Bingo — Bingo delle scuderie F1 | Box Daily Box",
  "seo.game.parrilla-bingo.description":
    "Completa ogni cella con un pilota che rispetti sia la scuderia che la condizione. Il bingo giornaliero di Formula 1.",
  "seo.game.gp-resultado.title": "GP Risultato — Indovina la top 10 di un Gran Premio | Box Daily Box",
  "seo.game.gp-resultado.description":
    "Completa la top 10 di un Gran Premio storico di F1 prima che scada il tempo. Un nuovo puzzle giornaliero gratuito.",
  "seo.game.top10-standings.title": "Top 10 Standings — Il puzzle del campionato F1 | Box Daily Box",
  "seo.game.top10-standings.description":
    "Indovina la top 10 accumulata di punti del campionato piloti F1 in un periodo di 1-4 anni.",

  "gamepage.not_found_title": "Gioco non trovato",
  "gamepage.not_found_body": "La sfida che cerchi non esiste o è stata spostata.",
  "gamepage.see_all": "Vedi tutte le sfide",
};

export default it;
