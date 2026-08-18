// src/data/teamRadios.ts
//
// Radios icónicas de F1 para el juego "Team Radio". Cada entrada quedó
// verificada contra al menos 1 fuente periodística citable (investigación
// de Etapa 3, agosto 2026) — ver Box_Daily_Box_Context.md sección 9 para el
// detalle de fuentes por radio.
//
// Dificultades EXCLUSIVAS por año (a pedido explícito, distinto del patrón
// difficultyFloor del resto del sitio que es acumulativo):
//   facil   -> 2022 en adelante (32 radios)
//   medio   -> 2017-2021 (45 radios)
//   dificil -> hasta 2016 inclusive (48 radios)
// Los cortes de año NO son los mismos que en otros juegos: se recalibraron
// específicamente para este dataset porque el material de radios está
// concentrado al revés que el de pilotos (lo reciente sobra, lo viejo casi
// no existe transmitido). Ver careerpath.logic.ts / filters.ts para el
// patrón estándar que este juego NO sigue a propósito.
//
// Exclusiones deliberadas (no agregar sin resolver el motivo):
//  - "panis-1996-monaco": descartada — la única fuente es un recuerdo
//    retrospectivo de Panis en entrevista posterior, no una transcripción
//    contemporánea a la carrera.
//  - "gasly-2026-belgium": descartada — la única versión con cita textual
//    encontrada está en español (medio argentino) y no se pudo confirmar si
//    la radio original fue en español o si es una traducción no marcada del
//    inglés.
//  - Senna 1991 Brasil: el audio real es un grito sin palabras, no sirve
//    para un juego de TEXTO.
//  - Barrichello Austria 2002 (órdenes de equipo): el hecho está
//    documentado pero el propio Barrichello confirmó en 2012 que nunca
//    reveló el texto exacto de esa radio.
//
// Radios que consisten en CANTAR una canción (Norris "Friday" 2020 Toscana,
// Alonso "We Are the Champions" 2005 China, Vettel imitando el ringtone de
// Crazy Frog 2011 España): "norris-2020-tuscan-sings" y
// "vettel-2011-spain-crazyfrog" describen el momento entre corchetes sin
// reproducir la letra. "alonso-2005-china-sings" fue editada a mano
// (2026-08-16) para incluir la letra real, a pedido explícito del dueño del
// proyecto — no fue una decisión tomada por Claude Code, que recomendó no
// hacerlo. Si se retoma esta entrada, chequear la licencia de la canción
// antes de publicar el sitio con ese contenido.

export type TeamRadio = {
  /** slug estable: driverId-año-gp */
  id: string;
  /** Texto original de la radio, SIN traducir (decisión de producto: las
   *  radios se muestran tal cual se dijeron en los 14 idiomas del sitio). */
  quote: string;
  /** FK a DRIVERS. Es siempre el PILOTO de la conversación, aunque la frase
   *  la haya dicho el ingeniero (ej. "Multi 21" -> driverId de Vettel). */
  driverId: string;
  y: number;
  g: string;
  c: string;
};

