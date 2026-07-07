import { useEffect, useState } from "react";

/**
 * true solo después de montar en el cliente. El HTML prerenderizado (SSG) y
 * el primer render del cliente antes de hidratar SIEMPRE ven `false`, así
 * que cualquier valor que dependa de localStorage/fecha real puede ocultarse
 * hasta este punto sin generar mismatch de hidratación.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
