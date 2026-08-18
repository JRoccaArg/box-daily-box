// src/content/info/nl.ts
import type { InfoContent } from "./types";

const content: InfoContent = {
  title: "Hoe te spelen",
  subtitle:
    "Box Daily Box heeft acht dagelijkse Formule 1-minigames. Elk spel wordt één keer per dag gespeeld, met een nieuwe uitdaging om middernacht. Hier leggen we de regels van elk spel uit, hoe de score wordt berekend, hoe de ranglijst werkt en de andere functies van het platform.",
  dataAsOfNote: "De coureurs-, team- en uitslaggegevens die in de spellen worden gebruikt, lopen tot en met het seizoen 2025.",

  gamesHeading: "De 8 spellen",
  gamesIntro:
    "Alle spellen gebruiken echte Formule 1-gegevens: coureurs, teams, nationaliteiten en historische resultaten. De dagelijkse uitdaging is voor alle spelers ter wereld hetzelfde.",
  gameDetail: {
    pittexto:
      "Je moet een geheime Formule 1-coureur raden. Elke poging geeft je geleidelijke aanwijzingen: nationaliteit, team, aantal titels en meer. Je hebt maximaal 8 pogingen om te ontdekken wie het is.",
    polewordle:
      "Dit is de Formule 1-versie van het klassieke woordraadspel. Je moet de achternaam van een coureur raden in 6 pogingen. Elke letter wordt groen, geel of grijs gemarkeerd, afhankelijk van of hij op de juiste plek staat, op een andere plek, of niet in de achternaam voorkomt.",
    "el-intruso":
      "Er worden tien Formule 1-coureurs getoond. Negen van hen hebben iets gemeenschappelijks (een verborgen regel: dit kan het team, de nationaliteit, een decennium, enz. zijn) en één past er niet bij. Jouw taak is om de indringer te vinden.",
    "parrilla-bingo":
      "Een 3x3-raster waarbij elke cel een team combineert met een voorwaarde (bijvoorbeeld \"wereldkampioen\" of \"reed in de jaren 90\"). Je moet elke cel invullen met een echte coureur die aan beide voorwaarden tegelijk voldoet, zonder coureurs te herhalen.",
    "gp-resultado":
      "Je krijgt een historische Grand Prix te zien en moet de top 10 van die race invullen: welke coureur op welke plek eindigde. Er is automatisch aanvullen om sneller tussen de coureurs te zoeken.",
    "top10-standings":
      "Vergelijkbaar met de vorige, maar met de opgebouwde coureursstand van een seizoen (willekeurig gekozen uit een periode van 1 tot 4 jaar), niet van één race. De aanwijzingen zijn de nationaliteit van elke coureur en de punten die hij dat jaar behaalde.",
    "career-path":
      "Je krijgt de keten van teams te zien waarvoor een Formule 1-coureur heeft gereden, in chronologische volgorde, weergegeven met het logo van elk team. Je moet raden om welke coureur het gaat door zijn naam te typen, met automatisch aanvullen om sneller te zoeken. Je hebt maximaal 3 pogingen.",
    "team-radio":
      "Je krijgt de echte tekst van een iconisch Formule 1-teamradiobericht te zien, samen met de coureur die het zei. Je moet raden bij welke Grand Prix het werd gezegd, kiezend uit 6 opties. De verkeerde opties zijn races uit hetzelfde jaar of van hetzelfde circuit in nabije jaren, dus zomaar gokken is niet genoeg: je moet de context echt kennen.",
  },

  difficultyHeading: "Moeilijkheidsgraden",
  difficultyIntro:
    "Elk spel kan op 4 moeilijkheidsgraden worden gespeeld. De moeilijkheidsgraad bepaalt uit welke periode de coureurs komen: hoe moeilijker, hoe verder terug in de Formule 1-geschiedenis je moet kennen.",

  scoringHeading: "Hoe de score wordt berekend",
  scoringIntro: "De score voor elke gewonnen uitdaging wordt zo berekend:",

  rankingHeading: "De ranglijst",
  rankingBody: [
    "Er zijn twee openbare ranglijsten: een dagelijkse (de resultaten van vandaag) en een maandelijkse (wordt op de 1e van elke maand gereset). Beide tonen alle spelers die die dag of maand hebben deelgenomen, gesorteerd op punten — inclusief degenen die al hun uitdagingen hebben verloren, die onderaan met 0 punten verschijnen.",
    "Om de ranglijst eerlijk te houden, wordt elke poging op de server geverifieerd (er wordt nooit vertrouwd op wat de browser van de speler zegt), en telt alleen het eerste account dat een spel vanaf dezelfde internetverbinding speelt mee voor de ranglijst — dit voorkomt dat iemand meerdere accounts gebruikt om extra punten te verzamelen.",
    "Je kunt spelen zonder een account aan te maken (anoniem) of inloggen met Google. In beide gevallen verschijn je in de ranglijst onder de openbare naam die je kiest.",
  ],

  badgesHeading: "Badges",
  badgesBody: [
    "Aan het einde van elke maand krijgen de eerste drie plaatsen van de maandranglijst een permanente badge: goud voor de eerste plaats, zilver voor de tweede, brons voor de derde. Deze badges blijven voor altijd naast je naam staan in alle ranglijsten en stapelen zich op als je meerdere maanden wint.",
    "Bij een gelijke stand voor een plaats krijgen alle gelijkgestelde spelers de badge van die plaats.",
  ],

  streakHeading: "Reeks",
  streakBody:
    "De reeks telt hoeveel opeenvolgende dagen je minstens één uitdaging hebt gewonnen. Deze wordt vanaf 2 opeenvolgende dagen getoond met een vlamicoon naast je naam in de ranglijst. Als je een dag niet speelt of alle uitdagingen verliest, wordt de reeks de volgende dag gereset.",

  duelsHeading: "Vrienden en duels",
  duelsBody: [
    "Je kunt vrienden toevoegen met een 6-cijferige code (iedereen heeft zijn eigen code) of via een link. Je kunt iemand ook uitdagen voor een duel voordat jullie zelfs vrienden zijn, door een directe link te sturen.",
    "Een duel is een speciale wedstrijd tegen een andere persoon, met een eigen uitdaging (het is niet de dagelijkse uitdaging, dus je kunt meerdere duels op dezelfde dag spelen). Het resultaat van een duel heeft geen invloed op de wereldwijde ranglijst of je reeks: het is alleen om tegen wie je maar wilt te strijden.",
    "Het duel is \"blind\": geen van beiden ziet het resultaat van de ander totdat beiden klaar zijn met spelen.",
  ],

  faq: [
    {
      q: "Moet ik een account aanmaken om te spelen?",
      a: "Nee. Je kunt volledig anoniem spelen; je voortgang wordt op je apparaat opgeslagen. Als je op meerdere apparaten in de ranglijst wilt verschijnen of je voortgang nooit wilt verliezen, kun je op elk moment inloggen met je Google-account.",
    },
    {
      q: "Hoe vaak per dag kan ik elke uitdaging spelen?",
      a: "Eén keer per dag per spel. Om middernacht wordt voor elk van de 8 spellen een nieuwe uitdaging gegenereerd. Duels met vrienden zijn de uitzondering: je kunt ze zo vaak spelen als je wilt, omdat het niet de dagelijkse uitdaging zijn.",
    },
    {
      q: "Hoe wordt de score berekend?",
      a: "Je verdient alleen punten als je de uitdaging wint. De basisscore hangt af van de gekozen moeilijkheidsgraad, plus een bonus voor snel oplossen. Verliezen of opgeven van een uitdaging levert altijd 0 punten op.",
    },
    {
      q: "Wat gebeurt er als ik een uitdaging verlies?",
      a: "Je verschijnt nog steeds in de ranglijst van die dag, met 0 punten, samen met de andere spelers. Verliezen sluit je niet uit van de ranglijst: het voegt gewoon geen punten toe.",
    },
    {
      q: "Hoe wordt valsspelen voorkomen?",
      a: "De server genereert de uitdaging, meet de tijd en verifieert elk antwoord onafhankelijk. De browser van de speler beslist nooit of hij heeft gewonnen of hoeveel punten hij heeft behaald. Bovendien telt alleen het eerste account dat een spel vanaf dezelfde verbinding speelt mee voor de ranglijst.",
    },
    {
      q: "Is Box Daily Box gelieerd aan Formule 1?",
      a: "Nee. Het is een door fans gemaakt project, zonder officiële band met de Formula One Group, de FIA, of enig team of coureur.",
    },
  ],
};

export default content;
