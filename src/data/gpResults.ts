// src/data/gpResults.ts
//
// Dataset de resultados reales de Grandes Premios de F1.
// Cada entrada contiene el top 10 de una carrera clasificada.
// Carreras trágicas excluidas (Imola 1994, Japón 2014, Monza 1970).
//
// Formato compacto: top10 es un array ordenado P1→P10, cada
// elemento es [nombreCompleto, escudería].

export type GPEntry = {
  /** Año del GP. */
  y: number;
  /** Nombre del GP (ej: "British Grand Prix"). */
  g: string;
  /** Nombre del circuito (ej: "Silverstone"). */
  c: string;
  /** Top 10 en orden P1→P10: [nombreCompleto, escudería]. */
  t: [string, string][];
};

// ─── Carreras excluidas (trágicas) ────────────────────────────────────
const BLACKLIST = new Set([
  "1994-San Marino",
  "2014-Japanese",
  "1970-Italian",
]);

// ─── Dataset ──────────────────────────────────────────────────────────
const RAW: GPEntry[] = [
  // ═══════════════════════════════════════════════════════════════════
  // FÁCIL — 2018-2024
  // ═══════════════════════════════════════════════════════════════════
  { y:2024, g:"Bahrain Grand Prix", c:"Sakhir", t:[
    ["Max Verstappen","Red Bull"],["Sergio Pérez","Red Bull"],["Carlos Sainz","Ferrari"],
    ["Charles Leclerc","Ferrari"],["George Russell","Mercedes"],["Lando Norris","McLaren"],
    ["Lewis Hamilton","Mercedes"],["Oscar Piastri","McLaren"],["Fernando Alonso","Aston Martin"],
    ["Lance Stroll","Aston Martin"]]},
  { y:2024, g:"Japanese Grand Prix", c:"Suzuka", t:[
    ["Max Verstappen","Red Bull"],["Sergio Pérez","Red Bull"],["Carlos Sainz","Ferrari"],
    ["Charles Leclerc","Ferrari"],["Lando Norris","McLaren"],["Fernando Alonso","Aston Martin"],
    ["George Russell","Mercedes"],["Lewis Hamilton","Mercedes"],["Yuki Tsunoda","RB"],
    ["Lance Stroll","Aston Martin"]]},
  { y:2024, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Carlos Sainz","Ferrari"],["Charles Leclerc","Ferrari"],["Lando Norris","McLaren"],
    ["Oscar Piastri","McLaren"],["Sergio Pérez","Red Bull"],["Lance Stroll","Aston Martin"],
    ["Yuki Tsunoda","RB"],["Fernando Alonso","Aston Martin"],["Daniel Ricciardo","RB"],
    ["Nico Hülkenberg","Haas"]]},
  { y:2024, g:"Miami Grand Prix", c:"Miami", t:[
    ["Lando Norris","McLaren"],["Max Verstappen","Red Bull"],["Charles Leclerc","Ferrari"],
    ["Sergio Pérez","Red Bull"],["Carlos Sainz","Ferrari"],["Lewis Hamilton","Mercedes"],
    ["Yuki Tsunoda","RB"],["George Russell","Mercedes"],["Fernando Alonso","Aston Martin"],
    ["Oscar Piastri","McLaren"]]},
  { y:2024, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Charles Leclerc","Ferrari"],["Oscar Piastri","McLaren"],["Carlos Sainz","Ferrari"],
    ["Lando Norris","McLaren"],["George Russell","Mercedes"],["Max Verstappen","Red Bull"],
    ["Lewis Hamilton","Mercedes"],["Yuki Tsunoda","RB"],["Alexander Albon","Williams"],
    ["Pierre Gasly","Alpine"]]},
  { y:2024, g:"Spanish Grand Prix", c:"Barcelona", t:[
    ["Max Verstappen","Red Bull"],["Lando Norris","McLaren"],["Lewis Hamilton","Mercedes"],
    ["George Russell","Mercedes"],["Charles Leclerc","Ferrari"],["Carlos Sainz","Ferrari"],
    ["Oscar Piastri","McLaren"],["Sergio Pérez","Red Bull"],["Pierre Gasly","Alpine"],
    ["Esteban Ocon","Alpine"]]},
  { y:2024, g:"British Grand Prix", c:"Silverstone", t:[
    ["Lewis Hamilton","Mercedes"],["Max Verstappen","Red Bull"],["Lando Norris","McLaren"],
    ["Oscar Piastri","McLaren"],["Carlos Sainz","Ferrari"],["Nico Hülkenberg","Haas"],
    ["Lance Stroll","Aston Martin"],["Fernando Alonso","Aston Martin"],["Alexander Albon","Williams"],
    ["Yuki Tsunoda","RB"]]},
  { y:2024, g:"Belgian Grand Prix", c:"Spa-Francorchamps", t:[
    ["Lewis Hamilton","Mercedes"],["Oscar Piastri","McLaren"],["Charles Leclerc","Ferrari"],
    ["Max Verstappen","Red Bull"],["Lando Norris","McLaren"],["Carlos Sainz","Ferrari"],
    ["Sergio Pérez","Red Bull"],["Fernando Alonso","Aston Martin"],["Esteban Ocon","Alpine"],
    ["Daniel Ricciardo","RB"]]},
  { y:2024, g:"Italian Grand Prix", c:"Monza", t:[
    ["Charles Leclerc","Ferrari"],["Oscar Piastri","McLaren"],["Lando Norris","McLaren"],
    ["Carlos Sainz","Ferrari"],["Lewis Hamilton","Mercedes"],["Max Verstappen","Red Bull"],
    ["George Russell","Mercedes"],["Sergio Pérez","Red Bull"],["Alexander Albon","Williams"],
    ["Kevin Magnussen","Haas"]]},
  { y:2024, g:"Azerbaijan Grand Prix", c:"Baku", t:[
    ["Oscar Piastri","McLaren"],["Charles Leclerc","Ferrari"],["George Russell","Mercedes"],
    ["Lando Norris","McLaren"],["Max Verstappen","Red Bull"],["Fernando Alonso","Aston Martin"],
    ["Alexander Albon","Williams"],["Franco Colapinto","Williams"],["Lewis Hamilton","Mercedes"],
    ["Sergio Pérez","Red Bull"]]},
  { y:2023, g:"Bahrain Grand Prix", c:"Sakhir", t:[
    ["Max Verstappen","Red Bull"],["Sergio Pérez","Red Bull"],["Fernando Alonso","Aston Martin"],
    ["Carlos Sainz","Ferrari"],["Lewis Hamilton","Mercedes"],["Lance Stroll","Aston Martin"],
    ["George Russell","Mercedes"],["Valtteri Bottas","Alfa Romeo"],["Pierre Gasly","Alpine"],
    ["Alexander Albon","Williams"]]},
  { y:2023, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Max Verstappen","Red Bull"],["Lewis Hamilton","Mercedes"],["Fernando Alonso","Aston Martin"],
    ["Lance Stroll","Aston Martin"],["Sergio Pérez","Red Bull"],["Lando Norris","McLaren"],
    ["Nico Hülkenberg","Haas"],["Oscar Piastri","McLaren"],["Zhou Guanyu","Alfa Romeo"],
    ["Yuki Tsunoda","AlphaTauri"]]},
  { y:2023, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Max Verstappen","Red Bull"],["Fernando Alonso","Aston Martin"],["Esteban Ocon","Alpine"],
    ["Lewis Hamilton","Mercedes"],["George Russell","Mercedes"],["Charles Leclerc","Ferrari"],
    ["Pierre Gasly","Alpine"],["Carlos Sainz","Ferrari"],["Lando Norris","McLaren"],
    ["Oscar Piastri","McLaren"]]},
  { y:2023, g:"British Grand Prix", c:"Silverstone", t:[
    ["Max Verstappen","Red Bull"],["Lando Norris","McLaren"],["Lewis Hamilton","Mercedes"],
    ["Oscar Piastri","McLaren"],["George Russell","Mercedes"],["Sergio Pérez","Red Bull"],
    ["Fernando Alonso","Aston Martin"],["Alexander Albon","Williams"],["Charles Leclerc","Ferrari"],
    ["Carlos Sainz","Ferrari"]]},
  { y:2023, g:"Abu Dhabi Grand Prix", c:"Yas Marina", t:[
    ["Max Verstappen","Red Bull"],["Charles Leclerc","Ferrari"],["George Russell","Mercedes"],
    ["Carlos Sainz","Ferrari"],["Lando Norris","McLaren"],["Lewis Hamilton","Mercedes"],
    ["Fernando Alonso","Aston Martin"],["Oscar Piastri","McLaren"],["Sergio Pérez","Red Bull"],
    ["Pierre Gasly","Alpine"]]},
  { y:2022, g:"Bahrain Grand Prix", c:"Sakhir", t:[
    ["Charles Leclerc","Ferrari"],["Carlos Sainz","Ferrari"],["Lewis Hamilton","Mercedes"],
    ["George Russell","Mercedes"],["Kevin Magnussen","Haas"],["Valtteri Bottas","Alfa Romeo"],
    ["Esteban Ocon","Alpine"],["Yuki Tsunoda","AlphaTauri"],["Fernando Alonso","Alpine"],
    ["Zhou Guanyu","Alfa Romeo"]]},
  { y:2022, g:"Saudi Arabian Grand Prix", c:"Jeddah", t:[
    ["Max Verstappen","Red Bull"],["Charles Leclerc","Ferrari"],["Carlos Sainz","Ferrari"],
    ["Sergio Pérez","Red Bull"],["George Russell","Mercedes"],["Esteban Ocon","Alpine"],
    ["Lando Norris","McLaren"],["Pierre Gasly","AlphaTauri"],["Kevin Magnussen","Haas"],
    ["Lewis Hamilton","Mercedes"]]},
  { y:2022, g:"Abu Dhabi Grand Prix", c:"Yas Marina", t:[
    ["Max Verstappen","Red Bull"],["Charles Leclerc","Ferrari"],["Sergio Pérez","Red Bull"],
    ["Carlos Sainz","Ferrari"],["George Russell","Mercedes"],["Lando Norris","McLaren"],
    ["Esteban Ocon","Alpine"],["Lance Stroll","Aston Martin"],["Daniel Ricciardo","McLaren"],
    ["Sebastian Vettel","Aston Martin"]]},
  { y:2021, g:"Bahrain Grand Prix", c:"Sakhir", t:[
    ["Lewis Hamilton","Mercedes"],["Max Verstappen","Red Bull"],["Valtteri Bottas","Mercedes"],
    ["Lando Norris","McLaren"],["Sergio Pérez","Red Bull"],["Charles Leclerc","Ferrari"],
    ["Daniel Ricciardo","McLaren"],["Carlos Sainz","Ferrari"],["Yuki Tsunoda","AlphaTauri"],
    ["Lance Stroll","Aston Martin"]]},
  { y:2021, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Max Verstappen","Red Bull"],["Carlos Sainz","Ferrari"],["Lando Norris","McLaren"],
    ["Sergio Pérez","Red Bull"],["Sebastian Vettel","Aston Martin"],["Pierre Gasly","AlphaTauri"],
    ["Lewis Hamilton","Mercedes"],["Lance Stroll","Aston Martin"],["Esteban Ocon","Alpine"],
    ["Antonio Giovinazzi","Alfa Romeo"]]},
  { y:2021, g:"Abu Dhabi Grand Prix", c:"Yas Marina", t:[
    ["Max Verstappen","Red Bull"],["Lewis Hamilton","Mercedes"],["Carlos Sainz","Ferrari"],
    ["Yuki Tsunoda","AlphaTauri"],["Pierre Gasly","AlphaTauri"],["Valtteri Bottas","Mercedes"],
    ["Lando Norris","McLaren"],["Fernando Alonso","Alpine"],["Esteban Ocon","Alpine"],
    ["Charles Leclerc","Ferrari"]]},
  { y:2020, g:"Austrian Grand Prix", c:"Spielberg", t:[
    ["Valtteri Bottas","Mercedes"],["Charles Leclerc","Ferrari"],["Lando Norris","McLaren"],
    ["Lewis Hamilton","Mercedes"],["Carlos Sainz","McLaren"],["Sergio Pérez","Racing Point"],
    ["Pierre Gasly","AlphaTauri"],["Esteban Ocon","Renault"],["Antonio Giovinazzi","Alfa Romeo"],
    ["Sebastian Vettel","Ferrari"]]},
  { y:2020, g:"Italian Grand Prix", c:"Monza", t:[
    ["Pierre Gasly","AlphaTauri"],["Carlos Sainz","McLaren"],["Lance Stroll","Racing Point"],
    ["Lando Norris","McLaren"],["Valtteri Bottas","Mercedes"],["Daniel Ricciardo","Renault"],
    ["Lewis Hamilton","Mercedes"],["Esteban Ocon","Renault"],["Daniil Kvyat","AlphaTauri"],
    ["Sergio Pérez","Racing Point"]]},
  { y:2019, g:"British Grand Prix", c:"Silverstone", t:[
    ["Lewis Hamilton","Mercedes"],["Valtteri Bottas","Mercedes"],["Charles Leclerc","Ferrari"],
    ["Pierre Gasly","Red Bull"],["Max Verstappen","Red Bull"],["Carlos Sainz","McLaren"],
    ["Daniel Ricciardo","Renault"],["Kimi Räikkönen","Alfa Romeo"],["Daniil Kvyat","Toro Rosso"],
    ["Nico Hülkenberg","Renault"]]},
  { y:2019, g:"Brazilian Grand Prix", c:"Interlagos", t:[
    ["Max Verstappen","Red Bull"],["Pierre Gasly","Toro Rosso"],["Carlos Sainz","McLaren"],
    ["Kimi Räikkönen","Alfa Romeo"],["Antonio Giovinazzi","Alfa Romeo"],["Daniel Ricciardo","Renault"],
    ["Lewis Hamilton","Mercedes"],["Lando Norris","McLaren"],["Sergio Pérez","Racing Point"],
    ["Daniil Kvyat","Toro Rosso"]]},
  { y:2018, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Sebastian Vettel","Ferrari"],["Lewis Hamilton","Mercedes"],["Kimi Räikkönen","Ferrari"],
    ["Daniel Ricciardo","Red Bull"],["Fernando Alonso","McLaren"],["Max Verstappen","Red Bull"],
    ["Nico Hülkenberg","Renault"],["Valtteri Bottas","Mercedes"],["Stoffel Vandoorne","McLaren"],
    ["Carlos Sainz","Renault"]]},
  { y:2018, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Daniel Ricciardo","Red Bull"],["Sebastian Vettel","Ferrari"],["Lewis Hamilton","Mercedes"],
    ["Kimi Räikkönen","Ferrari"],["Valtteri Bottas","Mercedes"],["Esteban Ocon","Force India"],
    ["Pierre Gasly","Toro Rosso"],["Nico Hülkenberg","Renault"],["Max Verstappen","Red Bull"],
    ["Carlos Sainz","Renault"]]},
  // ═══════════════════════════════════════════════════════════════════
  // MEDIO — 2006-2017
  // ═══════════════════════════════════════════════════════════════════
  { y:2017, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Sebastian Vettel","Ferrari"],["Lewis Hamilton","Mercedes"],["Valtteri Bottas","Mercedes"],
    ["Kimi Räikkönen","Ferrari"],["Max Verstappen","Red Bull"],["Felipe Massa","Williams"],
    ["Sergio Pérez","Force India"],["Carlos Sainz","Toro Rosso"],["Daniil Kvyat","Toro Rosso"],
    ["Nico Hülkenberg","Renault"]]},
  { y:2017, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Sebastian Vettel","Ferrari"],["Kimi Räikkönen","Ferrari"],["Daniel Ricciardo","Red Bull"],
    ["Valtteri Bottas","Mercedes"],["Max Verstappen","Red Bull"],["Carlos Sainz","Toro Rosso"],
    ["Lewis Hamilton","Mercedes"],["Sergio Pérez","Force India"],["Stoffel Vandoorne","McLaren"],
    ["Jolyon Palmer","Renault"]]},
  { y:2017, g:"Abu Dhabi Grand Prix", c:"Yas Marina", t:[
    ["Valtteri Bottas","Mercedes"],["Lewis Hamilton","Mercedes"],["Sebastian Vettel","Ferrari"],
    ["Kimi Räikkönen","Ferrari"],["Max Verstappen","Red Bull"],["Nico Hülkenberg","Renault"],
    ["Sergio Pérez","Force India"],["Esteban Ocon","Force India"],["Fernando Alonso","McLaren"],
    ["Felipe Massa","Williams"]]},
  { y:2016, g:"Spanish Grand Prix", c:"Barcelona", t:[
    ["Max Verstappen","Red Bull"],["Kimi Räikkönen","Ferrari"],["Sebastian Vettel","Ferrari"],
    ["Daniel Ricciardo","Red Bull"],["Valtteri Bottas","Williams"],["Carlos Sainz","Toro Rosso"],
    ["Sergio Pérez","Force India"],["Felipe Massa","Williams"],["Jenson Button","McLaren"],
    ["Daniil Kvyat","Toro Rosso"]]},
  { y:2016, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Lewis Hamilton","Mercedes"],["Daniel Ricciardo","Red Bull"],["Sergio Pérez","Force India"],
    ["Sebastian Vettel","Ferrari"],["Fernando Alonso","McLaren"],["Nico Hülkenberg","Force India"],
    ["Nico Rosberg","Mercedes"],["Carlos Sainz","Toro Rosso"],["Jenson Button","McLaren"],
    ["Felipe Massa","Williams"]]},
  { y:2016, g:"Abu Dhabi Grand Prix", c:"Yas Marina", t:[
    ["Lewis Hamilton","Mercedes"],["Nico Rosberg","Mercedes"],["Sebastian Vettel","Ferrari"],
    ["Max Verstappen","Red Bull"],["Daniel Ricciardo","Red Bull"],["Kimi Räikkönen","Ferrari"],
    ["Nico Hülkenberg","Force India"],["Sergio Pérez","Force India"],["Felipe Massa","Williams"],
    ["Fernando Alonso","McLaren"]]},
  { y:2015, g:"Malaysian Grand Prix", c:"Sepang", t:[
    ["Sebastian Vettel","Ferrari"],["Lewis Hamilton","Mercedes"],["Nico Rosberg","Mercedes"],
    ["Kimi Räikkönen","Ferrari"],["Valtteri Bottas","Williams"],["Daniel Ricciardo","Red Bull"],
    ["Daniil Kvyat","Red Bull"],["Felipe Massa","Williams"],["Max Verstappen","Toro Rosso"],
    ["Carlos Sainz","Toro Rosso"]]},
  { y:2015, g:"Hungarian Grand Prix", c:"Hungaroring", t:[
    ["Sebastian Vettel","Ferrari"],["Daniil Kvyat","Red Bull"],["Daniel Ricciardo","Red Bull"],
    ["Max Verstappen","Toro Rosso"],["Fernando Alonso","McLaren"],["Jenson Button","McLaren"],
    ["Kimi Räikkönen","Ferrari"],["Lewis Hamilton","Mercedes"],["Nico Rosberg","Mercedes"],
    ["Romain Grosjean","Lotus"]]},
  { y:2014, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Nico Rosberg","Mercedes"],["Daniel Ricciardo","Red Bull"],["Kevin Magnussen","McLaren"],
    ["Jenson Button","McLaren"],["Fernando Alonso","Ferrari"],["Valtteri Bottas","Williams"],
    ["Nico Hülkenberg","Force India"],["Kimi Räikkönen","Ferrari"],["Jean-Éric Vergne","Toro Rosso"],
    ["Daniil Kvyat","Toro Rosso"]]},
  { y:2014, g:"Canadian Grand Prix", c:"Montreal", t:[
    ["Daniel Ricciardo","Red Bull"],["Nico Rosberg","Mercedes"],["Sebastian Vettel","Red Bull"],
    ["Jenson Button","McLaren"],["Nico Hülkenberg","Force India"],["Fernando Alonso","Ferrari"],
    ["Valtteri Bottas","Williams"],["Jean-Éric Vergne","Toro Rosso"],["Kimi Räikkönen","Ferrari"],
    ["Kevin Magnussen","McLaren"]]},
  { y:2013, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Kimi Räikkönen","Lotus"],["Fernando Alonso","Ferrari"],["Sebastian Vettel","Red Bull"],
    ["Felipe Massa","Ferrari"],["Lewis Hamilton","Mercedes"],["Mark Webber","Red Bull"],
    ["Adrian Sutil","Force India"],["Paul di Resta","Force India"],["Jenson Button","McLaren"],
    ["Romain Grosjean","Lotus"]]},
  { y:2013, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Nico Rosberg","Mercedes"],["Sebastian Vettel","Red Bull"],["Mark Webber","Red Bull"],
    ["Lewis Hamilton","Mercedes"],["Adrian Sutil","Force India"],["Jenson Button","McLaren"],
    ["Fernando Alonso","Ferrari"],["Jean-Éric Vergne","Toro Rosso"],["Paul di Resta","Force India"],
    ["Kimi Räikkönen","Lotus"]]},
  { y:2012, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Jenson Button","McLaren"],["Sebastian Vettel","Red Bull"],["Lewis Hamilton","McLaren"],
    ["Mark Webber","Red Bull"],["Fernando Alonso","Ferrari"],["Felipe Massa","Ferrari"],
    ["Sergio Pérez","Sauber"],["Nico Rosberg","Mercedes"],["Kimi Räikkönen","Lotus"],
    ["Paul di Resta","Force India"]]},
  { y:2012, g:"Brazilian Grand Prix", c:"Interlagos", t:[
    ["Jenson Button","McLaren"],["Fernando Alonso","Ferrari"],["Felipe Massa","Ferrari"],
    ["Mark Webber","Red Bull"],["Nico Hülkenberg","Force India"],["Sebastian Vettel","Red Bull"],
    ["Michael Schumacher","Mercedes"],["Jean-Éric Vergne","Toro Rosso"],["Kamui Kobayashi","Sauber"],
    ["Kimi Räikkönen","Lotus"]]},
  { y:2011, g:"Canadian Grand Prix", c:"Montreal", t:[
    ["Jenson Button","McLaren"],["Sebastian Vettel","Red Bull"],["Mark Webber","Red Bull"],
    ["Michael Schumacher","Mercedes"],["Valtteri Petrov","Renault"],["Felipe Massa","Ferrari"],
    ["Kamui Kobayashi","Sauber"],["Jaime Alguersuari","Toro Rosso"],["Sergio Pérez","Sauber"],
    ["Rubens Barrichello","Williams"]]},
  { y:2011, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Sebastian Vettel","Red Bull"],["Fernando Alonso","Ferrari"],["Jenson Button","McLaren"],
    ["Mark Webber","Red Bull"],["Kamui Kobayashi","Sauber"],["Lewis Hamilton","McLaren"],
    ["Adrian Sutil","Force India"],["Nick Heidfeld","Renault"],["Rubens Barrichello","Williams"],
    ["Michael Schumacher","Mercedes"]]},
  { y:2010, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Jenson Button","McLaren"],["Robert Kubica","Renault"],["Felipe Massa","Ferrari"],
    ["Fernando Alonso","Ferrari"],["Nico Rosberg","Mercedes"],["Lewis Hamilton","McLaren"],
    ["Valtteri Petrov","Renault"],["Michael Schumacher","Mercedes"],["Adrian Sutil","Force India"],
    ["Sebastian Vettel","Red Bull"]]},
  { y:2010, g:"Abu Dhabi Grand Prix", c:"Yas Marina", t:[
    ["Sebastian Vettel","Red Bull"],["Lewis Hamilton","McLaren"],["Jenson Button","McLaren"],
    ["Nico Rosberg","Mercedes"],["Fernando Alonso","Ferrari"],["Mark Webber","Red Bull"],
    ["Robert Kubica","Renault"],["Valtteri Petrov","Renault"],["Michael Schumacher","Mercedes"],
    ["Rubens Barrichello","Williams"]]},
  { y:2009, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Jenson Button","Brawn"],["Rubens Barrichello","Brawn"],["Jarno Trulli","Toyota"],
    ["Lewis Hamilton","McLaren"],["Timo Glock","Toyota"],["Fernando Alonso","Renault"],
    ["Nico Rosberg","Williams"],["Sébastien Buemi","Toro Rosso"],["Sébastien Bourdais","Toro Rosso"],
    ["Adrian Sutil","Force India"]]},
  { y:2009, g:"Brazilian Grand Prix", c:"Interlagos", t:[
    ["Mark Webber","Red Bull"],["Robert Kubica","BMW Sauber"],["Lewis Hamilton","McLaren"],
    ["Sebastian Vettel","Red Bull"],["Jenson Button","Brawn"],["Kimi Räikkönen","Ferrari"],
    ["Sébastien Buemi","Toro Rosso"],["Nico Rosberg","Williams"],["Jarno Trulli","Toyota"],
    ["Kazuki Nakajima","Williams"]]},
  { y:2008, g:"British Grand Prix", c:"Silverstone", t:[
    ["Lewis Hamilton","McLaren"],["Nick Heidfeld","BMW Sauber"],["Rubens Barrichello","Honda"],
    ["Kimi Räikkönen","Ferrari"],["Heikki Kovalainen","McLaren"],["Fernando Alonso","Renault"],
    ["Jarno Trulli","Toyota"],["Kazuki Nakajima","Williams"],["Nico Rosberg","Williams"],
    ["Timo Glock","Toyota"]]},
  { y:2008, g:"Brazilian Grand Prix", c:"Interlagos", t:[
    ["Felipe Massa","Ferrari"],["Fernando Alonso","Renault"],["Kimi Räikkönen","Ferrari"],
    ["Sebastian Vettel","Toro Rosso"],["Lewis Hamilton","McLaren"],["Timo Glock","Toyota"],
    ["Heikki Kovalainen","McLaren"],["Jarno Trulli","Toyota"],["Mark Webber","Red Bull"],
    ["Nico Rosberg","Williams"]]},
  { y:2007, g:"Canadian Grand Prix", c:"Montreal", t:[
    ["Lewis Hamilton","McLaren"],["Nick Heidfeld","BMW Sauber"],["Alexander Wurz","Williams"],
    ["Heikki Kovalainen","Renault"],["Nico Rosberg","Williams"],["Takuma Sato","Super Aguri"],
    ["Ralf Schumacher","Toyota"],["Fernando Alonso","McLaren"],["Mark Webber","Red Bull"],
    ["Giancarlo Fisichella","Renault"]]},
  { y:2006, g:"Hungarian Grand Prix", c:"Hungaroring", t:[
    ["Jenson Button","Honda"],["Pedro de la Rosa","McLaren"],["Nick Heidfeld","BMW Sauber"],
    ["Rubens Barrichello","Honda"],["David Coulthard","Red Bull"],["Ralf Schumacher","Toyota"],
    ["Vitantonio Liuzzi","Toro Rosso"],["Kimi Räikkönen","McLaren"],["Jarno Trulli","Toyota"],
    ["Scott Speed","Toro Rosso"]]},
  { y:2006, g:"Italian Grand Prix", c:"Monza", t:[
    ["Michael Schumacher","Ferrari"],["Kimi Räikkönen","McLaren"],["Robert Kubica","BMW Sauber"],
    ["Giancarlo Fisichella","Renault"],["Jenson Button","Honda"],["Juan Pablo Montoya","McLaren"],
    ["Fernando Alonso","Renault"],["Nick Heidfeld","BMW Sauber"],["Rubens Barrichello","Honda"],
    ["Jarno Trulli","Toyota"]]},
  // ═══════════════════════════════════════════════════════════════════
  // DIFÍCIL — 1990-2005
  // ═══════════════════════════════════════════════════════════════════
  { y:2005, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Giancarlo Fisichella","Renault"],["Rubens Barrichello","Ferrari"],["Fernando Alonso","Renault"],
    ["Mark Webber","Williams"],["Jarno Trulli","Toyota"],["Ralf Schumacher","Toyota"],
    ["Jacques Villeneuve","Sauber"],["David Coulthard","Red Bull"],["Felipe Massa","Sauber"],
    ["Christian Klien","Red Bull"]]},
  { y:2005, g:"Japanese Grand Prix", c:"Suzuka", t:[
    ["Kimi Räikkönen","McLaren"],["Giancarlo Fisichella","Renault"],["Ralf Schumacher","Toyota"],
    ["Jenson Button","BAR"],["Michael Schumacher","Ferrari"],["David Coulthard","Red Bull"],
    ["Mark Webber","Williams"],["Jarno Trulli","Toyota"],["Felipe Massa","Sauber"],
    ["Christian Klien","Red Bull"]]},
  { y:2004, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Michael Schumacher","Ferrari"],["Rubens Barrichello","Ferrari"],["Fernando Alonso","Renault"],
    ["Ralf Schumacher","Williams"],["Juan Pablo Montoya","Williams"],["Jenson Button","BAR"],
    ["Jarno Trulli","Renault"],["David Coulthard","McLaren"],["Takuma Sato","BAR"],
    ["Olivier Panis","Toyota"]]},
  { y:2003, g:"Brazilian Grand Prix", c:"Interlagos", t:[
    ["Giancarlo Fisichella","Jordan"],["Kimi Räikkönen","McLaren"],["Fernando Alonso","Renault"],
    ["David Coulthard","McLaren"],["Heinz-Harald Frentzen","Sauber"],["Jenson Button","BAR"],
    ["Mark Webber","Jaguar"],["Jarno Trulli","Renault"],["Rubens Barrichello","Ferrari"],
    ["Jacques Villeneuve","BAR"]]},
  { y:2003, g:"Japanese Grand Prix", c:"Suzuka", t:[
    ["Rubens Barrichello","Ferrari"],["Kimi Räikkönen","McLaren"],["David Coulthard","McLaren"],
    ["Jenson Button","BAR"],["Jarno Trulli","Renault"],["Ralf Schumacher","Williams"],
    ["Juan Pablo Montoya","Williams"],["Mark Webber","Jaguar"],["Heinz-Harald Frentzen","Sauber"],
    ["Cristiano da Matta","Toyota"]]},
  { y:2002, g:"Australian Grand Prix", c:"Melbourne", t:[
    ["Michael Schumacher","Ferrari"],["Mark Webber","Minardi"],["Juan Pablo Montoya","Williams"],
    ["Ralf Schumacher","Williams"],["Rubens Barrichello","Ferrari"],["Heinz-Harald Frentzen","Arrows"],
    ["Kimi Räikkönen","McLaren"],["Giancarlo Fisichella","Jordan"],["Jarno Trulli","Renault"],
    ["David Coulthard","McLaren"]]},
  { y:2001, g:"Canadian Grand Prix", c:"Montreal", t:[
    ["Ralf Schumacher","Williams"],["Michael Schumacher","Ferrari"],["Mika Häkkinen","McLaren"],
    ["Kimi Räikkönen","Sauber"],["Jean Alesi","Jordan"],["David Coulthard","McLaren"],
    ["Nick Heidfeld","Sauber"],["Jacques Villeneuve","BAR"],["Jarno Trulli","Jordan"],
    ["Heinz-Harald Frentzen","Prost"]]},
  { y:2000, g:"Brazilian Grand Prix", c:"Interlagos", t:[
    ["Michael Schumacher","Ferrari"],["Giancarlo Fisichella","Benetton"],["Heinz-Harald Frentzen","Jordan"],
    ["Jarno Trulli","Jordan"],["Ralf Schumacher","Williams"],["Jenson Button","Williams"],
    ["Jacques Villeneuve","BAR"],["Mika Salo","Sauber"],["Pedro de la Rosa","Arrows"],
    ["Marc Gené","Minardi"]]},
  { y:2000, g:"United States Grand Prix", c:"Indianapolis", t:[
    ["Michael Schumacher","Ferrari"],["Rubens Barrichello","Ferrari"],["Heinz-Harald Frentzen","Jordan"],
    ["Jacques Villeneuve","BAR"],["David Coulthard","McLaren"],["Ricardo Zonta","BAR"],
    ["Jarno Trulli","Jordan"],["Mika Salo","Sauber"],["Jos Verstappen","Arrows"],
    ["Jenson Button","Williams"]]},
  { y:1999, g:"European Grand Prix", c:"Nürburgring", t:[
    ["Johnny Herbert","Stewart"],["Jarno Trulli","Prost"],["Rubens Barrichello","Stewart"],
    ["Ralf Schumacher","Williams"],["Mika Häkkinen","McLaren"],["Damon Hill","Jordan"],
    ["Marc Gené","Minardi"],["David Coulthard","McLaren"],["Jean Alesi","Sauber"],
    ["Pedro Diniz","Sauber"]]},
  { y:1998, g:"Belgian Grand Prix", c:"Spa-Francorchamps", t:[
    ["Damon Hill","Jordan"],["Ralf Schumacher","Jordan"],["Jean Alesi","Sauber"],
    ["Heinz-Harald Frentzen","Williams"],["Pedro Diniz","Arrows"],["Jarno Trulli","Prost"],
    ["Mika Häkkinen","McLaren"],["Mika Salo","Arrows"],["Johnny Herbert","Sauber"],
    ["Jan Magnussen","Stewart"]]},
  { y:1997, g:"European Grand Prix", c:"Jerez", t:[
    ["Mika Häkkinen","McLaren"],["David Coulthard","McLaren"],["Jacques Villeneuve","Williams"],
    ["Karl Wendlinger","Sauber"],["Michael Schumacher","Ferrari"],["Eddie Irvine","Ferrari"],
    ["Heinz-Harald Frentzen","Williams"],["Jean Alesi","Benetton"],["Giancarlo Fisichella","Jordan"],
    ["Ralf Schumacher","Jordan"]]},
  { y:1996, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Olivier Panis","Ligier"],["David Coulthard","McLaren"],["Johnny Herbert","Sauber"],
    ["Heinz-Harald Frentzen","Sauber"],["Mika Salo","Tyrrell"],["Mika Häkkinen","McLaren"],
    ["Eddie Irvine","Ferrari"],["Luca Badoer","Forti"],["Andrea Montermini","Forti"],
    ["Michael Schumacher","Ferrari"]]},
  { y:1995, g:"Belgian Grand Prix", c:"Spa-Francorchamps", t:[
    ["Michael Schumacher","Benetton"],["Damon Hill","Williams"],["Martin Brundle","Ligier"],
    ["Heinz-Harald Frentzen","Sauber"],["Mark Blundell","McLaren"],["Rubens Barrichello","Jordan"],
    ["David Coulthard","Williams"],["Mika Häkkinen","McLaren"],["Eddie Irvine","Jordan"],
    ["Gianni Morbidelli","Footwork"]]},
  { y:1994, g:"Australian Grand Prix", c:"Adelaide", t:[
    ["Nigel Mansell","Williams"],["Gerhard Berger","Ferrari"],["Martin Brundle","McLaren"],
    ["Rubens Barrichello","Jordan"],["Olivier Panis","Ligier"],["Jean Alesi","Ferrari"],
    ["Gianni Morbidelli","Footwork"],["Ukyo Katayama","Tyrrell"],["Érik Comas","Larrousse"],
    ["David Brabham","Simtek"]]},
  { y:1993, g:"Australian Grand Prix", c:"Adelaide", t:[
    ["Ayrton Senna","McLaren"],["Alain Prost","Williams"],["Damon Hill","Williams"],
    ["Michael Schumacher","Benetton"],["Jean Alesi","Ferrari"],["Martin Brundle","Ligier"],
    ["Gerhard Berger","Ferrari"],["Mark Blundell","Ligier"],["Mika Häkkinen","McLaren"],
    ["Rubens Barrichello","Jordan"]]},
  { y:1993, g:"European Grand Prix", c:"Donington Park", t:[
    ["Ayrton Senna","McLaren"],["Damon Hill","Williams"],["Alain Prost","Williams"],
    ["Karl Wendlinger","Sauber"],["Fabrizio Barbazza","Minardi"],["Christian Fittipaldi","Minardi"],
    ["JJ Lehto","Sauber"],["Luca Badoer","Lola-BMS"],["Michael Andretti","McLaren"],
    ["Gerhard Berger","Ferrari"]]},
  { y:1991, g:"Brazilian Grand Prix", c:"Interlagos", t:[
    ["Ayrton Senna","McLaren"],["Riccardo Patrese","Williams"],["Gerhard Berger","McLaren"],
    ["Alain Prost","Ferrari"],["Nelson Piquet","Benetton"],["Jean Alesi","Ferrari"],
    ["Roberto Moreno","Benetton"],["Satoru Nakajima","Tyrrell"],["Pierluigi Martini","Minardi"],
    ["Mika Häkkinen","Lotus"]]},
  { y:1991, g:"Canadian Grand Prix", c:"Montreal", t:[
    ["Nelson Piquet","Benetton"],["Stefano Modena","Tyrrell"],["Riccardo Patrese","Williams"],
    ["Andrea de Cesaris","Jordan"],["Gerhard Berger","McLaren"],["Bertrand Gachot","Jordan"],
    ["Nigel Mansell","Williams"],["Ayrton Senna","McLaren"],["Jean Alesi","Ferrari"],
    ["Pierluigi Martini","Minardi"]]},
  { y:1990, g:"Japanese Grand Prix", c:"Suzuka", t:[
    ["Nelson Piquet","Benetton"],["Roberto Moreno","Benetton"],["Aguri Suzuki","Lola-Lamborghini"],
    ["Riccardo Patrese","Williams"],["Thierry Boutsen","Williams"],["Satoru Nakajima","Tyrrell"],
    ["Alessandro Nannini","Benetton"],["Derek Warwick","Lotus"],["Pierluigi Martini","Minardi"],
    ["David Brabham","Brabham"]]},
  // ═══════════════════════════════════════════════════════════════════
  // LEYENDA — 1950-1989
  // ═══════════════════════════════════════════════════════════════════
  { y:1989, g:"Japanese Grand Prix", c:"Suzuka", t:[
    ["Alessandro Nannini","Benetton"],["Riccardo Patrese","Williams"],["Thierry Boutsen","Williams"],
    ["Nelson Piquet","Lotus"],["Martin Brundle","Brabham"],["Derek Warwick","Arrows"],
    ["Satoru Nakajima","Lotus"],["Andrea de Cesaris","Dallara"],["René Arnoux","Ligier"],
    ["Philippe Alliot","Larrousse"]]},
  { y:1989, g:"Australian Grand Prix", c:"Adelaide", t:[
    ["Thierry Boutsen","Williams"],["Alessandro Nannini","Benetton"],["Riccardo Patrese","Williams"],
    ["Satoru Nakajima","Lotus"],["Pierluigi Martini","Minardi"],["Emanuele Pirro","Benetton"],
    ["Nelson Piquet","Lotus"],["René Arnoux","Ligier"],["Bernd Schneider","Zakspeed"],
    ["Martin Brundle","Brabham"]]},
  { y:1988, g:"Australian Grand Prix", c:"Adelaide", t:[
    ["Alain Prost","McLaren"],["Ayrton Senna","McLaren"],["Nelson Piquet","Lotus"],
    ["Riccardo Patrese","Williams"],["Thierry Boutsen","Benetton"],["Ivan Capelli","March"],
    ["Alessandro Nannini","Benetton"],["Satoru Nakajima","Lotus"],["Nigel Mansell","Williams"],
    ["Pierluigi Martini","Minardi"]]},
  { y:1988, g:"British Grand Prix", c:"Silverstone", t:[
    ["Ayrton Senna","McLaren"],["Nigel Mansell","Williams"],["Alessandro Nannini","Benetton"],
    ["Mauricio Gugelmin","March"],["Nelson Piquet","Lotus"],["Derek Warwick","Arrows"],
    ["Riccardo Patrese","Williams"],["Eddie Cheever","Arrows"],["Ivan Capelli","March"],
    ["Andrea de Cesaris","Rial"]]},
  { y:1986, g:"Australian Grand Prix", c:"Adelaide", t:[
    ["Alain Prost","McLaren"],["Nelson Piquet","Williams"],["Stefan Johansson","Ferrari"],
    ["Martin Brundle","Tyrrell"],["Philippe Alliot","Ligier"],["Philippe Streiff","Tyrrell"],
    ["Keke Rosberg","McLaren"],["Alan Jones","Lola-Haas"],["Christian Danner","Arrows"],
    ["René Arnoux","Ligier"]]},
  { y:1985, g:"European Grand Prix", c:"Brands Hatch", t:[
    ["Nigel Mansell","Williams"],["Ayrton Senna","Lotus"],["Keke Rosberg","Williams"],
    ["Alain Prost","McLaren"],["Elio de Angelis","Lotus"],["Thierry Boutsen","Arrows"],
    ["Marc Surer","Brabham"],["Derek Warwick","Renault"],["Jacques Laffite","Ligier"],
    ["Piercarlo Ghinzani","Toleman"]]},
  { y:1984, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Alain Prost","McLaren"],["Ayrton Senna","Toleman"],["Stefan Bellof","Tyrrell"],
    ["René Arnoux","Ferrari"],["Keke Rosberg","Williams"],["David Coulthard","not applicable"],
    ["Jean-Pierre Jarier","Ligier"],["Nigel Mansell","Lotus"],["Andrea de Cesaris","Ligier"],
    ["Riccardo Patrese","Alfa Romeo"]]},
  { y:1982, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Riccardo Patrese","Brabham"],["Didier Pironi","Ferrari"],["Andrea de Cesaris","Alfa Romeo"],
    ["Nigel Mansell","Lotus"],["Elio de Angelis","Lotus"],["Derek Daly","Williams"],
    ["Jacques Laffite","Ligier"],["Jean-Pierre Jarier","Osella"],["Nelson Piquet","Brabham"],
    ["Alain Prost","Renault"]]},
  { y:1981, g:"Spanish Grand Prix", c:"Jarama", t:[
    ["Gilles Villeneuve","Ferrari"],["Jacques Laffite","Ligier"],["John Watson","McLaren"],
    ["Carlos Reutemann","Williams"],["Elio de Angelis","Lotus"],["Nigel Mansell","Lotus"],
    ["Mario Andretti","Alfa Romeo"],["Patrick Tambay","Ligier"],["Didier Pironi","Ferrari"],
    ["Eddie Cheever","Tyrrell"]]},
  { y:1979, g:"French Grand Prix", c:"Dijon-Prenois", t:[
    ["Jean-Pierre Jabouille","Renault"],["Gilles Villeneuve","Ferrari"],["René Arnoux","Renault"],
    ["Alan Jones","Williams"],["Jean-Pierre Jarier","Tyrrell"],["Clay Regazzoni","Williams"],
    ["Carlos Reutemann","Lotus"],["Jean-Pierre Depailler","Ligier"],["Jody Scheckter","Ferrari"],
    ["Patrick Tambay","McLaren"]]},
  { y:1978, g:"Italian Grand Prix", c:"Monza", t:[
    ["Niki Lauda","Brabham"],["John Watson","Brabham"],["Carlos Reutemann","Ferrari"],
    ["Emerson Fittipaldi","Fittipaldi"],["Jacques Laffite","Ligier"],["Mario Andretti","Lotus"],
    ["Jean-Pierre Jarier","Lotus"],["Patrick Tambay","McLaren"],["Jody Scheckter","Wolf"],
    ["Alan Jones","Williams"]]},
  { y:1976, g:"Japanese Grand Prix", c:"Fuji", t:[
    ["Mario Andretti","Lotus"],["Patrick Depailler","Tyrrell"],["James Hunt","McLaren"],
    ["Alan Jones","Surtees"],["Clay Regazzoni","Ferrari"],["Gunnar Nilsson","Lotus"],
    ["Jacques Laffite","Ligier"],["Harald Ertl","Hesketh"],["Kazuyoshi Hoshino","Heros"],
    ["Larry Perkins","Brabham"]]},
  { y:1973, g:"Italian Grand Prix", c:"Monza", t:[
    ["Ronnie Peterson","Lotus"],["Emerson Fittipaldi","Lotus"],["Peter Revson","McLaren"],
    ["Jackie Stewart","Tyrrell"],["François Cevert","Tyrrell"],["Carlos Reutemann","Brabham"],
    ["Jacky Ickx","Ferrari"],["Denny Hulme","McLaren"],["Carlos Pace","Surtees"],
    ["Clay Regazzoni","BRM"]]},
  { y:1971, g:"Italian Grand Prix", c:"Monza", t:[
    ["Peter Gethin","BRM"],["Ronnie Peterson","March"],["François Cevert","Tyrrell"],
    ["Mike Hailwood","Surtees"],["Howden Ganley","BRM"],["Chris Amon","Matra"],
    ["Jackie Stewart","Tyrrell"],["Emerson Fittipaldi","Lotus"],["Rolf Stommelen","Surtees"],
    ["Henri Pescarolo","March"]]},
  { y:1968, g:"French Grand Prix", c:"Rouen-Les-Essarts", t:[
    ["Jacky Ickx","Ferrari"],["John Surtees","Honda"],["Jackie Stewart","Matra"],
    ["Vic Elford","Cooper"],["Denny Hulme","McLaren"],["Jean-Pierre Beltoise","Matra"],
    ["Piers Courage","BRM"],["Ludovico Scarfiotti","Cooper"],["Dan Gurney","McLaren"],
    ["Johnny Servoz-Gavin","Matra"]]},
  { y:1966, g:"Italian Grand Prix", c:"Monza", t:[
    ["Ludovico Scarfiotti","Ferrari"],["Mike Parkes","Ferrari"],["Denny Hulme","Brabham"],
    ["Jochen Rindt","Cooper"],["Bob Anderson","Brabham"],["Graham Hill","BRM"],
    ["Bob Bondurant","Eagle"],["John Surtees","Cooper"],["Jo Bonnier","Cooper"],
    ["Jim Clark","Lotus"]]},
  { y:1961, g:"French Grand Prix", c:"Reims", t:[
    ["Giancarlo Baghetti","Ferrari"],["Dan Gurney","Porsche"],["Jim Clark","Lotus"],
    ["Innes Ireland","Lotus"],["Bruce McLaren","Cooper"],["Graham Hill","BRM"],
    ["Jack Brabham","Cooper"],["John Surtees","Cooper"],["Jo Bonnier","Porsche"],
    ["Wolfgang von Trips","Ferrari"]]},
  { y:1958, g:"Monaco Grand Prix", c:"Monaco", t:[
    ["Maurice Trintignant","Cooper"],["Luigi Musso","Ferrari"],["Peter Collins","Ferrari"],
    ["Jack Brabham","Cooper"],["Mike Hawthorn","Ferrari"],["Stuart Lewis-Evans","Vanwall"],
    ["Cliff Allison","Lotus"],["Robert La Caze","Cooper"],["Jean Behra","BRM"],
    ["Harry Schell","BRM"]]},
  { y:1957, g:"German Grand Prix", c:"Nürburgring", t:[
    ["Juan Manuel Fangio","Maserati"],["Mike Hawthorn","Ferrari"],["Peter Collins","Ferrari"],
    ["Luigi Musso","Ferrari"],["Stirling Moss","Vanwall"],["Tony Brooks","Vanwall"],
    ["Masten Gregory","Maserati"],["Stuart Lewis-Evans","Vanwall"],["Bruce Halford","Maserati"],
    ["Horace Gould","Maserati"]]},
  { y:1953, g:"British Grand Prix", c:"Silverstone", t:[
    ["Alberto Ascari","Ferrari"],["Juan Manuel Fangio","Maserati"],["Nino Farina","Ferrari"],
    ["José Froilán González","Maserati"],["Mike Hawthorn","Ferrari"],["Felice Bonetto","Maserati"],
    ["Onofre Marimón","Maserati"],["Stirling Moss","Cooper-Alta"],["Tony Rolt","Connaught"],
    ["Duncan Hamilton","HWM"]]},
  { y:1950, g:"British Grand Prix", c:"Silverstone", t:[
    ["Nino Farina","Alfa Romeo"],["Luigi Fagioli","Alfa Romeo"],["Reg Parnell","Alfa Romeo"],
    ["Yves Giraud-Cabantous","Talbot-Lago"],["Louis Rosier","Talbot-Lago"],["Bob Gerard","ERA"],
    ["Cuth Harrison","ERA"],["Philippe Étancelin","Talbot-Lago"],["David Hampshire","ERA"],
    ["Brian Shawe-Taylor","ERA"]]},
];

// ─── Filtrado y utilidades ────────────────────────────────────────────

/** Todas las carreras válidas (sin carreras trágicas). */
export const GP_RESULTS: GPEntry[] = RAW.filter(
  (r) => !BLACKLIST.has(`${r.y}-${r.g.split(" ")[0]}`),
);

/** Filtra por rango de años (inclusivo). */
export function gpsByRange(min: number, max: number): GPEntry[] {
  return GP_RESULTS.filter((r) => r.y >= min && r.y <= max);
}

/** Conjunto de todos los nombres de piloto en el dataset (para autocompletar). */
export function allDriverNames(): string[] {
  const set = new Set<string>();
  for (const gp of GP_RESULTS) {
    for (const [name] of gp.t) set.add(name);
  }
  return [...set].sort();
}

/** Busca pilotos por texto (case-insensitive, coincidencia parcial). */
export function searchDrivers(query: string, pool: string[]): string[] {
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return pool.filter((name) => {
    const n = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return n.includes(q);
  });
}
