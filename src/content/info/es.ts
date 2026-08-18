// src/content/info/es.ts
import type { InfoContent } from "./types";

const content: InfoContent = {
  title: "Cómo jugar",
  subtitle:
    "Box Daily Box tiene ocho minijuegos diarios de Fórmula 1. Cada uno se juega una vez por día, con un desafío nuevo a la medianoche. Acá te explicamos las reglas de cada juego, cómo se calcula el puntaje, cómo funciona el ranking y las demás funciones de la plataforma.",
  dataAsOfNote: "Los datos de pilotos, escuderías y resultados que usan los juegos llegan hasta la temporada 2025.",

  gamesHeading: "Los 8 juegos",
  gamesIntro:
    "Todos los juegos usan datos reales de la Fórmula 1: pilotos, escuderías, nacionalidades y resultados históricos. El desafío del día es el mismo para todos los jugadores del mundo.",
  gameDetail: {
    pittexto:
      "Tenés que adivinar a un piloto secreto de Fórmula 1. Cada intento que hacés te da pistas progresivas: nacionalidad, escudería, cantidad de campeonatos y más. Tenés un máximo de 8 intentos para descubrir de quién se trata.",
    polewordle:
      "Es la versión Fórmula 1 del clásico juego de adivinar palabras. Tenés que descubrir el apellido de un piloto en 6 intentos. Cada letra se marca en verde, amarillo o gris según esté en la posición correcta, en otra posición, o no esté en el apellido.",
    "el-intruso":
      "Se muestran diez pilotos de Fórmula 1. Nueve de ellos comparten algo en común (una regla oculta: puede ser la escudería, la nacionalidad, una década, etc.) y uno no encaja. Tu trabajo es encontrar al intruso.",
    "parrilla-bingo":
      "Una grilla de 3x3 donde cada celda cruza una escudería con una condición (por ejemplo, \"campeón del mundo\" o \"corrió en los años 90\"). Tenés que completar cada celda con un piloto real que cumpla ambas condiciones a la vez, sin repetir pilotos.",
    "gp-resultado":
      "Se te muestra un Gran Premio histórico y tenés que completar el top 10 de esa carrera: qué piloto terminó en cada posición. Tiene autocompletado para buscar más rápido entre los pilotos.",
    "top10-standings":
      "Similar al anterior, pero con el campeonato acumulado de pilotos de una temporada (elegida al azar entre un período de 1 a 4 años), no de una sola carrera. Las pistas son la nacionalidad de cada piloto y los puntos que sumó ese año.",
    "career-path":
      "Se muestra la cadena de escuderías por las que pasó un piloto de Fórmula 1, en orden cronológico, representada con los logos de cada equipo. Tenés que adivinar de qué piloto se trata escribiendo su nombre, con autocompletado para buscar más rápido. Tenés un máximo de 3 intentos.",
    "team-radio":
      "Se muestra el texto real de una radio icónica de equipo de Fórmula 1, junto con el piloto que la dijo. Tenés que adivinar en qué Gran Premio se dijo, eligiendo entre 6 opciones. Las opciones falsas son carreras del mismo año o del mismo circuito en años cercanos, así que no alcanza con adivinar: hay que conocer bien el contexto.",
  },

  difficultyHeading: "Dificultades",
  difficultyIntro:
    "Cada juego se puede jugar en 4 niveles de dificultad. La dificultad define de qué época salen los pilotos: cuanto más difícil, más atrás en la historia de la Fórmula 1 hay que conocer.",

  scoringHeading: "Cómo se calcula el puntaje",
  scoringIntro:
    "El puntaje de cada reto ganado se calcula así:",

  rankingHeading: "El ranking",
  rankingBody: [
    "Hay dos rankings públicos: uno diario (los resultados de hoy) y uno mensual (se reinicia el 1 de cada mes). Ambos muestran a todos los jugadores que participaron ese día o ese mes, ordenados por puntos — incluidos los que perdieron todos sus retos, que aparecen al final con 0 puntos.",
    "Para que el ranking sea justo, cada intento se verifica en el servidor (nunca se confía en lo que dice el navegador del jugador), y solo la primera cuenta que juega un juego desde una misma conexión a internet cuenta para el ranking — esto evita que una persona use varias cuentas para acumular más puntos.",
    "Podés jugar sin crear una cuenta (de forma anónima) o iniciar sesión con Google. En ambos casos aparecés en el ranking con el nombre público que elijas.",
  ],

  badgesHeading: "Badges (medallas)",
  badgesBody: [
    "Al terminar cada mes, los tres primeros puestos del ranking mensual reciben una medalla permanente: oro para el primer puesto, plata para el segundo, bronce para el tercero. Estas medallas quedan para siempre junto a tu nombre en todos los rankings, y se acumulan si ganás varios meses.",
    "Si hay un empate en algún puesto, todos los empatados reciben la medalla de ese puesto.",
  ],

  streakHeading: "Racha",
  streakBody:
    "La racha cuenta cuántos días seguidos ganaste al menos un reto. Se muestra con un ícono de llama junto a tu nombre en el ranking a partir de 2 días seguidos. Si un día no jugás o perdés todos los retos, la racha se reinicia al día siguiente.",

  duelsHeading: "Amigos y duelos",
  duelsBody: [
    "Podés agregar amigos con un código de 6 caracteres (que cada usuario tiene el suyo) o por link. También podés desafiar a alguien a un duelo sin que sea tu amigo todavía, mandándole un link directo.",
    "Un duelo es una partida especial contra otra persona, con su propio desafío (no es el reto diario, así que podés jugar varios duelos el mismo día). El resultado de un duelo no afecta el ranking global ni tu racha: es solo para competir cara a cara con quien quieras.",
    "El duelo es \"a ciegas\": ninguno de los dos ve el resultado del otro hasta que ambos terminaron de jugar.",
  ],

  faq: [
    {
      q: "¿Necesito crear una cuenta para jugar?",
      a: "No. Podés jugar de forma completamente anónima; tu progreso se guarda en tu dispositivo. Si querés aparecer en el ranking desde varios dispositivos o no perder tu progreso, podés iniciar sesión con tu cuenta de Google en cualquier momento.",
    },
    {
      q: "¿Cuántas veces por día puedo jugar cada reto?",
      a: "Una vez por día por juego. A la medianoche se genera un desafío nuevo para cada uno de los 8 juegos. Los duelos con amigos son la excepción: podés jugarlos las veces que quieras, ya que no son el reto diario.",
    },
    {
      q: "¿Cómo se calculan los puntos?",
      a: "Solo sumás puntos si ganás el reto. El puntaje base depende de la dificultad elegida, y se suma un bonus por resolver rápido. Perder o abandonar un reto siempre da 0 puntos.",
    },
    {
      q: "¿Qué pasa si pierdo un reto?",
      a: "Igual aparecés en el ranking del día, con 0 puntos, junto a los demás jugadores. Perder no te bloquea del ranking: solo no suma puntos.",
    },
    {
      q: "¿Cómo se evita la trampa?",
      a: "El servidor genera el desafío, mide el tiempo y verifica cada respuesta de forma independiente. El navegador del jugador nunca decide si ganó ni cuántos puntos hizo. Además, solo la primera cuenta que juega un juego desde una misma conexión cuenta para el ranking.",
    },
    {
      q: "¿Box Daily Box está afiliado a la Fórmula 1?",
      a: "No. Es un proyecto hecho por fans, sin afiliación oficial con Formula One Group, la FIA, ni ninguna escudería o piloto.",
    },
  ],
};

export default content;
