import { useCallback } from "react";
import { useI18n } from "@/context";
import { v2Copy } from "@/lib/v2/copy";

export function useV2I18n() {
 const context = useI18n();
 const baseT = context.t;
 const t = useCallback((key: string, vars?: Record<string, string | number>) =>
  v2Copy(key, vars) ?? baseT(key, vars), [baseT]);
 return { ...context, t };
}
