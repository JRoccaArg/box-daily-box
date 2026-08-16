// src/content/info/fr.ts
import type { InfoContent } from "./types";

const content: InfoContent = {
  title: "Comment jouer",
  subtitle:
    "Box Daily Box propose six mini-jeux quotidiens de Formule 1. Chacun se joue une fois par jour, avec un nouveau défi à minuit. Voici les règles de chaque jeu, comment le score est calculé, comment fonctionne le classement, et les autres fonctionnalités de la plateforme.",
  dataAsOfNote: "Les données de pilotes, d'écuries et de résultats utilisées par les jeux vont jusqu'à la saison 2025.",

  gamesHeading: "Les 6 jeux",
  gamesIntro:
    "Tous les jeux utilisent de vraies données de Formule 1 : pilotes, écuries, nationalités et résultats historiques. Le défi du jour est le même pour tous les joueurs du monde.",
  gameDetail: {
    pittexto:
      "Vous devez deviner un pilote de Formule 1 secret. Chaque tentative vous donne des indices progressifs : nationalité, écurie, nombre de titres et plus encore. Vous avez jusqu'à 8 tentatives pour découvrir de qui il s'agit.",
    polewordle:
      "C'est la version Formule 1 du célèbre jeu de mots à deviner. Vous devez trouver le nom de famille d'un pilote en 6 essais. Chaque lettre est marquée en vert, jaune ou gris selon qu'elle est à la bonne position, à une autre position, ou absente du nom.",
    "el-intruso":
      "Dix pilotes de Formule 1 sont affichés. Neuf d'entre eux ont un point commun (une règle cachée : cela peut être l'écurie, la nationalité, une décennie, etc.) et un ne correspond pas. Votre mission est de trouver l'intrus.",
    "parrilla-bingo":
      "Une grille 3x3 où chaque case croise une écurie avec une condition (par exemple, \"champion du monde\" ou \"a couru dans les années 90\"). Vous devez remplir chaque case avec un pilote réel qui remplit les deux conditions à la fois, sans répéter de pilote.",
    "gp-resultado":
      "Un Grand Prix historique vous est présenté et vous devez compléter le top 10 de cette course : quel pilote a terminé à chaque position. Une saisie semi-automatique permet de chercher plus rapidement parmi les pilotes.",
    "top10-standings":
      "Similaire au précédent, mais avec le classement cumulé des pilotes d'une saison (choisie au hasard sur une période de 1 à 4 ans), et non d'une seule course. Les indices sont la nationalité de chaque pilote et les points marqués cette année-là.",
  },

  difficultyHeading: "Niveaux de difficulté",
  difficultyIntro:
    "Chaque jeu peut être joué à 4 niveaux de difficulté. La difficulté définit de quelle époque viennent les pilotes : plus c'est difficile, plus il faut connaître l'histoire ancienne de la Formule 1.",

  scoringHeading: "Comment le score est calculé",
  scoringIntro: "Le score de chaque défi gagné se calcule ainsi :",

  rankingHeading: "Le classement",
  rankingBody: [
    "Il y a deux classements publics : un quotidien (les résultats du jour) et un mensuel (réinitialisé le 1er de chaque mois). Les deux montrent tous les joueurs ayant participé ce jour-là ou ce mois-ci, triés par points — y compris ceux qui ont perdu tous leurs défis, qui apparaissent en bas avec 0 point.",
    "Pour que le classement soit équitable, chaque tentative est vérifiée sur le serveur (on ne fait jamais confiance à ce que dit le navigateur du joueur), et seul le premier compte qui joue à un jeu depuis une même connexion internet compte pour le classement — cela empêche quelqu'un d'utiliser plusieurs comptes pour accumuler plus de points.",
    "Vous pouvez jouer sans créer de compte (anonymement) ou vous connecter avec Google. Dans les deux cas, vous apparaissez dans le classement sous le nom public que vous choisissez.",
  ],

  badgesHeading: "Badges",
  badgesBody: [
    "À la fin de chaque mois, les trois premières places du classement mensuel reçoivent un badge permanent : or pour la première place, argent pour la deuxième, bronze pour la troisième. Ces badges restent pour toujours à côté de votre nom dans tous les classements, et s'accumulent si vous gagnez plusieurs mois.",
    "En cas d'égalité pour une place, tous les joueurs à égalité reçoivent le badge de cette place.",
  ],

  streakHeading: "Série",
  streakBody:
    "La série compte le nombre de jours consécutifs pendant lesquels vous avez gagné au moins un défi. Elle s'affiche avec une icône de flamme à côté de votre nom dans le classement à partir de 2 jours consécutifs. Si vous ne jouez pas un jour ou perdez tous les défis, la série se réinitialise le lendemain.",

  duelsHeading: "Amis et duels",
  duelsBody: [
    "Vous pouvez ajouter des amis avec un code à 6 caractères (chaque utilisateur a le sien) ou via un lien. Vous pouvez aussi défier quelqu'un en duel avant même d'être amis, en lui envoyant un lien direct.",
    "Un duel est une partie spéciale contre une autre personne, avec son propre défi (ce n'est pas le défi quotidien, donc vous pouvez jouer plusieurs duels le même jour). Le résultat d'un duel n'affecte ni le classement global ni votre série : c'est uniquement pour s'affronter face à face avec qui vous voulez.",
    "Le duel se joue \"à l'aveugle\" : aucun des deux joueurs ne voit le résultat de l'autre tant que les deux n'ont pas terminé.",
  ],

  faq: [
    {
      q: "Dois-je créer un compte pour jouer ?",
      a: "Non. Vous pouvez jouer de façon totalement anonyme ; votre progression est enregistrée sur votre appareil. Si vous voulez apparaître dans le classement depuis plusieurs appareils ou ne jamais perdre votre progression, vous pouvez vous connecter avec votre compte Google à tout moment.",
    },
    {
      q: "Combien de fois par jour puis-je jouer à chaque défi ?",
      a: "Une fois par jour et par jeu. Un nouveau défi pour chacun des 6 jeux est généré à minuit. Les duels entre amis font exception : vous pouvez en jouer autant que vous voulez, puisqu'ils ne sont pas le défi quotidien.",
    },
    {
      q: "Comment le score est-il calculé ?",
      a: "Vous ne gagnez des points que si vous remportez le défi. Le score de base dépend de la difficulté choisie, avec un bonus pour une résolution rapide. Perdre ou abandonner un défi donne toujours 0 point.",
    },
    {
      q: "Que se passe-t-il si je perds un défi ?",
      a: "Vous apparaissez quand même dans le classement du jour, avec 0 point, aux côtés des autres joueurs. Perdre ne vous exclut pas du classement : cela n'ajoute simplement aucun point.",
    },
    {
      q: "Comment la triche est-elle évitée ?",
      a: "Le serveur génère le défi, mesure le temps et vérifie chaque réponse de façon indépendante. Le navigateur du joueur ne décide jamais s'il a gagné ni combien de points il a marqués. De plus, seul le premier compte qui joue à un jeu depuis une même connexion compte pour le classement.",
    },
    {
      q: "Box Daily Box est-il affilié à la Formule 1 ?",
      a: "Non. C'est un projet réalisé par des fans, sans affiliation officielle avec le Formula One Group, la FIA, ni aucune écurie ou pilote.",
    },
  ],
};

export default content;
