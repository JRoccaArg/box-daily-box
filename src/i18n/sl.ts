// src/i18n/sl.ts — Slovenian translations.

import type { Translations } from "./types";

const sl: Translations = {
  // ─── Home ───────────────────────────────────────────────────────────
  "home.eyebrow": "Današnji izzivi",
  "home.title": "{{count}} izzivov. En dan.",
  "home.subtitle":
    "Vsak dan ob polnoči nove mini igre Formule 1. Registracija ni potrebna: napredek se shrani na tej napravi.",
  "home.completed": "{{done}} od {{total}} opravljenih",
  "home.streak": "{{count}}-dnevni niz",
  "home.day_singular": "dan",
  "home.day_plural": "dni",
  "home.play_now": "Igraj zdaj",
  "home.come_back": "Pridi jutri nazaj",
  "home.solved": "Rešeno",
  "home.played": "Odigrano",
  "home.unplayed": "Neodigrano",
  "home.num.3": "Trije",
  "home.num.4": "Štirje",
  "home.num.5": "Pet",
  "home.num.6": "Šest",
  "home.num.7": "Sedem",
  "home.num.8": "Osem",

  // ─── Games: names and taglines ──────────────────────────────────────
  "game.pittexto.name": "Pit Tekst",
  "game.pittexto.tagline":
    "Ugani skrivnega dirkača. Vsak poskus ti pove, kako blizu si.",
  "game.polewordle.name": "PoleWordle",
  "game.polewordle.tagline":
    "Ugani priimek dirkača v slogu Wordle v 6 poskusih.",
  "game.el-intruso.name": "Vsiljivec",
  "game.el-intruso.tagline":
    "Devet od desetih dirkačev ima nekaj skupnega. Tapni tistega, ki ne spada zraven.",
  "game.parrilla-bingo.name": "Grid Bingo",
  "game.parrilla-bingo.tagline":
    "V vsako celico postavi dirkača, ki ustreza ekipi in pogoju.",

  // ─── GameShell ──────────────────────────────────────────────────────
  "shell.daily_challenge": "Dnevni izziv",
  "shell.difficulty": "Težavnost",
  "shell.time": "Čas",
  "shell.time_limit": "Časovna omejitev: {{seconds}} sekund",
  "shell.no_time_limit": "Brez časovne omejitve",
  "shell.start": "Začni",
  "shell.surrender": "Predaj se",
  "shell.no": "Ne",
  "shell.back": "Domov",
  "shell.back_label": "Nazaj na domačo stran",

  "diff.facil": "Lahko",
  "diff.medio": "Srednje",
  "diff.dificil": "Težko",
  "diff.leyenda": "Legenda",
  "diff.hint.facil": "Nedavna startna vrsta (zadnjih nekaj sezon)",
  "diff.hint.medio": "Hibridna in V8 doba (od 2006)",
  "diff.hint.dificil": "Moderna doba (od 1990)",
  "diff.hint.leyenda": "Celotna zgodovina F1",

  "result.won_title": "Izziv opravljen",
  "result.lost_title": "Konec poskusa",
  "result.won_msg": "Odlično opravljeno!",
  "result.lost_msg": "Tokrat ni šlo.",
  "result.won_sub": "Ta izziv si dodal v svoj niz.",
  "result.lost_sub": "Preglej pravilne odgovore na tabli.",
  "result.points": "točk",
  "result.not_ranked":
    "Danes je drug igralec s tvoje povezave že igral ta izziv, zato tvoj rezultat ne šteje za globalno lestvico. Še vedno je shranjen v tvoji zgodovini.",
  "result.view_board": "Poglej tablo",
  "result.view_ranking": "Poglej današnjo lestvico",
  "result.go_home": "Nazaj domov",
  "result.come_back": "Jutri se vrni za nov izziv",

  "leave.title": "Zapusti in izgubi izziv?",
  "leave.msg":
    "Če zdaj zapustiš, ta izziv šteje kot poraz in do jutri ga ne boš mogel ponovno igrati. Tvoj niz se bo prekinil.",
  "leave.confirm": "Da, zapusti in izgubi",
  "leave.cancel": "Nadaljuj z igro",

  "locked.won": "Današnji izziv si že rešil.",
  "locked.lost": "Današnji izziv si že odigral.",
  "locked.wait": "Jutri se vrni za nov izziv",

  "banner.won": "Izziv opravljen",
  "banner.lost": "Izziv neuspešen",
  "banner.summary": "Poglej povzetek",

  // ─── Header ─────────────────────────────────────────────────────────
  "header.home_label": "Box Daily Box - domov",
  "header.streak_title": "{{count}}-dnevni niz",
  "header.profile_label": "Uredi profil",
  "header.stats_label": "Poglej statistiko",
  "header.stats": "Statistika",

  // ─── Footer ─────────────────────────────────────────────────────────
  "footer.line1":
    "Box Box Daily · Navijački projekt, ni uradno povezan s Formulo 1.",
  "footer.line2": "Nov izziv vsak dan ob polnoči.",

  // ─── Profile (IdentityModal) ────────────────────────────────────────
  "profile.title": "Tvoj profil",
  "profile.subtitle":
    "Na globalni lestvici se boš pojavil s tem imenom in državo.",
  "profile.name_label": "Ime (vidno na lestvici)",
  "profile.name_placeholder": "Tvoje ime ali vzdevek",
  "profile.name_locked":
    "Ponovno ga lahko spremeniš v {{month}}. Ta mesec si že porabil spremembo imena.",
  "profile.name_warn":
    "⚠️ Ime lahko spremeniš samo enkrat na mesec. Dobro premisli pred shranjevanjem.",
  "profile.country_label": "Država",
  "profile.country_detecting": "(zaznavamo...)",
  "profile.country_select": "Izberi svojo državo",
  "profile.country_fixed": "(fiksno)",
  "profile.country_warn": "⚠️ Ko je shranjeno, ga ne moreš več spremeniti.",
  "profile.save": "Shrani",
  "profile.saving": "Shranjujem...",
  "profile.cancel": "Prekliči",
  "profile.save_error": "Ni bilo mogoče shraniti. Poskusi znova.",
  "profile.sync_label": "Sinhroniziraj med napravami",
  "profile.logged_as": "Prijavljen kot:",
  "profile.logout": "Odjava",
  "profile.google_login": "Prijava z Google",
  "profile.logged_hint": "Tvoj napredek je sinhroniziran na vseh tvojih napravah.",
  "profile.login_hint":
    "Neobvezno. Prijava ti omogoča igranje na več napravah z istim računom.",

  // ─── Stats (StatsModal) ─────────────────────────────────────────────
  "stats.title": "Statistika",
  "stats.no_name": "Brez imena",
  "stats.edit_profile": "Uredi profil",
  "stats.tab_global": "Globalna lestvica",
  "stats.tab_personal": "Moj napredek",
  "stats.won": "Zmage",
  "stats.lost": "Porazi",
  "stats.win_rate": "Zmage %",
  "stats.streak": "Niz",
  "stats.best_streak": "Najboljši niz",
  "stats.days": "dni",
  "stats.no_persistent":
    "Trajna shramba v tem brskalniku ni na voljo. Tvoj napredek bo shranjen samo med to sejo.",
  "stats.reset_confirm":
    "To bo izbrisalo tvojo statistiko in točke. Izzivi, ki si jih danes že odigral, bodo ostali zaklenjeni do jutri. Tega dejanja ni mogoče razveljaviti.",
  "stats.reset_yes": "Da, izbriši vse",
  "stats.reset_cancel": "Prekliči",
  "stats.reset": "Ponastavi napredek",

  // ─── Global Ranking ─────────────────────────────────────────────────
  "ranking.title": "Globalna lestvica",
  "ranking.tab_today": "Danes",
  "ranking.all_countries": "Vse države",
  "ranking.loading": "Nalagam lestvico...",
  "ranking.error": "Lestvice ni bilo mogoče naložiti",
  "ranking.retry": "Poskusi znova",
  "ranking.empty_daily": "Danes še nihče ni igral. Bodi prvi!",
  "ranking.empty_monthly": "Ta mesec ni rezultatov.",
  "ranking.anonymous": "Anonimni",
  "ranking.you": "(ti)",
  "ranking.challenges_won": "{{count}} {{label}} dobljenih",
  "ranking.challenge_singular": "izziv",
  "ranking.challenge_plural": "izzivov",
  "ranking.pts": "točk",
  "ranking.monthly_note": "Mesečna lestvica se ponastavi 1. v mesecu.",
  "ranking.daily_note": "Dnevna lestvica prikazuje današnje rezultate.",

  // ─── Monthly Ranking (personal) ─────────────────────────────────────
  "monthly.title": "Lestvica za {{month}}",
  "monthly.challenges_won": "{{count}} izzivov dobljenih",
  "monthly.points_month": "točk ta mesec",
  "monthly.no_wins": "Ta mesec še nisi dobil nobenega izziva. Osvoji svoje prve točke!",
  "monthly.best_day": "Najboljši dan: {{day}} ({{points}} točk)",
  "monthly.scoring_title": "Kako se izračunajo točke?",
  "monthly.scoring_body":
    "Štejejo samo dobljeni izzivi. Osnovne točke po težavnosti: Lahko {{easy}}, Srednje {{medium}}, Težko {{hard}}, Legenda {{legend}}. Hitrejši ko končaš, več hitrostnega bonusa dobiš (do +120). Predaja šteje kot poraz (0 točk).",
  "monthly.disclaimer":
    "Ta lestvica je osebna in lokalna (shranjena na tvoji napravi) in vključuje vse tvoje točke, tudi tiste, ki niso štele za globalno lestvico (na primer, ko je drug račun s tvoje povezave igral ta izziv pred tabo). Globalna lestvica se izračuna na strežniku, ki neodvisno preveri vsak odgovor. Majhne razlike v točkah z globalno lestvico so normalne (drugačno merjenje časa).",

  // ─── RankBadge ──────────────────────────────────────────────────────
  "rank.position": "Mesto #{{rank}}",
  "rank.your_position": "Tvoj današnji položaj",
  "rank.world_ranking": "Svetovna lestvica",
  "rank.of_players": "od {{count}}",
  "rank.badge_title": "Položaj na dnevni lestvici {{count}} igralcev",

  // ─── Auth Callback ──────────────────────────────────────────────────
  "auth.loading": "Prijavljanje...",
  "auth.linking": "Povezovanje tvojega Google računa",
  "auth.error": "Napaka",
  "auth.cancelled": "Prijava preklicana",
  "auth.no_code": "Ni avtorizacijske kode",
  "auth.failed": "Prijava ni uspela",
  "auth.redirecting": "Preusmerjanje...",

  // ─── Individual games ───────────────────────────────────────────────
  "pittexto.placeholder": "Vnesi priimek…",
  "pittexto.found": "Našel si:",
  "pittexto.answer_was": "Dirkač je bil:",

  "polewordle.not_in_list": "Ni na seznamu dirkačev",

  "intruso.confirm": "Potrdi vsiljivca",
  "intruso.select": "Izberi dirkača",

  "bingo.pick_driver": "Izberi dirkača",
  "bingo.drove_for": "dirkal za {{team}}",
  "bingo.nationality": "narodnost {{name}}",
  "bingo.world_champion": "svetovni prvak",

  // ─── Months ─────────────────────────────────────────────────────────
  "month.0": "Januar",
  "month.1": "Februar",
  "month.2": "Marec",
  "month.3": "April",
  "month.4": "Maj",
  "month.5": "Junij",
  "month.6": "Julij",
  "month.7": "Avgust",
  "month.8": "September",
  "month.9": "Oktober",
  "month.10": "November",
  "month.11": "December",

  // ─── PitTexto extra ──────────────────────────────────────────────────
  "pittexto.eyebrow": "Ugani dirkača",
  "pittexto.hint":
    "Vsak poskus pokaže, kako podoben je dirkač skrivnemu. Bolj vroče = bližje.",
  "pittexto.attempt": "Poskus {{current}} od {{max}}",

  // ─── PoleWordle extra ─────────────────────────────────────────────────
  "polewordle.eyebrow": "Priimek dirkača",
  "polewordle.hint":
    "Ugani priimek v {{max}} poskusih. Zelena = pravilna črka in mesto; rumena = črka je prisotna, a drugje; siva = ni prisotna.",
  "polewordle.grid_info": "{{len}} črk · {{max}} poskusov",
  "polewordle.length_error": "Priimek ima {{len}} črk",
  "polewordle.was": "Bil je",
  "polewordle.correct": "Pravilno!",
  "polewordle.input_label": "Vnesi priimek",
  "polewordle.grid_label": "Odpri tipkovnico za vnos",

  // ─── ElIntruso extra ──────────────────────────────────────────────────
  "intruso.eyebrow": "Vsiljivec",
  "intruso.hint":
    "9 od teh 10 dirkačev ima nekaj skupnega. Najdi tistega, ki ne spada zraven.",
  "intruso.rule_label": "Ostalih 9",

  // ─── ParrillaBingo extra ──────────────────────────────────────────────
  "bingo.eyebrow": "Grid Bingo",
  "bingo.hint":
    "Vsako celico napolni z dirkačem, ki ustreza ekipi v svoji vrstici in pogoju v svojem stolpcu. Brez ponavljanja dirkačev.",
  "bingo.cells_count": "{{filled}} od 9 celic",
  "bingo.reveal_hint": "Sive celice prikazujejo veljaven primer.",
  "bingo.search_placeholder": "Išči dirkača…",
  "bingo.no_match": "Ni ujemajočih dirkačev.",
  "bingo.already_used": "{{name}} je že v drugi celici.",
  "bingo.does_not_match": "{{name}} ne ustreza: {{rule}}.",
  "bingo.in_cell": "V celici:",
  "bingo.remove": "Odstrani",
  "bingo.empty_cell": "Prazna celica",
  "bingo.example": "npr.",
  "bingo.champion_label": "Prvak",

  // ─── GP Resultado ───────────────────────────────────────────────────
  "game.gp-resultado.name": "GP Rezultat",
  "game.gp-resultado.tagline": "Dopolni prvih 10 zgodovinske Velike nagrade, preden ti zmanjka časa.",
  "gpresultado.eyebrow": "Velika nagrada",
  "gpresultado.search_placeholder": "Vnesi ime dirkača…",
  "gpresultado.found_count": "{{found}} od {{total}} najdenih",
  "gpresultado.not_in_top": "{{name}} ni končal v prvih 10.",
  "gpresultado.time_up": "Čas je potekel. Manjkajoča mesta so prikazana zgoraj.",

  // ─── Language ───────────────────────────────────────────────────────
  "lang.label": "Jezik",

  "profile.name_unique_hint": "Mora biti edinstveno: nihče drug ne more imeti istega uporabniškega imena.",
  "profile.name_taken": "To uporabniško ime je že zasedeno. Poskusite z drugim.",
  "profile.name_checking": "Preverjanje razpoložljivosti...",
  "profile.name_available": "✓ Na voljo",

  "game.top10-standings.name": "Top 10 Standings",
  "game.top10-standings.tagline":
    "Uganite seštevek najboljših 10 mest v prvenstvu voznikov v obdobju 1-4 let.",
  "top10standings.eyebrow": "Prvenstvo voznikov",
  "top10standings.subtitle": "Seštevek najboljših 10 mest za obdobje",
  "top10standings.search_placeholder": "Vnesite ime voznika…",
  "top10standings.found_count": "{{found}} od {{total}} najdenih",
  "top10standings.not_in_top": "{{name}} ni med seštetimi najboljšimi 10.",
  "top10standings.points_label": "{{points}} t.",
  "top10standings.time_up": "Čas je potekel. Manjkajoči položaji so prikazani zgoraj.",

  "seo.home.title": "Box Daily Box — Dnevne mini igre Formule 1 | 6 brezplačnih ugank",
  "seo.home.description":
    "Šest dnevnih mini iger Formule 1: ugibajte voznike, dopolnite najboljših 10, poiščite vsiljivca in več. Brezplačna svetovna lestvica, brez prijave.",
  "seo.game.pittexto.title": "PitTexto — Uganite skrivnega voznika F1 | Box Daily Box",
  "seo.game.pittexto.description":
    "Uganite skrivnega voznika Formule 1 dneva. Vsak poskus vam pove, kako blizu ste. Nov izziv vsakih 24 ur.",
  "seo.game.polewordle.title": "PoleWordle — Wordle Formule 1 | Box Daily Box",
  "seo.game.polewordle.description":
    "Uganite priimek voznika F1 dneva, v slogu Wordle, v 6 poskusih. Nova brezplačna dnevna uganka.",
  "seo.game.el-intruso.title": "El Intruso — Poiščite voznika, ki ne sodi zraven | Box Daily Box",
  "seo.game.el-intruso.description":
    "Devet od desetih voznikov F1 si deli nekaj skupnega. Poiščite vsiljivca v tej dnevni uganki Formule 1.",
  "seo.game.parrilla-bingo.title": "Parrilla Bingo — Bingo ekip F1 | Box Daily Box",
  "seo.game.parrilla-bingo.description":
    "Vsako celico zapolnite z voznikom, ki ustreza ekipi in pogoju. Dnevni bingo Formule 1.",
  "seo.game.gp-resultado.title": "GP Resultado — Uganite najboljših 10 na Velike nagrade | Box Daily Box",
  "seo.game.gp-resultado.description":
    "Dopolnite najboljših 10 na zgodovinski Veliki nagradi F1, preden poteče čas. Nova brezplačna dnevna uganka.",
  "seo.game.top10-standings.title": "Top 10 Standings — Uganka prvenstva F1 | Box Daily Box",
  "seo.game.top10-standings.description":
    "Uganite seštevek najboljših 10 mest v prvenstvu voznikov F1 v obdobju 1-4 let.",

  "gamepage.not_found_title": "Igra ni najdena",
  "gamepage.not_found_body": "Izziv, ki ga iščete, ne obstaja ali je bil premaknjen.",
  "gamepage.see_all": "Poglej vse izzive",
};

export default sl;