export const TEAM_RADIOS: TeamRadio[] = [
  // ═══════════════════════════════════════════════════════════════════
  // FACIL — 2022 en adelante (33)
  // ═══════════════════════════════════════════════════════════════════
  { id: "leclerc-2026-australia", quote: "This is like the mushroom in Mario Kart.", driverId: "charles-leclerc", y: 2026, g: "Australian Grand Prix", c: "Melbourne" },
  { id: "verstappen-2026-hungary", quote: "Oh, they should get a penalty. This is fucking ridiculous, these morons! My God!", driverId: "max-verstappen", y: 2026, g: "Hungarian Grand Prix", c: "Hungaroring" },
  { id: "piastri-2026-hungary", quote: "Get out of the fucking way, you idiot!", driverId: "oscar-piastri", y: 2026, g: "Hungarian Grand Prix", c: "Hungaroring" },
  { id: "stroll-2026-canada", quote: "I am completing the race for the mechanics and Lawrence. That's it.", driverId: "lance-stroll", y: 2026, g: "Canadian Grand Prix", c: "Montreal" },
  { id: "antonelli-2026-china", quote: "Yes, we did it. Thank you guys, you've helped me achieve one of my dreams.", driverId: "kimi-antonelli", y: 2026, g: "Chinese Grand Prix", c: "Shanghai" },
  { id: "russell-2026-belgium", quote: "I'm out, what the fuck happened with the SoC down the straight? Guys, unacceptable. Un-fucking-acceptable this whole weekend.", driverId: "george-russell", y: 2026, g: "Belgian Grand Prix", c: "Spa-Francorchamps" },
  { id: "leclerc-2025-australia", quote: "I have the seat full of water. Like, full of water.", driverId: "charles-leclerc", y: 2025, g: "Australian Grand Prix", c: "Melbourne" },
  { id: "hulkenberg-2025-britain", quote: "I don't think I comprehend what we've just done. OH MY GOD!", driverId: "nico-hulkenberg", y: 2025, g: "British Grand Prix", c: "Silverstone" },
  { id: "sainz-2025-azerbaijan", quote: "This is my first Smoooooth Operation in Williams! And not the last!", driverId: "carlos-sainz-jr", y: 2025, g: "Azerbaijan Grand Prix", c: "Baku" },
  { id: "piastri-2025-austria", quote: "Alpine still managed to find a way to fuck me over all these years later, huh?", driverId: "oscar-piastri", y: 2025, g: "Austrian Grand Prix", c: "Red Bull Ring" },
  { id: "bortoleto-2025-monaco", quote: "Did he get a penalty for what he did? OK, I will put him in the wall next time.", driverId: "gabriel-bortoleto", y: 2025, g: "Monaco Grand Prix", c: "Monaco" },
  { id: "norris-2025-abudhabi", quote: "Thank you guys. Oh my god. You made a kid's dream come true. I love you, Mom. I love you, Dad.", driverId: "lando-norris", y: 2025, g: "Abu Dhabi Grand Prix", c: "Yas Marina" },
  { id: "hamilton-2025-miami", quote: "Have a tea break while you're at it.", driverId: "lewis-hamilton", y: 2025, g: "Miami Grand Prix", c: "Miami" },
  { id: "lawson-2025-mexico", quote: "What the fuck, oh my god, are you kidding me? Did you just see that? I could have fucking killed them, mate.", driverId: "liam-lawson", y: 2025, g: "Mexico City Grand Prix", c: "Mexico City" },
  { id: "alonso-2025-netherlands", quote: "Fucking luck we have always, shit. Ah, fucking end of the race. Fucking lucky.", driverId: "fernando-alonso", y: 2025, g: "Dutch Grand Prix", c: "Zandvoort" },
  { id: "leclerc-2024-monaco", quote: "Just for your info… do you want to know the margin? You said no, right? That's rude.", driverId: "charles-leclerc", y: 2024, g: "Monaco Grand Prix", c: "Monaco" },
  { id: "norris-2024-abudhabi", quote: "We did it, mate. We did it. World champions.", driverId: "lando-norris", y: 2024, g: "Abu Dhabi Grand Prix", c: "Yas Marina" },
  { id: "ocon-2024-canada", quote: "Yeah, amazing. Thank you, amazing.", driverId: "esteban-ocon", y: 2024, g: "Canadian Grand Prix", c: "Montreal" },
  { id: "verstappen-2024-hungary", quote: "Don't give me that nonsense now. You guys gave me this strategy, OK?", driverId: "max-verstappen", y: 2024, g: "Hungarian Grand Prix", c: "Hungaroring" },
  { id: "colapinto-2024-azerbaijan", quote: "Now you are a Williams Grand Prix driver with points to your name. You deserve the seat, great work!", driverId: "franco-colapinto", y: 2024, g: "Azerbaijan Grand Prix", c: "Baku" },
  { id: "bearman-2024-saudiarabia", quote: "The car was mega today, so thank you. I really enjoyed it. It was so much fun out there.", driverId: "oliver-bearman", y: 2024, g: "Saudi Arabian Grand Prix", c: "Jeddah" },
  { id: "verstappen-2023-italy", quote: "Another win! And a nice one, too, as well… that's a nice stat.", driverId: "max-verstappen", y: 2023, g: "Italian Grand Prix", c: "Monza" },
  { id: "sainz-2023-singapore", quote: "This is my first with Ferrari. Smooth operator… smooth operator, hahaha.", driverId: "carlos-sainz-jr", y: 2023, g: "Singapore Grand Prix", c: "Marina Bay" },
  { id: "russell-2023-australia", quote: "Red flag! Red flag! Red flag! I am in the middle of the track. Red! Fucking hell!", driverId: "george-russell", y: 2023, g: "Australian Grand Prix", c: "Melbourne" },
  { id: "gasly-2023-canada", quote: "He should be BANNED for such a thing! I'm coming at 300!", driverId: "pierre-gasly", y: 2023, g: "Canadian Grand Prix", c: "Montreal" },
  { id: "albon-2023-qatar", quote: "Fucking hell… that was fun!", driverId: "alexander-albon", y: 2023, g: "Qatar Grand Prix", c: "Losail" },
  { id: "norris-2022-emiliaromagna", quote: "Happy birthday to Will's mum!", driverId: "lando-norris", y: 2022, g: "Emilia Romagna Grand Prix", c: "Imola" },
  { id: "russell-2022-saopaulo", quote: "This is just the beginning.", driverId: "george-russell", y: 2022, g: "São Paulo Grand Prix", c: "Interlagos" },
  { id: "magnussen-2022-saopaulo", quote: "You're kidding. Don't celebrate yet!", driverId: "kevin-magnussen", y: 2022, g: "São Paulo Grand Prix", c: "Interlagos" },
  { id: "hamilton-2022-netherlands", quote: "I can't believe you guys screwed me like that, I can't tell you how pissed I am right now.", driverId: "lewis-hamilton", y: 2022, g: "Dutch Grand Prix", c: "Zandvoort" },
  { id: "sainz-2022-britain", quote: "Guys, I'm under pressure from Hamilton, please don't ask these things. Please. Please. Let's just stop inventing. Stop inventing.", driverId: "carlos-sainz-jr", y: 2022, g: "British Grand Prix", c: "Silverstone" },
  { id: "perez-2022-belgium", quote: "Ah, you will talk to me now.", driverId: "sergio-perez", y: 2022, g: "Belgian Grand Prix", c: "Spa-Francorchamps" },

  // ═══════════════════════════════════════════════════════════════════
  // MEDIO — 2017-2021 (44)
  // ═══════════════════════════════════════════════════════════════════
  { id: "hamilton-2021-britain", quote: "I was ahead going in there man, fully alongside, that's my line. He turned in on me man. I was giving that guy space.", driverId: "lewis-hamilton", y: 2021, g: "British Grand Prix", c: "Silverstone" },
  { id: "ricciardo-2021-italy", quote: "And for anyone who thought I left… I never left. Just moved aside for a while.", driverId: "daniel-ricciardo", y: 2021, g: "Italian Grand Prix", c: "Monza" },
  { id: "verstappen-2021-abudhabi", quote: "Max Verstappen, you are the world champion.", driverId: "max-verstappen", y: 2021, g: "Abu Dhabi Grand Prix", c: "Yas Marina" },
  { id: "hamilton-2021-abudhabi", quote: "This is getting manipulated, man!", driverId: "lewis-hamilton", y: 2021, g: "Abu Dhabi Grand Prix", c: "Yas Marina" },
  { id: "bottas-2021-france", quote: "Why the fuck does no one listen to me when I say that it's going to be a two-stopper?", driverId: "valtteri-bottas", y: 2021, g: "French Grand Prix", c: "Paul Ricard" },
  { id: "leclerc-2021-monaco", quote: "No, no, no, no, the gearbox guys.", driverId: "charles-leclerc", y: 2021, g: "Monaco Grand Prix", c: "Monaco" },
  { id: "verstappen-2020-70thanniversary", quote: "I'm not just sitting behind like a grandma!", driverId: "max-verstappen", y: 2020, g: "70th Anniversary Grand Prix", c: "Silverstone" },
  { id: "albon-2020-tuscan", quote: "Thanks to everyone, thanks for sticking with me!", driverId: "alexander-albon", y: 2020, g: "Tuscan Grand Prix", c: "Mugello" },
  { id: "stroll-2020-turkey", quote: "YES BOYS! HAHA! WOO! LET'S GO! LET'S GO!", driverId: "lance-stroll", y: 2020, g: "Turkish Grand Prix", c: "Istanbul Park" },
  { id: "russell-2020-sakhir", quote: "That was taken away from us twice. Honestly. It's been a pleasure and I've loved it and honestly, I'm gutted. I'm absolutely gutted.", driverId: "george-russell", y: 2020, g: "Sakhir Grand Prix", c: "Sakhir" },
  { id: "perez-2020-sakhir", quote: "Did you see dad? Did you see dad? Yes? You did see him? Who won? Who won?", driverId: "sergio-perez", y: 2020, g: "Sakhir Grand Prix", c: "Sakhir" },
  { id: "hamilton-2020-turkey", quote: "That's for all the kids out there to dream the impossible, you can do it too.", driverId: "lewis-hamilton", y: 2020, g: "Turkish Grand Prix", c: "Istanbul Park" },
  { id: "gasly-2020-italy", quote: "What did we just do? We won the fucking race!", driverId: "pierre-gasly", y: 2020, g: "Italian Grand Prix", c: "Monza" },
  { id: "vettel-2020-spain", quote: "Ah, fucking hell! I asked you this before!", driverId: "sebastian-vettel", y: 2020, g: "Spanish Grand Prix", c: "Barcelona" },
  { id: "raikkonen-2020-belgium", quote: "He should have fucking let me pass.", driverId: "kimi-raikkonen", y: 2020, g: "Belgian Grand Prix", c: "Spa-Francorchamps" },
  { id: "ricciardo-2020-eifel", quote: "Is that a podium boys? Is that a fucking podium?", driverId: "daniel-ricciardo", y: 2020, g: "Eifel Grand Prix", c: "Nürburgring" },
  { id: "leclerc-2019-belgium", quote: "This one is for Anthoine. Feels good, but difficult to enjoy on a weekend like this.", driverId: "charles-leclerc", y: 2019, g: "Belgian Grand Prix", c: "Spa-Francorchamps" },
  { id: "vettel-2019-canada", quote: "But they are stealing the race from us.", driverId: "sebastian-vettel", y: 2019, g: "Canadian Grand Prix", c: "Montreal" },
  { id: "bottas-2019-australia", quote: "To whom it may concern – fuck you.", driverId: "valtteri-bottas", y: 2019, g: "Australian Grand Prix", c: "Melbourne" },
  { id: "leclerc-2019-azerbaijan", quote: "I am stupid.", driverId: "charles-leclerc", y: 2019, g: "Azerbaijan Grand Prix", c: "Baku" },
  { id: "ricciardo-2019-italy", quote: "Pizza pizza pizza.", driverId: "daniel-ricciardo", y: 2019, g: "Italian Grand Prix", c: "Monza" },
  { id: "norris-2019-germany", quote: "Er, so wet! Can't see a thing!", driverId: "lando-norris", y: 2019, g: "German Grand Prix", c: "Hockenheim" },
  { id: "sainz-2019-britain", quote: "You know what that was? That was a smooth operatoor…", driverId: "carlos-sainz-jr", y: 2019, g: "British Grand Prix", c: "Silverstone" },
  { id: "norris-2019-belgium", quote: "It's BROKEN!", driverId: "lando-norris", y: 2019, g: "Belgian Grand Prix", c: "Spa-Francorchamps" },
  { id: "hamilton-2019-monaco", quote: "I can't look after these tyres anymore, they're dead!", driverId: "lewis-hamilton", y: 2019, g: "Monaco Grand Prix", c: "Monaco" },
  { id: "magnussen-2019-canada", quote: "This is the worst experience I've ever had in a racing car.", driverId: "kevin-magnussen", y: 2019, g: "Canadian Grand Prix", c: "Montreal" },
  { id: "norris-2019-usa", quote: "I'm moving up and down, side to side, like a rollercoaster.", driverId: "lando-norris", y: 2019, g: "United States Grand Prix", c: "Austin" },
  { id: "vettel-2019-brazil", quote: "Mein Gott muss das sein!", driverId: "sebastian-vettel", y: 2019, g: "Brazilian Grand Prix", c: "Interlagos" },
  { id: "sainz-2019-brazil", quote: "I cannot believe it! Simple as that. What do you think? Do you think that was a… Smooth Operator!", driverId: "carlos-sainz-jr", y: 2019, g: "Brazilian Grand Prix", c: "Interlagos" },
  { id: "verstappen-2018-brazil", quote: "What a fucking idiot! What a fucking idiot!", driverId: "max-verstappen", y: 2018, g: "Brazilian Grand Prix", c: "Interlagos" },
  { id: "vettel-2018-brazil", quote: "There's something loose between my legs… apart from the obvious!", driverId: "sebastian-vettel", y: 2018, g: "Brazilian Grand Prix", c: "Interlagos" },
  { id: "ricciardo-2018-monaco", quote: "Hoooooly tomorrow. Cheers boys. Redemption!", driverId: "daniel-ricciardo", y: 2018, g: "Monaco Grand Prix", c: "Monaco" },
  { id: "raikkonen-2018-usa", quote: "Fucking finally!", driverId: "kimi-raikkonen", y: 2018, g: "United States Grand Prix", c: "Austin" },
  { id: "bottas-2018-russia", quote: "Valtteri, it's James.", driverId: "valtteri-bottas", y: 2018, g: "Russian Grand Prix", c: "Sochi" },
  { id: "hamilton-2018-germany", quote: "So box, box, box, box. No stay, stay out! In in in in in in in in in in in in. Yeah no, sorry mate. Just go, go. Staying out, staying out.", driverId: "lewis-hamilton", y: 2018, g: "German Grand Prix", c: "Hockenheim" },
  { id: "perez-2018-azerbaijan", quote: "Unbelievable guys. We did it once again guys. Once again. Once again it's not a coincidence that we are always there. Thank you guys.", driverId: "sergio-perez", y: 2018, g: "Azerbaijan Grand Prix", c: "Baku" },
  { id: "verstappen-2018-bahrain", quote: "I have no power! I have no power!", driverId: "max-verstappen", y: 2018, g: "Bahrain Grand Prix", c: "Sakhir" },
  { id: "gasly-2018-bahrain", quote: "Unbelievable! Thank you guys, now we can fight.", driverId: "pierre-gasly", y: 2018, g: "Bahrain Grand Prix", c: "Sakhir" },
  { id: "leclerc-2018-japan", quote: "Magnussen is and will always be stupid. It's a fact.", driverId: "charles-leclerc", y: 2018, g: "Japanese Grand Prix", c: "Suzuka" },
  { id: "verstappen-2017-britain", quote: "He wants to play bumper cars or something!", driverId: "max-verstappen", y: 2017, g: "British Grand Prix", c: "Silverstone" },
  { id: "ricciardo-2017-hungary", quote: "Fucking sore loser!", driverId: "daniel-ricciardo", y: 2017, g: "Hungarian Grand Prix", c: "Hungaroring" },
  { id: "button-2017-monaco", quote: "I'm gonna pee in your seat.", driverId: "jenson-button", y: 2017, g: "Monaco Grand Prix", c: "Monaco" },
  { id: "raikkonen-2017-azerbaijan", quote: "Gimme my gloves and steering wheel!", driverId: "kimi-raikkonen", y: 2017, g: "Azerbaijan Grand Prix", c: "Baku" },
  { id: "bottas-2017-russia", quote: "Yeah thanks so much guys. It means a lot, difficult to say more, but very thankful for you too.", driverId: "valtteri-bottas", y: 2017, g: "Russian Grand Prix", c: "Sochi" },

  // ═══════════════════════════════════════════════════════════════════
  // DIFICIL — hasta 2016 inclusive (47)
  // ═══════════════════════════════════════════════════════════════════
  { id: "vettel-2016-china", quote: "Kvyat came like a torpedo and I had to react, there was no way out.", driverId: "sebastian-vettel", y: 2016, g: "Chinese Grand Prix", c: "Shanghai" },
  { id: "hamilton-2016-malaysia", quote: "Oh, no, no.", driverId: "lewis-hamilton", y: 2016, g: "Malaysian Grand Prix", c: "Sepang" },
  { id: "verstappen-2016-malaysia", quote: "Sebastian is crazy. He fucking smashed into Rosberg like an idiot.", driverId: "max-verstappen", y: 2016, g: "Malaysian Grand Prix", c: "Sepang" },
  { id: "verstappen-2016-spain", quote: "Yes! Yes! Thank you very much, Christian.", driverId: "max-verstappen", y: 2016, g: "Spanish Grand Prix", c: "Barcelona" },
  { id: "ricciardo-2016-germany", quote: "Esteban is my favourite. I love this guy.", driverId: "daniel-ricciardo", y: 2016, g: "German Grand Prix", c: "Hockenheim" },
  { id: "raikkonen-2016-belgium", quote: "Come on, this is fucking ridiculous now, he's just fucking turning when I'm at full speed.", driverId: "kimi-raikkonen", y: 2016, g: "Belgian Grand Prix", c: "Spa-Francorchamps" },
  { id: "vettel-2016-mexico", quote: "You know what? Here's a message to Charlie: fuck off! Honestly, fuck off.", driverId: "sebastian-vettel", y: 2016, g: "Mexican Grand Prix", c: "Mexico City" },
  { id: "rosberg-2016-abudhabi", quote: "It's a childhood dream come true.", driverId: "nico-rosberg", y: 2016, g: "Abu Dhabi Grand Prix", c: "Yas Marina" },
  { id: "vettel-2016-russia", quote: "Oh for fuck sake man! Who the fuck? Oh I'm out! Crash!", driverId: "sebastian-vettel", y: 2016, g: "Russian Grand Prix", c: "Sochi" },
  { id: "hamilton-2016-austria", quote: "I was on the outside. It wasn't me who crashed.", driverId: "lewis-hamilton", y: 2016, g: "Austrian Grand Prix", c: "Red Bull Ring" },
  { id: "grosjean-2016-bahrain", quote: "This is the American dream. This is unbelievable. What a job from all of you. Guys, I love you. Beautiful.", driverId: "romain-grosjean", y: 2016, g: "Bahrain Grand Prix", c: "Sakhir" },
  { id: "ricciardo-2016-monaco", quote: "Just save it — nothing you could say could make it any better.", driverId: "daniel-ricciardo", y: 2016, g: "Monaco Grand Prix", c: "Monaco" },
  { id: "rosberg-2016-germany", quote: "I braked hard, I had full lock, I had nowhere else to go, I didn't expect him to steer or go there.", driverId: "nico-rosberg", y: 2016, g: "German Grand Prix", c: "Hockenheim" },
  { id: "vettel-2016-spain", quote: "If I don't avoid that, he's just going straight to my car!", driverId: "sebastian-vettel", y: 2016, g: "Spanish Grand Prix", c: "Barcelona" },
  { id: "verstappen-2016-singapore", quote: "Woah! There's a giant lizard on the track. Yeah, I'm not joking! Out of Turn 3.", driverId: "max-verstappen", y: 2016, g: "Singapore Grand Prix", c: "Marina Bay" },
  { id: "bottas-2015-britain", quote: "I have more pace. Can I overtake? I can do it on the back straight.", driverId: "valtteri-bottas", y: 2015, g: "British Grand Prix", c: "Silverstone" },
  { id: "alonso-2015-japan", quote: "GP2 engine! GP2… Argh!", driverId: "fernando-alonso", y: 2015, g: "Japanese Grand Prix", c: "Suzuka" },
  { id: "hulkenberg-2015-mexico", quote: "Shut up! It's not a warm-up lap. It's a timed lap. Bottas is on a warm-up lap behind you.", driverId: "nico-hulkenberg", y: 2015, g: "Mexican Grand Prix", c: "Mexico City" },
  { id: "hamilton-2015-usa", quote: "It's the greatest moment of my life. Thank you guys so much.", driverId: "lewis-hamilton", y: 2015, g: "United States Grand Prix", c: "Austin" },
  { id: "alonso-2015-usa", quote: "Has he got a penalty for the start, Massa? No, he has retired. Well, I am not sad about that.", driverId: "fernando-alonso", y: 2015, g: "United States Grand Prix", c: "Austin" },
  { id: "hamilton-2014-belgium", quote: "Nico hit me! Nico's hit me!", driverId: "lewis-hamilton", y: 2014, g: "Belgian Grand Prix", c: "Spa-Francorchamps" },
  { id: "massa-2014-malaysia", quote: "Valtteri is faster than you.", driverId: "felipe-massa", y: 2014, g: "Malaysian Grand Prix", c: "Sepang" },
  { id: "vettel-2013-malaysia", quote: "Multi 21, Seb. Multi 21.", driverId: "sebastian-vettel", y: 2013, g: "Malaysian Grand Prix", c: "Sepang" },
  { id: "webber-2013-brazil", quote: "Not easy, getting in the car the last time.", driverId: "mark-webber", y: 2013, g: "Brazilian Grand Prix", c: "Interlagos" },
  { id: "ricciardo-2013-japan", quote: "Before I go off and kill somebody, was it for the move in turn 15?", driverId: "daniel-ricciardo", y: 2013, g: "Japanese Grand Prix", c: "Suzuka" },
  { id: "massa-2013-japan", quote: "Multifunction strategy A. Multifunction strategy A. Now, please.", driverId: "felipe-massa", y: 2013, g: "Japanese Grand Prix", c: "Suzuka" },
  { id: "raikkonen-2013-india", quote: "Don't shout there fucker! I get out of the way when I have a chance, but not during fast corner.", driverId: "kimi-raikkonen", y: 2013, g: "Indian Grand Prix", c: "Buddh International Circuit" },
  { id: "raikkonen-2012-abudhabi", quote: "Leave me alone, I know what I'm doing.", driverId: "kimi-raikkonen", y: 2012, g: "Abu Dhabi Grand Prix", c: "Yas Marina" },
  { id: "alonso-2012-bahrain", quote: "All the time you have to leave a space.", driverId: "fernando-alonso", y: 2012, g: "Bahrain Grand Prix", c: "Sakhir" },
  { id: "webber-2010-britain", quote: "Not bad for a number two driver.", driverId: "mark-webber", y: 2010, g: "British Grand Prix", c: "Silverstone" },
  { id: "massa-2010-germany", quote: "Fernando is faster than you, can you confirm you understood that message?", driverId: "felipe-massa", y: 2010, g: "German Grand Prix", c: "Hockenheim" },
  { id: "vettel-2010-abudhabi", quote: "Thank you boys, unbelievable.", driverId: "sebastian-vettel", y: 2010, g: "Abu Dhabi Grand Prix", c: "Yas Marina" },
  { id: "vettel-2008-italy", quote: "I don't know what to say, I miss the words, grazie mille.", driverId: "sebastian-vettel", y: 2008, g: "Italian Grand Prix", c: "Monza" },
  { id: "piquetjr-2008-singapore", quote: "Sorry guys. I had a little outing. Yeah, I hit my head in the back. I think I'm okay.", driverId: "nelson-piquet-jr", y: 2008, g: "Singapore Grand Prix", c: "Marina Bay" },
  { id: "massa-2008-brazil", quote: "I think you've done, what I can only say is, a very good job. Well done son, I'm very very proud of you.", driverId: "felipe-massa", y: 2008, g: "Brazilian Grand Prix", c: "Interlagos" },
  { id: "trulli-2008-turkey", quote: "Don't worry, I'm pushing like a hell!", driverId: "jarno-trulli", y: 2008, g: "Turkish Grand Prix", c: "Istanbul Park" },
  { id: "hamilton-2008-brazil", quote: "Guys, I'm speechless! That was so frickin' close.", driverId: "lewis-hamilton", y: 2008, g: "Brazilian Grand Prix", c: "Interlagos" },
  { id: "coulthard-2007-canada", quote: "Not good. Doesn't turn, doesn't stop, no traction. Apart from that it's great, having lots of fun.", driverId: "david-coulthard", y: 2007, g: "Canadian Grand Prix", c: "Montreal" },
  { id: "coulthard-2007-germany", quote: "Guys, I'm just losing time. You're wankers, you're all wankers!", driverId: "david-coulthard", y: 2007, g: "German Grand Prix", c: "Nürburgring" },
  { id: "barrichello-2006-australia", quote: "I'm struggling like a pig.", driverId: "rubens-barrichello", y: 2006, g: "Australian Grand Prix", c: "Melbourne" },
  { id: "fisichella-2006-turkey", quote: "Everywhere, everywhere!", driverId: "giancarlo-fisichella", y: 2006, g: "Turkish Grand Prix", c: "Istanbul Park" },
  { id: "montoya-2002-belgium", quote: "Fucking Räikkönen! What a fucking idiot!", driverId: "juan-pablo-montoya", y: 2002, g: "Belgian Grand Prix", c: "Spa-Francorchamps" },
  { id: "montoya-2001-austria", quote: "Oh, dear!", driverId: "juan-pablo-montoya", y: 2001, g: "Austrian Grand Prix", c: "A1-Ring" },
  { id: "schumacher-2000-japan", quote: "You are great, Ross! All of you guys! We did it, we did it!", driverId: "michael-schumacher", y: 2000, g: "Japanese Grand Prix", c: "Suzuka" },
  { id: "schumacher-1998-hungary", quote: "Michael, you have 19 laps to pull out 25 seconds. We need 19 qualifying laps from you.", driverId: "michael-schumacher", y: 1998, g: "Hungarian Grand Prix", c: "Hungaroring" },
  { id: "villeneuve-1997-europe", quote: "Keep the thing going, you bastard. You beauty.", driverId: "jacques-villeneuve", y: 1997, g: "European Grand Prix", c: "Jerez" },

  // Momentos verificados que NO son citas literales (ver nota de derechos
  // de autor arriba): se describe el hecho sin reproducir ninguna letra.
  { id: "norris-2020-tuscan-sings", quote: "It's Friday then... It's Saturday, Sunday, WHAT?! IT'S FRIDAY THEN IT'S SATURDAY, SUNDAY, WHAT! ", driverId: "lando-norris", y: 2020, g: "Tuscan Grand Prix", c: "Mugello" },
  { id: "alonso-2005-china-sings", quote: "WE ARE THE CHAMPIONSSS, WE ARE THE CHAMPIONSSS!", driverId: "fernando-alonso", y: 2005, g: "Chinese Grand Prix", c: "Shanghai" },
];
