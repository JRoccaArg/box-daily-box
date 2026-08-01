// src/content/legal/es.ts
//
// Versión en ESPAÑOL de los documentos legales. Es la versión VINCULANTE
// (ver cláusula de idioma prevaleciente): el responsable tiene domicilio en
// Argentina y el documento se rige por la ley argentina. Las traducciones a
// otros idiomas se ofrecen por conveniencia.

import type { LegalContent } from "./types";

const LAST_UPDATED = "2026-07-31";
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
        heading: "6. Servicio \"tal cual\"",
        blocks: [
          {
            p: "El Servicio se ofrece \"tal cual\" y \"según disponibilidad\", sin garantías de ningún tipo. No garantizamos que el Servicio esté libre de errores, disponible de forma ininterrumpida, ni que los datos deportivos sean exactos. Podemos modificar, suspender o discontinuar el Servicio (total o parcialmente) en cualquier momento.",
          },
        ],
      },
      {
        heading: "7. Limitación de responsabilidad",
        blocks: [
          {
            p: "En la máxima medida permitida por la ley aplicable, el operador no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso del Servicio. Nada en estos Términos limita derechos que la ley te reconozca de forma irrenunciable como consumidor.",
          },
        ],
      },
      {
        heading: "8. Cambios en el Servicio y en estos Términos",
        blocks: [
          {
            p: "Podemos actualizar estos Términos para reflejar cambios en el Servicio o en la ley. La versión vigente estará siempre disponible en esta página, con su fecha de última actualización.",
          },
          {
            p: "Actualmente el Servicio es gratuito y no muestra publicidad. En el futuro podrían introducirse anuncios, funciones pagas u otras formas de monetización. Si eso ocurre, estos Términos y la Política de Privacidad se actualizarán en consecuencia, y se te informará y solicitará tu consentimiento cuando la ley así lo requiera.",
          },
        ],
      },
      {
        heading: "9. Ley aplicable y jurisdicción",
        blocks: [
          {
            p: "Estos Términos se rigen por las leyes de la República Argentina. Cualquier controversia se someterá a los tribunales competentes de Argentina, sin perjuicio de los derechos que las normas imperativas de protección al consumidor de tu país de residencia te reconozcan, incluida la posibilidad de recurrir a los tribunales de tu domicilio cuando la ley lo permita.",
          },
        ],
      },
      {
        heading: "10. Contacto",
        blocks: [
          { p: "Para consultas sobre estos Términos podés escribir a:" },
          { email: CONTACT_EMAIL },
        ],
      },
      {
        heading: "11. Idioma",
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
    lastUpdated: LAST_UPDATED,
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
            p: "Si usás las funciones de amigos y duelos, guardamos las relaciones que vos mismo creás (a quién agregás como amigo o desafiás).",
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
            p: "El Servicio usa únicamente almacenamiento técnico y necesario en tu navegador: para recordar tu identidad, tu idioma y tu progreso. Utilizamos una cookie técnica de identidad (bdb_uid) y el almacenamiento local y de sesión del navegador.",
          },
          {
            p: "Actualmente NO usamos cookies de publicidad ni tecnologías de rastreo de terceros. Por eso el Servicio no muestra un banner de consentimiento de cookies. Si en el futuro se introduce publicidad o analítica de terceros, se solicitará tu consentimiento cuando la ley lo requiera.",
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
              "Railway (alojamiento del servidor y la base de datos).",
              "Vercel (alojamiento del sitio web).",
            ],
          },
          {
            p: "Algunos de estos proveedores pueden procesar datos en servidores ubicados fuera de Argentina o del Espacio Económico Europeo. En esos casos, la transferencia se realiza amparada en las salvaguardas y mecanismos legales que ofrecen dichos proveedores.",
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
            p: "Podemos actualizar esta Política para reflejar cambios en el Servicio o en la ley. En particular, si en el futuro se introduce publicidad, analítica de terceros o funciones pagas, esta Política se actualizará para describir esos tratamientos y se solicitará tu consentimiento cuando corresponda. La versión vigente estará siempre en esta página, con su fecha de última actualización.",
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
