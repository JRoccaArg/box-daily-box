// src/content/career/types.ts
//
// Modelo del CONTENIDO NARRATIVO del Modo Carrera.
//
// Mismo criterio que el contenido legal (`src/content/legal`): son textos
// largos, no microcopy de UI, asi que viven aca fuera de los diccionarios
// i18n, como datos estructurados y tipados.
//
// La mecanica de cada evento (pesos, condiciones, efectos) vive aparte, en
// `src/lib/career/eventData.ts`. Los dos lados se cruzan por id y hay un
// test que verifica que no falte ni sobre ninguna clave en ningun idioma.
//
// Seguridad: todo es texto plano. NUNCA se renderiza HTML crudo.

export type EventText = {
  /** Titulo corto del evento. */
  title: string;
  /**
   * La historia breve que da contexto a la decision. Es lo que diferencia
   * este modo de un simple "elegi A o B": siempre hay un por que detras.
   */
  story: string;
  /** Texto de cada opcion, indexado por el id de la opcion. */
  options: Record<string, string>;
  /**
   * Narracion de cada desenlace, indexada por el id del desenlace. Las
   * probabilidades NO se muestran nunca: las pistas van en la historia.
   */
  outcomes: Record<string, string>;
};

/** Todo el contenido narrativo del modo en un idioma. */
export type CareerContent = {
  events: Record<string, EventText>;
};
