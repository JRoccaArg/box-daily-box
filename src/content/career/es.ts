// src/content/career/es.ts
//
// Contenido narrativo del Modo Carrera en ESPANIOL (version de referencia).
// Las claves cruzan con la mecanica de `src/lib/career/eventData.ts`:
// cada evento necesita un texto por opcion y uno por desenlace.
//
// Las probabilidades NUNCA se muestran: las pistas van en el relato ("el
// jefe duda", "el auto viene raro"), que es la decision de diseno acordada.

import type { CareerContent } from "./types";

const content: CareerContent = {
  events: {
    // ─── En pista y con tu companiero ─────────────────────────────
    "team-order-hold": {
      title: "Orden de equipo",
      story:
        "Vas segundo, pegado a tu companiero, y tenes ritmo para pasarlo. Por la radio llega la voz del muro, seca: mantener posiciones hasta el final. El equipo no quiere perder un doblete por una pelea interna.",
      options: {
        obey: "Obedecer y quedarte detras",
        ignore: "Ignorar la orden y atacar",
      },
      outcomes: {
        respect:
          "Cruzas la meta segundo, mordiendote la lengua. En el box te esperan con un abrazo: el equipo no se olvida de los que se bancan una orden incomoda.",
        bitter:
          "Terminas segundo y no saludas a nadie. Esa noche no dormis pensando en la vuelta que no diste, y el fastidio te acompania varias carreras.",
        win: "Lo pasas por afuera en la ultima chicana. El box queda mudo, pero el publico se levanta. Ganaste, y todos vieron como.",
        punished:
          "Lo intentas, se tocan y los dos pierden posiciones. El jefe de equipo no grita: eso es peor. Te queda claro que vas a pagar el atrevimiento.",
      },
    },
    "teammate-clash": {
      title: "Toque con tu companiero",
      story:
        "Curva 3, los dos entran juntos y ninguno levanta. Fin de carrera para ambos. En el garaje no se miran, y la prensa ya esta afuera esperando que alguien hable primero.",
      options: {
        apologise: "Poner la cara y pedir disculpas",
        blame: "Echarle la culpa en publico",
      },
      outcomes: {
        peace:
          "Das el primer paso y bajas el fuego. Nadie sale ganando, pero el vestuario respira y el equipo valora que hayas elegido el bien comun.",
        weak: "Pedis disculpas y del otro lado no hay gesto. Quedas como el que se achico, y te lo hacen sentir.",
        backed:
          "Fuiste primero a los micros y contaste tu version. Los datos te dieron la razon y por un rato sos el que dijo la verdad incomoda.",
        isolated:
          "Lo dijiste con bronca y sono a excusa. La telemetria despues mostro otra cosa. El garaje se enfria y algunas puertas se cierran.",
      },
    },
    "last-lap-gamble": {
      title: "Ultima vuelta",
      story:
        "Ultima vuelta, estas a menos de un segundo del que va adelante. Hay una sola chance real y es en la frenada mas complicada del circuito. Si sale, es podio. Si no, sos vos el que queda en la grava.",
      options: {
        attack: "Tirarte a la frenada",
        settle: "Conformarte con la posicion",
      },
      outcomes: {
        hero:
          "Frenas mas tarde de lo que decia el sentido comun y sale. La maniobra da la vuelta al mundo esa misma noche.",
        crash:
          "Bloqueas la rueda de adentro y te vas largo. De la nada, cero puntos. El repaso del domingo a la noche es doloroso.",
        safe: "Cruzas la meta donde venias. Nada memorable, pero suma, y sumar tambien es un oficio.",
        regret:
          "Te guardas y en el momento parece prudente. Despues, mirando la repeticion, ves el hueco que estaba y no tomaste.",
      },
    },
    "defend-hard": {
      title: "Defender lo indefendible",
      story:
        "Tu auto no da para mas pero venis peleando un punto que para el equipo vale oro. Atras se te viene uno con medio segundo de ventaja por vuelta y ganas de terminar el asunto rapido.",
      options: {
        defend: "Defender al limite",
        yield: "Dejarlo pasar y cuidar el auto",
      },
      outcomes: {
        held: "Vuelta tras vuelta le cerras la puerta justo a tiempo. Cruzas la meta sin ceder el lugar y el garaje explota por un solo punto.",
        contact:
          "Cerras una vez de mas, se tocan y los comisarios miran. Terminas fuera de los puntos y con fama de sucio.",
        clean:
          "Le abris la puerta y guardas el auto. No hay gloria, pero llegas entero al final y el equipo tiene con que trabajar.",
      },
    },
    "teammate-data": {
      title: "La telemetria",
      story:
        "Tu companiero encontro algo en tu vuelta rapida y pide ver tus datos. En un equipo, todo se comparte. En la practica, cada uno cuida su ventaja.",
      options: {
        share: "Compartir todo",
        refuse: "Guardarte lo tuyo",
      },
      outcomes: {
        mutual:
          "Abris tus datos y el hace lo mismo. Los dos encuentran decimas donde no las buscaban: el equipo entero da un paso adelante.",
        used: "Compartis y el mejora. Vos no sacas nada a cambio, y te queda la sensacion de haber regalado tu unica ventaja.",
        edge: "Te guardas el secreto y seguis siendo el mas rapido de los dos. Del otro lado del garaje ya no te hablan igual.",
        frozen:
          "El equipo se entera de que no colaboras y responde con la misma moneda: la informacion que baja hacia tu lado empieza a llegar tarde.",
      },
    },
    "backmarker-traffic": {
      title: "Trafico de doblados",
      story:
        "Tres vueltas para el final, tenes que doblar a dos autos que pelean entre si y no te vieron. El que te persigue esta a un segundo y viene mas rapido.",
      options: {
        dive: "Meterte entre los dos",
        wait: "Esperar una zona segura",
      },
      outcomes: {
        clear:
          "Te metes por un hueco que duro un parpadeo y salis limpio. La diferencia atras se mantiene y llegas.",
        tangle:
          "Uno de los dos se cierra sin verte. Toque, aleron roto y una carrera que se te escapa por querer ganar dos segundos.",
        "lost-time":
          "Esperas la recta larga para pasarlos sin riesgo. Perdes un puniado de decimas, pero llegas al final sin sustos.",
      },
    },

    // ─── Tecnicos y de desarrollo ─────────────────────────────────
    "dev-direction": {
      title: "Adonde va el desarrollo",
      story:
        "Reunion tecnica: hay plata para una sola linea de desarrollo. Podes pedir mejoras para ya, o empujar para que el equipo apunte todo al auto del anio que viene.",
      options: {
        now: "Mejoras para esta temporada",
        "next-year": "Apostar todo al proximo auto",
      },
      outcomes: {
        gain: "Las piezas llegan a mitad de anio y el auto despierta. No es una revolucion, pero se nota en cada vuelta.",
        flat: "Las mejoras llegan y el crono casi no cambia. Al menos no empeoro nada.",
        payoff:
          "Sufris el resto del anio con un auto que quedo viejo, pero en el invierno la fabrica saca algo serio. La espera valio la pena.",
        wasted:
          "Sacrificas la temporada por un proyecto que despues no funciona. El peor de los dos mundos.",
      },
    },
    "risky-upgrade": {
      title: "La mejora arriesgada",
      story:
        "Aerodinamica trajo un paquete nuevo que en el tunel de viento vuela, pero que casi no se probo en pista. El ingeniero jefe lo defiende con entusiasmo; el tuyo, en voz baja, dice que el auto puede quedar impredecible.",
      options: {
        "take-it": "Montarlo ya",
        stay: "Seguir con lo conocido",
      },
      outcomes: {
        breakthrough:
          "Funciona incluso mejor que en los numeros. De golpe estan peleando donde no llegaban hace un mes.",
        unstable:
          "En pista el auto se vuelve una loteria: rapido en una curva, aterrador en la siguiente. Cuesta varias carreras volver atras.",
        steady:
          "Seguis con el paquete viejo. Nada nuevo, pero sabes exactamente que auto tenes debajo cada domingo.",
      },
    },
    "setup-gamble": {
      title: "Reglaje al limite",
      story:
        "El fin de semana viene con lluvia posible. Podes armar el auto en un reglaje extremo, apuntando a una vuelta perfecta en clasificacion, o dejarlo en algo estable que aguante cualquier escenario.",
      options: {
        extreme: "Reglaje extremo",
        safe: "Reglaje conservador",
      },
      outcomes: {
        flying:
          "En clasificacion el auto vuela y te sorprendes a vos mismo. Encontraste una ventana que nadie mas vio.",
        undrivable:
          "El auto no se deja manejar. Peleas con el volante todo el fin de semana y nunca encontras el ritmo.",
        predictable:
          "Nada espectacular, pero el auto hace lo mismo vuelta tras vuelta. Con eso se trabaja.",
      },
    },
    "engine-mode": {
      title: "Modo motor",
      story:
        "Quedan quince vueltas y tenes un rival encima. Hay un mapa de motor mas agresivo disponible. El ingeniero te avisa que la unidad ya tiene kilometros de sobra.",
      options: {
        push: "Subir el motor y aguantar",
        save: "Cuidar la unidad",
      },
      outcomes: {
        "held-on":
          "Subis el mapa, aguantas el ataque y el motor llega. Terminas con la boca seca y el puesto en el bolsillo.",
        "blew-up":
          "A cuatro vueltas del final aparece humo por el espejo. Abandono, y una unidad menos para lo que queda de anio.",
        conserved:
          "Bajas el ritmo y cuidas el motor. Perdes la posicion, pero el equipo tiene una unidad sana para las proximas carreras.",
      },
    },
    "wind-tunnel": {
      title: "Horas de tunel",
      story:
        "El reglamento limita cuantas horas de tunel de viento puede usar el equipo. Hay que decidir si se gastan en entender el auto de ahora o en el concepto del que viene.",
      options: {
        "long-term": "Invertirlas en el auto futuro",
        "short-term": "Usarlas para arreglar lo de ahora",
      },
      outcomes: {
        strong:
          "El concepto nuevo aparece solido desde el primer dia de pretemporada. El sacrificio tuvo sentido.",
        slow: "El auto nuevo es un poco mejor, nada mas. Se esperaba mas de tanta espera.",
        "quick-fix":
          "Encuentran el problema que arrastraban y lo corrigen. El auto queda mas manejable de inmediato.",
        "dead-end":
          "Gastan las horas persiguiendo un fantasma. Ni arreglan lo de ahora ni adelantan lo de despues.",
      },
    },
    "single-part": {
      title: "Una sola pieza nueva",
      story:
        "Llego el aleron nuevo, pero solo uno. Alcanza para un auto. Tu companiero viene puntuando mejor y el equipo duda a quien darselo.",
      options: {
        demand: "Reclamarla para vos",
        concede: "Dejar que se la den a el",
      },
      outcomes: {
        granted:
          "Peleas tu caso y ganas. La pieza es tuya y se nota en el crono, aunque del otro lado del box quedo olor a quemado.",
        denied:
          "Reclamas y te dicen que no delante de todos. Ademas de quedarte sin la pieza, quedaste como el que rompe la armonia.",
        goodwill:
          "Cedes sin hacer ruido. El jefe de equipo toma nota: los gestos asi se devuelven cuando importa.",
        overlooked:
          "Cedes y nadie lo registra. La proxima vez que haya una sola pieza, ya saben que no vas a pelearla.",
      },
    },

    // ─── Contratos y mercado ──────────────────────────────────────
    "renew-early": {
      title: "Renovar ahora",
      story:
        "El equipo te pone un contrato sobre la mesa antes de tiempo. La oferta es correcta, no generosa. Tu representante dice que si esperas hasta mitad de anio podrias valer bastante mas.",
      options: {
        sign: "Firmar ahora y quedarte tranquilo",
        wait: "Esperar a que se mueva el mercado",
      },
      outcomes: {
        secure:
          "Firmas y te sacas el tema de encima. Podes concentrarte en manejar mientras el resto del paddock se pelea por butacas.",
        better:
          "Esperas, rendis, y el mercado se mueve a tu favor. Ahora sos vos el que tiene la sarten del mango.",
        exposed:
          "Esperas demasiado. El equipo se cansa, mira para otro lado y de golpe sos vos el que necesita cerrar algo rapido.",
      },
    },
    "release-clause": {
      title: "La clausula",
      story:
        "Tu representante quiere meter una clausula de salida en el contrato: si aparece un equipo grande, podes irte sin pagar. Al equipo no le va a gustar la sola idea.",
      options: {
        push: "Insistir con la clausula",
        drop: "Dejarla caer",
      },
      outcomes: {
        granted:
          "Despues de tres reuniones tensas, aceptan. Ahora tenes una puerta de salida que muy pocos tienen. Habra que ver cuando se abre.",
        refused:
          "Se niegan de plano y ademas les queda la idea de que ya estas pensando en irte.",
        loyal:
          "Firmas sin condiciones. El equipo lo lee como un gesto de compromiso y te lo agradece de mil maneras chicas.",
      },
    },
    "clause-triggered": {
      title: "Se abre la puerta",
      story:
        "Aquella clausula que tanto costo negociar deja de ser teorica: un equipo de arriba pregunto por vos formalmente. Tenes poco tiempo para contestar y todo el paddock mirando.",
      options: {
        "use-it": "Activarla y dar el salto",
        "stay-put": "Quedarte donde estas",
      },
      outcomes: {
        "big-move":
          "Firmas con el equipo grande. La primera vez que te sentas en ese auto entendes de que estaban hablando todos estos anios.",
        trap: "Das el salto y del otro lado hay un proyecto en crisis que nadie te conto. El auto es peor de lo que parecia desde afuera.",
        rewarded:
          "Elegis quedarte y el equipo responde: mas recursos, mas voz en las decisiones, y la sensacion de ser el numero uno de verdad.",
        stagnant:
          "Te quedas por lealtad y el proyecto no crece. Con los meses te preguntas que hubiera pasado del otro lado.",
      },
    },
    "agent-change": {
      title: "Cambiar de representante",
      story:
        "Tu representante te acompania desde los karts, pero hace dos mercados que no consigue mover nada. Aparecio una agencia grande, con contactos en todos los boxes y una reputacion de no tener escrupulos.",
      options: {
        switch: "Cambiar a la agencia grande",
        keep: "Seguir con el de siempre",
      },
      outcomes: {
        shark:
          "El tipo nuevo levanta el telefono y de golpe tu nombre suena en tres boxes. No es simpatico, pero funciona.",
        burned:
          "La agencia te usa como moneda de cambio en negociaciones que ni te involucran. Tu nombre queda manoseado.",
        steady:
          "Seguis con el de siempre. Nada explosivo, pero es el unico que te dice la verdad cuando no te gusta escucharla.",
      },
    },
    "rival-team-approach": {
      title: "Un tanteo discreto",
      story:
        "En el motorhome de otro equipo te esperan para una charla informal, sin agentes ni papeles. Nadie tiene que enterarse. En el paddock, nadie se entera de nada durante muy poco tiempo.",
      options: {
        listen: "Ir a escuchar",
        decline: "No ir",
      },
      outcomes: {
        leverage:
          "Escuchas, no prometes nada, y volves con informacion valiosa sobre lo que vale tu firma.",
        leaked:
          "Alguien te vio entrar. Para el viernes ya lo publicaron y en tu box te reciben con cara larga.",
        trusted:
          "Decis que no y te ocupas de que tu equipo se entere. Ese tipo de lealtad se paga en recursos.",
      },
    },
    "pay-cut": {
      title: "Menos plata, mejor auto",
      story:
        "Un equipo mejor te quiere, pero el presupuesto no da: la unica manera de que entres es que resignes buena parte de tu sueldo.",
      options: {
        accept: "Aceptar el recorte",
        refuse: "Rechazar y quedarte",
      },
      outcomes: {
        "worth-it":
          "Cobras bastante menos y no te importa: por primera vez tenes abajo un auto que responde a lo que pedis.",
        "no-return":
          "Resignaste el sueldo y el auto termino siendo apenas mejor. La apuesta salio cara.",
        dignity:
          "Decis que no. Te quedas donde estabas, con menos auto pero sin la sensacion de haberte regalado.",
      },
    },

    // ─── Prensa, patrocinadores y vida personal ───────────────────
    "press-blast": {
      title: "Micro abierto",
      story:
        "Cuarto abandono del anio por una falla que ya habias reportado. Salis del auto caliente y hay quince microfonos esperandote a diez metros.",
      options: {
        vent: "Decir lo que pensas, sin filtro",
        diplomatic: "Contenerte y ser diplomatico",
      },
      outcomes: {
        rallied:
          "Lo decis todo. Hay ruido una semana, pero adentro del equipo algo se acomoda: los que tenian que espabilar, espabilaron.",
        backfire:
          "Tus palabras salen en todos lados sin contexto. Quedas como el piloto que culpa a los demas.",
        professional:
          "Decis lo correcto con cara de poker. Nadie escribe nada y en la fabrica agradecen no tener que apagar otro incendio.",
      },
    },
    "social-media": {
      title: "El posteo",
      story:
        "Un periodista escribio que llegaste a la F1 por la plata de tu familia y no por talento. Tenes el telefono en la mano y algo escrito que todavia no publicaste.",
      options: {
        post: "Publicarlo",
        delete: "Borrarlo y no decir nada",
      },
      outcomes: {
        viral:
          "Tu respuesta da justo en el tono: firme, con humor y sin insultar. La gente la comparte todo el fin de semana.",
        storm:
          "El tono se lee mucho peor de lo que sonaba en tu cabeza. Dos dias de escandalo y una llamada incomoda del departamento de prensa.",
        quiet: "Borras el borrador y cerras el telefono. El tema se apaga solo en cuarenta y ocho horas.",
      },
    },
    "sponsor-demand": {
      title: "Compromiso con el sponsor",
      story:
        "El patrocinador principal organizo un evento en otro continente el jueves previo a una carrera clave. Tecnicamente podes decir que no.",
      options: {
        attend: "Ir al evento",
        skip: "Priorizar el fin de semana",
      },
      outcomes: {
        funded:
          "Vas, sonreis, firmas gorras. El sponsor queda encantado y renueva con mas plata: eso termina siendo desarrollo.",
        drained:
          "Llegas al circuito el viernes hecho pelota, con el cuerpo en otro huso horario. El fin de semana nunca arranca.",
        focused:
          "Te quedas, dormis bien y trabajas el circuito desde el jueves. Se nota en el ritmo.",
        angered:
          "El sponsor se entera de que elegiste no ir y lo toma personal. La renovacion queda en veremos.",
      },
    },
    documentary: {
      title: "Las camaras adentro",
      story:
        "Una productora quiere seguirte todo el anio, con acceso a la radio, al motorhome y a tu casa. Prometen mostrar al piloto de verdad.",
      options: {
        join: "Abrir las puertas",
        pass: "Decir que no",
      },
      outcomes: {
        beloved:
          "El episodio sobre vos le pega a mucha gente. De golpe te para gente en la calle que nunca habia visto una carrera.",
        edited:
          "Editan tus peores momentos uno detras del otro y arman un personaje que no sos. Cuesta sacarse esa etiqueta.",
        private:
          "Decis que no y seguis tranquilo. Menos fama, menos ruido, mas cabeza para lo unico que importa el domingo.",
      },
    },
    "fame-pressure": {
      title: "El peso del nombre",
      story:
        "Ya no podes ir a comer sin que te reconozcan. Hay tres marcas peleando por tu imagen y una agenda que se llena de cosas que no son manejar.",
      options: {
        embrace: "Aprovechar el momento",
        shield: "Poner limites y recluirte",
      },
      outcomes: {
        thrives:
          "Te movés comodo en el ruido. La exposicion te suma sin restarte foco: no todos pueden con las dos cosas.",
        distracted:
          "Entre viajes, notas y compromisos, dejaste de hacer lo que te trajo hasta aca. En pista se empieza a notar.",
        grounded:
          "Cortas casi todo y volves a lo basico. Menos titulares, mas simulador, la cabeza otra vez donde tiene que estar.",
      },
    },
    "charity-cause": {
      title: "Una causa propia",
      story:
        "Una fundacion de tu ciudad te pide que prestes tu nombre para un proyecto de karting para chicos sin recursos. No hay plata para vos, solo tiempo.",
      options: {
        lead: "Ponerle la cara y el tiempo",
        "quiet-support": "Ayudar sin difundirlo",
      },
      outcomes: {
        admired:
          "El proyecto crece y todos lo asocian a vos. Es la clase de cosas que te sobreviven a la carrera deportiva.",
        personal:
          "Ayudas en silencio, sin fotos ni prensa. No suma titulares, pero dormis un poco mejor.",
      },
    },

    // ─── Comisarios y reglamento ──────────────────────────────────
    "under-investigation": {
      title: "Bajo investigacion",
      story:
        "Los comisarios estan mirando tu maniobra de la vuelta 30. Fue al limite, de esas que se pueden explicar de dos maneras. Tenes que ir a declarar en veinte minutos.",
      options: {
        "defend-move": "Defender la maniobra",
        admit: "Reconocer que te pasaste",
      },
      outcomes: {
        cleared:
          "Explicas la maniobra con datos en la mano y te dan la razon. Sin sancion, y con fama de saber pelear tu caso.",
        penalised:
          "No les alcanza tu explicacion. Cinco segundos que te tiran fuera de los puntos.",
        lenient:
          "Reconoces el error de entrada y los comisarios lo valoran. La sancion queda en lo minimo.",
        harsh:
          "Admitis y aun asi te caen con todo, como para sentar precedente. Encima quedaste confesando.",
      },
    },
    "appeal-penalty": {
      title: "Apelar",
      story:
        "Te sancionaron por algo que en tu opinion no fue infraccion. El equipo puede apelar, pero eso significa semanas de ruido y una federacion que no suele dar marcha atras.",
      options: {
        appeal: "Apelar la sancion",
        accept: "Aceptar y seguir",
      },
      outcomes: {
        overturned:
          "Contra todo pronostico, la revocan. Te devuelven los puntos y la sensacion de que a veces vale la pena pelearla.",
        upheld:
          "La confirman y encima quedas marcado como el que discute todo. Semanas de desgaste para nada.",
        "move-on":
          "Tragas y seguis. Cuesta, pero la energia queda intacta para lo que viene.",
      },
    },
    "penalty-points": {
      title: "Al borde de la suspension",
      story:
        "Te queda un punto de penalizacion para la suspension automatica. Tu manera de correr, la que te trajo hasta aca, es justamente la que te tiene al borde.",
      options: {
        "cool-off": "Bajar un cambio unas carreras",
        "keep-style": "Seguir corriendo igual",
      },
      outcomes: {
        safe: "Manejas medido y llegas al final del ciclo sin sumar puntos. No fue divertido, pero funciono.",
        "got-away":
          "Seguis igual y zafas. Un par de maniobras al limite que los comisarios dejan pasar y salis del pozo.",
        banned:
          "Un toque, un punto mas, y quedas afuera de la proxima carrera. El equipo tiene que poner al piloto reserva.",
      },
    },
    "protest-rival": {
      title: "Protestar el auto rival",
      story:
        "Tu equipo cree que el auto que los viene ganando tiene una pieza fuera de reglamento. Si protestan y tienen razon, cambia la temporada. Si se equivocan, quedan como llorones.",
      options: {
        protest: "Impulsar la protesta",
        "let-go": "Dejarlo pasar",
      },
      outcomes: {
        vindicated:
          "La FIA revisa y les da la razon. El rival tiene que cambiar la pieza y de golpe estan mas cerca.",
        petty:
          "La protesta se cae en dos horas. Quedan como el equipo que en vez de mejorar su auto va a llorar a la carpa.",
        sporting:
          "Dejas el tema. Preferis que te ganen en pista antes que en una sala de comisarios.",
      },
    },
    "fia-summons": {
      title: "Citado por la federacion",
      story:
        "Dijiste en una conferencia que las decisiones de los comisarios cambian segun el color del auto. La federacion te cito para el jueves.",
      options: {
        apologise: "Pedir disculpas y cerrar el tema",
        "double-down": "Sostener lo que dijiste",
      },
      outcomes: {
        settled:
          "Firmas una aclaracion tibia y todos hacen como si nada. Aburrido, pero eficaz.",
        "folk-hero":
          "Sostenes cada palabra. Te multan, pero medio paddock piensa lo mismo y no se anima a decirlo: tu figura crece.",
        fined:
          "Te sostienen la mirada y te aplican una multa ejemplar. Encima ahora te miran con lupa todos los fines de semana.",
      },
    },

    // ─── Rivalidades ──────────────────────────────────────────────
    "rival-born": {
      title: "Nace una rivalidad",
      story:
        "Un piloto de otro equipo te cerro la puerta dos veces en la misma carrera y despues, en la zona mixta, dijo que manejas 'como un junior'. Los periodistas ya se dieron cuenta de que hay historia.",
      options: {
        engage: "Aceptar la pelea",
        ignore: "No darle entidad",
      },
      outcomes: {
        "fired-up":
          "Le contestas en pista y en los micros. Tenes un enemigo, y descubris que correr con bronca te hace ir mas rapido.",
        "above-it":
          "Sonreis y cambias de tema. Sin combustible, la historia se apaga sola y vos quedas como el adulto de la pelicula.",
      },
    },
    "rival-media-war": {
      title: "Guerra de declaraciones",
      story:
        "Tu rival volvio a la carga en una entrevista larga: dijo que tenes mas prensa que resultados. La pregunta ya esta sobre la mesa y todos esperan tu respuesta.",
      options: {
        "hit-back": "Contestarle con todo",
        "stay-quiet": "No entrar en el juego",
      },
      outcomes: {
        "crowd-loves-it":
          "Tu respuesta es filosa y con gracia. El publico se divierte, los diarios la levantan y vos quedas mejor parado.",
        ugly:
          "La cosa escala mas de la cuenta y termina en algo personal. Los dos quedan salpicados.",
        classy:
          "Contestas que preferis hablar en pista. Suena a frase hecha, pero funciona: te deja bien parado y a el, hablando solo.",
      },
    },
    "rival-payback": {
      title: "La revancha",
      story:
        "Se te aparece la ocasion perfecta: tu rival esta a tiro, en el interior, en la curva donde te tiro afuera el anio pasado. Nadie te podria acusar de nada si algo saliera mal.",
      options: {
        revenge: "Cobrartela",
        "race-clean": "Pasarlo limpio",
      },
      outcomes: {
        even: "Lo pasas apretandolo hasta el pasto. Queda claro que con vos no se juega, aunque no todos aplaudan.",
        "both-out":
          "El toque termina con los dos afuera. La prensa se hace un festin y ninguno gana nada.",
        "respect-earned":
          "Lo pasas por afuera, limpio, sin tocarlo. Hasta el te busca despues para darte la mano.",
      },
    },
    "rival-truce": {
      title: "Bajar las armas",
      story:
        "Despues de anios de piques, tu rival te propone terminar con el circo: una foto juntos, un par de declaraciones y listo. Dice que ya estan grandes para esto.",
      options: {
        "make-peace": "Hacer las paces",
        never: "No perdonar nada",
      },
      outcomes: {
        friends:
          "La foto da la vuelta al mundo. Lo que era veneno se convierte en una de esas rivalidades que la gente recuerda con carino.",
        fuel: "Le decis que no. Seguis manejando con esa bronca prendida, y sigue funcionandote.",
      },
    },
    "rival-final-duel": {
      title: "El duelo definitivo",
      story:
        "Ultima carrera, y despues de todos estos anios estan los dos peleando por lo mismo. Lo que decidas en las proximas dos horas es lo que van a contar de vos cuando ya no manejes.",
      options: {
        "all-in": "Ir a buscarlo todo",
        points: "Manejar por los puntos",
      },
      outcomes: {
        legend:
          "Te la jugas en cada vuelta y sale. La carrera entra en la lista de las que se repiten cada aniversario.",
        heartbreak:
          "Arriesgas de mas y lo perdes todo en una curva. De esas derrotas no se vuelve igual.",
        smart:
          "Manejas con la cabeza fria, sumas lo que tenias que sumar y dejas que el se equivoque. No fue epico, fue correcto.",
        "too-cautious":
          "Especulas de mas y el se anima. Terminas el anio pensando en la vuelta que no diste.",
      },
    },

    // ─── Crisis del equipo ────────────────────────────────────────
    "sponsor-lost": {
      title: "Se cae el patrocinador",
      story:
        "El sponsor principal rompio el contrato de un dia para el otro. El auto va a salir con espacios en blanco y el departamento tecnico ya hablo de recortes.",
      options: {
        "help-find": "Salir a buscar reemplazo",
        "focus-driving": "Concentrarte en manejar",
      },
      outcomes: {
        saved:
          "Golpeas puertas, usas tus contactos y aparece un reemplazo. En la fabrica no lo van a olvidar.",
        failed:
          "Perdes semanas en reuniones que no llevan a nada y encima llegas a las carreras con la cabeza en otro lado.",
        detached:
          "Dejas que se ocupe quien tiene que ocuparse. El auto sufre los recortes, pero vos llegas entero a cada domingo.",
      },
    },
    takeover: {
      title: "Cambio de duenios",
      story:
        "Un grupo inversor compro el equipo. Prometen dinero, fabrica nueva y ambicion. Los que llevan veinte anios ahi ya escucharon ese discurso otras veces.",
      options: {
        "back-them": "Apoyar el proyecto en publico",
        "look-elsewhere": "Cubrirte por las dudas",
      },
      outcomes: {
        investment:
          "La plata aparece de verdad. En un anio el equipo se transforma y vos quedaste del lado correcto de la historia.",
        "empty-promises":
          "Las promesas se evaporan y el presupuesto real es menor que antes. Quedaste atado a un proyecto vacio.",
        hedged:
          "No te comprometes con nadie y mantenes conversaciones abiertas. No es glamoroso, pero es prudente.",
      },
    },
    "team-may-fold": {
      title: "El equipo se hunde",
      story:
        "Se habla de que el equipo no llega a fin de anio. Los proveedores cortaron el credito y hay mecanicos actualizando su curriculum en el garaje.",
      options: {
        "stay-loyal": "Quedarte y dar pelea",
        "jump-ship": "Buscar salida ya",
      },
      outcomes: {
        rescued:
          "Te quedas, das la cara, y aparece un comprador a ultimo momento. Todos saben quien no se bajo cuando se hundia.",
        sank: "Te quedas y el equipo cierra igual. Terminas la temporada sin butaca y con el mercado ya cerrado.",
        survivor:
          "Te vas a tiempo. Salvas tu carrera, aunque algunos en ese garaje no te lo perdonen.",
      },
    },
    "unpaid-crew": {
      title: "Los mecanicos sin cobrar",
      story:
        "Hace dos meses que el equipo no le paga a los mecanicos. Siguen viniendo igual, armando tu auto cada fin de semana. Uno te lo conto casi pidiendo disculpas.",
      options: {
        "pay-them": "Poner plata de tu bolsillo",
        "stay-out": "No meterte",
      },
      outcomes: {
        devotion:
          "Pagas vos y pedis que no se sepa. Se sabe igual. A partir de ahi, ese grupo de gente hace cosas por tu auto que no estan en ningun manual.",
        resentment:
          "El clima del garaje se pudre. Las paradas salen lentas y los errores se acumulan.",
        resolved:
          "El equipo termina regularizando los pagos por su cuenta. Zafaste de meterte y no paso a mayores.",
      },
    },
    "boss-fired": {
      title: "Echan al jefe",
      story:
        "El jefe de equipo que te trajo a la F1 fue despedido el lunes. El que llega tiene fama de armar todo a su gusto y de no tenerle carinio a nadie del plantel anterior.",
      options: {
        "defend-boss": "Salir a bancar al que se fue",
        "welcome-new": "Congraciarte con el nuevo",
      },
      outcomes: {
        honourable:
          "Agradeces publicamente al que se fue. Queda bien y muchos te lo reconocen, aunque adentro te miren de reojo un tiempo.",
        marked:
          "El nuevo lo toma como un desafio personal. De golpe sos el que quedo del bando perdedor.",
        favoured:
          "Te acercas rapido y funciona: el nuevo te pone en el centro del proyecto.",
        clash:
          "Intentas acercarte y no engancha. Ya venia con su piloto en la cabeza desde antes de firmar.",
      },
    },

    // ─── Clima y caos ─────────────────────────────────────────────
    monsoon: {
      title: "Diluvio",
      story:
        "Cae agua a baldes y la carrera esta por relanzarse. El radar dice que en diez minutos para. Podes entrar por lisos ahora, cuando la pista todavia es un rio.",
      options: {
        "slicks-gamble": "Apostar a los lisos",
        wets: "Poner lluvia y esperar",
      },
      outcomes: {
        masterstroke:
          "Sobrevivis tres vueltas imposibles y despues la pista seca. Pasas a todos sin pelear: la jugada del anio.",
        aquaplane:
          "En la segunda curva el auto flota y te vas al pasto. La apuesta se pago sola, en contra.",
        solid:
          "Poner lluvia era lo logico y funciono. Sumaste puntos mientras otros se despistaban.",
      },
    },
    "safety-car-gamble": {
      title: "Safety car",
      story:
        "Sale el auto de seguridad justo cuando estabas por parar. Entrar ahora es gratis en tiempo, pero salis en el trafico. Quedarte afuera te deja adelante con gomas que ya no dan.",
      options: {
        pit: "Entrar a boxes",
        "stay-out": "Quedarte en pista",
      },
      outcomes: {
        jackpot:
          "Entras y salis justo delante del grupo. Gomas nuevas y pista libre: regalo.",
        trapped:
          "Salis en medio de un tren de autos y te quedas atrapado ahi hasta el final.",
        "track-position":
          "Te quedas afuera y aguantas con lo que tenes. La posicion en pista termina valiendo mas que las gomas.",
        "sitting-duck":
          "Al relanzamiento tus gomas estan muertas y te comen de a uno. Perdes cinco puestos en dos vueltas.",
      },
    },
    "red-flag": {
      title: "Bandera roja",
      story:
        "Bandera roja y todos al pit lane. Se puede cambiar todo sin costo. Media parrilla va a salir con estrategia nueva y quedan quince vueltas de esprint.",
      options: {
        aggressive: "Ir por la goma mas rapida",
        conservative: "Elegir lo seguro",
      },
      outcomes: {
        charged:
          "Salis con la goma agresiva y en el relanzamiento te comes tres autos antes de la curva 4.",
        "burned-out":
          "La goma rinde cinco vueltas y despues se cae a pedazos. El final es una agonia.",
        banked:
          "Elegis lo conservador, no brillas, pero terminas donde tenias que terminar.",
      },
    },
    "grid-penalty-strategy": {
      title: "Ultimo en la grilla",
      story:
        "Cambio de motor: largas ultimo. El muro propone una estrategia larga, a contramano de todos, que solo funciona si sos capaz de adelantar mucho.",
      options: {
        "long-game": "Ir a la estrategia larga",
        "write-off": "Dar la carrera por perdida",
      },
      outcomes: {
        carved:
          "Vas pasando de a uno, con paciencia, y en las ultimas vueltas aparecen las gomas frescas. Remontada de las que se aplauden.",
        stuck:
          "La estrategia depende de adelantar y el circuito no perdona. Te quedas atascado toda la tarde.",
        "saved-parts":
          "El equipo aprovecha para probar piezas y guardar kilometros. No hay puntos, pero hay datos.",
      },
    },
    "first-lap-chaos": {
      title: "Caos en la largada",
      story:
        "Se apagan las luces y en la curva 1 se arma un desastre delante tuyo: humo, autos girando y un hueco por adentro que se abre y se cierra en un segundo.",
      options: {
        "thread-it": "Meterte por el hueco",
        "back-off": "Levantar y esquivar",
      },
      outcomes: {
        gained:
          "Pasas por el medio del desastre sin tocar a nadie. Salis de la curva 1 con seis puestos ganados.",
        collected:
          "El hueco se cierra justo cuando entrabas. Un auto que giraba te encuentra de lleno.",
        survived:
          "Levantas, esquivas todo y salis limpio. Perdiste un par de puestos, pero seguis en carrera.",
      },
    },

    // ─── Salud y estado fisico ────────────────────────────────────
    "big-crash": {
      title: "Accidente fuerte",
      story:
        "Rotura de suspension a alta velocidad. El auto quedo partido y vos saliste caminando, pero el chequeo medico encontro algo en la espalda. Hay carrera en seis dias.",
      options: {
        "rush-back": "Correr igual",
        "sit-out": "Bajarte y recuperarte bien",
      },
      outcomes: {
        brave:
          "Corres con analgesicos y terminas la carrera. La imagen tuya saliendo del auto le da la vuelta al mundo.",
        lingering:
          "Corres antes de tiempo y la lesion se instala. Vas a convivir con esa molestia mucho mas de lo que pensabas.",
        healed:
          "Te bajas y te recuperas como corresponde. Perdes una carrera, pero volves entero.",
      },
    },
    "injury-legacy": {
      title: "La molestia que quedo",
      story:
        "Aquella lesion nunca se fue del todo. En las carreras largas, sobre el final, la espalda te empieza a jugar en contra justo cuando mas concentracion necesitas.",
      options: {
        surgery: "Operarte ahora",
        "manage-it": "Convivir con la molestia",
      },
      outcomes: {
        fixed:
          "La cirugia sale bien. Despues de meses de recuperacion volves a manejar sin pensar en el cuerpo.",
        complications:
          "La operacion se complica y la recuperacion es larga. Nunca volves a sentir el auto igual.",
        coping:
          "Con kinesiologia y un asiento nuevo la llevas. No es lo ideal, pero se puede.",
        worse:
          "Postergarla fue peor. La molestia crece y ahora te condiciona en cada fin de semana.",
      },
    },
    "training-regime": {
      title: "Preparacion fisica",
      story:
        "El preparador te propone un plan mucho mas duro para el invierno. Promete que vas a llegar mas fuerte que nunca, pero implica no parar nunca del todo.",
      options: {
        brutal: "Plan exigente",
        balanced: "Plan equilibrado",
      },
      outcomes: {
        "peak-shape":
          "Llegas a la pretemporada en la mejor forma de tu vida. En las carreras de calor se nota la diferencia.",
        overtrained:
          "Te pasas de rosca. Llegas al primer test agotado y arrastras el cansancio los primeros meses.",
        sustainable:
          "Un plan que podes sostener todo el anio. Sin picos espectaculares, pero llegas bien a todas.",
      },
    },
    burnout: {
      title: "Desgaste",
      story:
        "Hace meses que no disfrutas nada de esto. Viajes, presion, resultados que no llegan. El domingo a la noche ya no hay bronca ni alegria, solo cansancio.",
      options: {
        break: "Frenar y desconectar",
        "power-through": "Seguir adelante igual",
      },
      outcomes: {
        recharged:
          "Te tomas unas semanas de verdad, lejos de todo. Volves con una claridad que hacia mucho no tenias.",
        grit: "Apretas los dientes y salis adelante sin frenar. No fue sano, pero funciono y todos lo notaron.",
        collapse:
          "Seguis empujando hasta que el cuerpo y la cabeza dicen basta. Los errores se multiplican.",
      },
    },
    "sports-psychologist": {
      title: "Trabajo mental",
      story:
        "El equipo te sugiere trabajar con una psicologa deportiva. Vos siempre creiste que estas cosas se arreglan manejando, y que pedir ayuda es mostrar una grieta.",
      options: {
        "work-with": "Aceptar la ayuda",
        alone: "Arreglartelas solo",
      },
      outcomes: {
        clarity:
          "Las sesiones te ordenan la cabeza mas de lo que esperabas. Volves a disfrutar y ademas rendis mejor.",
        "no-click":
          "No terminas de engancharte con el proceso. No te hace mal, pero tampoco te cambia nada.",
        "self-made":
          "Lo resolves a tu manera, con horas de simulador y silencio. Funciono, aunque tardo mas.",
        spiral:
          "Sin ayuda, la bola se hace mas grande. Cada error pesa mas que el anterior.",
      },
    },

    // ─── Ingeniero y mecanicos ────────────────────────────────────
    "hide-problem": {
      title: "El fallo que nadie vio",
      story:
        "Tu ingeniero te muestra en privado unos datos raros: hay una pieza trabajando fuera de especificacion. Declararlo significa perder el resultado. El te mira esperando que decidas vos.",
      options: {
        "cover-up": "Callarlo y seguir",
        report: "Informarlo al equipo",
      },
      outcomes: {
        held: "Deciden no decir nada. El auto aguanta y el resultado queda. Pero ahora hay una carpeta que existe y dos personas que lo saben.",
        "fixed-early":
          "Lo informas. Perdes el resultado del fin de semana, pero lo corrigen antes de que sea grave y el equipo lo valora.",
        blamed:
          "Lo informas y alguien arriba prefiere buscar un culpable antes que resolverlo. El culpable termina siendo el que hablo.",
      },
    },
    "problem-surfaces": {
      title: "Sale a la luz",
      story:
        "Un periodista tecnico esta haciendo preguntas muy precisas sobre aquella pieza. Demasiado precisas. Alguien hablo, y tu ingeniero te llama antes de que salga la nota.",
      options: {
        confess: "Adelantarte y contar todo",
        "keep-quiet": "Negarlo y aguantar",
      },
      outcomes: {
        forgiven:
          "Contas la verdad antes de que la publiquen. Hay ruido, pero el hecho de haberlo dicho vos mismo te salva de lo peor.",
        scandal:
          "Contas todo y el escandalo se lleva puesto medio equipo. Tu nombre queda pegado a ese titulo para siempre.",
        buried:
          "La nota sale, no la puede probar nadie y el tema se apaga. Zafaste, aunque no vas a olvidarte de la semana que pasaste.",
        exposed:
          "Lo negas y a los tres dias aparecen los mails. Quedar mal es una cosa; quedar mal habiendo mentido es otra.",
      },
    },
    "engineer-swap": {
      title: "Cambio de ingeniero",
      story:
        "Con tu ingeniero de pista no se entienden. El habla en numeros, vos en sensaciones, y cada fin de semana se pierde una hora traduciendo. Podes pedir un cambio.",
      options: {
        request: "Pedir el cambio",
        "work-on-it": "Trabajar la relacion",
      },
      outcomes: {
        "better-fit":
          "El nuevo entiende como hablas. Desde el primer viernes el auto llega mas cerca de lo que pedis.",
        worse:
          "El cambio rompe una rutina que igual funcionaba. Cuesta meses volver al punto de partida.",
        bond: "Se sientan a laburarlo y encuentran un idioma comun. Lo que era friccion ahora es confianza.",
      },
    },
    "mechanic-error": {
      title: "El error del box",
      story:
        "Una rueda mal puesta te costo el podio. El mecanico responsable es un pibe de veintitres anios que no puede ni mirarte a la cara. La prensa quiere saber que paso.",
      options: {
        "shield-them": "Bancarlo publicamente",
        "call-out": "Marcar el error",
      },
      outcomes: {
        loyalty:
          "Decis que el equipo gana y pierde junto, y que vos tambien cometiste errores. Ese pibe va a trabajar por vos el resto de su vida.",
        sharper:
          "Marcas el error con firmeza y el box se pone serio. Las paradas mejoran, aunque el clima quede tenso.",
        resented:
          "Lo expones y el garaje entero te lo cobra en frialdad. Nadie te va a hacer un favor cuando lo necesites.",
      },
    },
    "trust-the-wall": {
      title: "Confiar en el muro",
      story:
        "Por radio te piden que entres a boxes ya. Vos venis sintiendo el auto bien y crees que hay que estirar. Tenes menos de una vuelta para decidir quien manda.",
      options: {
        follow: "Hacer lo que dice el muro",
        "own-call": "Hacer lo tuyo",
      },
      outcomes: {
        "right-call":
          "Entras cuando te dijeron y era el momento justo. Ellos tenian la informacion que vos no veias.",
        "wrong-call":
          "Entras y era pronto. Salis en el trafico y ves como el que estiro te pasa por delante.",
        vindicated:
          "Estiras contra la orden y tenias razon. Cruzas la meta adelante y en la radio no saben si retarte o felicitarte.",
        insubordinate:
          "Ignoras la orden y sale mal. Ademas del resultado, rompiste algo mas dificil de reparar que un aleron.",
      },
    },
    "engineer-leaves": {
      title: "Se va tu ingeniero",
      story:
        "Tu ingeniero de pista, el que te conoce mejor que nadie despues de tantos anios, acepto una oferta de otro equipo. Te lo cuenta el mismo, antes que nadie.",
      options: {
        "follow-them": "Intentar seguirlo",
        stay: "Quedarte y adaptarte",
      },
      outcomes: {
        reunited:
          "Se dan las condiciones y terminan trabajando juntos otra vez. Retomar la sintonia lleva una carrera y media.",
        stranded:
          "Perseguis la idea, no se da, y encima tu equipo se entera de que estabas mirando la puerta.",
        adapted:
          "Te quedas y construis de cero con alguien nuevo. Cuesta el primer tiempo, pero se puede.",
      },
    },

    // ─── Fuera de la F1 ───────────────────────────────────────────
    "indycar-offer": {
      title: "Oferta de IndyCar",
      story:
        "Un equipo grande de IndyCar te ofrece butaca, buen contrato y autos competitivos de verdad. Del otro lado del oceano tambien se corre, y ahi si podrias pelear cosas.",
      options: {
        tempted: "Escuchar la propuesta en serio",
        committed: "Cerrar la puerta",
      },
      outcomes: {
        recharged:
          "Escuchar otra cosa te recuerda por que te gusta correr. Volves a la F1 con la cabeza mas liviana.",
        distracted:
          "Te la pasas mirando lo que podria ser y dejas de estar del todo en lo que es. En tu box se dan cuenta.",
        focused:
          "Decis que no sin dudar. Viniste por una cosa y todavia no la conseguiste.",
      },
    },
    "lemans-invite": {
      title: "Invitacion a Le Mans",
      story:
        "Un equipo oficial te invita a correr las 24 Horas. Es en un hueco del calendario, pero tu equipo de F1 preferiria que no te subas a nada que no sea su auto.",
      options: {
        "race-it": "Correr Le Mans",
        decline: "Rechazar la invitacion",
      },
      outcomes: {
        glory:
          "Corres, andas bien y hasta subis al podio. Ganaste algo que la F1 no da: la certeza de que sabes correr cualquier cosa.",
        exhausted:
          "Veinticuatro horas te dejan hecho pedazos. Llegas a la siguiente de F1 sin nafta en el tanque.",
        "single-minded":
          "Decis que no. Una sola cosa a la vez, y esa cosa es el domingo que viene.",
      },
    },
    "dakar-dream": {
      title: "El Dakar",
      story:
        "Siempre dijiste que antes de retirarte querias hacer el Dakar. Apareció la chance concreta, con equipo y camioneta. Y tambien el riesgo real de romperte algo lejos de todo.",
      options: {
        go: "Ir al Dakar",
        someday: "Dejarlo para mas adelante",
      },
      outcomes: {
        adventure:
          "Dos semanas en el desierto te cambian la cabeza. Volves con historias para toda la vida y una sonrisa nueva.",
        injured:
          "Un vuelco en la etapa siete te deja con una muniieca fisurada y meses de recuperacion.",
        shelved:
          "Lo dejas para cuando cuelgues el casco. Es lo sensato, aunque te quede la espina.",
      },
    },
    "esports-team": {
      title: "Equipo de esports",
      story:
        "Te proponen poner tu nombre y tu plata en un equipo de simracing. Es un mundo que conoces y que crece rapido, pero montar un equipo lleva tiempo y cabeza.",
      options: {
        "found-it": "Fundar el equipo",
        "not-now": "Dejarlo para despues",
      },
      outcomes: {
        thriving:
          "El equipo funciona, gana campeonatos y te acerca a una generacion entera que no te conocia.",
        "money-pit":
          "Resulta ser mucho mas caro y mas trabajoso de lo que te vendieron. Un dolor de cabeza extra.",
        focused:
          "Lo posponés. Ya vas a tener tiempo para proyectos cuando no tengas que manejar los domingos.",
      },
    },
    "reserve-role": {
      title: "Piloto reserva",
      story:
        "No tenes butaca. Un equipo te ofrece ser su piloto reserva: sin correr, pero adentro del paddock, en el simulador y a mano si alguien se lesiona.",
      options: {
        accept: "Aceptar el rol",
        "hold-out": "Esperar una butaca titular",
      },
      outcomes: {
        "in-the-paddock":
          "Aceptas y seguis existiendo para el paddock. Te ven cada fin de semana, y en este mundo estar es medio camino.",
        rewarded:
          "Esperas, aguantas la ansiedad, y a mitad de anio se abre una butaca de verdad. La paciencia pago.",
        forgotten:
          "Pasan los meses lejos de todo y tu nombre deja de aparecer en las listas. Desaparecer es mas rapido de lo que parece.",
      },
    },

    // ─── Legado y mentoria ────────────────────────────────────────
    "mentor-rookie": {
      title: "El pibe nuevo",
      story:
        "Llego a la academia del equipo un chico de dieciocho anios con un talento que asusta. Te piden que lo guies. Tambien es cierto que en tres anios puede estar peleando tu butaca.",
      options: {
        "take-them": "Tomarlo bajo tu ala",
        "no-time": "No involucrarte",
      },
      outcomes: {
        proud:
          "Le abris la cabeza, le contas lo que a vos nadie te conto. Verlo progresar te da algo distinto a un trofeo.",
        selfish:
          "Le decis que cada uno se arregla como puede, como te toco a vos. Ganas tiempo para lo tuyo, pero algunos toman nota.",
      },
    },
    "mentee-returns": {
      title: "El alumno",
      story:
        "Aquel pibe al que ayudaste ahora tiene butaca y viene rapido. Este fin de semana estan peleando la misma posicion, y el ya no te pide consejos.",
      options: {
        "beat-them": "Ganarle y marcar territorio",
        "help-them": "Dejarlo crecer",
      },
      outcomes: {
        "still-sharp":
          "Le ganas limpio y le recordas por que era el que preguntaba. Todavia estas.",
        "passed-torch":
          "Te gana, y te das cuenta de que ya no es el mismo pibe. Duele, aunque en el fondo algo de orgullo hay.",
        "legacy-secured":
          "Lo dejas pasar y despues lo ayudas en el box. Todos entienden lo que acaba de pasar y eso vale mas que un puesto.",
      },
    },
    "retirement-thoughts": {
      title: "Pensar en el final",
      story:
        "Ya no te levantas con la misma ansiedad los jueves. El cuerpo tarda mas en recuperarse y hay pibes de veinte anios que van mas rapido sin despeinarse. La pregunta empieza a aparecer sola.",
      options: {
        "one-more": "Una temporada mas",
        "plan-exit": "Empezar a planear la salida",
      },
      outcomes: {
        renewed:
          "Decidis seguir y algo se enciende otra vez. Volves a manejar sin pensar, como cuando empezaste.",
        fading:
          "Seguis un anio mas y las sensaciones no vuelven. Cada fin de semana cuesta un poco mas que el anterior.",
        "at-peace":
          "Empezas a ordenar la salida con tiempo. Manejar sabiendo cuando termina te saca un peso de encima.",
      },
    },
    "academy-offer": {
      title: "Dirigir la academia",
      story:
        "El equipo te ofrece dirigir su academia de jovenes cuando dejes de correr. Es seguridad para despues, pero implica empezar a mirar el final con fecha.",
      options: {
        accept: "Aceptar y asegurar el futuro",
        "still-racing": "Todavia no, sigo manejando",
      },
      outcomes: {
        "future-secured":
          "Firmas y sabes que hay vida despues del casco. La tranquilidad tiene un precio: parte de tu cabeza ya esta en el otro lado.",
        "not-done":
          "Les decis que hablen en unos anios. Todavia te levantas con ganas de manejar y eso manda.",
      },
    },
    autobiography: {
      title: "Tu libro",
      story:
        "Una editorial quiere tu autobiografia. El adelanto es importante y el interes tambien. La pregunta es cuanto vas a contar de lo que viste adentro de los boxes.",
      options: {
        "tell-all": "Contarlo todo",
        diplomatic: "Contar lo publicable",
      },
      outcomes: {
        bestseller:
          "El libro es un exito. Contaste cosas que nadie habia contado y la gente lo agradece.",
        "burned-bridges":
          "El libro incomoda a media parrilla. Vendiste ejemplares y perdiste amigos y algun aliado que te hacia falta.",
        respectable:
          "Un libro correcto, agradable y sin escandalos. Nadie se enoja y nadie se sorprende.",
      },
    },
    "final-season-announce": {
      title: "Anunciar el final",
      story:
        "Ya lo decidiste: esta es la ultima. Podes anunciarlo ahora y vivir una gira de despedida, o guardartelo y mantener a todos adivinando hasta diciembre.",
      options: {
        announce: "Anunciarlo ahora",
        "keep-guessing": "No decir nada todavia",
      },
      outcomes: {
        "farewell-tour":
          "Cada circuito te prepara un homenaje. Es hermoso y agotador: despedirse en cada pais cuesta mas energia de la que imaginabas.",
        leverage:
          "Te guardas la noticia. El silencio te mantiene en todas las conversaciones de mercado hasta el ultimo dia.",
      },
    },
  },
};

export default content;
