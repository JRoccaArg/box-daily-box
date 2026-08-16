// src/content/info/de.ts
import type { InfoContent } from "./types";

const content: InfoContent = {
  title: "So wird gespielt",
  subtitle:
    "Box Daily Box bietet sechs tägliche Formel-1-Minispiele. Jedes wird einmal pro Tag gespielt, mit einer neuen Herausforderung um Mitternacht. Hier erklären wir die Regeln jedes Spiels, wie die Punktzahl berechnet wird, wie die Rangliste funktioniert und die weiteren Funktionen der Plattform.",
  dataAsOfNote: "Die in den Spielen verwendeten Fahrer-, Team- und Ergebnisdaten reichen bis zur Saison 2025.",

  gamesHeading: "Die 6 Spiele",
  gamesIntro:
    "Alle Spiele verwenden echte Formel-1-Daten: Fahrer, Teams, Nationalitäten und historische Ergebnisse. Die Tagesherausforderung ist für alle Spieler weltweit gleich.",
  gameDetail: {
    pittexto:
      "Du musst einen geheimen Formel-1-Fahrer erraten. Jeder Versuch gibt dir fortschreitende Hinweise: Nationalität, Team, Anzahl der Titel und mehr. Du hast bis zu 8 Versuche, um herauszufinden, wer es ist.",
    polewordle:
      "Die Formel-1-Version des klassischen Wörterrate-Spiels. Du musst den Nachnamen eines Fahrers in 6 Versuchen erraten. Jeder Buchstabe wird grün, gelb oder grau markiert, je nachdem, ob er an der richtigen Stelle, an einer anderen Stelle oder gar nicht im Nachnamen vorkommt.",
    "el-intruso":
      "Zehn Formel-1-Fahrer werden gezeigt. Neun von ihnen haben etwas gemeinsam (eine verborgene Regel: das kann das Team, die Nationalität, ein Jahrzehnt usw. sein) und einer passt nicht dazu. Deine Aufgabe ist es, den Eindringling zu finden.",
    "parrilla-bingo":
      "Ein 3x3-Raster, in dem jede Zelle ein Team mit einer Bedingung kreuzt (zum Beispiel \"Weltmeister\" oder \"fuhr in den 90ern\"). Du musst jede Zelle mit einem echten Fahrer füllen, der beide Bedingungen gleichzeitig erfüllt, ohne Fahrer zu wiederholen.",
    "gp-resultado":
      "Dir wird ein historischer Grand Prix gezeigt, und du musst die Top 10 dieses Rennens vervollständigen: welcher Fahrer auf welchem Platz landete. Es gibt eine Autovervollständigung, um schneller unter den Fahrern zu suchen.",
    "top10-standings":
      "Ähnlich wie das vorherige, aber mit der kumulierten Fahrerwertung einer Saison (zufällig aus einem Zeitraum von 1 bis 4 Jahren gewählt), nicht eines einzelnen Rennens. Die Hinweise sind die Nationalität jedes Fahrers und die Punkte, die er in diesem Jahr erzielt hat.",
  },

  difficultyHeading: "Schwierigkeitsgrade",
  difficultyIntro:
    "Jedes Spiel kann in 4 Schwierigkeitsgraden gespielt werden. Der Schwierigkeitsgrad legt fest, aus welcher Ära die Fahrer stammen: Je schwerer, desto weiter zurück in der Formel-1-Geschichte muss man sich auskennen.",

  scoringHeading: "Wie die Punktzahl berechnet wird",
  scoringIntro: "Die Punktzahl für jede gewonnene Herausforderung wird so berechnet:",

  rankingHeading: "Die Rangliste",
  rankingBody: [
    "Es gibt zwei öffentliche Ranglisten: eine tägliche (die heutigen Ergebnisse) und eine monatliche (setzt sich am 1. jeden Monats zurück). Beide zeigen alle Spieler, die an diesem Tag oder Monat teilgenommen haben, sortiert nach Punkten — einschließlich derer, die alle ihre Herausforderungen verloren haben und am Ende mit 0 Punkten erscheinen.",
    "Damit die Rangliste fair bleibt, wird jeder Versuch auf dem Server überprüft (dem Browser des Spielers wird nie vertraut), und nur das erste Konto, das ein Spiel von derselben Internetverbindung aus spielt, zählt für die Rangliste — das verhindert, dass jemand mehrere Konten benutzt, um zusätzliche Punkte zu sammeln.",
    "Du kannst spielen, ohne ein Konto zu erstellen (anonym), oder dich mit Google anmelden. In beiden Fällen erscheinst du in der Rangliste unter dem öffentlichen Namen, den du wählst.",
  ],

  badgesHeading: "Abzeichen",
  badgesBody: [
    "Am Ende jedes Monats erhalten die ersten drei Plätze der Monatsrangliste ein dauerhaftes Abzeichen: Gold für den ersten Platz, Silber für den zweiten, Bronze für den dritten. Diese Abzeichen bleiben für immer neben deinem Namen in allen Ranglisten und sammeln sich an, wenn du mehrere Monate gewinnst.",
    "Bei einem Gleichstand für einen Platz erhalten alle Gleichgestellten das Abzeichen für diesen Platz.",
  ],

  streakHeading: "Serie",
  streakBody:
    "Die Serie zählt, an wie vielen aufeinanderfolgenden Tagen du mindestens eine Herausforderung gewonnen hast. Sie wird ab 2 aufeinanderfolgenden Tagen mit einem Flammensymbol neben deinem Namen in der Rangliste angezeigt. Wenn du an einem Tag nicht spielst oder alle Herausforderungen verlierst, setzt sich die Serie am nächsten Tag zurück.",

  duelsHeading: "Freunde und Duelle",
  duelsBody: [
    "Du kannst Freunde mit einem 6-stelligen Code hinzufügen (jeder hat seinen eigenen) oder per Link. Du kannst auch jemanden zu einem Duell herausfordern, bevor ihr überhaupt Freunde seid, indem du ihm einen direkten Link schickst.",
    "Ein Duell ist ein besonderes Match gegen eine andere Person mit einer eigenen Herausforderung (es ist nicht die tägliche Herausforderung, du kannst also mehrere Duelle am selben Tag spielen). Das Ergebnis eines Duells wirkt sich weder auf die globale Rangliste noch auf deine Serie aus — es dient nur dazu, gegen wen auch immer du möchtest, direkt anzutreten.",
    "Das Duell ist \"blind\": Keiner der beiden sieht das Ergebnis des anderen, bis beide fertig gespielt haben.",
  ],

  faq: [
    {
      q: "Muss ich ein Konto erstellen, um zu spielen?",
      a: "Nein. Du kannst völlig anonym spielen; dein Fortschritt wird auf deinem Gerät gespeichert. Wenn du auf mehreren Geräten in der Rangliste erscheinen oder deinen Fortschritt nie verlieren möchtest, kannst du dich jederzeit mit deinem Google-Konto anmelden.",
    },
    {
      q: "Wie oft am Tag kann ich jede Herausforderung spielen?",
      a: "Einmal am Tag pro Spiel. Um Mitternacht wird für jedes der 6 Spiele eine neue Herausforderung erzeugt. Duelle mit Freunden sind die Ausnahme: Du kannst sie so oft spielen, wie du möchtest, da sie nicht die tägliche Herausforderung sind.",
    },
    {
      q: "Wie wird die Punktzahl berechnet?",
      a: "Du bekommst nur Punkte, wenn du die Herausforderung gewinnst. Die Basispunktzahl hängt vom gewählten Schwierigkeitsgrad ab, plus ein Bonus für schnelles Lösen. Verlieren oder Aufgeben einer Herausforderung ergibt immer 0 Punkte.",
    },
    {
      q: "Was passiert, wenn ich eine Herausforderung verliere?",
      a: "Du erscheinst trotzdem in der Rangliste des Tages, mit 0 Punkten, zusammen mit den anderen Spielern. Verlieren schließt dich nicht von der Rangliste aus — es fügt einfach keine Punkte hinzu.",
    },
    {
      q: "Wie wird Betrug verhindert?",
      a: "Der Server erzeugt die Herausforderung, misst die Zeit und überprüft jede Antwort unabhängig. Der Browser des Spielers entscheidet nie, ob er gewonnen hat oder wie viele Punkte er erzielt hat. Außerdem zählt nur das erste Konto, das ein Spiel von derselben Verbindung aus spielt, für die Rangliste.",
    },
    {
      q: "Ist Box Daily Box mit der Formel 1 verbunden?",
      a: "Nein. Es ist ein von Fans erstelltes Projekt, ohne offizielle Verbindung zur Formula One Group, der FIA oder einem Team oder Fahrer.",
    },
  ],
};

export default content;
