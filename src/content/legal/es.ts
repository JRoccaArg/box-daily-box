// src/content/legal/es.ts
//
// Versión en ESPAÑOL de los documentos legales. Es la versión VINCULANTE
// (ver cláusula de idioma prevaleciente): el responsable tiene domicilio en
// Argentina y el documento se rige por la ley argentina. Las traducciones a
// otros idiomas se ofrecen por conveniencia.

import type { LegalContent } from "./types";

const LAST_UPDATED = "2026-08-15";
// Fecha propia de la Política de Privacidad: se actualizó al introducir las
// analíticas (Vercel + Google Analytics) y el banner de consentimiento, sin
// tocar la fecha de los Términos, que no cambiaron.
const PRIVACY_UPDATED = "2026-09-02";
const CONTACT_EMAIL = "boxdailybox@gmail.com";
const OPERATOR = "Juan Cruz Rocca";

const content: LegalContent = {
  terms: {
    title: "Términos y Condiciones",
    lastUpdated: LAST_UPDATED,
    intro: [
      `Box Daily Box ("el Servicio", "el sitio") es un proyecto personal operado por ${OPERATOR}, con domicilio en la República Argentina. Al acceder o usar el Servicio, aceptás estos Términos y Condiciones. Si no estás de acuerdo, por favor no uses el sitio.`,
    ],
    sections: [
      {
        heading: "1. Qué es Box Daily Box",
        blocks: [
          {
            p: "Box Daily Box es una plataforma gratuita de minijuegos diarios sobre Fórmula 1. Cada día se publica un nuevo desafío para cada juego. El Servicio es un proyecto hecho por fans, con fines de entretenimiento.",
          },
          {
            p: "El Servicio NO está afiliado, asociado, autorizado ni respaldado de ninguna forma por Formula One Group, la FIA, ni ninguna escudería, piloto u organización oficial de la Fórmula 1. Todas las marcas mencionadas pertenecen a sus respectivos titulares.",
          },
        ],
      },
      {
        heading: "2. Edad mínima",
        blocks: [
          {
            p: "Para usar el Servicio debés tener al menos 13 años. Si tu legislación local exige una edad mayor para consentir el tratamiento de datos personales sin autorización de un adulto responsable, debés contar con dicha autorización. El Servicio no está dirigido a menores de 13 años.",
          },
        ],
      },
      {
        heading: "3. Tu identidad y tu cuenta",
        blocks: [
          {
            p: "Podés jugar de forma anónima (sin crear una cuenta) o iniciar sesión con tu cuenta de Google. En cualquiera de los dos casos, sos responsable del uso del Servicio bajo tu identidad y del nombre público que elijas.",
          },
          {
            p: "El nombre que elijas es visible para otros usuarios en los rankings públicos. No debés usar nombres ofensivos, ilegales, que suplanten a terceros o que infrinjan derechos de otros.",
          },
        ],
      },
      {
        heading: "4. Uso aceptable",
        blocks: [
          { p: "Al usar el Servicio, te comprometés a NO:" },
          {
            list: [
              "Hacer trampa, manipular resultados, o intentar inflar tu puntaje o posición por medios no previstos por el juego.",
              "Usar bots, scripts, automatización o ingeniería inversa para interactuar con el Servicio o su API.",
              "Crear múltiples cuentas para eludir los límites del ranking o el sistema anti-trampa.",
              "Interferir con el funcionamiento del Servicio, sobrecargarlo, o intentar acceder a datos de otros usuarios.",
              "Usar nombres o contenidos ofensivos, discriminatorios o ilegales.",
            ],
          },
          {
            p: "El operador puede excluir intentos del ranking, restringir o suspender el acceso, o eliminar cuentas que violen estos Términos, sin aviso previo cuando sea necesario para proteger la integridad del Servicio.",
          },
        ],
      },
      {
        heading: "5. Propiedad intelectual",
        blocks: [
          {
            p: "El código, el diseño, los textos originales y la identidad visual del Servicio pertenecen a su operador. Los nombres, marcas y logotipos de la Fórmula 1, la FIA, escuderías y pilotos pertenecen a sus respectivos titulares y se usan únicamente con fines informativos y de referencia dentro de un contexto de fans.",
          },
          {
            p: "Los datos deportivos utilizados (resultados históricos, nombres de pilotos, escuderías, nacionalidades) son hechos de dominio público.",
          },
        ],
      },
      {
        heading: "6. Contenido generado o asistido por inteligencia artificial",
        blocks: [
          {
            p: "Partes del código, de los textos de la interfaz y de algunos elementos visuales del Servicio fueron generados o asistidos por herramientas de inteligencia artificial, y revisados por el operador antes de publicarse.",
          },
          {
            p: "Los datos históricos de Fórmula 1 utilizados (resultados, escuderías, pilotos, nacionalidades) provienen de fuentes públicas y de conjuntos de datos abiertos. Se procura su exactitud, pero pueden contener errores, imprecisiones u omisiones.",
          },
        ],
      },
      {
        heading: "7. Apoyo voluntario",
        blocks: [
          {
            p: "El Servicio es y seguirá siendo gratuito en su modalidad actual (ver también la Sección 10, \"Cambios en el Servicio y en estos Términos\"). Si querés, podés apoyar su desarrollo con una contribución voluntaria a través de plataformas de terceros: Cafecito (para Argentina) y Ko-fi (internacional).",
          },
          {
            p: "Esa contribución es una donación, no una compra: no genera una relación de consumo respecto del Servicio, no otorga acceso a contenido exclusivo, ventajas de juego, ranking preferencial ni ningún otro beneficio dentro del Servicio, y no es reembolsable por parte del operador.",
          },
          {
            p: "El cobro lo procesa íntegramente la plataforma elegida (Cafecito o Ko-fi), bajo sus propios términos y su propia política de privacidad. El operador no recibe, no almacena ni procesa ningún dato de pago: al hacer clic en el botón de apoyo salís del Servicio hacia el sitio de esa plataforma.",
          },
        ],
      },
      {
        heading: "8. Servicio \"tal cual\"",
        blocks: [
          {
            p: "El Servicio se ofrece \"tal cual\" y \"según disponibilidad\", sin garantías de ningún tipo. No garantizamos que el Servicio esté libre de errores, disponible de forma ininterrumpida, ni que los datos deportivos sean exactos. Podemos modificar, suspender o discontinuar el Servicio (total o parcialmente) en cualquier momento.",
          },
        ],
      },
      {
        heading: "9. Limitación de responsabilidad",
        blocks: [
          {
            p: "En la máxima medida permitida por la ley aplicable, el operador no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del Servicio. Nada en estos Términos limita derechos que la ley te reconozca de forma irrenunciable como consumidor.",
          },
        ],
      },
      {
        heading: "10. Cambios en el Servicio y en estos Términos",
        blocks: [
          {
            p: "Podemos actualizar estos Términos para reflejar cambios en el Servicio o en la ley. La versión vigente estará siempre disponible en esta página, con su fecha de última actualización.",
          },
          {
            p: "El modo gratuito actual del Servicio —un intento por juego por día, sin necesidad de registrarte ni de pagar— va a seguir estando disponible sin costo y sin que sea necesario ver ningún anuncio para poder jugar.",
          },
          {
            p: "En el futuro podríamos incorporar publicidad (por ejemplo, banners laterales que no interrumpen el juego ni requieren cerrarlos o esperar para poder seguir jugando) y/o una membresía opcional paga con beneficios adicionales (por ejemplo, intentos extra). Ninguna de esas eventuales novedades va a reemplazar ni a condicionar el modo gratuito descripto en el párrafo anterior.",
          },
          {
            p: "Si se introduce publicidad, funciones pagas u otra forma de monetización, estos Términos y la Política de Privacidad se actualizarán en consecuencia, y se te informará y solicitará tu consentimiento cuando la ley así lo requiera.",
          },
        ],
      },
      {
        heading: "11. Ley aplicable y jurisdicción",
        blocks: [
          {
            p: "Estos Términos se rigen por las leyes de la República Argentina. Cualquier controversia se someterá a los tribunales competentes de Argentina, sin perjuicio de los derechos que las normas imperativas de protección al consumidor de tu país de residencia te reconozcan, incluida la posibilidad de recurrir a los tribunales de tu domicilio cuando la ley lo permita.",
          },
        ],
      },
      {
        heading: "12. Contacto",
        blocks: [
          { p: "Para consultas sobre estos Términos podés escribir a:" },
          { email: CONTACT_EMAIL },
        ],
      },
      {
        heading: "13. Idioma",
        blocks: [
          {
            p: "La versión en español de este documento es la versión vinculante. Las traducciones a otros idiomas se ofrecen únicamente por conveniencia y, en caso de discrepancia, prevalece la versión en español.",
          },
        ],
      },
    ],
  },

  privacy: {
    title: "Política de Privacidad",
    lastUpdated: PRIVACY_UPDATED,
    intro: [
      `Esta Política de Privacidad explica qué datos personales trata Box Daily Box, con qué finalidad y bajo qué base legal. El responsable del tratamiento es ${OPERATOR}, con domicilio en la República Argentina. Podés contactarlo en ${CONTACT_EMAIL}.`,
    ],
    sections: [
      {
        heading: "1. Qué datos recopilamos",
        blocks: [
          { p: "Si jugás de forma anónima (sin iniciar sesión), tratamos:" },
          {
            list: [
              "Un identificador aleatorio que genera tu dispositivo para reconocerte entre sesiones (guardado en el almacenamiento local del navegador, una cookie técnica y el almacenamiento de sesión).",
              "Tus resultados de juego: qué jugaste, si ganaste o perdiste, puntaje, tiempo y dificultad.",
              "El país que elijas mostrar (opcional) y el nombre público que elijas.",
              "Tu dirección IP, usada para prevenir el uso de múltiples cuentas desde un mismo origen (anti-trampa del ranking).",
            ],
          },
          { p: "Si iniciás sesión con Google, además tratamos:" },
          {
            list: [
              "Tu nombre, dirección de email, foto de perfil e identificador de Google, provistos por Google al autenticarte.",
            ],
          },
          {
            p: "Si usás las funciones de amigos y duelos, guardamos las relaciones que vos mismo creás (a quién agregás como amigo o desafiás). Si tenés amigos agregados, también guardamos la última vez que tuviste el Servicio abierto, para poder mostrarte a vos y a tus amigos quién está conectado en ese momento. Esa información se muestra únicamente como \"conectado\" o \"desconectado\": nunca se muestra la hora exacta ni un historial de conexiones.",
          },
          {
            p: "Para entender cómo se usa el sitio y mejorarlo, usamos herramientas de analítica web (ver sección 3). A través de ellas se tratan: las páginas que visitás, eventos de juego (qué juego iniciás, completás o abandonás, con qué dificultad y resultado), el tipo de dispositivo y navegador, y una ubicación geográfica aproximada (país o región) derivada de tu dirección IP. Vercel Web Analytics funciona de forma agregada y sin cookies, sin identificarte como persona. Google Analytics usa cookies y solo se activa si diste tu consentimiento.",
          },
          {
            p: "No solicitamos ni almacenamos tu contraseña: la autenticación la realiza Google. Tampoco tratamos categorías de datos sensibles.",
          },
        ],
      },
      {
        heading: "2. Para qué usamos los datos y base legal",
        blocks: [
          {
            list: [
              "Para que el juego funcione y tu progreso se conserve entre sesiones y dispositivos (ejecución del servicio que solicitás).",
              "Para calcular y mostrar los rankings y para prevenir trampas y el uso abusivo de múltiples cuentas (interés legítimo en mantener un ranking justo; la IP se usa con este único fin).",
              "Para vincular tu progreso a tu cuenta si iniciás sesión con Google (con base en tu consentimiento al elegir iniciar sesión).",
              "Para mostrarte, a vos y a tus amigos, quién tiene el Servicio abierto en este momento (ejecución de la funcionalidad de amigos que vos activás).",
              "Para analizar de forma agregada cómo se usa el sitio y mejorarlo. La analítica sin cookies de Vercel se basa en nuestro interés legítimo en mantener y mejorar el Servicio, sin identificarte. La analítica de Google Analytics, que sí usa cookies, se basa exclusivamente en tu consentimiento y no se activa hasta que lo otorgás.",
            ],
          },
          {
            p: "No usamos tus datos para publicidad ni para tomar decisiones automatizadas con efectos jurídicos sobre vos.",
          },
        ],
      },
      {
        heading: "3. Cookies y almacenamiento local",
        blocks: [
          {
            p: "El Servicio usa almacenamiento técnico y necesario en tu navegador para recordar tu identidad, tu idioma y tu progreso. Utilizamos una cookie técnica de identidad (bdb_uid) y el almacenamiento local y de sesión del navegador. Este almacenamiento es imprescindible para que el juego funcione, por lo que no requiere tu consentimiento.",
          },
          {
            p: "Además, usamos dos herramientas de analítica web para entender cómo se usa el sitio:",
          },
          {
            list: [
              "Vercel Web Analytics: mide de forma agregada y anónima (visitas, país, dispositivo). No usa cookies ni te identifica como persona, por lo que funciona siempre, sin necesitar tu consentimiento.",
              "Google Analytics: mide el uso con más detalle y SÍ usa cookies. Por eso solo se activa si aceptás las cookies en el cartel que aparece la primera vez que entrás. Si lo rechazás o lo ignorás, Google Analytics no se carga ni guarda ninguna cookie.",
            ],
          },
          {
            p: "Podés cambiar tu elección en cualquier momento desde el enlace \"Gestionar cookies\" en el pie de página. NO usamos cookies de publicidad. Si en el futuro se introduce publicidad, se solicitará tu consentimiento cuando la ley lo requiera.",
          },
        ],
      },
      {
        heading: "4. Con quién se comparten los datos",
        blocks: [
          {
            p: "No vendemos tus datos personales. Compartimos datos únicamente con proveedores de infraestructura que los procesan por nuestra cuenta para operar el Servicio:",
          },
          {
            list: [
              "Google (autenticación mediante Google OAuth), si elegís iniciar sesión.",
              "Google (Google Analytics, para analizar el uso del sitio), únicamente si aceptás las cookies de analítica.",
              "Railway (alojamiento del servidor y la base de datos).",
              "Vercel (alojamiento del sitio web y su analítica web sin cookies).",
            ],
          },
          {
            p: "Algunos de estos proveedores pueden procesar datos en servidores ubicados fuera de Argentina o del Espacio Económico Europeo. En esos casos, la transferencia se realiza amparada en las salvaguardas y mecanismos legales que ofrecen dichos proveedores.",
          },
          {
            p: "Si hacés clic en el botón de apoyo voluntario, salís del Servicio hacia Cafecito o Ko-fi, según cuál elijas. Son responsables independientes del tratamiento de datos en su propio sitio; el operador no les envía ningún dato tuyo, es simplemente un enlace hacia su página.",
          },
        ],
      },
      {
        heading: "5. Cuánto tiempo conservamos los datos",
        blocks: [
          {
            p: "Conservamos tus datos mientras tu identidad o cuenta siga activa y sea necesario para prestar el Servicio. Podés solicitar la eliminación de tus datos en cualquier momento escribiéndonos.",
          },
        ],
      },
      {
        heading: "6. Tus derechos",
        blocks: [
          {
            p: "Según la normativa aplicable (Ley 25.326 de Protección de los Datos Personales de Argentina y, si te encontrás en la Unión Europea, el Reglamento General de Protección de Datos), tenés derecho a:",
          },
          {
            list: [
              "Acceder a los datos personales que tratamos sobre vos.",
              "Rectificar datos inexactos o incompletos.",
              "Solicitar la supresión (borrado) de tus datos.",
              "Solicitar la portabilidad de tus datos.",
              "Oponerte o limitar ciertos tratamientos.",
            ],
          },
          {
            p: "Para ejercer estos derechos, escribinos a:",
          },
          { email: CONTACT_EMAIL },
          {
            p: "También podés reclamar ante la autoridad de control competente. En Argentina, la Agencia de Acceso a la Información Pública (AAIP). En la Unión Europea, la autoridad de protección de datos de tu país.",
          },
        ],
      },
      {
        heading: "7. Menores",
        blocks: [
          {
            p: "El Servicio no está dirigido a menores de 13 años y no recopilamos deliberadamente datos de menores de esa edad. Si creés que un menor de 13 años nos proporcionó datos personales, contactanos para eliminarlos.",
          },
        ],
      },
      {
        heading: "8. Seguridad",
        blocks: [
          {
            p: "Aplicamos medidas técnicas razonables para proteger los datos, incluyendo verificación del lado del servidor y firma criptográfica de las sesiones de juego. Ningún sistema es completamente seguro, pero trabajamos para proteger tu información.",
          },
        ],
      },
      {
        heading: "9. Cambios en esta Política",
        blocks: [
          {
            p: "Podemos actualizar esta Política para reflejar cambios en el Servicio o en la ley. En particular, si en el futuro se introduce publicidad o funciones pagas, esta Política se actualizará para describir esos tratamientos y se solicitará tu consentimiento cuando corresponda. La versión vigente estará siempre en esta página, con su fecha de última actualización.",
          },
        ],
      },
      {
        heading: "10. Idioma",
        blocks: [
          {
            p: "La versión en español de este documento es la versión vinculante. Las traducciones a otros idiomas se ofrecen únicamente por conveniencia y, en caso de discrepancia, prevalece la versión en español.",
          },
        ],
      },
    ],
  },
};

export default content;
