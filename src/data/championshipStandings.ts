// src/data/championshipStandings.ts
//
// Dataset de standings FINALES del campeonato de pilotos, temporada por
// temporada (1950-2026).
// Generado con scripts/fetch-standings.mjs desde la API publica Jolpica
// (fork mantenido de Ergast). Para regenerar: node scripts/fetch-standings.mjs
//
// Se guarda el standing COMPLETO de cada año (no solo el top 10) para que
// el calculo de puntos acumulados en periodos de 2-4 años sea exacto.
// El nombre del piloto es la clave de agregacion (igual patron que
// src/data/gpResults.ts), no se usan IDs internos.

export type StandingEntry = {
  /** Nombre completo del piloto (para autocompletado y matching). */
  name: string;
  /** ISO alpha-3 (referencia src/data/nationalities.ts). */
  nationalityCode: string;
  points: number;
};

export type SeasonStandings = {
  year: number;
  standings: StandingEntry[];
};

export const CHAMPIONSHIP_STANDINGS: SeasonStandings[] = [
  {
    "year": 1950,
    "standings": [
      {
        "name": "Nino Farina",
        "nationalityCode": "ITA",
        "points": 30
      },
      {
        "name": "Juan Fangio",
        "nationalityCode": "ARG",
        "points": 27
      },
      {
        "name": "Luigi Fagioli",
        "nationalityCode": "ITA",
        "points": 24
      },
      {
        "name": "Louis Rosier",
        "nationalityCode": "FRA",
        "points": 13
      },
      {
        "name": "Alberto Ascari",
        "nationalityCode": "ITA",
        "points": 11
      },
      {
        "name": "Johnnie Parsons",
        "nationalityCode": "USA",
        "points": 9
      },
      {
        "name": "Bill Holland",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Prince Bira",
        "nationalityCode": "THA",
        "points": 5
      },
      {
        "name": "Peter Whitehead",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Louis Chiron",
        "nationalityCode": "MCO",
        "points": 4
      },
      {
        "name": "Reg Parnell",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Mauri Rose",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Dorino Serafini",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Yves Cabantous",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Raymond Sommer",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Robert Manzon",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Cecil Green",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Philippe Étancelin",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Felice Bonetto",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Eugène Chaboud",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Joie Chitwood",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Toulo de Graffenried",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Bob Gerard",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Luigi Villoresi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Lee Wallard",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Charles Pozzi",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Johnny Claes",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Pierre Levegh",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Cuth Harrison",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Walt Faulkner",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Nello Pagani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "George Connor",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "David Hampshire",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Geoff Crossley",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Paul Russo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Toni Branca",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Brian Shawe Taylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Joe Fry",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Pat Flaherty",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Myron Fohr",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Duane Carter",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Mack Hellings",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jack McGrath",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Troy Ruttman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Gene Hartley",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jimmy Davies",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnny McDowell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Walt Brown",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Travis Webb",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jerry Hoyt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Walt Ader",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jackie Holmes",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jim Rathmann",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "David Murray",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "José Froilán González",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Guy Mairesse",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Franco Rol",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Joe Kelly",
        "nationalityCode": "IRL",
        "points": 0
      },
      {
        "name": "Piero Taruffi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Eugène Martin",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Clemente Biondetti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Henri Louveau",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Peter Walker",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Tony Rolt",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Franco Comotti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Leslie Johnson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Alfredo Pián",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Consalvo Sanesi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Henry Banks",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bill Schindler",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paul Pietsch",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Bayliss Levrett",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bill Cantrell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Fred Agabashian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jimmy Jackson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Sam Hanks",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Dick Rathmann",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Duke Dinsmore",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1951,
    "standings": [
      {
        "name": "Juan Fangio",
        "nationalityCode": "ARG",
        "points": 31
      },
      {
        "name": "Alberto Ascari",
        "nationalityCode": "ITA",
        "points": 25
      },
      {
        "name": "José Froilán González",
        "nationalityCode": "ARG",
        "points": 24
      },
      {
        "name": "Nino Farina",
        "nationalityCode": "ITA",
        "points": 19
      },
      {
        "name": "Luigi Villoresi",
        "nationalityCode": "ITA",
        "points": 15
      },
      {
        "name": "Piero Taruffi",
        "nationalityCode": "ITA",
        "points": 10
      },
      {
        "name": "Lee Wallard",
        "nationalityCode": "USA",
        "points": 9
      },
      {
        "name": "Felice Bonetto",
        "nationalityCode": "ITA",
        "points": 7
      },
      {
        "name": "Mike Nazaruk",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Reg Parnell",
        "nationalityCode": "GBR",
        "points": 5
      },
      {
        "name": "Luigi Fagioli",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Consalvo Sanesi",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Louis Rosier",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Andy Linden",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Jack McGrath",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Manny Ayulo",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Toulo de Graffenried",
        "nationalityCode": "CHE",
        "points": 2
      },
      {
        "name": "Yves Cabantous",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Bobby Ball",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Louis Chiron",
        "nationalityCode": "MCO",
        "points": 0
      },
      {
        "name": "Rudi Fischer",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "André Simon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Henry Banks",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "André Pilette",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Robert Manzon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Johnny Claes",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Carl Forberg",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Peter Walker",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Pierre Levegh",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Philippe Étancelin",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Duane Carter",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eugène Chaboud",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Brian Shawe Taylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Guy Mairesse",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Peter Whitehead",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Franco Rol",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jacques Swaters",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paco Godia",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Bob Gerard",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Duncan Hamilton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Duke Nalon",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Gene Force",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Sam Hanks",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bill Schindler",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Mauri Rose",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Walt Faulkner",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Aldo Gordini",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Joe Kelly",
        "nationalityCode": "IRL",
        "points": 0
      },
      {
        "name": "Henri Louveau",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jimmy Davies",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paul Pietsch",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Georges Grignard",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "George Abecassis",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Fred Agabashian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Philip Fotheringham-Parker",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Carl Scarborough",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "David Murray",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Bill Mackey",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Prince Bira",
        "nationalityCode": "THA",
        "points": 0
      },
      {
        "name": "Chuck Stevenson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "John James",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Chico Landi",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Juan Jover",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Peter Hirt",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Johnnie Parsons",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Onofre Marimón",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Toni Branca",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Cecil Green",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ken Richardson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Troy Ruttman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Duke Dinsmore",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chet Miller",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Walt Brown",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Cliff Griffith",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bill Vukovich",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "George Connor",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Mack Hellings",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnny McDowell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Joe James",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1952,
    "standings": [
      {
        "name": "Alberto Ascari",
        "nationalityCode": "ITA",
        "points": 36
      },
      {
        "name": "Nino Farina",
        "nationalityCode": "ITA",
        "points": 24
      },
      {
        "name": "Piero Taruffi",
        "nationalityCode": "ITA",
        "points": 22
      },
      {
        "name": "Rudi Fischer",
        "nationalityCode": "CHE",
        "points": 10
      },
      {
        "name": "Mike Hawthorn",
        "nationalityCode": "GBR",
        "points": 10
      },
      {
        "name": "Robert Manzon",
        "nationalityCode": "FRA",
        "points": 9
      },
      {
        "name": "Troy Ruttman",
        "nationalityCode": "USA",
        "points": 8
      },
      {
        "name": "Luigi Villoresi",
        "nationalityCode": "ITA",
        "points": 8
      },
      {
        "name": "José Froilán González",
        "nationalityCode": "ARG",
        "points": 6.5
      },
      {
        "name": "Jim Rathmann",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Jean Behra",
        "nationalityCode": "FRA",
        "points": 6
      },
      {
        "name": "Sam Hanks",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Ken Wharton",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Dennis Poore",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Duane Carter",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Alan Brown",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Paul Frère",
        "nationalityCode": "BEL",
        "points": 2
      },
      {
        "name": "Felice Bonetto",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Art Cross",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Eric Thompson",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Bill Vukovich",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Roger Laurent",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Toulo de Graffenried",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "André Simon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Peter Collins",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jimmy Bryan",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Peter Hirt",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Charles de Tornaco",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Duncan Hamilton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jimmy Reece",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Reg Parnell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Fritz Riess",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Lance Macklin",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eric Brandon",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Chico Landi",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Johnny Claes",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Toni Ulmen",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "George Connor",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Philippe Étancelin",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ken Downing",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Cliff Griffith",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Helmut Niedermayr",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jan Flinterman",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Prince Bira",
        "nationalityCode": "THA",
        "points": 0
      },
      {
        "name": "Peter Whitehead",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Louis Rosier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Johnnie Parsons",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Yves Cabantous",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Eitel Cantoni",
        "nationalityCode": "URY",
        "points": 0
      },
      {
        "name": "Jack McGrath",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Hans Klenk",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jim Rigsby",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Franco Comotti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Graham Whitehead",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ernst Klodwig",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Joe James",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Arthur Legat",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Bill Schindler",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Robert O'Brien",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tony Gaze",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "George Fonder",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Kenneth McAlpine",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eddie Johnson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Gino Bianco",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Chuck Stevenson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Henry Banks",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Manny Ayulo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnny McDowell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tony Crook",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Dries van der Lof",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Willi Heeks",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Robin Montgomerie-Charrington",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Adolf Brudes",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "George Abecassis",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Marcel Balsa",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Hans von Stuck",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Günther Bechem",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Piero Carini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Rudolf Krause",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Franco Rol",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Max de Terra",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Rudolf Schoeller",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Bill Aston",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Travis Webb",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paul Pietsch",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Élie Bayol",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Duke Nalon",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Sweikert",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Fred Agabashian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Theo Helfrich",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Gene Hartley",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "David Murray",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Josef Peters",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Bob Scott",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1953,
    "standings": [
      {
        "name": "Alberto Ascari",
        "nationalityCode": "ITA",
        "points": 34.5
      },
      {
        "name": "Juan Fangio",
        "nationalityCode": "ARG",
        "points": 28
      },
      {
        "name": "Nino Farina",
        "nationalityCode": "ITA",
        "points": 26
      },
      {
        "name": "Mike Hawthorn",
        "nationalityCode": "GBR",
        "points": 19
      },
      {
        "name": "Luigi Villoresi",
        "nationalityCode": "ITA",
        "points": 17
      },
      {
        "name": "José Froilán González",
        "nationalityCode": "ARG",
        "points": 13.5
      },
      {
        "name": "Bill Vukovich",
        "nationalityCode": "USA",
        "points": 9
      },
      {
        "name": "Toulo de Graffenried",
        "nationalityCode": "CHE",
        "points": 7
      },
      {
        "name": "Felice Bonetto",
        "nationalityCode": "ITA",
        "points": 6.5
      },
      {
        "name": "Art Cross",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Onofre Marimón",
        "nationalityCode": "ARG",
        "points": 4
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 4
      },
      {
        "name": "Duane Carter",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Sam Hanks",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Oscar Gálvez",
        "nationalityCode": "ARG",
        "points": 2
      },
      {
        "name": "Jack McGrath",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Hermann Lang",
        "nationalityCode": "DEU",
        "points": 2
      },
      {
        "name": "Paul Russo",
        "nationalityCode": "USA",
        "points": 1.5
      },
      {
        "name": "Fred Agabashian",
        "nationalityCode": "USA",
        "points": 1.5
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jean Behra",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Roberto Mieres",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Jimmy Daywalt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Louis Rosier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Ken Wharton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Prince Bira",
        "nationalityCode": "THA",
        "points": 0
      },
      {
        "name": "Jacques Swaters",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Johnson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jim Rathmann",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Luigi Musso",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Sergio Mantovani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Peter Collins",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "John Barber",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ernie McCoy",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Max de Terra",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Umberto Maglioli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Alan Brown",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Gene Hartley",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chuck Stevenson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Fred Wacker",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Peter Whitehead",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Hans Herrmann",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Albert Scherrer",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Louis Chiron",
        "nationalityCode": "MCO",
        "points": 0
      },
      {
        "name": "Paul Frère",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Jimmy Davies",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Duke Nalon",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "André Pilette",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Bob Gerard",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Rodney Nuckey",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Johnny Claes",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Bob Scott",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Carl Scarborough",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Theo Helfrich",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Kenneth McAlpine",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Manny Ayulo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Yves Cabantous",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Hans von Stuck",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jimmy Bryan",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Rudolf Krause",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Bill Holland",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ernst Klodwig",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Duke Dinsmore",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Andy Linden",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Wolfgang Seidel",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Walt Faulkner",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnny Mantz",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chico Landi",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Robert Manzon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jimmy Stewart",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Tony Rolt",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Lance Macklin",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Carlos Menditeguy",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Pablo Birger",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Adolfo Cruz",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Jack Fairman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Peter Hirt",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Marshall Teague",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Élie Bayol",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Johnny Thomson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Travis Webb",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jackie Holmes",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Georges Berger",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Bob Sweikert",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Arthur Legat",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Edgar Barth",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Mike Nazaruk",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Pat Flaherty",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ian Stewart",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Oswald Karch",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jerry Hoyt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Willi Heeks",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Duncan Hamilton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Piero Carini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Johnnie Parsons",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Don Freeland",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1954,
    "standings": [
      {
        "name": "Juan Fangio",
        "nationalityCode": "ARG",
        "points": 42
      },
      {
        "name": "José Froilán González",
        "nationalityCode": "ARG",
        "points": 25.14
      },
      {
        "name": "Mike Hawthorn",
        "nationalityCode": "GBR",
        "points": 24.64
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 17
      },
      {
        "name": "Karl Kling",
        "nationalityCode": "DEU",
        "points": 12
      },
      {
        "name": "Bill Vukovich",
        "nationalityCode": "USA",
        "points": 8
      },
      {
        "name": "Hans Herrmann",
        "nationalityCode": "DEU",
        "points": 8
      },
      {
        "name": "Nino Farina",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Luigi Musso",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Jimmy Bryan",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Roberto Mieres",
        "nationalityCode": "ARG",
        "points": 6
      },
      {
        "name": "Jack McGrath",
        "nationalityCode": "USA",
        "points": 5
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 4.14
      },
      {
        "name": "Onofre Marimón",
        "nationalityCode": "ARG",
        "points": 4.14
      },
      {
        "name": "Robert Manzon",
        "nationalityCode": "FRA",
        "points": 4
      },
      {
        "name": "Sergio Mantovani",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Prince Bira",
        "nationalityCode": "THA",
        "points": 3
      },
      {
        "name": "Umberto Maglioli",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "André Pilette",
        "nationalityCode": "BEL",
        "points": 2
      },
      {
        "name": "Luigi Villoresi",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Élie Bayol",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Mike Nazaruk",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Duane Carter",
        "nationalityCode": "USA",
        "points": 1.5
      },
      {
        "name": "Troy Ruttman",
        "nationalityCode": "USA",
        "points": 1.5
      },
      {
        "name": "Alberto Ascari",
        "nationalityCode": "ITA",
        "points": 1.1400000000000001
      },
      {
        "name": "Jean Behra",
        "nationalityCode": "FRA",
        "points": 0.14
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ken Wharton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Fred Wacker",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Fred Agabashian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Piero Taruffi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Paco Godia",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Louis Rosier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Peter Collins",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Don Freeland",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Toulo de Graffenried",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Jacques Swaters",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paul Russo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jerry Hoyt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Larry Crockett",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Cal Niday",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Gerard",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jorge Daponte",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Johnnie Parsons",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jimmy Davies",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Sam Hanks",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Andy Linden",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Art Cross",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Don Beauman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Walt Faulkner",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chuck Stevenson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Manny Ayulo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Leslie Marr",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Bob Sweikert",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Leslie Thorne",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Marshall Teague",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jimmy Jackson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Horace Gould",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ernie McCoy",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jimmy Reece",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Scott",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ed Elisian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Frank Armi",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "George Fonder",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Gene Hartley",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paul Frère",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Ottorino Volonterio",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Hermann Lang",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Clemar Bucci",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Jacques Pollet",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Roger Loyer",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Theo Helfrich",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Lance Macklin",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Bill Whitehouse",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Carlos Menditeguy",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Georges Berger",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Jim Rathmann",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ron Flockhart",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Pat O'Connor",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Johnson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "John Riseley-Prichard",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Reg Parnell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jimmy Daywalt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnny Thomson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Pat Flaherty",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Peter Whitehead",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eric Brandon",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Travis Webb",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Danny Kladis",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Len Duncan",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Alan Brown",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Rodney Nuckey",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Bill Homeier",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1955,
    "standings": [
      {
        "name": "Juan Fangio",
        "nationalityCode": "ARG",
        "points": 40
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 23
      },
      {
        "name": "Eugenio Castellotti",
        "nationalityCode": "ITA",
        "points": 12
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 10
      },
      {
        "name": "Nino Farina",
        "nationalityCode": "ITA",
        "points": 9
      },
      {
        "name": "Piero Taruffi",
        "nationalityCode": "ITA",
        "points": 9
      },
      {
        "name": "Bob Sweikert",
        "nationalityCode": "USA",
        "points": 8
      },
      {
        "name": "Roberto Mieres",
        "nationalityCode": "ARG",
        "points": 7
      },
      {
        "name": "Jean Behra",
        "nationalityCode": "FRA",
        "points": 6
      },
      {
        "name": "Luigi Musso",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Karl Kling",
        "nationalityCode": "DEU",
        "points": 5
      },
      {
        "name": "Jimmy Davies",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Paul Russo",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Paul Frère",
        "nationalityCode": "BEL",
        "points": 3
      },
      {
        "name": "Johnny Thomson",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "José Froilán González",
        "nationalityCode": "ARG",
        "points": 2
      },
      {
        "name": "Cesare Perdisa",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Carlos Menditeguy",
        "nationalityCode": "ARG",
        "points": 2
      },
      {
        "name": "Luigi Villoresi",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Umberto Maglioli",
        "nationalityCode": "ITA",
        "points": 1.33
      },
      {
        "name": "Hans Herrmann",
        "nationalityCode": "DEU",
        "points": 1
      },
      {
        "name": "Walt Faulkner",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Bill Homeier",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Bill Vukovich",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Mike Hawthorn",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Louis Chiron",
        "nationalityCode": "MCO",
        "points": 0
      },
      {
        "name": "Andy Linden",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jacques Pollet",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Sergio Mantovani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Al Herman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Mike Sparken",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Hernando da Silva Ramos",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Pat O'Connor",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Lance Macklin",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Louis Rosier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Ken Wharton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jimmy Daywalt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "John Fitch",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Pat Flaherty",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnny Claes",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Duane Carter",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chuck Weyant",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Johnson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jim Rathmann",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Clemar Bucci",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Jesús Iglesias",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Alberto Ascari",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Horace Gould",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Robert Manzon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Kenneth McAlpine",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Élie Bayol",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Peter Collins",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Alberto Uria",
        "nationalityCode": "URY",
        "points": 0
      },
      {
        "name": "Don Freeland",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Peter Walker",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Cal Niday",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "André Simon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Art Cross",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Shorty Templeman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Sam Hanks",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tony Rolt",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jean Lucas",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Pablo Birger",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Keith Andrews",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Leslie Marr",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Johnnie Parsons",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Russo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ray Crawford",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Luigi Piotti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jimmy Bryan",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jack Fairman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jack McGrath",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Al Keller",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnny Boyd",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ed Elisian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jerry Hoyt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Fred Agabashian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jimmy Reece",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1956,
    "standings": [
      {
        "name": "Juan Fangio",
        "nationalityCode": "ARG",
        "points": 30
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 27
      },
      {
        "name": "Peter Collins",
        "nationalityCode": "GBR",
        "points": 25
      },
      {
        "name": "Jean Behra",
        "nationalityCode": "FRA",
        "points": 22
      },
      {
        "name": "Pat Flaherty",
        "nationalityCode": "USA",
        "points": 8
      },
      {
        "name": "Eugenio Castellotti",
        "nationalityCode": "ITA",
        "points": 7.5
      },
      {
        "name": "Sam Hanks",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Paul Frère",
        "nationalityCode": "BEL",
        "points": 6
      },
      {
        "name": "Paco Godia",
        "nationalityCode": "ESP",
        "points": 6
      },
      {
        "name": "Jack Fairman",
        "nationalityCode": "GBR",
        "points": 5
      },
      {
        "name": "Luigi Musso",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Mike Hawthorn",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Ron Flockhart",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Don Freeland",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Alfonso de Portago",
        "nationalityCode": "ESP",
        "points": 3
      },
      {
        "name": "Cesare Perdisa",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Johnnie Parsons",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Louis Rosier",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Luigi Villoresi",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Horace Gould",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Hernando da Silva Ramos",
        "nationalityCode": "BRA",
        "points": 2
      },
      {
        "name": "Olivier Gendebien",
        "nationalityCode": "BEL",
        "points": 2
      },
      {
        "name": "Dick Rathmann",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Gerino Gerini",
        "nationalityCode": "ITA",
        "points": 1.5
      },
      {
        "name": "Chico Landi",
        "nationalityCode": "BRA",
        "points": 1.5
      },
      {
        "name": "Paul Russo",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "André Pilette",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Luigi Piotti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Óscar González",
        "nationalityCode": "URY",
        "points": 0
      },
      {
        "name": "Alberto Uria",
        "nationalityCode": "URY",
        "points": 0
      },
      {
        "name": "Élie Bayol",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Bob Sweikert",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Veith",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Toulo de Graffenried",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Robert Manzon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "André Simon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jimmy Reece",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Cliff Griffith",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Gene Hartley",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Gerard",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Fred Agabashian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Christie",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Al Keller",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Johnson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Billy Garrett",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Duke Dinsmore",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Pat O'Connor",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jimmy Bryan",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bruce Halford",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ottorino Volonterio",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "André Milhoux",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Carlos Menditeguy",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "José Froilán González",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Umberto Maglioli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Piero Scotti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Desmond Titterington",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Tony Brooks",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Louis Chiron",
        "nationalityCode": "MCO",
        "points": 0
      },
      {
        "name": "Piero Taruffi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Giorgio Scarlatti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jim Rathmann",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Colin Chapman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Johnnie Tolan",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ed Elisian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Russo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Les Leston",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jimmy Daywalt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Archie Scott Brown",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jack Turner",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paul Emery",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Wolfgang von Trips",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Keith Andrews",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Andy Linden",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Al Herman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ray Crawford",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnny Boyd",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Troy Ruttman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnny Thomson",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1957,
    "standings": [
      {
        "name": "Juan Fangio",
        "nationalityCode": "ARG",
        "points": 40
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 25
      },
      {
        "name": "Luigi Musso",
        "nationalityCode": "ITA",
        "points": 16
      },
      {
        "name": "Mike Hawthorn",
        "nationalityCode": "GBR",
        "points": 13
      },
      {
        "name": "Tony Brooks",
        "nationalityCode": "GBR",
        "points": 11
      },
      {
        "name": "Masten Gregory",
        "nationalityCode": "USA",
        "points": 10
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 10
      },
      {
        "name": "Sam Hanks",
        "nationalityCode": "USA",
        "points": 8
      },
      {
        "name": "Peter Collins",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Jim Rathmann",
        "nationalityCode": "USA",
        "points": 7
      },
      {
        "name": "Jean Behra",
        "nationalityCode": "FRA",
        "points": 6
      },
      {
        "name": "Stuart Lewis-Evans",
        "nationalityCode": "GBR",
        "points": 5
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 5
      },
      {
        "name": "Wolfgang von Trips",
        "nationalityCode": "DEU",
        "points": 4
      },
      {
        "name": "Carlos Menditeguy",
        "nationalityCode": "ARG",
        "points": 4
      },
      {
        "name": "Jimmy Bryan",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Paul Russo",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Andy Linden",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Giorgio Scarlatti",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "José Froilán González",
        "nationalityCode": "ARG",
        "points": 1
      },
      {
        "name": "Alfonso de Portago",
        "nationalityCode": "ESP",
        "points": 1
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Cesare Perdisa",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Johnny Boyd",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Gerard",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Marshall Teague",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Mike MacDowel",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ivor Bueb",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Pat O'Connor",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paco Godia",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Alessandro de Tomaso",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Bob Veith",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Horace Gould",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Luigi Piotti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Gene Hartley",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bruce Halford",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jack Turner",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "André Simon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Ottorino Volonterio",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Johnny Thomson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Edgar Barth",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Bob Christie",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Brian Naylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Chuck Weyant",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Carel Godin de Beaufort",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tony Marsh",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Johnnie Parsons",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Don Freeland",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ron Flockhart",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eugenio Castellotti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Herbert MacKay-Fraser",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jack Fairman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Les Leston",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Hans Herrmann",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Umberto Maglioli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jimmy Reece",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Don Edmunds",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnnie Tolan",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Al Herman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Fred Agabashian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paul England",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Eddie Sachs",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Dick Gibson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mike Magill",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Johnson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bill Cheesbourg",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Al Keller",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jimmy Daywalt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ed Elisian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Troy Ruttman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Russo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Elmer George",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1958,
    "standings": [
      {
        "name": "Mike Hawthorn",
        "nationalityCode": "GBR",
        "points": 42
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 41
      },
      {
        "name": "Tony Brooks",
        "nationalityCode": "GBR",
        "points": 24
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 15
      },
      {
        "name": "Peter Collins",
        "nationalityCode": "GBR",
        "points": 14
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 14
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 12
      },
      {
        "name": "Luigi Musso",
        "nationalityCode": "ITA",
        "points": 12
      },
      {
        "name": "Stuart Lewis-Evans",
        "nationalityCode": "GBR",
        "points": 11
      },
      {
        "name": "Phil Hill",
        "nationalityCode": "USA",
        "points": 9
      },
      {
        "name": "Wolfgang von Trips",
        "nationalityCode": "DEU",
        "points": 9
      },
      {
        "name": "Jean Behra",
        "nationalityCode": "FRA",
        "points": 9
      },
      {
        "name": "Jimmy Bryan",
        "nationalityCode": "USA",
        "points": 8
      },
      {
        "name": "Juan Fangio",
        "nationalityCode": "ARG",
        "points": 7
      },
      {
        "name": "George Amick",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Johnny Boyd",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 3
      },
      {
        "name": "Cliff Allison",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 3
      },
      {
        "name": "Jim Rathmann",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Masten Gregory",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Carroll Shelby",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 0
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Olivier Gendebien",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Jimmy Reece",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Edgar Barth",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Ian Burgess",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Carlos Menditeguy",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Don Freeland",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paco Godia",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Jack Fairman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jud Larson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tony Marsh",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Gerino Gerini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Hans Herrmann",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Horace Gould",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eddie Johnson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Maria de Filippis",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Troy Ruttman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bill Cheesbourg",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ivor Bueb",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Carel Godin de Beaufort",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Al Keller",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnnie Parsons",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnnie Tolan",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Robert La Caze",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "André Guelfi",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Giulio Cabianca",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Giorgio Scarlatti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Wolfgang Seidel",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Bob Christie",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Dempsey Wilson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Anthony Foyt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Christian Goethals",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Mike Magill",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paul Russo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Alan Stacey",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "François Picard",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Shorty Templeman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tom Bridger",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Billy Garrett",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Sachs",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Dick Gibson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Johnny Thomson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Brian Naylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Chuck Weyant",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ron Flockhart",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jack Turner",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Veith",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Dick Rathmann",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ed Elisian",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Pat O'Connor",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Paul Goldsmith",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jerry Unser",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Len Sutton",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Art Bisch",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1959,
    "standings": [
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 31
      },
      {
        "name": "Tony Brooks",
        "nationalityCode": "GBR",
        "points": 27
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 25.5
      },
      {
        "name": "Phil Hill",
        "nationalityCode": "USA",
        "points": 20
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 19
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 16.5
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 13
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 10
      },
      {
        "name": "Masten Gregory",
        "nationalityCode": "USA",
        "points": 10
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 8
      },
      {
        "name": "Jim Rathmann",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Johnny Thomson",
        "nationalityCode": "USA",
        "points": 5
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 5
      },
      {
        "name": "Innes Ireland",
        "nationalityCode": "GBR",
        "points": 5
      },
      {
        "name": "Olivier Gendebien",
        "nationalityCode": "BEL",
        "points": 3
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Cliff Allison",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Jean Behra",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Paul Goldsmith",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ron Flockhart",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ian Burgess",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Wolfgang von Trips",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Johnny Boyd",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Duane Carter",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Harry Blanchard",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Carroll Shelby",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Giorgio Scarlatti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Alan Stacey",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eddie Johnson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Carel Godin de Beaufort",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Paul Russo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Fritz d'Orey",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Anthony Foyt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chris Bristow",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mário de Araújo Cabral",
        "nationalityCode": "PRT",
        "points": 0
      },
      {
        "name": "Colin Davis",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Gene Hartley",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Henry Taylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Bob Veith",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Peter Ashdown",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Al Herman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ivor Bueb",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jimmy Daywalt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chuck Arnold",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Giulio Cabianca",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jim McWithey",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Hans Herrmann",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Alessandro de Tomaso",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Bruce Halford",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "George Constantine",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jack Fairman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eddie Sachs",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Al Keller",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Said",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Pat Flaherty",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Phil Cade",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Dick Rathmann",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bill Cheesbourg",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "David Piper",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Don Freeland",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Azdrubal Fontes",
        "nationalityCode": "URY",
        "points": 0
      },
      {
        "name": "Brian Naylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ray Crawford",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Mike Taylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Don Branson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Christie",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bobby Grim",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jack Turner",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chuck Weyant",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jud Larson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Mike Magill",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Red Amick",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Len Sutton",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jimmy Bryan",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1960,
    "standings": [
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 43
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 34
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 19
      },
      {
        "name": "Innes Ireland",
        "nationalityCode": "GBR",
        "points": 18
      },
      {
        "name": "Phil Hill",
        "nationalityCode": "USA",
        "points": 16
      },
      {
        "name": "Olivier Gendebien",
        "nationalityCode": "BEL",
        "points": 10
      },
      {
        "name": "Wolfgang von Trips",
        "nationalityCode": "DEU",
        "points": 10
      },
      {
        "name": "Jim Rathmann",
        "nationalityCode": "USA",
        "points": 8
      },
      {
        "name": "Richie Ginther",
        "nationalityCode": "USA",
        "points": 8
      },
      {
        "name": "Jim Clark",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Tony Brooks",
        "nationalityCode": "GBR",
        "points": 7
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Cliff Allison",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Willy Mairesse",
        "nationalityCode": "BEL",
        "points": 4
      },
      {
        "name": "Paul Goldsmith",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 4
      },
      {
        "name": "Henry Taylor",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Carlos Menditeguy",
        "nationalityCode": "ARG",
        "points": 3
      },
      {
        "name": "Don Branson",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Giulio Cabianca",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Johnny Thomson",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Lucien Bianchi",
        "nationalityCode": "BEL",
        "points": 1
      },
      {
        "name": "Ron Flockhart",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Eddie Johnson",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Hans Herrmann",
        "nationalityCode": "DEU",
        "points": 1
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Lloyd Ruby",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Edgar Barth",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jim Hall",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Bob Veith",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Carel Godin de Beaufort",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Bruce Halford",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Piero Drogo",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Masten Gregory",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Alberto Rodriguez Larreta",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Bud Tingelstad",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Wolfgang Seidel",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chuck Daigh",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ian Burgess",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "José Froilán González",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Bob Christie",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Fred Gamble",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Roberto Bonomi",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Red Amick",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Pete Lovely",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "David Piper",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Duane Carter",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Gino Munaron",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Brian Naylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Bill Homeier",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Drake",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Nasif Estéfano",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Gene Hartley",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chuck Stevenson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bobby Grim",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Shorty Templeman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jim Hurtubise",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jimmy Bryan",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Troy Ruttman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Sachs",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Don Freeland",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tony Bettenhausen",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Wayne Weiler",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Anthony Foyt",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Eddie Russo",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Johnny Boyd",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Gene Force",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jim McWithey",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Len Sutton",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Dick Rathmann",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Al Herman",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Dempsey Wilson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Alan Stacey",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mário de Araújo Cabral",
        "nationalityCode": "PRT",
        "points": 0
      },
      {
        "name": "Chris Bristow",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Alfonso Thiele",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Giorgio Scarlatti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Harry Schell",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Vic Wilson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Arthur Owen",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Lance Reventlow",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Horace Gould",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mike Taylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ettore Chimeri",
        "nationalityCode": "VEN",
        "points": 0
      },
      {
        "name": "Antonio Creus",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Jack Fairman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Keith Greene",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 1961,
    "standings": [
      {
        "name": "Phil Hill",
        "nationalityCode": "USA",
        "points": 34
      },
      {
        "name": "Wolfgang von Trips",
        "nationalityCode": "DEU",
        "points": 33
      },
      {
        "name": "Stirling Moss",
        "nationalityCode": "GBR",
        "points": 21
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 21
      },
      {
        "name": "Richie Ginther",
        "nationalityCode": "USA",
        "points": 16
      },
      {
        "name": "Innes Ireland",
        "nationalityCode": "GBR",
        "points": 12
      },
      {
        "name": "Jim Clark",
        "nationalityCode": "GBR",
        "points": 11
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 11
      },
      {
        "name": "Giancarlo Baghetti",
        "nationalityCode": "ITA",
        "points": 9
      },
      {
        "name": "Tony Brooks",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 4
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Jackie Lewis",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Olivier Gendebien",
        "nationalityCode": "BEL",
        "points": 3
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 3
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Carel Godin de Beaufort",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Lorenzo Bandini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Cliff Allison",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Roger Penske",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Hans Herrmann",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Peter Ryan",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Masten Gregory",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Henry Taylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Tim Parnell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Hap Sharp",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tony Maggs",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Michael May",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Ian Burgess",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Renato Pirocchi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Trevor Taylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Tony Marsh",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Keith Greene",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Gerry Ashmore",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Wolfgang Seidel",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jim Hall",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Lloyd Ruby",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Gaetano Starrabba",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Willy Mairesse",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Ricardo Rodríguez",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Walt Hansgen",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Lucien Bianchi",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Bernard Collomb",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jack Fairman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Nino Vaccarella",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Ken Miles",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Giorgio Scarlatti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Brian Naylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Edgar Barth",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Juan Manuel Bordeu",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Roberto Bussinello",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Massimo Natili",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Peter Monteverdi",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Roberto Lippi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Geoff Duke",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "John Campbell-Jones",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Alfonso Thiele",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Ernesto Prinoth",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Menato Boffa",
        "nationalityCode": "ITA",
        "points": 0
      }
    ]
  },
  {
    "year": 1962,
    "standings": [
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 42
      },
      {
        "name": "Jim Clark",
        "nationalityCode": "GBR",
        "points": 30
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 27
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 19
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 15
      },
      {
        "name": "Phil Hill",
        "nationalityCode": "USA",
        "points": 14
      },
      {
        "name": "Tony Maggs",
        "nationalityCode": "ZAF",
        "points": 13
      },
      {
        "name": "Richie Ginther",
        "nationalityCode": "USA",
        "points": 10
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 9
      },
      {
        "name": "Trevor Taylor",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Giancarlo Baghetti",
        "nationalityCode": "ITA",
        "points": 5
      },
      {
        "name": "Lorenzo Bandini",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Ricardo Rodríguez",
        "nationalityCode": "MEX",
        "points": 4
      },
      {
        "name": "Willy Mairesse",
        "nationalityCode": "BEL",
        "points": 3
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 3
      },
      {
        "name": "Innes Ireland",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Carel Godin de Beaufort",
        "nationalityCode": "NLD",
        "points": 2
      },
      {
        "name": "Masten Gregory",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Neville Lederle",
        "nationalityCode": "ZAF",
        "points": 1
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jackie Lewis",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "John Love",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Nino Vaccarella",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Lucien Bianchi",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Roger Penske",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bruce Johnstone",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Jo Siffert",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Rob Schroeder",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ernie Pieterse",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Ian Burgess",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Tony Settember",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "John Campbell-Jones",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Hap Sharp",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Heini Walter",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Jay Chamberlain",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Roy Salvadori",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Doug Serrurier",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Wolfgang Seidel",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Mike Harris",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Timmy Mayer",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Peter Arundell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Gary Hocking",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Tony Marsh",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Syd van der Vyver",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Keith Greene",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ben Pon",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Colin Davis",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jim Hall",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Rob Slotemaker",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Carlo Abate",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Tony Shelly",
        "nationalityCode": "NZL",
        "points": 0
      },
      {
        "name": "Sam Tingle",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Roberto Bussinello",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Gerry Ashmore",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Heinz Schiller",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Bernard Collomb",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Kurt Kuhnke",
        "nationalityCode": "DEU",
        "points": 0
      }
    ]
  },
  {
    "year": 1963,
    "standings": [
      {
        "name": "Jim Clark",
        "nationalityCode": "GBR",
        "points": 54
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 29
      },
      {
        "name": "Richie Ginther",
        "nationalityCode": "USA",
        "points": 29
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 22
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 19
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 17
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 14
      },
      {
        "name": "Tony Maggs",
        "nationalityCode": "ZAF",
        "points": 9
      },
      {
        "name": "Innes Ireland",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Lorenzo Bandini",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 6
      },
      {
        "name": "Gerhard Mitter",
        "nationalityCode": "DEU",
        "points": 3
      },
      {
        "name": "Jim Hall",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Carel Godin de Beaufort",
        "nationalityCode": "NLD",
        "points": 2
      },
      {
        "name": "Jo Siffert",
        "nationalityCode": "CHE",
        "points": 1
      },
      {
        "name": "Trevor Taylor",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Ludovico Scarfiotti",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 0
      },
      {
        "name": "Hap Sharp",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Peter Broeker",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Mike Hailwood",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Tony Settember",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "John Love",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Bernard Collomb",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Phil Hill",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Masten Gregory",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Moisés Solana",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Doug Serrurier",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Bob Anderson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Trevor Blokdyk",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "John Campbell-Jones",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mike Spence",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Brausch Niemann",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Giancarlo Baghetti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Willy Mairesse",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Lucien Bianchi",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Mário de Araújo Cabral",
        "nationalityCode": "PRT",
        "points": 0
      },
      {
        "name": "Rodger Ward",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Pedro Rodríguez",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Ian Burgess",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Peter de Klerk",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "David Prophet",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ian Raby",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ernie Pieterse",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Sam Tingle",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Peter Arundell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Paddy Driver",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Walt Hansgen",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Frank Dochnal",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Neville Lederle",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Nasif Estéfano",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Ernie de Vos",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Thomas Monarch",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Günther Seiffert",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Carlo Abate",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Gaetano Starrabba",
        "nationalityCode": "ITA",
        "points": 0
      }
    ]
  },
  {
    "year": 1964,
    "standings": [
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 40
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 39
      },
      {
        "name": "Jim Clark",
        "nationalityCode": "GBR",
        "points": 32
      },
      {
        "name": "Lorenzo Bandini",
        "nationalityCode": "ITA",
        "points": 23
      },
      {
        "name": "Richie Ginther",
        "nationalityCode": "USA",
        "points": 23
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 19
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 13
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 11
      },
      {
        "name": "Peter Arundell",
        "nationalityCode": "GBR",
        "points": 11
      },
      {
        "name": "Jo Siffert",
        "nationalityCode": "CHE",
        "points": 7
      },
      {
        "name": "Bob Anderson",
        "nationalityCode": "GBR",
        "points": 5
      },
      {
        "name": "Mike Spence",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Tony Maggs",
        "nationalityCode": "ZAF",
        "points": 4
      },
      {
        "name": "Innes Ireland",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 3
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 2
      },
      {
        "name": "Maurice Trintignant",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Walt Hansgen",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Phil Hill",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Trevor Taylor",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Mike Hailwood",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Pedro Rodríguez",
        "nationalityCode": "MEX",
        "points": 1
      },
      {
        "name": "Giancarlo Baghetti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Gerhard Mitter",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Ludovico Scarfiotti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Moisés Solana",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Peter Revson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Hap Sharp",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ronnie Bucknum",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "John Taylor",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jochen Rindt",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "André Pilette",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Mário de Araújo Cabral",
        "nationalityCode": "PRT",
        "points": 0
      },
      {
        "name": "Carel Godin de Beaufort",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Ian Raby",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Edgar Barth",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Frank Gardner",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Richard Attwood",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 1965,
    "standings": [
      {
        "name": "Jim Clark",
        "nationalityCode": "GBR",
        "points": 54
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 40
      },
      {
        "name": "Jackie Stewart",
        "nationalityCode": "GBR",
        "points": 33
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 25
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 17
      },
      {
        "name": "Lorenzo Bandini",
        "nationalityCode": "ITA",
        "points": 13
      },
      {
        "name": "Richie Ginther",
        "nationalityCode": "USA",
        "points": 11
      },
      {
        "name": "Mike Spence",
        "nationalityCode": "GBR",
        "points": 10
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 10
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 9
      },
      {
        "name": "Denny Hulme",
        "nationalityCode": "NZL",
        "points": 5
      },
      {
        "name": "Jo Siffert",
        "nationalityCode": "CHE",
        "points": 5
      },
      {
        "name": "Jochen Rindt",
        "nationalityCode": "AUT",
        "points": 4
      },
      {
        "name": "Pedro Rodríguez",
        "nationalityCode": "MEX",
        "points": 2
      },
      {
        "name": "Ronnie Bucknum",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Richard Attwood",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Frank Gardner",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Masten Gregory",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Anderson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Innes Ireland",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Paul Hawkins",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Bob Bondurant",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Peter de Klerk",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Tony Maggs",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Ian Raby",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Moisés Solana",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Lucien Bianchi",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Nino Vaccarella",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Sam Tingle",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Roberto Bussinello",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "David Prophet",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 0
      },
      {
        "name": "Gerhard Mitter",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Mike Hailwood",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "John Rhodes",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Giacomo Russo",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "John Love",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Ludovico Scarfiotti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Giancarlo Baghetti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Giorgio Bassi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Ray Reed",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "David Clapham",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Alex Blignaut",
        "nationalityCode": "ZAF",
        "points": 0
      }
    ]
  },
  {
    "year": 1966,
    "standings": [
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 42
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 28
      },
      {
        "name": "Jochen Rindt",
        "nationalityCode": "AUT",
        "points": 22
      },
      {
        "name": "Denny Hulme",
        "nationalityCode": "NZL",
        "points": 18
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 17
      },
      {
        "name": "Jim Clark",
        "nationalityCode": "GBR",
        "points": 16
      },
      {
        "name": "Jackie Stewart",
        "nationalityCode": "GBR",
        "points": 14
      },
      {
        "name": "Mike Parkes",
        "nationalityCode": "GBR",
        "points": 12
      },
      {
        "name": "Lorenzo Bandini",
        "nationalityCode": "ITA",
        "points": 12
      },
      {
        "name": "Ludovico Scarfiotti",
        "nationalityCode": "ITA",
        "points": 9
      },
      {
        "name": "Richie Ginther",
        "nationalityCode": "USA",
        "points": 5
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Mike Spence",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Bob Bondurant",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Jo Siffert",
        "nationalityCode": "CHE",
        "points": 3
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 3
      },
      {
        "name": "Peter Arundell",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 1
      },
      {
        "name": "Bob Anderson",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "John Taylor",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Chris Irwin",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ronnie Bucknum",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 0
      },
      {
        "name": "Guy Ligier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Giacomo Russo",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Chris Lawrence",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Innes Ireland",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Pedro Rodríguez",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Giancarlo Baghetti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Vic Wilson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Moisés Solana",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Trevor Taylor",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 1967,
    "standings": [
      {
        "name": "Denny Hulme",
        "nationalityCode": "NZL",
        "points": 51
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 48
      },
      {
        "name": "Jim Clark",
        "nationalityCode": "GBR",
        "points": 41
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 20
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 20
      },
      {
        "name": "Pedro Rodríguez",
        "nationalityCode": "MEX",
        "points": 15
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 15
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 13
      },
      {
        "name": "Jackie Stewart",
        "nationalityCode": "GBR",
        "points": 10
      },
      {
        "name": "Mike Spence",
        "nationalityCode": "GBR",
        "points": 9
      },
      {
        "name": "John Love",
        "nationalityCode": "ZWE",
        "points": 6
      },
      {
        "name": "Jo Siffert",
        "nationalityCode": "CHE",
        "points": 6
      },
      {
        "name": "Jochen Rindt",
        "nationalityCode": "AUT",
        "points": 6
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 3
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 3
      },
      {
        "name": "Chris Irwin",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Bob Anderson",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Mike Parkes",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 1
      },
      {
        "name": "Ludovico Scarfiotti",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Guy Ligier",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Jackie Oliver",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jean-Pierre Beltoise",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Alan Rees",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "David Hobbs",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jonathan Williams",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Richard Attwood",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mike Fisher",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Dave Charlton",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Lorenzo Bandini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Piers Courage",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Luki Botha",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Sam Tingle",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Giancarlo Baghetti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Eppie Wietzes",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Brian Hart",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Johnny Servoz-Gavin",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Silvio Moser",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Al Pease",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Moisés Solana",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Hubert Hahne",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Kurt Ahrens",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jo Schlesser",
        "nationalityCode": "FRA",
        "points": 0
      }
    ]
  },
  {
    "year": 1968,
    "standings": [
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 48
      },
      {
        "name": "Jackie Stewart",
        "nationalityCode": "GBR",
        "points": 36
      },
      {
        "name": "Denny Hulme",
        "nationalityCode": "NZL",
        "points": 33
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 27
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 22
      },
      {
        "name": "Pedro Rodríguez",
        "nationalityCode": "MEX",
        "points": 18
      },
      {
        "name": "Jo Siffert",
        "nationalityCode": "CHE",
        "points": 12
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 12
      },
      {
        "name": "Jean-Pierre Beltoise",
        "nationalityCode": "FRA",
        "points": 11
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 10
      },
      {
        "name": "Jim Clark",
        "nationalityCode": "GBR",
        "points": 9
      },
      {
        "name": "Jochen Rindt",
        "nationalityCode": "AUT",
        "points": 8
      },
      {
        "name": "Richard Attwood",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Johnny Servoz-Gavin",
        "nationalityCode": "FRA",
        "points": 6
      },
      {
        "name": "Jackie Oliver",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Ludovico Scarfiotti",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Lucien Bianchi",
        "nationalityCode": "BEL",
        "points": 5
      },
      {
        "name": "Vic Elford",
        "nationalityCode": "GBR",
        "points": 5
      },
      {
        "name": "Brian Redman",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Piers Courage",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 3
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 2
      },
      {
        "name": "Silvio Moser",
        "nationalityCode": "CHE",
        "points": 2
      },
      {
        "name": "Henri Pescarolo",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "John Love",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Hubert Hahne",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Kurt Ahrens",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jackie Pretorius",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "David Hobbs",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Robin Widdows",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Sam Tingle",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Basil van Rooyen",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Jo Schlesser",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Bobby Unser",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Moisés Solana",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Bill Brack",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Derek Bell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Andrea de Adamich",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Mike Spence",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Dave Charlton",
        "nationalityCode": "ZAF",
        "points": 0
      }
    ]
  },
  {
    "year": 1969,
    "standings": [
      {
        "name": "Jackie Stewart",
        "nationalityCode": "GBR",
        "points": 63
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 37
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 26
      },
      {
        "name": "Jochen Rindt",
        "nationalityCode": "AUT",
        "points": 22
      },
      {
        "name": "Jean-Pierre Beltoise",
        "nationalityCode": "FRA",
        "points": 21
      },
      {
        "name": "Denny Hulme",
        "nationalityCode": "NZL",
        "points": 20
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 19
      },
      {
        "name": "Piers Courage",
        "nationalityCode": "GBR",
        "points": 16
      },
      {
        "name": "Jo Siffert",
        "nationalityCode": "CHE",
        "points": 15
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 14
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 4
      },
      {
        "name": "Richard Attwood",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Vic Elford",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Pedro Rodríguez",
        "nationalityCode": "MEX",
        "points": 3
      },
      {
        "name": "Silvio Moser",
        "nationalityCode": "CHE",
        "points": 1
      },
      {
        "name": "Jackie Oliver",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Johnny Servoz-Gavin",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Pete Lovely",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Sam Tingle",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "John Miles",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Bill Brack",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Peter de Klerk",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "George Eaton",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Al Pease",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "John Love",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Derek Bell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "John Cordts",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Basil van Rooyen",
        "nationalityCode": "ZAF",
        "points": 0
      }
    ]
  },
  {
    "year": 1970,
    "standings": [
      {
        "name": "Jochen Rindt",
        "nationalityCode": "AUT",
        "points": 45
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 40
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 33
      },
      {
        "name": "Denny Hulme",
        "nationalityCode": "NZL",
        "points": 27
      },
      {
        "name": "Jackie Stewart",
        "nationalityCode": "GBR",
        "points": 25
      },
      {
        "name": "Jack Brabham",
        "nationalityCode": "AUS",
        "points": 25
      },
      {
        "name": "Pedro Rodríguez",
        "nationalityCode": "MEX",
        "points": 23
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 23
      },
      {
        "name": "Jean-Pierre Beltoise",
        "nationalityCode": "FRA",
        "points": 16
      },
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 12
      },
      {
        "name": "Rolf Stommelen",
        "nationalityCode": "DEU",
        "points": 10
      },
      {
        "name": "Henri Pescarolo",
        "nationalityCode": "FRA",
        "points": 8
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 7
      },
      {
        "name": "Bruce McLaren",
        "nationalityCode": "NZL",
        "points": 6
      },
      {
        "name": "Reine Wisell",
        "nationalityCode": "SWE",
        "points": 4
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Ignazio Giunti",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "John Miles",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Jackie Oliver",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Johnny Servoz-Gavin",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "François Cevert",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Peter Gethin",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Dan Gurney",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Derek Bell",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Jo Siffert",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Ronnie Peterson",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Andrea de Adamich",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "John Love",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "George Eaton",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Peter de Klerk",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Dave Charlton",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Piers Courage",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Pete Lovely",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tim Schenken",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Silvio Moser",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Gus Hutchison",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1971,
    "standings": [
      {
        "name": "Jackie Stewart",
        "nationalityCode": "GBR",
        "points": 62
      },
      {
        "name": "Ronnie Peterson",
        "nationalityCode": "SWE",
        "points": 33
      },
      {
        "name": "François Cevert",
        "nationalityCode": "FRA",
        "points": 26
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 19
      },
      {
        "name": "Jo Siffert",
        "nationalityCode": "CHE",
        "points": 19
      },
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 16
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 13
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 12
      },
      {
        "name": "Peter Gethin",
        "nationalityCode": "GBR",
        "points": 9
      },
      {
        "name": "Pedro Rodríguez",
        "nationalityCode": "MEX",
        "points": 9
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 9
      },
      {
        "name": "Reine Wisell",
        "nationalityCode": "SWE",
        "points": 9
      },
      {
        "name": "Denny Hulme",
        "nationalityCode": "NZL",
        "points": 9
      },
      {
        "name": "Tim Schenken",
        "nationalityCode": "AUS",
        "points": 5
      },
      {
        "name": "Howden Ganley",
        "nationalityCode": "NZL",
        "points": 5
      },
      {
        "name": "Mark Donohue",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Henri Pescarolo",
        "nationalityCode": "FRA",
        "points": 4
      },
      {
        "name": "Mike Hailwood",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Rolf Stommelen",
        "nationalityCode": "DEU",
        "points": 3
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Jean-Pierre Beltoise",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Jackie Oliver",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Brian Redman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Gijs van Lennep",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Jo Bonnier",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "David Hobbs",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Nanni Galli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Helmut Marko",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Andrea de Adamich",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Vic Elford",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "François Mazet",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "John Cannon",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "George Eaton",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Mike Beuttler",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Skip Barber",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Max Jean",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Alex Soler-Roig",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Pete Lovely",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Dave Charlton",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Derek Bell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "John Love",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "Silvio Moser",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Jackie Pretorius",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "David Walker",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Chris Craft",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Sam Posey",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Peter Revson",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1972,
    "standings": [
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 61
      },
      {
        "name": "Jackie Stewart",
        "nationalityCode": "GBR",
        "points": 45
      },
      {
        "name": "Denny Hulme",
        "nationalityCode": "NZL",
        "points": 39
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 27
      },
      {
        "name": "Peter Revson",
        "nationalityCode": "USA",
        "points": 23
      },
      {
        "name": "François Cevert",
        "nationalityCode": "FRA",
        "points": 15
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 15
      },
      {
        "name": "Mike Hailwood",
        "nationalityCode": "GBR",
        "points": 13
      },
      {
        "name": "Ronnie Peterson",
        "nationalityCode": "SWE",
        "points": 12
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 12
      },
      {
        "name": "Jean-Pierre Beltoise",
        "nationalityCode": "FRA",
        "points": 9
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Howden Ganley",
        "nationalityCode": "NZL",
        "points": 4
      },
      {
        "name": "Brian Redman",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 3
      },
      {
        "name": "Andrea de Adamich",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Carlos Pace",
        "nationalityCode": "BRA",
        "points": 3
      },
      {
        "name": "Tim Schenken",
        "nationalityCode": "AUS",
        "points": 2
      },
      {
        "name": "Arturo Merzario",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Peter Gethin",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Wilson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Patrick Depailler",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Helmut Marko",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Mike Beuttler",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Henri Pescarolo",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "David Walker",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Jody Scheckter",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Rolf Stommelen",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Reine Wisell",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Sam Posey",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Nanni Galli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Skip Barber",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "John Love",
        "nationalityCode": "ZWE",
        "points": 0
      },
      {
        "name": "John Surtees",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jackie Oliver",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Alex Soler-Roig",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "François Migault",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Dave Charlton",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Bill Brack",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Derek Bell",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 1973,
    "standings": [
      {
        "name": "Jackie Stewart",
        "nationalityCode": "GBR",
        "points": 71
      },
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 55
      },
      {
        "name": "Ronnie Peterson",
        "nationalityCode": "SWE",
        "points": 52
      },
      {
        "name": "François Cevert",
        "nationalityCode": "FRA",
        "points": 47
      },
      {
        "name": "Peter Revson",
        "nationalityCode": "USA",
        "points": 38
      },
      {
        "name": "Denny Hulme",
        "nationalityCode": "NZL",
        "points": 26
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 16
      },
      {
        "name": "James Hunt",
        "nationalityCode": "GBR",
        "points": 14
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 12
      },
      {
        "name": "Jean-Pierre Beltoise",
        "nationalityCode": "FRA",
        "points": 9
      },
      {
        "name": "Carlos Pace",
        "nationalityCode": "BRA",
        "points": 7
      },
      {
        "name": "Arturo Merzario",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "George Follmer",
        "nationalityCode": "USA",
        "points": 5
      },
      {
        "name": "Jackie Oliver",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Andrea de Adamich",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Wilson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 3
      },
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 2
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 2
      },
      {
        "name": "Howden Ganley",
        "nationalityCode": "NZL",
        "points": 1
      },
      {
        "name": "Gijs van Lennep",
        "nationalityCode": "NLD",
        "points": 1
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 1
      },
      {
        "name": "Mike Hailwood",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mike Beuttler",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jochen Mass",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Henri Pescarolo",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Nanni Galli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "David Purley",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jody Scheckter",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Rolf Stommelen",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Luiz Bueno",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Rikky von Opel",
        "nationalityCode": "LIE",
        "points": 0
      },
      {
        "name": "Tim Schenken",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Eddie Keizan",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jackie Pretorius",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Roger Williamson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Reine Wisell",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Dave Charlton",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Brian Redman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Peter Gethin",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Graham McRae",
        "nationalityCode": "NZL",
        "points": 0
      }
    ]
  },
  {
    "year": 1974,
    "standings": [
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 55
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 52
      },
      {
        "name": "Jody Scheckter",
        "nationalityCode": "ZAF",
        "points": 45
      },
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 38
      },
      {
        "name": "Ronnie Peterson",
        "nationalityCode": "SWE",
        "points": 35
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 32
      },
      {
        "name": "Denny Hulme",
        "nationalityCode": "NZL",
        "points": 20
      },
      {
        "name": "James Hunt",
        "nationalityCode": "GBR",
        "points": 15
      },
      {
        "name": "Patrick Depailler",
        "nationalityCode": "FRA",
        "points": 14
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 12
      },
      {
        "name": "Mike Hailwood",
        "nationalityCode": "GBR",
        "points": 12
      },
      {
        "name": "Carlos Pace",
        "nationalityCode": "BRA",
        "points": 11
      },
      {
        "name": "Jean-Pierre Beltoise",
        "nationalityCode": "FRA",
        "points": 10
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 6
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Hans-Joachim Stuck",
        "nationalityCode": "DEU",
        "points": 5
      },
      {
        "name": "Arturo Merzario",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Tom Pryce",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Vittorio Brambilla",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Guy Edwards",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "David Hobbs",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jochen Mass",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Brian Redman",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Howden Ganley",
        "nationalityCode": "NZL",
        "points": 0
      },
      {
        "name": "Tom Belsø",
        "nationalityCode": "DNK",
        "points": 0
      },
      {
        "name": "Rikky von Opel",
        "nationalityCode": "LIE",
        "points": 0
      },
      {
        "name": "Henri Pescarolo",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 0
      },
      {
        "name": "Dieter Quester",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Tim Schenken",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Helmuth Koinigg",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Rolf Stommelen",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Derek Bell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mark Donohue",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Ian Scheckter",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "François Migault",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Ian Ashley",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eddie Keizan",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Gijs van Lennep",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Richard Robarts",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Vern Schuppan",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Teddy Pilette",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Dave Charlton",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Reine Wisell",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Mike Wilds",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "José Dolhem",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Peter Revson",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Leo Kinnunen",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Paddy Driver",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Gérard Larrousse",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Bertil Roos",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Peter Gethin",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eppie Wietzes",
        "nationalityCode": "CAN",
        "points": 0
      }
    ]
  },
  {
    "year": 1975,
    "standings": [
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 64.5
      },
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 45
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 37
      },
      {
        "name": "James Hunt",
        "nationalityCode": "GBR",
        "points": 33
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 25
      },
      {
        "name": "Carlos Pace",
        "nationalityCode": "BRA",
        "points": 24
      },
      {
        "name": "Jody Scheckter",
        "nationalityCode": "ZAF",
        "points": 20
      },
      {
        "name": "Jochen Mass",
        "nationalityCode": "DEU",
        "points": 20
      },
      {
        "name": "Patrick Depailler",
        "nationalityCode": "FRA",
        "points": 12
      },
      {
        "name": "Tom Pryce",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Vittorio Brambilla",
        "nationalityCode": "ITA",
        "points": 6.5
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 6
      },
      {
        "name": "Ronnie Peterson",
        "nationalityCode": "SWE",
        "points": 6
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 5
      },
      {
        "name": "Mark Donohue",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 3
      },
      {
        "name": "Alan Jones",
        "nationalityCode": "AUS",
        "points": 2
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 1.5
      },
      {
        "name": "Tony Brise",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Gijs van Lennep",
        "nationalityCode": "NLD",
        "points": 1
      },
      {
        "name": "Lella Lombardi",
        "nationalityCode": "ITA",
        "points": 0.5
      },
      {
        "name": "Rolf Stommelen",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Harald Ertl",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Hans-Joachim Stuck",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Bob Evans",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Wilson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Graham Hill",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Brett Lunger",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Torsten Palm",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Arturo Merzario",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Guy Tunmer",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 0
      },
      {
        "name": "Ian Scheckter",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Jean-Pierre Jabouille",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jim Crawford",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eddie Keizan",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Dave Charlton",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Damien Magee",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Renzo Zorzi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Brian Henton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "John Nicholson",
        "nationalityCode": "NZL",
        "points": 0
      },
      {
        "name": "Dave Morgan",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "François Migault",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Roelof Wunderink",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Mike Wilds",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Vern Schuppan",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Michel Leclère",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jo Vonlanthen",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Hiroshi Fushida",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Ian Ashley",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 1976,
    "standings": [
      {
        "name": "James Hunt",
        "nationalityCode": "GBR",
        "points": 66
      },
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 64
      },
      {
        "name": "Jody Scheckter",
        "nationalityCode": "ZAF",
        "points": 48
      },
      {
        "name": "Patrick Depailler",
        "nationalityCode": "FRA",
        "points": 39
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 31
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 22
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 20
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 20
      },
      {
        "name": "Jochen Mass",
        "nationalityCode": "DEU",
        "points": 19
      },
      {
        "name": "Gunnar Nilsson",
        "nationalityCode": "SWE",
        "points": 11
      },
      {
        "name": "Ronnie Peterson",
        "nationalityCode": "SWE",
        "points": 10
      },
      {
        "name": "Tom Pryce",
        "nationalityCode": "GBR",
        "points": 10
      },
      {
        "name": "Hans-Joachim Stuck",
        "nationalityCode": "DEU",
        "points": 8
      },
      {
        "name": "Carlos Pace",
        "nationalityCode": "BRA",
        "points": 7
      },
      {
        "name": "Alan Jones",
        "nationalityCode": "AUS",
        "points": 7
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 3
      },
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 3
      },
      {
        "name": "Chris Amon",
        "nationalityCode": "NZL",
        "points": 2
      },
      {
        "name": "Vittorio Brambilla",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Rolf Stommelen",
        "nationalityCode": "DEU",
        "points": 1
      },
      {
        "name": "Harald Ertl",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Larry Perkins",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Henri Pescarolo",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Arturo Merzario",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Renzo Zorzi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Noritake Takahara",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Michel Leclère",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Brett Lunger",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bob Evans",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Alessandro Pesenti-Rossi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Ingo Hoffmann",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Masahiro Hasemi",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Lella Lombardi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Loris Kessel",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Alex Ribeiro",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Warwick Brown",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Guy Edwards",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Patrick Nève",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Hans Binder",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Boy Lunger",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Kazuyoshi Hoshino",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Ian Ashley",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Ian Scheckter",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Conny Andersson",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Otto Stuppacher",
        "nationalityCode": "AUT",
        "points": 0
      }
    ]
  },
  {
    "year": 1977,
    "standings": [
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 70
      },
      {
        "name": "Jody Scheckter",
        "nationalityCode": "ZAF",
        "points": 55
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 47
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 41
      },
      {
        "name": "James Hunt",
        "nationalityCode": "GBR",
        "points": 40
      },
      {
        "name": "Jochen Mass",
        "nationalityCode": "DEU",
        "points": 25
      },
      {
        "name": "Alan Jones",
        "nationalityCode": "AUS",
        "points": 22
      },
      {
        "name": "Gunnar Nilsson",
        "nationalityCode": "SWE",
        "points": 20
      },
      {
        "name": "Patrick Depailler",
        "nationalityCode": "FRA",
        "points": 20
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 18
      },
      {
        "name": "Hans-Joachim Stuck",
        "nationalityCode": "DEU",
        "points": 12
      },
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 11
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 9
      },
      {
        "name": "Ronnie Peterson",
        "nationalityCode": "SWE",
        "points": 7
      },
      {
        "name": "Carlos Pace",
        "nationalityCode": "BRA",
        "points": 6
      },
      {
        "name": "Vittorio Brambilla",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 5
      },
      {
        "name": "Patrick Tambay",
        "nationalityCode": "FRA",
        "points": 5
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Renzo Zorzi",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Rupert Keegan",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Patrick Nève",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Vern Schuppan",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Ingo Hoffmann",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Danny Ongais",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Alex Ribeiro",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Hans Binder",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Brett Lunger",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Harald Ertl",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Jackie Oliver",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Kunimitsu Takahashi",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Ian Scheckter",
        "nationalityCode": "ZAF",
        "points": 0
      },
      {
        "name": "Brian Henton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Gilles Villeneuve",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Kazuyoshi Hoshino",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Larry Perkins",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "David Purley",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Emilio de Villota",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Arturo Merzario",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Ian Ashley",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Tom Pryce",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Bruno Giacomelli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jean-Pierre Jabouille",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Boy Lunger",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Hector Rebaque",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Noritake Takahara",
        "nationalityCode": "JPN",
        "points": 0
      }
    ]
  },
  {
    "year": 1978,
    "standings": [
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 64
      },
      {
        "name": "Ronnie Peterson",
        "nationalityCode": "SWE",
        "points": 51
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 48
      },
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 44
      },
      {
        "name": "Patrick Depailler",
        "nationalityCode": "FRA",
        "points": 34
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 25
      },
      {
        "name": "Jody Scheckter",
        "nationalityCode": "ZAF",
        "points": 24
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 19
      },
      {
        "name": "Gilles Villeneuve",
        "nationalityCode": "CAN",
        "points": 17
      },
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 17
      },
      {
        "name": "Alan Jones",
        "nationalityCode": "AUS",
        "points": 11
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 11
      },
      {
        "name": "James Hunt",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Patrick Tambay",
        "nationalityCode": "FRA",
        "points": 8
      },
      {
        "name": "Didier Pironi",
        "nationalityCode": "FRA",
        "points": 7
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 4
      },
      {
        "name": "Jean-Pierre Jabouille",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Hans-Joachim Stuck",
        "nationalityCode": "DEU",
        "points": 2
      },
      {
        "name": "Vittorio Brambilla",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Derek Daly",
        "nationalityCode": "IRL",
        "points": 1
      },
      {
        "name": "Hector Rebaque",
        "nationalityCode": "MEX",
        "points": 1
      },
      {
        "name": "Brett Lunger",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Bruno Giacomelli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jochen Mass",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Rolf Stommelen",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Keke Rosberg",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Rupert Keegan",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Harald Ertl",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Bobby Rahal",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Arturo Merzario",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Michael Bleekemolen",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Danny Ongais",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Lamberto Leoni",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1979,
    "standings": [
      {
        "name": "Jody Scheckter",
        "nationalityCode": "ZAF",
        "points": 51
      },
      {
        "name": "Gilles Villeneuve",
        "nationalityCode": "CAN",
        "points": 47
      },
      {
        "name": "Alan Jones",
        "nationalityCode": "AUS",
        "points": 40
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 36
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 29
      },
      {
        "name": "Patrick Depailler",
        "nationalityCode": "FRA",
        "points": 20
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 20
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 17
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 15
      },
      {
        "name": "Didier Pironi",
        "nationalityCode": "FRA",
        "points": 14
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 14
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 14
      },
      {
        "name": "Jean-Pierre Jabouille",
        "nationalityCode": "FRA",
        "points": 9
      },
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 4
      },
      {
        "name": "Elio de Angelis",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 3
      },
      {
        "name": "Jacky Ickx",
        "nationalityCode": "BEL",
        "points": 3
      },
      {
        "name": "Jochen Mass",
        "nationalityCode": "DEU",
        "points": 3
      },
      {
        "name": "Hans-Joachim Stuck",
        "nationalityCode": "DEU",
        "points": 2
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 1
      },
      {
        "name": "Hector Rebaque",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Patrick Tambay",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Ricardo Zunino",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Geoff Lees",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Derek Daly",
        "nationalityCode": "IRL",
        "points": 0
      },
      {
        "name": "James Hunt",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jan Lammers",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Keke Rosberg",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Vittorio Brambilla",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Patrick Gaillard",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Bruno Giacomelli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Marc Surer",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Arturo Merzario",
        "nationalityCode": "ITA",
        "points": 0
      }
    ]
  },
  {
    "year": 1980,
    "standings": [
      {
        "name": "Alan Jones",
        "nationalityCode": "AUS",
        "points": 67
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 54
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 42
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 34
      },
      {
        "name": "Didier Pironi",
        "nationalityCode": "FRA",
        "points": 32
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 29
      },
      {
        "name": "Elio de Angelis",
        "nationalityCode": "ITA",
        "points": 13
      },
      {
        "name": "Jean-Pierre Jabouille",
        "nationalityCode": "FRA",
        "points": 9
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 7
      },
      {
        "name": "Keke Rosberg",
        "nationalityCode": "FIN",
        "points": 6
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Derek Daly",
        "nationalityCode": "IRL",
        "points": 6
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 6
      },
      {
        "name": "Gilles Villeneuve",
        "nationalityCode": "CAN",
        "points": 6
      },
      {
        "name": "Emerson Fittipaldi",
        "nationalityCode": "BRA",
        "points": 5
      },
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 5
      },
      {
        "name": "Jochen Mass",
        "nationalityCode": "DEU",
        "points": 4
      },
      {
        "name": "Bruno Giacomelli",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Jody Scheckter",
        "nationalityCode": "ZAF",
        "points": 2
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Hector Rebaque",
        "nationalityCode": "MEX",
        "points": 1
      },
      {
        "name": "Marc Surer",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Ricardo Zunino",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Rupert Keegan",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Clay Regazzoni",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Jan Lammers",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Geoff Lees",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Patrick Depailler",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Vittorio Brambilla",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Tiff Needell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mike Thackwell",
        "nationalityCode": "NZL",
        "points": 0
      }
    ]
  },
  {
    "year": 1981,
    "standings": [
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 50
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 49
      },
      {
        "name": "Alan Jones",
        "nationalityCode": "AUS",
        "points": 46
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 44
      },
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 43
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 27
      },
      {
        "name": "Gilles Villeneuve",
        "nationalityCode": "CAN",
        "points": 25
      },
      {
        "name": "Elio de Angelis",
        "nationalityCode": "ITA",
        "points": 14
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 11
      },
      {
        "name": "Hector Rebaque",
        "nationalityCode": "MEX",
        "points": 11
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 10
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 10
      },
      {
        "name": "Didier Pironi",
        "nationalityCode": "FRA",
        "points": 9
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Bruno Giacomelli",
        "nationalityCode": "ITA",
        "points": 7
      },
      {
        "name": "Marc Surer",
        "nationalityCode": "CHE",
        "points": 4
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Patrick Tambay",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Slim Borgudd",
        "nationalityCode": "SWE",
        "points": 1
      },
      {
        "name": "Eliseo Salazar",
        "nationalityCode": "CHL",
        "points": 1
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Derek Daly",
        "nationalityCode": "IRL",
        "points": 0
      },
      {
        "name": "Siegfried Stohr",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Chico Serra",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Keke Rosberg",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Brian Henton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jan Lammers",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Ricardo Zunino",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Piercarlo Ghinzani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jean-Pierre Jabouille",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Beppe Gabbiani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Miguel Ángel Guerra",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Ricardo Londoño",
        "nationalityCode": "COL",
        "points": 0
      }
    ]
  },
  {
    "year": 1982,
    "standings": [
      {
        "name": "Keke Rosberg",
        "nationalityCode": "FIN",
        "points": 44
      },
      {
        "name": "Didier Pironi",
        "nationalityCode": "FRA",
        "points": 39
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 39
      },
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 34
      },
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 30
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 28
      },
      {
        "name": "Patrick Tambay",
        "nationalityCode": "FRA",
        "points": 25
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 25
      },
      {
        "name": "Elio de Angelis",
        "nationalityCode": "ITA",
        "points": 23
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 21
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 20
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 15
      },
      {
        "name": "Derek Daly",
        "nationalityCode": "IRL",
        "points": 8
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 7
      },
      {
        "name": "Gilles Villeneuve",
        "nationalityCode": "CAN",
        "points": 6
      },
      {
        "name": "Carlos Reutemann",
        "nationalityCode": "ARG",
        "points": 6
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 5
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 5
      },
      {
        "name": "Mario Andretti",
        "nationalityCode": "USA",
        "points": 4
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Marc Surer",
        "nationalityCode": "CHE",
        "points": 3
      },
      {
        "name": "Bruno Giacomelli",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Eliseo Salazar",
        "nationalityCode": "CHL",
        "points": 2
      },
      {
        "name": "Manfred Winkelhock",
        "nationalityCode": "DEU",
        "points": 2
      },
      {
        "name": "Mauro Baldi",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Chico Serra",
        "nationalityCode": "BRA",
        "points": 1
      },
      {
        "name": "Brian Henton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jochen Mass",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Slim Borgudd",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Raul Boesel",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Roberto Guerrero",
        "nationalityCode": "COL",
        "points": 0
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Rupert Keegan",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Geoff Lees",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Teo Fabi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Riccardo Paletti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Tommy Byrne",
        "nationalityCode": "IRL",
        "points": 0
      },
      {
        "name": "Jan Lammers",
        "nationalityCode": "NLD",
        "points": 0
      }
    ]
  },
  {
    "year": 1983,
    "standings": [
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 59
      },
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 57
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 49
      },
      {
        "name": "Patrick Tambay",
        "nationalityCode": "FRA",
        "points": 40
      },
      {
        "name": "Keke Rosberg",
        "nationalityCode": "FIN",
        "points": 27
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 22
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 22
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 15
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 13
      },
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 12
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 11
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 10
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 10
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 9
      },
      {
        "name": "Marc Surer",
        "nationalityCode": "CHE",
        "points": 4
      },
      {
        "name": "Mauro Baldi",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Danny Sullivan",
        "nationalityCode": "USA",
        "points": 2
      },
      {
        "name": "Elio de Angelis",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Bruno Giacomelli",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Johnny Cecotto",
        "nationalityCode": "VEN",
        "points": 1
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Chico Serra",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Jean-Pierre Jarier",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Raul Boesel",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Stefan Johansson",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Manfred Winkelhock",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Corrado Fabi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Piercarlo Ghinzani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Roberto Guerrero",
        "nationalityCode": "COL",
        "points": 0
      },
      {
        "name": "Kenny Acheson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Eliseo Salazar",
        "nationalityCode": "CHL",
        "points": 0
      },
      {
        "name": "Jonathan Palmer",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Alan Jones",
        "nationalityCode": "AUS",
        "points": 0
      }
    ]
  },
  {
    "year": 1984,
    "standings": [
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 72
      },
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 71.5
      },
      {
        "name": "Elio de Angelis",
        "nationalityCode": "ITA",
        "points": 34
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 30.5
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 29
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 27
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 23
      },
      {
        "name": "Keke Rosberg",
        "nationalityCode": "FIN",
        "points": 20.5
      },
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 13
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 13
      },
      {
        "name": "Patrick Tambay",
        "nationalityCode": "FRA",
        "points": 11
      },
      {
        "name": "Teo Fabi",
        "nationalityCode": "ITA",
        "points": 9
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 8
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 5
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 5
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 3
      },
      {
        "name": "Stefan Johansson",
        "nationalityCode": "SWE",
        "points": 3
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Piercarlo Ghinzani",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Marc Surer",
        "nationalityCode": "CHE",
        "points": 1
      },
      {
        "name": "Jo Gartner",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "François Hesnault",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Corrado Fabi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Mauro Baldi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Manfred Winkelhock",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Jonathan Palmer",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Huub Rothengatter",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Johnny Cecotto",
        "nationalityCode": "VEN",
        "points": 0
      },
      {
        "name": "Philippe Alliot",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Stefan Bellof",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Philippe Streiff",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Mike Thackwell",
        "nationalityCode": "NZL",
        "points": 0
      }
    ]
  },
  {
    "year": 1985,
    "standings": [
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 73
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 53
      },
      {
        "name": "Keke Rosberg",
        "nationalityCode": "FIN",
        "points": 40
      },
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 38
      },
      {
        "name": "Elio de Angelis",
        "nationalityCode": "ITA",
        "points": 33
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 31
      },
      {
        "name": "Stefan Johansson",
        "nationalityCode": "SWE",
        "points": 26
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 21
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 16
      },
      {
        "name": "Niki Lauda",
        "nationalityCode": "AUT",
        "points": 14
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 11
      },
      {
        "name": "Patrick Tambay",
        "nationalityCode": "FRA",
        "points": 11
      },
      {
        "name": "Marc Surer",
        "nationalityCode": "CHE",
        "points": 5
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 5
      },
      {
        "name": "Philippe Streiff",
        "nationalityCode": "FRA",
        "points": 4
      },
      {
        "name": "Stefan Bellof",
        "nationalityCode": "DEU",
        "points": 4
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Ivan Capelli",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 3
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Huub Rothengatter",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "John Watson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Pierluigi Martini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Piercarlo Ghinzani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Philippe Alliot",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jonathan Palmer",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Manfred Winkelhock",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Teo Fabi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Christian Danner",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Kenny Acheson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Mauro Baldi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Alan Jones",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "François Hesnault",
        "nationalityCode": "FRA",
        "points": 0
      }
    ]
  },
  {
    "year": 1986,
    "standings": [
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 72
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 70
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 69
      },
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 55
      },
      {
        "name": "Stefan Johansson",
        "nationalityCode": "SWE",
        "points": 23
      },
      {
        "name": "Keke Rosberg",
        "nationalityCode": "FIN",
        "points": 22
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 17
      },
      {
        "name": "Jacques Laffite",
        "nationalityCode": "FRA",
        "points": 14
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 14
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 14
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Alan Jones",
        "nationalityCode": "AUS",
        "points": 4
      },
      {
        "name": "Johnny Dumfries",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Philippe Streiff",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Patrick Tambay",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Teo Fabi",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Christian Danner",
        "nationalityCode": "DEU",
        "points": 1
      },
      {
        "name": "Philippe Alliot",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jonathan Palmer",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Huub Rothengatter",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Elio de Angelis",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Marc Surer",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Piercarlo Ghinzani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Allen Berg",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Alessandro Nannini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Alex Caffi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Ivan Capelli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 0
      }
    ]
  },
  {
    "year": 1987,
    "standings": [
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 73
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 61
      },
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 57
      },
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 46
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 36
      },
      {
        "name": "Stefan Johansson",
        "nationalityCode": "SWE",
        "points": 30
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 17
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 16
      },
      {
        "name": "Teo Fabi",
        "nationalityCode": "ITA",
        "points": 12
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 8
      },
      {
        "name": "Jonathan Palmer",
        "nationalityCode": "GBR",
        "points": 7
      },
      {
        "name": "Satoru Nakajima",
        "nationalityCode": "JPN",
        "points": 7
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Philippe Streiff",
        "nationalityCode": "FRA",
        "points": 4
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Philippe Alliot",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Ivan Capelli",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Roberto Moreno",
        "nationalityCode": "BRA",
        "points": 1
      },
      {
        "name": "Yannick Dalmas",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Christian Danner",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Piercarlo Ghinzani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Pascal Fabre",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Alessandro Nannini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Alex Caffi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Adrián Campos",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Franco Forini",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Gabriele Tarquini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Stefano Modena",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Nicola Larini",
        "nationalityCode": "ITA",
        "points": 0
      }
    ]
  },
  {
    "year": 1988,
    "standings": [
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 90
      },
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 87
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 41
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 27
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 24
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 22
      },
      {
        "name": "Ivan Capelli",
        "nationalityCode": "ITA",
        "points": 17
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 17
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 12
      },
      {
        "name": "Alessandro Nannini",
        "nationalityCode": "ITA",
        "points": 12
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 8
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Maurício Gugelmin",
        "nationalityCode": "BRA",
        "points": 5
      },
      {
        "name": "Jonathan Palmer",
        "nationalityCode": "GBR",
        "points": 5
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Satoru Nakajima",
        "nationalityCode": "JPN",
        "points": 1
      },
      {
        "name": "Pierluigi Martini",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Yannick Dalmas",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Alex Caffi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Philippe Streiff",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Luis Pérez-Sala",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Gabriele Tarquini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Philippe Alliot",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Stefan Johansson",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Julian Bailey",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Nicola Larini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Stefano Modena",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jean-Louis Schlesser",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Bernd Schneider",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Oscar Larrauri",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Piercarlo Ghinzani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Adrián Campos",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Aguri Suzuki",
        "nationalityCode": "JPN",
        "points": 0
      }
    ]
  },
  {
    "year": 1989,
    "standings": [
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 76
      },
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 60
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 40
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 38
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 37
      },
      {
        "name": "Alessandro Nannini",
        "nationalityCode": "ITA",
        "points": 32
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 21
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 12
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 8
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 7
      },
      {
        "name": "Eddie Cheever",
        "nationalityCode": "USA",
        "points": 6
      },
      {
        "name": "Stefan Johansson",
        "nationalityCode": "SWE",
        "points": 6
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 5
      },
      {
        "name": "Pierluigi Martini",
        "nationalityCode": "ITA",
        "points": 5
      },
      {
        "name": "Maurício Gugelmin",
        "nationalityCode": "BRA",
        "points": 4
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Stefano Modena",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Alex Caffi",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Satoru Nakajima",
        "nationalityCode": "JPN",
        "points": 3
      },
      {
        "name": "Christian Danner",
        "nationalityCode": "DEU",
        "points": 3
      },
      {
        "name": "Emanuele Pirro",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "René Arnoux",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Jonathan Palmer",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Olivier Grouillard",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Gabriele Tarquini",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Luis Pérez-Sala",
        "nationalityCode": "ESP",
        "points": 1
      },
      {
        "name": "Philippe Alliot",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Ivan Capelli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Éric Bernard",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Bertrand Gachot",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Nicola Larini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Martin Donnelly",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Roberto Moreno",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Jyrki Järvilehto",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Piercarlo Ghinzani",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Bernd Schneider",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Pierre-Henri Raphanel",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Yannick Dalmas",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Paolo Barilla",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Volker Weidler",
        "nationalityCode": "DEU",
        "points": 0
      }
    ]
  },
  {
    "year": 1990,
    "standings": [
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 78
      },
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 71
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 43
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 43
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 37
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 34
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 23
      },
      {
        "name": "Alessandro Nannini",
        "nationalityCode": "ITA",
        "points": 21
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 13
      },
      {
        "name": "Ivan Capelli",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Roberto Moreno",
        "nationalityCode": "BRA",
        "points": 6
      },
      {
        "name": "Aguri Suzuki",
        "nationalityCode": "JPN",
        "points": 6
      },
      {
        "name": "Éric Bernard",
        "nationalityCode": "FRA",
        "points": 5
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Satoru Nakajima",
        "nationalityCode": "JPN",
        "points": 3
      },
      {
        "name": "Alex Caffi",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Stefano Modena",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Maurício Gugelmin",
        "nationalityCode": "BRA",
        "points": 1
      },
      {
        "name": "Nicola Larini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Martin Donnelly",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Pierluigi Martini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Gregor Foitek",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Philippe Alliot",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Yannick Dalmas",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Emanuele Pirro",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Paolo Barilla",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jyrki Järvilehto",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Bernd Schneider",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Olivier Grouillard",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Gabriele Tarquini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Gianni Morbidelli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "David Brabham",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 1991,
    "standings": [
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 96
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 72
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 53
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 43
      },
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 34
      },
      {
        "name": "Nelson Piquet",
        "nationalityCode": "BRA",
        "points": 26.5
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 21
      },
      {
        "name": "Stefano Modena",
        "nationalityCode": "ITA",
        "points": 10
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 9
      },
      {
        "name": "Roberto Moreno",
        "nationalityCode": "BRA",
        "points": 8
      },
      {
        "name": "Pierluigi Martini",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Jyrki Järvilehto",
        "nationalityCode": "FIN",
        "points": 4
      },
      {
        "name": "Bertrand Gachot",
        "nationalityCode": "BEL",
        "points": 4
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 4
      },
      {
        "name": "Satoru Nakajima",
        "nationalityCode": "JPN",
        "points": 2
      },
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 2
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Emanuele Pirro",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Mark Blundell",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Ivan Capelli",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Éric Bernard",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Aguri Suzuki",
        "nationalityCode": "JPN",
        "points": 1
      },
      {
        "name": "Julian Bailey",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Gianni Morbidelli",
        "nationalityCode": "ITA",
        "points": 0.5
      },
      {
        "name": "Maurício Gugelmin",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Nicola Larini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Érik Comas",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Gabriele Tarquini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Alessandro Zanardi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Eric van de Poele",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Alex Caffi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Olivier Grouillard",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Karl Wendlinger",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Stefan Johansson",
        "nationalityCode": "SWE",
        "points": 0
      }
    ]
  },
  {
    "year": 1992,
    "standings": [
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 108
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 56
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 53
      },
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 50
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 49
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 38
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 18
      },
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 11
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 8
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Érik Comas",
        "nationalityCode": "FRA",
        "points": 4
      },
      {
        "name": "Karl Wendlinger",
        "nationalityCode": "AUT",
        "points": 3
      },
      {
        "name": "Ivan Capelli",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 2
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Pierluigi Martini",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Stefano Modena",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Christian Fittipaldi",
        "nationalityCode": "BRA",
        "points": 1
      },
      {
        "name": "Bertrand Gachot",
        "nationalityCode": "BEL",
        "points": 1
      },
      {
        "name": "Aguri Suzuki",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Jyrki Järvilehto",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Gianni Morbidelli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Maurício Gugelmin",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Olivier Grouillard",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Ukyo Katayama",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Paul Belmondo",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Eric van de Poele",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Emanuele Naspetti",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Nicola Larini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Damon Hill",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jan Lammers",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Gabriele Tarquini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Andrea Chiesa",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Roberto Moreno",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Alessandro Zanardi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Perry McCarthy",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 1993,
    "standings": [
      {
        "name": "Alain Prost",
        "nationalityCode": "FRA",
        "points": 99
      },
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 73
      },
      {
        "name": "Damon Hill",
        "nationalityCode": "GBR",
        "points": 69
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 52
      },
      {
        "name": "Riccardo Patrese",
        "nationalityCode": "ITA",
        "points": 20
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 16
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 13
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 12
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 11
      },
      {
        "name": "Mark Blundell",
        "nationalityCode": "GBR",
        "points": 10
      },
      {
        "name": "Michael Andretti",
        "nationalityCode": "USA",
        "points": 7
      },
      {
        "name": "Karl Wendlinger",
        "nationalityCode": "AUT",
        "points": 7
      },
      {
        "name": "Jyrki Järvilehto",
        "nationalityCode": "FIN",
        "points": 5
      },
      {
        "name": "Christian Fittipaldi",
        "nationalityCode": "BRA",
        "points": 5
      },
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 4
      },
      {
        "name": "Derek Warwick",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Philippe Alliot",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 2
      },
      {
        "name": "Fabrizio Barbazza",
        "nationalityCode": "ITA",
        "points": 2
      },
      {
        "name": "Alessandro Zanardi",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Érik Comas",
        "nationalityCode": "FRA",
        "points": 1
      },
      {
        "name": "Eddie Irvine",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Pierluigi Martini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Aguri Suzuki",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Luca Badoer",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Thierry Boutsen",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Ukyo Katayama",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Pedro Lamy",
        "nationalityCode": "PRT",
        "points": 0
      },
      {
        "name": "Toshio Suzuki",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Jean-Marc Gounon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Ivan Capelli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Marco Apicella",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Emanuele Naspetti",
        "nationalityCode": "ITA",
        "points": 0
      }
    ]
  },
  {
    "year": 1994,
    "standings": [
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 92
      },
      {
        "name": "Damon Hill",
        "nationalityCode": "GBR",
        "points": 91
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 41
      },
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 26
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 24
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 19
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 16
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 14
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 13
      },
      {
        "name": "Jos Verstappen",
        "nationalityCode": "NLD",
        "points": 10
      },
      {
        "name": "Olivier Panis",
        "nationalityCode": "FRA",
        "points": 9
      },
      {
        "name": "Mark Blundell",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Heinz-Harald Frentzen",
        "nationalityCode": "DEU",
        "points": 7
      },
      {
        "name": "Nicola Larini",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Christian Fittipaldi",
        "nationalityCode": "BRA",
        "points": 6
      },
      {
        "name": "Eddie Irvine",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Ukyo Katayama",
        "nationalityCode": "JPN",
        "points": 5
      },
      {
        "name": "Éric Bernard",
        "nationalityCode": "FRA",
        "points": 4
      },
      {
        "name": "Karl Wendlinger",
        "nationalityCode": "AUT",
        "points": 4
      },
      {
        "name": "Andrea de Cesaris",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Pierluigi Martini",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "Gianni Morbidelli",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Érik Comas",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Jyrki Järvilehto",
        "nationalityCode": "FIN",
        "points": 1
      },
      {
        "name": "Michele Alboreto",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Olivier Beretta",
        "nationalityCode": "MCO",
        "points": 0
      },
      {
        "name": "Pedro Lamy",
        "nationalityCode": "PRT",
        "points": 0
      },
      {
        "name": "Jean-Marc Gounon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Alessandro Zanardi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "David Brabham",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Mika Salo",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Franck Lagorce",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Roland Ratzenberger",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Yannick Dalmas",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Philippe Adams",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Domenico Schiattarella",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Ayrton Senna",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Paul Belmondo",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Bertrand Gachot",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Jean-Denis Délétraz",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Aguri Suzuki",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Philippe Alliot",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Hideki Noda",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Taki Inoue",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Andrea Montermini",
        "nationalityCode": "ITA",
        "points": 0
      }
    ]
  },
  {
    "year": 1995,
    "standings": [
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 102
      },
      {
        "name": "Damon Hill",
        "nationalityCode": "GBR",
        "points": 69
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 49
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 45
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 42
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 31
      },
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 17
      },
      {
        "name": "Olivier Panis",
        "nationalityCode": "FRA",
        "points": 16
      },
      {
        "name": "Heinz-Harald Frentzen",
        "nationalityCode": "DEU",
        "points": 15
      },
      {
        "name": "Mark Blundell",
        "nationalityCode": "GBR",
        "points": 13
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 11
      },
      {
        "name": "Eddie Irvine",
        "nationalityCode": "GBR",
        "points": 10
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 7
      },
      {
        "name": "Gianni Morbidelli",
        "nationalityCode": "ITA",
        "points": 5
      },
      {
        "name": "Mika Salo",
        "nationalityCode": "FIN",
        "points": 5
      },
      {
        "name": "Jean-Christophe Boullion",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Aguri Suzuki",
        "nationalityCode": "JPN",
        "points": 1
      },
      {
        "name": "Pedro Lamy",
        "nationalityCode": "PRT",
        "points": 1
      },
      {
        "name": "Pierluigi Martini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Ukyo Katayama",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Pedro Diniz",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Massimiliano Papis",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Luca Badoer",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Taki Inoue",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Andrea Montermini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Bertrand Gachot",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Domenico Schiattarella",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Karl Wendlinger",
        "nationalityCode": "AUT",
        "points": 0
      },
      {
        "name": "Nigel Mansell",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Jan Magnussen",
        "nationalityCode": "DNK",
        "points": 0
      },
      {
        "name": "Jos Verstappen",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Roberto Moreno",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Gabriele Tarquini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jean-Denis Délétraz",
        "nationalityCode": "CHE",
        "points": 0
      },
      {
        "name": "Giovanni Lavaggi",
        "nationalityCode": "ITA",
        "points": 0
      }
    ]
  },
  {
    "year": 1996,
    "standings": [
      {
        "name": "Damon Hill",
        "nationalityCode": "GBR",
        "points": 97
      },
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 78
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 59
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 47
      },
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 31
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 21
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 18
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 14
      },
      {
        "name": "Olivier Panis",
        "nationalityCode": "FRA",
        "points": 13
      },
      {
        "name": "Eddie Irvine",
        "nationalityCode": "GBR",
        "points": 11
      },
      {
        "name": "Martin Brundle",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Heinz-Harald Frentzen",
        "nationalityCode": "DEU",
        "points": 7
      },
      {
        "name": "Mika Salo",
        "nationalityCode": "FIN",
        "points": 5
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Pedro Diniz",
        "nationalityCode": "BRA",
        "points": 2
      },
      {
        "name": "Jos Verstappen",
        "nationalityCode": "NLD",
        "points": 1
      },
      {
        "name": "Ukyo Katayama",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Ricardo Rosset",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Pedro Lamy",
        "nationalityCode": "PRT",
        "points": 0
      },
      {
        "name": "Luca Badoer",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Giovanni Lavaggi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Andrea Montermini",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Tarso Marques",
        "nationalityCode": "BRA",
        "points": 0
      }
    ]
  },
  {
    "year": 1997,
    "standings": [
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 81
      },
      {
        "name": "Heinz-Harald Frentzen",
        "nationalityCode": "DEU",
        "points": 42
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 36
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 36
      },
      {
        "name": "Gerhard Berger",
        "nationalityCode": "AUT",
        "points": 27
      },
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 27
      },
      {
        "name": "Eddie Irvine",
        "nationalityCode": "GBR",
        "points": 24
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 20
      },
      {
        "name": "Olivier Panis",
        "nationalityCode": "FRA",
        "points": 16
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 15
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 13
      },
      {
        "name": "Damon Hill",
        "nationalityCode": "GBR",
        "points": 7
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 6
      },
      {
        "name": "Alexander Wurz",
        "nationalityCode": "AUT",
        "points": 4
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Pedro Diniz",
        "nationalityCode": "BRA",
        "points": 2
      },
      {
        "name": "Mika Salo",
        "nationalityCode": "FIN",
        "points": 2
      },
      {
        "name": "Shinji Nakano",
        "nationalityCode": "JPN",
        "points": 2
      },
      {
        "name": "Nicola Larini",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 78
      },
      {
        "name": "Jan Magnussen",
        "nationalityCode": "DNK",
        "points": 0
      },
      {
        "name": "Jos Verstappen",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Gianni Morbidelli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Norberto Fontana",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Ukyo Katayama",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Tarso Marques",
        "nationalityCode": "BRA",
        "points": 0
      }
    ]
  },
  {
    "year": 1998,
    "standings": [
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 100
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 86
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 56
      },
      {
        "name": "Eddie Irvine",
        "nationalityCode": "GBR",
        "points": 47
      },
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 21
      },
      {
        "name": "Damon Hill",
        "nationalityCode": "GBR",
        "points": 20
      },
      {
        "name": "Heinz-Harald Frentzen",
        "nationalityCode": "DEU",
        "points": 17
      },
      {
        "name": "Alexander Wurz",
        "nationalityCode": "AUT",
        "points": 17
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 16
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 14
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 9
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 4
      },
      {
        "name": "Mika Salo",
        "nationalityCode": "FIN",
        "points": 3
      },
      {
        "name": "Pedro Diniz",
        "nationalityCode": "BRA",
        "points": 3
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Jan Magnussen",
        "nationalityCode": "DNK",
        "points": 1
      },
      {
        "name": "Shinji Nakano",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Esteban Tuero",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Ricardo Rosset",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Toranosuke Takagi",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Olivier Panis",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jos Verstappen",
        "nationalityCode": "NLD",
        "points": 0
      }
    ]
  },
  {
    "year": 1999,
    "standings": [
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 76
      },
      {
        "name": "Eddie Irvine",
        "nationalityCode": "GBR",
        "points": 74
      },
      {
        "name": "Heinz-Harald Frentzen",
        "nationalityCode": "DEU",
        "points": 54
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 48
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 44
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 35
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 21
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 15
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 13
      },
      {
        "name": "Mika Salo",
        "nationalityCode": "FIN",
        "points": 10
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 7
      },
      {
        "name": "Damon Hill",
        "nationalityCode": "GBR",
        "points": 7
      },
      {
        "name": "Alexander Wurz",
        "nationalityCode": "AUT",
        "points": 3
      },
      {
        "name": "Pedro Diniz",
        "nationalityCode": "BRA",
        "points": 3
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Olivier Panis",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Marc Gené",
        "nationalityCode": "ESP",
        "points": 1
      },
      {
        "name": "Pedro de la Rosa",
        "nationalityCode": "ESP",
        "points": 1
      },
      {
        "name": "Alessandro Zanardi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Toranosuke Takagi",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Ricardo Zonta",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Luca Badoer",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Stéphane Sarrazin",
        "nationalityCode": "FRA",
        "points": 0
      }
    ]
  },
  {
    "year": 2000,
    "standings": [
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 108
      },
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 89
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 73
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 62
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 24
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 18
      },
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 17
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 12
      },
      {
        "name": "Heinz-Harald Frentzen",
        "nationalityCode": "DEU",
        "points": 11
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 6
      },
      {
        "name": "Mika Salo",
        "nationalityCode": "FIN",
        "points": 6
      },
      {
        "name": "Jos Verstappen",
        "nationalityCode": "NLD",
        "points": 5
      },
      {
        "name": "Eddie Irvine",
        "nationalityCode": "GBR",
        "points": 4
      },
      {
        "name": "Ricardo Zonta",
        "nationalityCode": "BRA",
        "points": 3
      },
      {
        "name": "Alexander Wurz",
        "nationalityCode": "AUT",
        "points": 2
      },
      {
        "name": "Pedro de la Rosa",
        "nationalityCode": "ESP",
        "points": 2
      },
      {
        "name": "Johnny Herbert",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Pedro Diniz",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Marc Gené",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Gastón Mazzacane",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Luciano Burti",
        "nationalityCode": "BRA",
        "points": 0
      }
    ]
  },
  {
    "year": 2001,
    "standings": [
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 123
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 65
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 56
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 49
      },
      {
        "name": "Mika Häkkinen",
        "nationalityCode": "FIN",
        "points": 37
      },
      {
        "name": "Juan Pablo Montoya",
        "nationalityCode": "COL",
        "points": 31
      },
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 12
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 12
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 12
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 9
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 8
      },
      {
        "name": "Eddie Irvine",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Heinz-Harald Frentzen",
        "nationalityCode": "DEU",
        "points": 6
      },
      {
        "name": "Olivier Panis",
        "nationalityCode": "FRA",
        "points": 5
      },
      {
        "name": "Jean Alesi",
        "nationalityCode": "FRA",
        "points": 5
      },
      {
        "name": "Pedro de la Rosa",
        "nationalityCode": "ESP",
        "points": 3
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 2
      },
      {
        "name": "Jos Verstappen",
        "nationalityCode": "NLD",
        "points": 1
      },
      {
        "name": "Ricardo Zonta",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Luciano Burti",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Enrique Bernoldi",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Tarso Marques",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Tomáš Enge",
        "nationalityCode": "CZE",
        "points": 0
      },
      {
        "name": "Gastón Mazzacane",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Alex Yoong",
        "nationalityCode": "MYS",
        "points": 0
      }
    ]
  },
  {
    "year": 2002,
    "standings": [
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 144
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 77
      },
      {
        "name": "Juan Pablo Montoya",
        "nationalityCode": "COL",
        "points": 50
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 42
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 41
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 24
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 14
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 9
      },
      {
        "name": "Eddie Irvine",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 7
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 7
      },
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 4
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 4
      },
      {
        "name": "Olivier Panis",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Takuma Sato",
        "nationalityCode": "JPN",
        "points": 2
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 2
      },
      {
        "name": "Mika Salo",
        "nationalityCode": "FIN",
        "points": 2
      },
      {
        "name": "Heinz-Harald Frentzen",
        "nationalityCode": "DEU",
        "points": 2
      },
      {
        "name": "Allan McNish",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Alex Yoong",
        "nationalityCode": "MYS",
        "points": 0
      },
      {
        "name": "Pedro de la Rosa",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Enrique Bernoldi",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Anthony Davidson",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 2003,
    "standings": [
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 93
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 91
      },
      {
        "name": "Juan Pablo Montoya",
        "nationalityCode": "COL",
        "points": 82
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 65
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 58
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 55
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 51
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 33
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 17
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 17
      },
      {
        "name": "Heinz-Harald Frentzen",
        "nationalityCode": "DEU",
        "points": 13
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 12
      },
      {
        "name": "Cristiano da Matta",
        "nationalityCode": "BRA",
        "points": 10
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 6
      },
      {
        "name": "Olivier Panis",
        "nationalityCode": "FRA",
        "points": 6
      },
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 6
      },
      {
        "name": "Marc Gené",
        "nationalityCode": "ESP",
        "points": 4
      },
      {
        "name": "Takuma Sato",
        "nationalityCode": "JPN",
        "points": 3
      },
      {
        "name": "Ralph Firman",
        "nationalityCode": "IRL",
        "points": 1
      },
      {
        "name": "Justin Wilson",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Antônio Pizzonia",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Jos Verstappen",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Nicolas Kiesa",
        "nationalityCode": "DNK",
        "points": 0
      },
      {
        "name": "Zsolt Baumgartner",
        "nationalityCode": "HUN",
        "points": 0
      }
    ]
  },
  {
    "year": 2004,
    "standings": [
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 148
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 114
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 85
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 59
      },
      {
        "name": "Juan Pablo Montoya",
        "nationalityCode": "COL",
        "points": 58
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 46
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 45
      },
      {
        "name": "Takuma Sato",
        "nationalityCode": "JPN",
        "points": 34
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 24
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 24
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 22
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 12
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 7
      },
      {
        "name": "Olivier Panis",
        "nationalityCode": "FRA",
        "points": 6
      },
      {
        "name": "Antônio Pizzonia",
        "nationalityCode": "BRA",
        "points": 6
      },
      {
        "name": "Christian Klien",
        "nationalityCode": "AUT",
        "points": 3
      },
      {
        "name": "Cristiano da Matta",
        "nationalityCode": "BRA",
        "points": 3
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 3
      },
      {
        "name": "Timo Glock",
        "nationalityCode": "DEU",
        "points": 2
      },
      {
        "name": "Zsolt Baumgartner",
        "nationalityCode": "HUN",
        "points": 1
      },
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Ricardo Zonta",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Marc Gené",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Giorgio Pantano",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Gianmaria Bruni",
        "nationalityCode": "ITA",
        "points": 0
      }
    ]
  },
  {
    "year": 2005,
    "standings": [
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 133
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 112
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 62
      },
      {
        "name": "Juan Pablo Montoya",
        "nationalityCode": "COL",
        "points": 60
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 58
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 45
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 43
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 38
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 37
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 36
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 28
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 24
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 11
      },
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 9
      },
      {
        "name": "Christian Klien",
        "nationalityCode": "AUT",
        "points": 9
      },
      {
        "name": "Tiago Monteiro",
        "nationalityCode": "PRT",
        "points": 7
      },
      {
        "name": "Alexander Wurz",
        "nationalityCode": "AUT",
        "points": 6
      },
      {
        "name": "Narain Karthikeyan",
        "nationalityCode": "IND",
        "points": 5
      },
      {
        "name": "Christijan Albers",
        "nationalityCode": "NLD",
        "points": 4
      },
      {
        "name": "Pedro de la Rosa",
        "nationalityCode": "ESP",
        "points": 4
      },
      {
        "name": "Patrick Friesacher",
        "nationalityCode": "AUT",
        "points": 3
      },
      {
        "name": "Antônio Pizzonia",
        "nationalityCode": "BRA",
        "points": 2
      },
      {
        "name": "Takuma Sato",
        "nationalityCode": "JPN",
        "points": 1
      },
      {
        "name": "Vitantonio Liuzzi",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Robert Doornbos",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Ricardo Zonta",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Anthony Davidson",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 2006,
    "standings": [
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 134
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 121
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 80
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 72
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 65
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 56
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 30
      },
      {
        "name": "Juan Pablo Montoya",
        "nationalityCode": "COL",
        "points": 26
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 23
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 20
      },
      {
        "name": "Pedro de la Rosa",
        "nationalityCode": "ESP",
        "points": 19
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 15
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 14
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 7
      },
      {
        "name": "Jacques Villeneuve",
        "nationalityCode": "CAN",
        "points": 7
      },
      {
        "name": "Robert Kubica",
        "nationalityCode": "POL",
        "points": 6
      },
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 4
      },
      {
        "name": "Christian Klien",
        "nationalityCode": "AUT",
        "points": 2
      },
      {
        "name": "Vitantonio Liuzzi",
        "nationalityCode": "ITA",
        "points": 1
      },
      {
        "name": "Scott Speed",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Tiago Monteiro",
        "nationalityCode": "PRT",
        "points": 0
      },
      {
        "name": "Christijan Albers",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Takuma Sato",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Robert Doornbos",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Yuji Ide",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Sakon Yamamoto",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Franck Montagny",
        "nationalityCode": "FRA",
        "points": 0
      }
    ]
  },
  {
    "year": 2007,
    "standings": [
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 110
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 109
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 109
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 94
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 61
      },
      {
        "name": "Robert Kubica",
        "nationalityCode": "POL",
        "points": 39
      },
      {
        "name": "Heikki Kovalainen",
        "nationalityCode": "FIN",
        "points": 30
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 21
      },
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 20
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 14
      },
      {
        "name": "Alexander Wurz",
        "nationalityCode": "AUT",
        "points": 13
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 10
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 8
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 6
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 6
      },
      {
        "name": "Ralf Schumacher",
        "nationalityCode": "DEU",
        "points": 5
      },
      {
        "name": "Takuma Sato",
        "nationalityCode": "JPN",
        "points": 4
      },
      {
        "name": "Vitantonio Liuzzi",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Adrian Sutil",
        "nationalityCode": "DEU",
        "points": 1
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Scott Speed",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Kazuki Nakajima",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Anthony Davidson",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Sakon Yamamoto",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Christijan Albers",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Markus Winkelhock",
        "nationalityCode": "DEU",
        "points": 0
      }
    ]
  },
  {
    "year": 2008,
    "standings": [
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 98
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 97
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 75
      },
      {
        "name": "Robert Kubica",
        "nationalityCode": "POL",
        "points": 75
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 61
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 60
      },
      {
        "name": "Heikki Kovalainen",
        "nationalityCode": "FIN",
        "points": 53
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 35
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 31
      },
      {
        "name": "Timo Glock",
        "nationalityCode": "DEU",
        "points": 25
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 21
      },
      {
        "name": "Nelson Piquet Jr.",
        "nationalityCode": "BRA",
        "points": 19
      },
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 17
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 11
      },
      {
        "name": "Kazuki Nakajima",
        "nationalityCode": "JPN",
        "points": 9
      },
      {
        "name": "David Coulthard",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Sébastien Bourdais",
        "nationalityCode": "FRA",
        "points": 4
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Adrian Sutil",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Takuma Sato",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Anthony Davidson",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 2009,
    "standings": [
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 95
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 84
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 77
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 69.5
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 49
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 48
      },
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 34.5
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 32.5
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 26
      },
      {
        "name": "Timo Glock",
        "nationalityCode": "DEU",
        "points": 24
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 22
      },
      {
        "name": "Heikki Kovalainen",
        "nationalityCode": "FIN",
        "points": 22
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 19
      },
      {
        "name": "Robert Kubica",
        "nationalityCode": "POL",
        "points": 17
      },
      {
        "name": "Giancarlo Fisichella",
        "nationalityCode": "ITA",
        "points": 8
      },
      {
        "name": "Sébastien Buemi",
        "nationalityCode": "CHE",
        "points": 6
      },
      {
        "name": "Adrian Sutil",
        "nationalityCode": "DEU",
        "points": 5
      },
      {
        "name": "Kamui Kobayashi",
        "nationalityCode": "JPN",
        "points": 3
      },
      {
        "name": "Sébastien Bourdais",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Kazuki Nakajima",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Nelson Piquet Jr.",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Vitantonio Liuzzi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Romain Grosjean",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Jaime Alguersuari",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Luca Badoer",
        "nationalityCode": "ITA",
        "points": 0
      }
    ]
  },
  {
    "year": 2010,
    "standings": [
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 256
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 252
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 242
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 240
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 214
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 144
      },
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 142
      },
      {
        "name": "Robert Kubica",
        "nationalityCode": "POL",
        "points": 136
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 72
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 47
      },
      {
        "name": "Adrian Sutil",
        "nationalityCode": "DEU",
        "points": 47
      },
      {
        "name": "Kamui Kobayashi",
        "nationalityCode": "JPN",
        "points": 32
      },
      {
        "name": "Vitaly Petrov",
        "nationalityCode": "RUS",
        "points": 27
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 22
      },
      {
        "name": "Vitantonio Liuzzi",
        "nationalityCode": "ITA",
        "points": 21
      },
      {
        "name": "Sébastien Buemi",
        "nationalityCode": "CHE",
        "points": 8
      },
      {
        "name": "Pedro de la Rosa",
        "nationalityCode": "ESP",
        "points": 6
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 6
      },
      {
        "name": "Jaime Alguersuari",
        "nationalityCode": "ESP",
        "points": 5
      },
      {
        "name": "Heikki Kovalainen",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Karun Chandhok",
        "nationalityCode": "IND",
        "points": 0
      },
      {
        "name": "Bruno Senna",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Lucas di Grassi",
        "nationalityCode": "BRA",
        "points": 0
      },
      {
        "name": "Timo Glock",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Sakon Yamamoto",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Christian Klien",
        "nationalityCode": "AUT",
        "points": 0
      }
    ]
  },
  {
    "year": 2011,
    "standings": [
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 392
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 270
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 258
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 257
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 227
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 118
      },
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 89
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 76
      },
      {
        "name": "Adrian Sutil",
        "nationalityCode": "DEU",
        "points": 42
      },
      {
        "name": "Vitaly Petrov",
        "nationalityCode": "RUS",
        "points": 37
      },
      {
        "name": "Nick Heidfeld",
        "nationalityCode": "DEU",
        "points": 34
      },
      {
        "name": "Kamui Kobayashi",
        "nationalityCode": "JPN",
        "points": 30
      },
      {
        "name": "Paul di Resta",
        "nationalityCode": "GBR",
        "points": 27
      },
      {
        "name": "Jaime Alguersuari",
        "nationalityCode": "ESP",
        "points": 26
      },
      {
        "name": "Sébastien Buemi",
        "nationalityCode": "CHE",
        "points": 15
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 14
      },
      {
        "name": "Rubens Barrichello",
        "nationalityCode": "BRA",
        "points": 4
      },
      {
        "name": "Bruno Senna",
        "nationalityCode": "BRA",
        "points": 2
      },
      {
        "name": "Pastor Maldonado",
        "nationalityCode": "VEN",
        "points": 1
      },
      {
        "name": "Pedro de la Rosa",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Jarno Trulli",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Heikki Kovalainen",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Vitantonio Liuzzi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Jérôme d'Ambrosio",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Timo Glock",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Narain Karthikeyan",
        "nationalityCode": "IND",
        "points": 0
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 0
      },
      {
        "name": "Karun Chandhok",
        "nationalityCode": "IND",
        "points": 0
      }
    ]
  },
  {
    "year": 2012,
    "standings": [
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 281
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 278
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 207
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 190
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 188
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 179
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 122
      },
      {
        "name": "Romain Grosjean",
        "nationalityCode": "FRA",
        "points": 96
      },
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 93
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 66
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 63
      },
      {
        "name": "Kamui Kobayashi",
        "nationalityCode": "JPN",
        "points": 60
      },
      {
        "name": "Michael Schumacher",
        "nationalityCode": "DEU",
        "points": 49
      },
      {
        "name": "Paul di Resta",
        "nationalityCode": "GBR",
        "points": 46
      },
      {
        "name": "Pastor Maldonado",
        "nationalityCode": "VEN",
        "points": 45
      },
      {
        "name": "Bruno Senna",
        "nationalityCode": "BRA",
        "points": 31
      },
      {
        "name": "Jean-Éric Vergne",
        "nationalityCode": "FRA",
        "points": 16
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 10
      },
      {
        "name": "Vitaly Petrov",
        "nationalityCode": "RUS",
        "points": 0
      },
      {
        "name": "Timo Glock",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Charles Pic",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Heikki Kovalainen",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Jérôme d'Ambrosio",
        "nationalityCode": "BEL",
        "points": 0
      },
      {
        "name": "Narain Karthikeyan",
        "nationalityCode": "IND",
        "points": 0
      },
      {
        "name": "Pedro de la Rosa",
        "nationalityCode": "ESP",
        "points": 0
      }
    ]
  },
  {
    "year": 2013,
    "standings": [
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 397
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 242
      },
      {
        "name": "Mark Webber",
        "nationalityCode": "AUS",
        "points": 199
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 189
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 183
      },
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 171
      },
      {
        "name": "Romain Grosjean",
        "nationalityCode": "FRA",
        "points": 132
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 112
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 73
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 51
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 49
      },
      {
        "name": "Paul di Resta",
        "nationalityCode": "GBR",
        "points": 48
      },
      {
        "name": "Adrian Sutil",
        "nationalityCode": "DEU",
        "points": 29
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 20
      },
      {
        "name": "Jean-Éric Vergne",
        "nationalityCode": "FRA",
        "points": 13
      },
      {
        "name": "Esteban Gutiérrez",
        "nationalityCode": "MEX",
        "points": 6
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 4
      },
      {
        "name": "Pastor Maldonado",
        "nationalityCode": "VEN",
        "points": 1
      },
      {
        "name": "Jules Bianchi",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Charles Pic",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Giedo van der Garde",
        "nationalityCode": "NLD",
        "points": 0
      },
      {
        "name": "Heikki Kovalainen",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Max Chilton",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 2014,
    "standings": [
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 384
      },
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 317
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 238
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 186
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 167
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 161
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 134
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 126
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 96
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 59
      },
      {
        "name": "Kevin Magnussen",
        "nationalityCode": "DNK",
        "points": 55
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 55
      },
      {
        "name": "Jean-Éric Vergne",
        "nationalityCode": "FRA",
        "points": 22
      },
      {
        "name": "Romain Grosjean",
        "nationalityCode": "FRA",
        "points": 8
      },
      {
        "name": "Daniil Kvyat",
        "nationalityCode": "RUS",
        "points": 8
      },
      {
        "name": "Pastor Maldonado",
        "nationalityCode": "VEN",
        "points": 2
      },
      {
        "name": "Jules Bianchi",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Adrian Sutil",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Marcus Ericsson",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Esteban Gutiérrez",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Max Chilton",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Kamui Kobayashi",
        "nationalityCode": "JPN",
        "points": 0
      },
      {
        "name": "Will Stevens",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "André Lotterer",
        "nationalityCode": "DEU",
        "points": 0
      }
    ]
  },
  {
    "year": 2015,
    "standings": [
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 381
      },
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 322
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 278
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 150
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 136
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 121
      },
      {
        "name": "Daniil Kvyat",
        "nationalityCode": "RUS",
        "points": 95
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 92
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 78
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 58
      },
      {
        "name": "Romain Grosjean",
        "nationalityCode": "FRA",
        "points": 51
      },
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 49
      },
      {
        "name": "Felipe Nasr",
        "nationalityCode": "BRA",
        "points": 27
      },
      {
        "name": "Pastor Maldonado",
        "nationalityCode": "VEN",
        "points": 27
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 18
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 16
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 11
      },
      {
        "name": "Marcus Ericsson",
        "nationalityCode": "SWE",
        "points": 9
      },
      {
        "name": "Roberto Merhi",
        "nationalityCode": "ESP",
        "points": 0
      },
      {
        "name": "Alexander Rossi",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Will Stevens",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Kevin Magnussen",
        "nationalityCode": "DNK",
        "points": 0
      }
    ]
  },
  {
    "year": 2016,
    "standings": [
      {
        "name": "Nico Rosberg",
        "nationalityCode": "DEU",
        "points": 385
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 380
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 256
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 212
      },
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 204
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 186
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 101
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 85
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 72
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 54
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 53
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 46
      },
      {
        "name": "Romain Grosjean",
        "nationalityCode": "FRA",
        "points": 29
      },
      {
        "name": "Daniil Kvyat",
        "nationalityCode": "RUS",
        "points": 25
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 21
      },
      {
        "name": "Kevin Magnussen",
        "nationalityCode": "DNK",
        "points": 7
      },
      {
        "name": "Felipe Nasr",
        "nationalityCode": "BRA",
        "points": 2
      },
      {
        "name": "Jolyon Palmer",
        "nationalityCode": "GBR",
        "points": 1
      },
      {
        "name": "Pascal Wehrlein",
        "nationalityCode": "DEU",
        "points": 1
      },
      {
        "name": "Stoffel Vandoorne",
        "nationalityCode": "BEL",
        "points": 1
      },
      {
        "name": "Esteban Gutiérrez",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Marcus Ericsson",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Esteban Ocon",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Rio Haryanto",
        "nationalityCode": "IDN",
        "points": 0
      }
    ]
  },
  {
    "year": 2017,
    "standings": [
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 363
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 317
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 305
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 205
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 200
      },
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 168
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 100
      },
      {
        "name": "Esteban Ocon",
        "nationalityCode": "FRA",
        "points": 87
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 54
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 43
      },
      {
        "name": "Felipe Massa",
        "nationalityCode": "BRA",
        "points": 43
      },
      {
        "name": "Lance Stroll",
        "nationalityCode": "CAN",
        "points": 40
      },
      {
        "name": "Romain Grosjean",
        "nationalityCode": "FRA",
        "points": 28
      },
      {
        "name": "Kevin Magnussen",
        "nationalityCode": "DNK",
        "points": 19
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 17
      },
      {
        "name": "Stoffel Vandoorne",
        "nationalityCode": "BEL",
        "points": 13
      },
      {
        "name": "Jolyon Palmer",
        "nationalityCode": "GBR",
        "points": 8
      },
      {
        "name": "Pascal Wehrlein",
        "nationalityCode": "DEU",
        "points": 5
      },
      {
        "name": "Daniil Kvyat",
        "nationalityCode": "RUS",
        "points": 5
      },
      {
        "name": "Marcus Ericsson",
        "nationalityCode": "SWE",
        "points": 0
      },
      {
        "name": "Pierre Gasly",
        "nationalityCode": "FRA",
        "points": 0
      },
      {
        "name": "Antonio Giovinazzi",
        "nationalityCode": "ITA",
        "points": 0
      },
      {
        "name": "Brendon Hartley",
        "nationalityCode": "NZL",
        "points": 0
      },
      {
        "name": "Jenson Button",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Paul di Resta",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 2018,
    "standings": [
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 408
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 320
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 251
      },
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 249
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 247
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 170
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 69
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 62
      },
      {
        "name": "Kevin Magnussen",
        "nationalityCode": "DNK",
        "points": 56
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 53
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 50
      },
      {
        "name": "Esteban Ocon",
        "nationalityCode": "FRA",
        "points": 49
      },
      {
        "name": "Charles Leclerc",
        "nationalityCode": "MCO",
        "points": 39
      },
      {
        "name": "Romain Grosjean",
        "nationalityCode": "FRA",
        "points": 37
      },
      {
        "name": "Pierre Gasly",
        "nationalityCode": "FRA",
        "points": 29
      },
      {
        "name": "Stoffel Vandoorne",
        "nationalityCode": "BEL",
        "points": 12
      },
      {
        "name": "Marcus Ericsson",
        "nationalityCode": "SWE",
        "points": 9
      },
      {
        "name": "Lance Stroll",
        "nationalityCode": "CAN",
        "points": 6
      },
      {
        "name": "Brendon Hartley",
        "nationalityCode": "NZL",
        "points": 4
      },
      {
        "name": "Sergey Sirotkin",
        "nationalityCode": "RUS",
        "points": 1
      }
    ]
  },
  {
    "year": 2019,
    "standings": [
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 413
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 326
      },
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 278
      },
      {
        "name": "Charles Leclerc",
        "nationalityCode": "MCO",
        "points": 264
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 240
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 96
      },
      {
        "name": "Pierre Gasly",
        "nationalityCode": "FRA",
        "points": 95
      },
      {
        "name": "Alexander Albon",
        "nationalityCode": "THA",
        "points": 92
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 54
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 52
      },
      {
        "name": "Lando Norris",
        "nationalityCode": "GBR",
        "points": 49
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 43
      },
      {
        "name": "Daniil Kvyat",
        "nationalityCode": "RUS",
        "points": 37
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 37
      },
      {
        "name": "Lance Stroll",
        "nationalityCode": "CAN",
        "points": 21
      },
      {
        "name": "Kevin Magnussen",
        "nationalityCode": "DNK",
        "points": 20
      },
      {
        "name": "Antonio Giovinazzi",
        "nationalityCode": "ITA",
        "points": 14
      },
      {
        "name": "Romain Grosjean",
        "nationalityCode": "FRA",
        "points": 8
      },
      {
        "name": "Robert Kubica",
        "nationalityCode": "POL",
        "points": 1
      },
      {
        "name": "George Russell",
        "nationalityCode": "GBR",
        "points": 0
      }
    ]
  },
  {
    "year": 2020,
    "standings": [
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 347
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 223
      },
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 214
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 125
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 119
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 105
      },
      {
        "name": "Alexander Albon",
        "nationalityCode": "THA",
        "points": 105
      },
      {
        "name": "Charles Leclerc",
        "nationalityCode": "MCO",
        "points": 98
      },
      {
        "name": "Lando Norris",
        "nationalityCode": "GBR",
        "points": 97
      },
      {
        "name": "Pierre Gasly",
        "nationalityCode": "FRA",
        "points": 75
      },
      {
        "name": "Lance Stroll",
        "nationalityCode": "CAN",
        "points": 75
      },
      {
        "name": "Esteban Ocon",
        "nationalityCode": "FRA",
        "points": 62
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 33
      },
      {
        "name": "Daniil Kvyat",
        "nationalityCode": "RUS",
        "points": 32
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 10
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 4
      },
      {
        "name": "Antonio Giovinazzi",
        "nationalityCode": "ITA",
        "points": 4
      },
      {
        "name": "George Russell",
        "nationalityCode": "GBR",
        "points": 3
      },
      {
        "name": "Romain Grosjean",
        "nationalityCode": "FRA",
        "points": 2
      },
      {
        "name": "Kevin Magnussen",
        "nationalityCode": "DNK",
        "points": 1
      },
      {
        "name": "Nicholas Latifi",
        "nationalityCode": "CAN",
        "points": 0
      },
      {
        "name": "Jack Aitken",
        "nationalityCode": "GBR",
        "points": 0
      },
      {
        "name": "Pietro Fittipaldi",
        "nationalityCode": "BRA",
        "points": 0
      }
    ]
  },
  {
    "year": 2021,
    "standings": [
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 395.5
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 387.5
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 226
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 190
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 164.5
      },
      {
        "name": "Lando Norris",
        "nationalityCode": "GBR",
        "points": 160
      },
      {
        "name": "Charles Leclerc",
        "nationalityCode": "MCO",
        "points": 159
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 115
      },
      {
        "name": "Pierre Gasly",
        "nationalityCode": "FRA",
        "points": 110
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 81
      },
      {
        "name": "Esteban Ocon",
        "nationalityCode": "FRA",
        "points": 74
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 43
      },
      {
        "name": "Lance Stroll",
        "nationalityCode": "CAN",
        "points": 34
      },
      {
        "name": "Yuki Tsunoda",
        "nationalityCode": "JPN",
        "points": 32
      },
      {
        "name": "George Russell",
        "nationalityCode": "GBR",
        "points": 16
      },
      {
        "name": "Kimi Räikkönen",
        "nationalityCode": "FIN",
        "points": 10
      },
      {
        "name": "Nicholas Latifi",
        "nationalityCode": "CAN",
        "points": 7
      },
      {
        "name": "Antonio Giovinazzi",
        "nationalityCode": "ITA",
        "points": 3
      },
      {
        "name": "Mick Schumacher",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Robert Kubica",
        "nationalityCode": "POL",
        "points": 0
      },
      {
        "name": "Nikita Mazepin",
        "nationalityCode": "RUS",
        "points": 0
      }
    ]
  },
  {
    "year": 2022,
    "standings": [
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 454
      },
      {
        "name": "Charles Leclerc",
        "nationalityCode": "MCO",
        "points": 308
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 305
      },
      {
        "name": "George Russell",
        "nationalityCode": "GBR",
        "points": 275
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 246
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 240
      },
      {
        "name": "Lando Norris",
        "nationalityCode": "GBR",
        "points": 122
      },
      {
        "name": "Esteban Ocon",
        "nationalityCode": "FRA",
        "points": 92
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 81
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 49
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 37
      },
      {
        "name": "Sebastian Vettel",
        "nationalityCode": "DEU",
        "points": 37
      },
      {
        "name": "Kevin Magnussen",
        "nationalityCode": "DNK",
        "points": 25
      },
      {
        "name": "Pierre Gasly",
        "nationalityCode": "FRA",
        "points": 23
      },
      {
        "name": "Lance Stroll",
        "nationalityCode": "CAN",
        "points": 18
      },
      {
        "name": "Mick Schumacher",
        "nationalityCode": "DEU",
        "points": 12
      },
      {
        "name": "Yuki Tsunoda",
        "nationalityCode": "JPN",
        "points": 12
      },
      {
        "name": "Guanyu Zhou",
        "nationalityCode": "CHN",
        "points": 6
      },
      {
        "name": "Alexander Albon",
        "nationalityCode": "THA",
        "points": 4
      },
      {
        "name": "Nicholas Latifi",
        "nationalityCode": "CAN",
        "points": 2
      },
      {
        "name": "Nyck de Vries",
        "nationalityCode": "NLD",
        "points": 2
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 0
      }
    ]
  },
  {
    "year": 2023,
    "standings": [
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 575
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 285
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 234
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 206
      },
      {
        "name": "Charles Leclerc",
        "nationalityCode": "MCO",
        "points": 206
      },
      {
        "name": "Lando Norris",
        "nationalityCode": "GBR",
        "points": 205
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 200
      },
      {
        "name": "George Russell",
        "nationalityCode": "GBR",
        "points": 175
      },
      {
        "name": "Oscar Piastri",
        "nationalityCode": "AUS",
        "points": 97
      },
      {
        "name": "Lance Stroll",
        "nationalityCode": "CAN",
        "points": 74
      },
      {
        "name": "Pierre Gasly",
        "nationalityCode": "FRA",
        "points": 62
      },
      {
        "name": "Esteban Ocon",
        "nationalityCode": "FRA",
        "points": 58
      },
      {
        "name": "Alexander Albon",
        "nationalityCode": "THA",
        "points": 27
      },
      {
        "name": "Yuki Tsunoda",
        "nationalityCode": "JPN",
        "points": 17
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 10
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 9
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 6
      },
      {
        "name": "Guanyu Zhou",
        "nationalityCode": "CHN",
        "points": 6
      },
      {
        "name": "Kevin Magnussen",
        "nationalityCode": "DNK",
        "points": 3
      },
      {
        "name": "Liam Lawson",
        "nationalityCode": "NZL",
        "points": 2
      },
      {
        "name": "Logan Sargeant",
        "nationalityCode": "USA",
        "points": 1
      },
      {
        "name": "Nyck de Vries",
        "nationalityCode": "NLD",
        "points": 0
      }
    ]
  },
  {
    "year": 2024,
    "standings": [
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 437
      },
      {
        "name": "Lando Norris",
        "nationalityCode": "GBR",
        "points": 374
      },
      {
        "name": "Charles Leclerc",
        "nationalityCode": "MCO",
        "points": 356
      },
      {
        "name": "Oscar Piastri",
        "nationalityCode": "AUS",
        "points": 292
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 290
      },
      {
        "name": "George Russell",
        "nationalityCode": "GBR",
        "points": 245
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 223
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 152
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 70
      },
      {
        "name": "Pierre Gasly",
        "nationalityCode": "FRA",
        "points": 42
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 41
      },
      {
        "name": "Yuki Tsunoda",
        "nationalityCode": "JPN",
        "points": 30
      },
      {
        "name": "Lance Stroll",
        "nationalityCode": "CAN",
        "points": 24
      },
      {
        "name": "Esteban Ocon",
        "nationalityCode": "FRA",
        "points": 23
      },
      {
        "name": "Kevin Magnussen",
        "nationalityCode": "DNK",
        "points": 16
      },
      {
        "name": "Alexander Albon",
        "nationalityCode": "THA",
        "points": 12
      },
      {
        "name": "Daniel Ricciardo",
        "nationalityCode": "AUS",
        "points": 12
      },
      {
        "name": "Oliver Bearman",
        "nationalityCode": "GBR",
        "points": 7
      },
      {
        "name": "Franco Colapinto",
        "nationalityCode": "ARG",
        "points": 5
      },
      {
        "name": "Guanyu Zhou",
        "nationalityCode": "CHN",
        "points": 4
      },
      {
        "name": "Liam Lawson",
        "nationalityCode": "NZL",
        "points": 4
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Logan Sargeant",
        "nationalityCode": "USA",
        "points": 0
      },
      {
        "name": "Jack Doohan",
        "nationalityCode": "AUS",
        "points": 0
      }
    ]
  },
  {
    "year": 2025,
    "standings": [
      {
        "name": "Lando Norris",
        "nationalityCode": "GBR",
        "points": 423
      },
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 421
      },
      {
        "name": "Oscar Piastri",
        "nationalityCode": "AUS",
        "points": 410
      },
      {
        "name": "George Russell",
        "nationalityCode": "GBR",
        "points": 319
      },
      {
        "name": "Charles Leclerc",
        "nationalityCode": "MCO",
        "points": 242
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 156
      },
      {
        "name": "Andrea Kimi Antonelli",
        "nationalityCode": "ITA",
        "points": 150
      },
      {
        "name": "Alexander Albon",
        "nationalityCode": "THA",
        "points": 73
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 64
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 56
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 51
      },
      {
        "name": "Isack Hadjar",
        "nationalityCode": "FRA",
        "points": 51
      },
      {
        "name": "Oliver Bearman",
        "nationalityCode": "GBR",
        "points": 41
      },
      {
        "name": "Liam Lawson",
        "nationalityCode": "NZL",
        "points": 38
      },
      {
        "name": "Esteban Ocon",
        "nationalityCode": "FRA",
        "points": 38
      },
      {
        "name": "Lance Stroll",
        "nationalityCode": "CAN",
        "points": 33
      },
      {
        "name": "Yuki Tsunoda",
        "nationalityCode": "JPN",
        "points": 33
      },
      {
        "name": "Pierre Gasly",
        "nationalityCode": "FRA",
        "points": 22
      },
      {
        "name": "Gabriel Bortoleto",
        "nationalityCode": "BRA",
        "points": 19
      },
      {
        "name": "Franco Colapinto",
        "nationalityCode": "ARG",
        "points": 0
      },
      {
        "name": "Jack Doohan",
        "nationalityCode": "AUS",
        "points": 0
      }
    ]
  },
  {
    "year": 2026,
    "standings": [
      {
        "name": "Andrea Kimi Antonelli",
        "nationalityCode": "ITA",
        "points": 179
      },
      {
        "name": "George Russell",
        "nationalityCode": "GBR",
        "points": 154
      },
      {
        "name": "Lewis Hamilton",
        "nationalityCode": "GBR",
        "points": 147
      },
      {
        "name": "Charles Leclerc",
        "nationalityCode": "MCO",
        "points": 108
      },
      {
        "name": "Lando Norris",
        "nationalityCode": "GBR",
        "points": 97
      },
      {
        "name": "Oscar Piastri",
        "nationalityCode": "AUS",
        "points": 82
      },
      {
        "name": "Max Verstappen",
        "nationalityCode": "NLD",
        "points": 76
      },
      {
        "name": "Isack Hadjar",
        "nationalityCode": "FRA",
        "points": 52
      },
      {
        "name": "Pierre Gasly",
        "nationalityCode": "FRA",
        "points": 42
      },
      {
        "name": "Liam Lawson",
        "nationalityCode": "NZL",
        "points": 39
      },
      {
        "name": "Arvid Lindblad",
        "nationalityCode": "GBR",
        "points": 20
      },
      {
        "name": "Oliver Bearman",
        "nationalityCode": "GBR",
        "points": 18
      },
      {
        "name": "Franco Colapinto",
        "nationalityCode": "ARG",
        "points": 18
      },
      {
        "name": "Gabriel Bortoleto",
        "nationalityCode": "BRA",
        "points": 6
      },
      {
        "name": "Carlos Sainz",
        "nationalityCode": "ESP",
        "points": 6
      },
      {
        "name": "Alexander Albon",
        "nationalityCode": "THA",
        "points": 5
      },
      {
        "name": "Esteban Ocon",
        "nationalityCode": "FRA",
        "points": 3
      },
      {
        "name": "Fernando Alonso",
        "nationalityCode": "ESP",
        "points": 1
      },
      {
        "name": "Nico Hülkenberg",
        "nationalityCode": "DEU",
        "points": 0
      },
      {
        "name": "Valtteri Bottas",
        "nationalityCode": "FIN",
        "points": 0
      },
      {
        "name": "Sergio Pérez",
        "nationalityCode": "MEX",
        "points": 0
      },
      {
        "name": "Lance Stroll",
        "nationalityCode": "CAN",
        "points": 0
      }
    ]
  }
];
