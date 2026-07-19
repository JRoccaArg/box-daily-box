// src/i18n/fr.ts — Traductions en français.

import type { Translations } from "./types";

const fr: Translations = {
  "home.eyebrow": "Défis du jour",
  "home.title": "{{count}} défis. Un jour.",
  "home.subtitle":
    "Un nouveau set de mini-jeux de Formule 1 chaque jour à minuit. Sans inscription : votre progression est sauvegardée sur cet appareil.",
  "home.completed": "{{done}} sur {{total}} terminés",
  "home.streak": "Série de {{count}} {{day}}",
  "home.day_singular": "jour",
  "home.day_plural": "jours",
  "home.play_now": "Jouer maintenant",
  "home.come_back": "Revenez demain",
  "home.solved": "Résolu",
  "home.played": "Joué",
  "home.unplayed": "Non joué",
  "home.num.3": "Trois",
  "home.num.4": "Quatre",
  "home.num.5": "Cinq",
  "home.num.6": "Six",
  "home.num.7": "Sept",
  "home.num.8": "Huit",

  "game.pittexto.name": "Pit Texte",
  "game.pittexto.tagline":
    "Devinez le pilote secret. Chaque essai vous dit à quel point vous êtes proche.",
  "game.polewordle.name": "PoleWordle",
  "game.polewordle.tagline":
    "Devinez le nom du pilote du jour, style Wordle, en 6 essais.",
  "game.el-intruso.name": "L'Intrus",
  "game.el-intruso.tagline":
    "Neuf pilotes sur dix ont quelque chose en commun. Touchez celui qui ne correspond pas.",
  "game.parrilla-bingo.name": "Grille Bingo",
  "game.parrilla-bingo.tagline":
    "Placez dans chaque case un pilote correspondant à l'écurie et à la condition.",

  "shell.daily_challenge": "Défi du jour",
  "shell.difficulty": "Difficulté",
  "shell.time": "Temps",
  "shell.time_limit": "Limite de temps : {{seconds}} secondes",
  "shell.no_time_limit": "Pas de limite de temps",
  "shell.start": "Commencer",
  "shell.surrender": "Abandonner",
  "shell.no": "Non",
  "shell.back": "Accueil",
  "shell.back_label": "Retour à l'accueil",

  "diff.facil": "Facile",
  "diff.medio": "Moyen",
  "diff.dificil": "Difficile",
  "diff.leyenda": "Légende",
  "diff.hint.facil": "Grille récente (dernières saisons)",
  "diff.hint.medio": "Ère hybride et V8 (depuis 2006)",
  "diff.hint.dificil": "Ère moderne (depuis 1990)",
  "diff.hint.leyenda": "Toute l'histoire de la F1",

  "result.won_title": "Défi réussi",
  "result.lost_title": "Fin de la tentative",
  "result.won_msg": "Bien joué !",
  "result.lost_msg": "Pas cette fois.",
  "result.won_sub": "Vous avez ajouté ce défi à votre série.",
  "result.lost_sub": "Revoyez les bonnes réponses sur le tableau.",
  "result.points": "points",
  "result.not_ranked":
    "Un autre joueur a déjà joué ce défi depuis votre connexion aujourd'hui, votre résultat ne compte donc pas pour le classement global. Il est quand même sauvegardé dans votre historique.",
  "result.view_board": "Voir le tableau",
  "result.view_ranking": "Voir le classement du jour",
  "result.go_home": "Retour à l'accueil",
  "result.come_back": "Revenez demain pour un nouveau défi",

  "leave.title": "Quitter et perdre le défi ?",
  "leave.msg":
    "Si vous quittez maintenant, ce défi compte comme perdu et vous ne pourrez pas le rejouer avant demain. La série sera interrompue.",
  "leave.confirm": "Oui, quitter et perdre",
  "leave.cancel": "Continuer à jouer",

  "locked.won": "Vous avez déjà résolu le défi d'aujourd'hui.",
  "locked.lost": "Vous avez déjà joué le défi d'aujourd'hui.",
  "locked.wait": "Revenez demain pour un nouveau défi",

  "banner.won": "Défi réussi",
  "banner.lost": "Défi échoué",
  "banner.summary": "Voir le résumé",

  "header.home_label": "Box Daily Box - accueil",
  "header.streak_title": "Série de {{count}} jours",
  "header.profile_label": "Modifier le profil",
  "header.stats_label": "Voir les statistiques",
  "header.stats": "Stats",

  "footer.line1":
    "Box Box Daily · Projet de fans, sans affiliation officielle avec la Formule 1.",
  "footer.line2": "Un nouveau défi chaque jour à minuit.",
  "footer.photo_credit": "Photos des pilotes : Wikimedia Commons (CC BY-SA / domaine public).",
  "header.progress": "{{played}} sur {{total}} jeux joués aujourd'hui",

  "profile.title": "Votre profil",
  "profile.subtitle":
    "Vous apparaîtrez dans le classement global avec ce nom et ce pays.",
  "profile.name_label": "Nom (visible dans le classement)",
  "profile.name_placeholder": "Votre nom ou pseudo",
  "profile.name_locked":
    "Vous pourrez le modifier à nouveau en {{month}}. Vous avez déjà utilisé votre changement de nom ce mois-ci.",
  "profile.name_warn":
    "⚠️ Vous ne pouvez changer votre nom qu'une fois par mois. Choisissez bien avant de sauvegarder.",
  "profile.country_label": "Pays",
  "profile.country_detecting": "(détection...)",
  "profile.country_select": "Sélectionnez votre pays",
  "profile.country_fixed": "(fixe)",
  "profile.country_warn": "⚠️ Une fois sauvegardé, vous ne pouvez plus le changer.",
  "profile.save": "Sauvegarder",
  "profile.saving": "Sauvegarde...",
  "profile.cancel": "Annuler",
  "profile.save_error": "Impossible de sauvegarder. Réessayez.",
  "profile.sync_label": "Synchroniser entre appareils",
  "profile.logged_as": "Connecté en tant que :",
  "profile.logout": "Se déconnecter",
  "profile.google_login": "Se connecter avec Google",
  "profile.logged_hint":
    "Votre progression est synchronisée sur tous vos appareils.",
  "profile.login_hint":
    "Optionnel. La connexion vous permet de jouer sur plusieurs appareils avec le même compte.",

  "stats.title": "Statistiques",
  "stats.no_name": "Sans nom",
  "stats.edit_profile": "Modifier le profil",
  "stats.tab_global": "Classement Global",
  "stats.tab_personal": "Ma Progression",
  "stats.won": "Gagnés",
  "stats.lost": "Perdus",
  "stats.win_rate": "% Victoires",
  "stats.streak": "Série",
  "stats.best_streak": "Meilleure série",
  "stats.days": "jours",
  "stats.no_persistent":
    "Le stockage persistant n'est pas disponible dans ce navigateur. Votre progression ne sera sauvegardée que pendant cette session.",
  "stats.reset_confirm":
    "Cela supprimera vos statistiques et vos points. Les défis joués aujourd'hui resteront bloqués jusqu'à demain. Cette action est irréversible.",
  "stats.reset_yes": "Oui, tout supprimer",
  "stats.reset_cancel": "Annuler",
  "stats.reset": "Réinitialiser la progression",

  "ranking.title": "Classement Global",
  "ranking.tab_today": "Aujourd'hui",
  "ranking.all_countries": "Tous les pays",
  "ranking.loading": "Chargement du classement...",
  "ranking.error": "Impossible de charger le classement",
  "ranking.retry": "Réessayer",
  "ranking.empty_daily": "Personne n'a joué aujourd'hui. Soyez le premier !",
  "ranking.empty_monthly": "Aucun résultat ce mois-ci.",
  "ranking.anonymous": "Anonyme",
  "ranking.you": "(vous)",
  "ranking.challenges_won": "{{count}} {{label}} gagnés",
  "ranking.challenge_singular": "défi",
  "ranking.challenge_plural": "défis",
  "ranking.played_no_win": "A joué, aucune victoire",
  "ranking.pts": "pts",
  "ranking.monthly_note":
    "Le classement mensuel est réinitialisé le 1er de chaque mois.",
  "ranking.daily_note":
    "Le classement quotidien affiche les résultats d'aujourd'hui.",

  "monthly.title": "Classement de {{month}}",
  "monthly.challenges_won": "{{count}} défis gagnés",
  "monthly.points_month": "points ce mois-ci",
  "monthly.no_wins":
    "Vous n'avez pas encore gagné de défi ce mois-ci. Marquez vos premiers points !",
  "monthly.best_day": "Meilleur jour : {{day}} ({{points}} pts)",
  "monthly.scoring_title": "Comment fonctionne le score ?",
  "monthly.scoring_body":
    "Seuls les défis gagnés comptent. Points de base par difficulté : Facile {{easy}}, Moyen {{medium}}, Difficile {{hard}}, Légende {{legend}}. Plus vous finissez vite, plus le bonus de vitesse est élevé (jusqu'à +120). Abandonner compte comme une défaite (0 points).",
  "monthly.disclaimer":
    "Ce classement est personnel et local (sauvegardé sur votre appareil) et inclut tous vos points, même ceux qui n'ont pas compté pour le classement global. Le classement global est calculé sur le serveur, qui vérifie chaque réponse de manière indépendante. De petites différences de points avec le global sont normales.",

  "rank.position": "Position #{{rank}}",
  "rank.your_position": "Votre position aujourd'hui",
  "rank.world_ranking": "Classement mondial",
  "rank.of_players": "sur {{count}}",
  "rank.badge_title":
    "Position dans le classement quotidien de {{count}} joueurs",

  "auth.loading": "Connexion en cours...",
  "auth.linking": "Liaison de votre compte Google",
  "auth.error": "Erreur",
  "auth.cancelled": "Authentification annulée",
  "auth.no_code": "Pas de code d'autorisation",
  "auth.failed": "Impossible de se connecter",
  "auth.redirecting": "Redirection...",

  "pittexto.placeholder": "Tapez un nom de famille…",
  "pittexto.found": "Vous l'avez trouvé :",
  "pittexto.answer_was": "Le pilote était :",

  "polewordle.not_in_list": "Pas dans la liste des pilotes",

  "intruso.confirm": "Confirmer l'intrus",
  "intruso.select": "Sélectionnez un pilote",

  "bingo.pick_driver": "Choisir un pilote",
  "bingo.drove_for": "a couru chez {{team}}",
  "bingo.nationality": "nationalité {{name}}",
  "bingo.world_champion": "champion du monde",

  "month.0": "janvier",
  "month.1": "février",
  "month.2": "mars",
  "month.3": "avril",
  "month.4": "mai",
  "month.5": "juin",
  "month.6": "juillet",
  "month.7": "août",
  "month.8": "septembre",
  "month.9": "octobre",
  "month.10": "novembre",
  "month.11": "décembre",

  "pittexto.eyebrow": "Devinez le pilote",
  "pittexto.hint":
    "Chaque essai montre à quel point le pilote ressemble au secret. Plus chaud = plus proche.",
  "pittexto.attempt": "Essai {{current}} sur {{max}}",
  "pittexto.factor.nationality": "Nationalité",
  "pittexto.factor.team": "Écurie",
  "pittexto.factor.debut": "Débuts",
  "pittexto.factor.titles": "Titres",
  "pittexto.factor.mates": "Coéquipiers",
  "pittexto.no_team_match": "Aucune correspondance",
  "common.yes": "Oui",
  "common.no": "Non",

  "polewordle.eyebrow": "Nom du pilote",
  "polewordle.hint":
    "Devinez le nom en {{max}} essais. Vert = lettre et position correctes ; jaune = la lettre est présente mais ailleurs ; gris = absente.",
  "polewordle.grid_info": "{{len}} lettres · {{max}} essais",
  "polewordle.length_error": "Le nom a {{len}} lettres",
  "polewordle.was": "C'était",
  "polewordle.correct": "Correct !",
  "polewordle.input_label": "Tapez le nom",
  "polewordle.grid_label": "Ouvrir le clavier pour taper",

  "intruso.eyebrow": "L'Intrus",
  "intruso.hint":
    "9 de ces 10 pilotes ont quelque chose en commun. Trouvez celui qui ne correspond pas.",
  "intruso.rule_label": "Les 9 autres",
  "intruso.rule.team": "Ont couru pour {{team}}",
  "intruso.rule.champ": "Ont été champions du monde",
  "intruso.rule.non_champ": "N'ont jamais été champions du monde",
  "intruso.rule.nationality": "Sont de la même nationalité ({{nat}})",
  "intruso.rule.none": "Aucune règle disponible",

  "bingo.eyebrow": "Grille Bingo",
  "bingo.hint":
    "Remplissez chaque case avec un pilote correspondant à l'écurie de sa ligne et à la condition de sa colonne. Pas de pilotes en double.",
  "bingo.cells_count": "{{filled}} sur 9 cases",
  "bingo.reveal_hint": "Les cases grises montrent un exemple valide.",
  "bingo.search_placeholder": "Chercher un pilote…",
  "bingo.no_match": "Aucun pilote correspondant.",
  "bingo.already_used": "{{name}} est déjà dans une autre case.",
  "bingo.does_not_match": "{{name}} ne correspond pas : {{rule}}.",
  "bingo.in_cell": "Dans la case :",
  "bingo.remove": "Retirer",
  "bingo.empty_cell": "Case vide",
  "bingo.example": "ex.",
  "bingo.champion_label": "Champion",
  "bingo.stat.winner": "A gagné un GP",
  "bingo.stat.podium": "Est monté sur le podium",
  "bingo.stat.pole": "A obtenu une pole",

    "game.gp-resultado.name": "GP Résultat",
  "game.gp-resultado.tagline": "Complétez le top 10 d'un Grand Prix historique avant la fin du temps.",
  "gpresultado.eyebrow": "Grand Prix",
  "gpresultado.search_placeholder": "Tapez un nom de pilote…",
  "gpresultado.found_count": "{{found}} sur {{total}} trouvés",
  "gpresultado.not_in_top": "{{name}} n'a pas fini dans le top 10.",
  "gpresultado.time_up": "Temps écoulé. Les positions manquantes sont affichées ci-dessus.",

  "lang.label": "Langue",

  "profile.name_unique_hint": "Doit être unique : personne d'autre ne peut avoir le même nom d'utilisateur.",
  "profile.name_taken": "Ce nom d'utilisateur est déjà pris. Essayez-en un autre.",
  "profile.name_checking": "Vérification de la disponibilité...",
  "profile.name_available": "✓ Disponible",

  "game.top10-standings.name": "Top 10 Standings",
  "game.top10-standings.tagline":
    "Devinez le top 10 cumulé de points du championnat pilotes sur une période de 1 à 4 ans.",
  "top10standings.eyebrow": "Championnat des Pilotes",
  "top10standings.subtitle": "Top 10 cumulé de points de la période",
  "top10standings.search_placeholder": "Tapez un nom de pilote…",
  "top10standings.found_count": "{{found}} sur {{total}} trouvés",
  "top10standings.not_in_top": "{{name}} n'est pas dans le top 10 cumulé.",
  "top10standings.points_label": "{{points}} pts",
  "top10standings.time_up": "Temps écoulé. Les positions manquantes sont affichées ci-dessus.",

  "seo.home.title": "Box Daily Box — Minijeux quotidiens de Formule 1 | 6 puzzles gratuits",
  "seo.home.description":
    "Six minijeux quotidiens de Formule 1 : devinez des pilotes, complétez le top 10, trouvez l'intrus et plus encore. Classement mondial gratuit, sans inscription.",
  "seo.game.pittexto.title": "PitTexto — Devinez le pilote secret de F1 | Box Daily Box",
  "seo.game.pittexto.description":
    "Devinez le pilote de Formule 1 secret du jour. Chaque tentative vous indique à quel point vous êtes proche. Nouveau défi toutes les 24 heures.",
  "seo.game.polewordle.title": "PoleWordle — Le Wordle de la Formule 1 | Box Daily Box",
  "seo.game.polewordle.description":
    "Devinez le nom de famille du pilote de F1 du jour, façon Wordle, en 6 essais. Un nouveau puzzle quotidien gratuit.",
  "seo.game.el-intruso.title": "El Intruso — Trouvez le pilote qui ne va pas | Box Daily Box",
  "seo.game.el-intruso.description":
    "Neuf pilotes de F1 sur dix partagent un point commun. Trouvez l'intrus dans ce puzzle quotidien de Formule 1.",
  "seo.game.parrilla-bingo.title": "Parrilla Bingo — Le bingo des écuries F1 | Box Daily Box",
  "seo.game.parrilla-bingo.description":
    "Complétez chaque case avec un pilote qui correspond à l'écurie et à la condition. Le bingo quotidien de Formule 1.",
  "seo.game.gp-resultado.title": "GP Résultat — Devinez le top 10 d'un Grand Prix | Box Daily Box",
  "seo.game.gp-resultado.description":
    "Complétez le top 10 d'un Grand Prix historique de F1 avant la fin du temps. Un nouveau puzzle quotidien gratuit.",
  "seo.game.top10-standings.title": "Top 10 Standings — Le puzzle du championnat F1 | Box Daily Box",
  "seo.game.top10-standings.description":
    "Devinez le top 10 cumulé de points du championnat pilotes F1 sur une période de 1 à 4 ans.",

  "gamepage.not_found_title": "Jeu introuvable",
  "gamepage.not_found_body": "Le défi que vous cherchez n'existe pas ou a changé d'adresse.",
  "gamepage.see_all": "Voir tous les défis",

  // ─── Country names (driver nationality flags) ─────────────────────────
  "country.ARG": "Argentine",
  "country.AUS": "Australie",
  "country.AUT": "Autriche",
  "country.BEL": "Belgique",
  "country.BRA": "Brésil",
  "country.CAN": "Canada",
  "country.CHE": "Suisse",
  "country.CHL": "Chili",
  "country.CHN": "Chine",
  "country.COL": "Colombie",
  "country.CZE": "Tchéquie",
  "country.DEU": "Allemagne",
  "country.DNK": "Danemark",
  "country.ESP": "Espagne",
  "country.FIN": "Finlande",
  "country.FRA": "France",
  "country.GBR": "Royaume-Uni",
  "country.HUN": "Hongrie",
  "country.IDN": "Indonésie",
  "country.IND": "Inde",
  "country.IRL": "Irlande",
  "country.ITA": "Italie",
  "country.JPN": "Japon",
  "country.LIE": "Liechtenstein",
  "country.MAR": "Maroc",
  "country.MCO": "Monaco",
  "country.MEX": "Mexique",
  "country.MYS": "Malaisie",
  "country.NLD": "Pays-Bas",
  "country.NZL": "Nouvelle-Zélande",
  "country.POL": "Pologne",
  "country.PRT": "Portugal",
  "country.RUS": "Russie",
  "country.SWE": "Suède",
  "country.THA": "Thaïlande",
  "country.URY": "Uruguay",
  "country.USA": "États-Unis",
  "country.VEN": "Venezuela",
  "country.ZAF": "Afrique du Sud",
  "country.ZWE": "Zimbabwe",
};

export default fr;
