// src/content/info/en.ts
import type { InfoContent } from "./types";

const content: InfoContent = {
  title: "How to play",
  subtitle:
    "Box Daily Box has six daily Formula 1 minigames. Each one is played once per day, with a new challenge at midnight. Here's how the rules of each game work, how scoring is calculated, how the ranking works, and the platform's other features.",
  dataAsOfNote: "The driver, team, and results data used by the games goes up to the 2025 season.",

  gamesHeading: "The 6 games",
  gamesIntro:
    "All games use real Formula 1 data: drivers, teams, nationalities, and historical results. The daily challenge is the same for every player in the world.",
  gameDetail: {
    pittexto:
      "You have to guess a secret Formula 1 driver. Each guess gives you progressive clues: nationality, team, number of championships, and more. You get up to 8 attempts to figure out who it is.",
    polewordle:
      "The Formula 1 version of the classic word-guessing game. You have to guess a driver's last name in 6 tries. Each letter is marked green, yellow, or gray depending on whether it's in the right spot, in another spot, or not in the last name.",
    "el-intruso":
      "Ten Formula 1 drivers are shown. Nine of them share something in common (a hidden rule: it could be the team, the nationality, a decade, etc.) and one doesn't fit. Your job is to find the odd one out.",
    "parrilla-bingo":
      "A 3x3 grid where each cell crosses a team with a condition (for example, \"world champion\" or \"raced in the 90s\"). You have to fill each cell with a real driver who meets both conditions at once, without repeating drivers.",
    "gp-resultado":
      "You're shown a historic Grand Prix and have to complete the top 10 of that race: which driver finished in each position. It has autocomplete for faster searching among drivers.",
    "top10-standings":
      "Similar to the previous one, but with the accumulated drivers' championship standings for a season (randomly chosen from a 1-to-4-year period), not a single race. The clues are each driver's nationality and the points they scored that year.",
  },

  difficultyHeading: "Difficulty levels",
  difficultyIntro:
    "Each game can be played at 4 difficulty levels. The difficulty sets which era the drivers come from: the harder the level, the further back in Formula 1 history you need to know.",

  scoringHeading: "How scoring works",
  scoringIntro: "The score for each challenge you win is calculated like this:",

  rankingHeading: "The ranking",
  rankingBody: [
    "There are two public rankings: a daily one (today's results) and a monthly one (resets on the 1st of each month). Both show every player who took part that day or month, sorted by points — including those who lost all their challenges, who appear at the bottom with 0 points.",
    "To keep the ranking fair, every attempt is verified on the server (the player's browser is never trusted), and only the first account that plays a game from the same internet connection counts toward the ranking — this prevents someone from using multiple accounts to rack up extra points.",
    "You can play without creating an account (anonymously) or sign in with Google. Either way, you appear in the ranking under the public name you choose.",
  ],

  badgesHeading: "Badges",
  badgesBody: [
    "At the end of each month, the top three places in the monthly ranking receive a permanent badge: gold for first place, silver for second, bronze for third. These badges stay next to your name forever in every ranking, and they stack up if you win multiple months.",
    "If there's a tie for any place, everyone tied for that place receives the badge.",
  ],

  streakHeading: "Streak",
  streakBody:
    "Your streak counts how many days in a row you've won at least one challenge. It shows up as a flame icon next to your name in the ranking starting at 2 days in a row. If you skip a day or lose every challenge, the streak resets the next day.",

  duelsHeading: "Friends and duels",
  duelsBody: [
    "You can add friends with a 6-character code (everyone has their own) or via a link. You can also challenge someone to a duel before you're even friends, by sending them a direct link.",
    "A duel is a special match against another person, with its own challenge (it's not the daily challenge, so you can play several duels the same day). A duel's result doesn't affect the global ranking or your streak — it's just for head-to-head competition against whoever you want.",
    "Duels are \"blind\": neither player sees the other's result until both have finished playing.",
  ],

  faq: [
    {
      q: "Do I need to create an account to play?",
      a: "No. You can play completely anonymously; your progress is saved on your device. If you want to appear in the ranking from several devices, or never lose your progress, you can sign in with your Google account at any time.",
    },
    {
      q: "How many times a day can I play each challenge?",
      a: "Once a day per game. A new challenge for each of the 6 games is generated at midnight. Duels with friends are the exception: you can play as many as you want, since they're not the daily challenge.",
    },
    {
      q: "How is the score calculated?",
      a: "You only earn points if you win the challenge. The base score depends on the difficulty chosen, plus a bonus for solving quickly. Losing or giving up a challenge always gives 0 points.",
    },
    {
      q: "What happens if I lose a challenge?",
      a: "You still appear in that day's ranking, with 0 points, alongside everyone else. Losing doesn't block you from the ranking — it just doesn't add any points.",
    },
    {
      q: "How is cheating prevented?",
      a: "The server generates the challenge, measures the time, and verifies every answer independently. The player's browser never decides whether they won or how many points they scored. Also, only the first account that plays a game from the same connection counts toward the ranking.",
    },
    {
      q: "Is Box Daily Box affiliated with Formula 1?",
      a: "No. It's a fan-made project, with no official affiliation with the Formula One Group, the FIA, or any team or driver.",
    },
  ],
};

export default content;
