import type { IdentityEditor } from "@/hooks/useIdentityEditor";
import { useV2I18n } from "@/hooks/useV2I18n";

export function NameStatusLine({ editor, id }: { editor: IdentityEditor; id: string }) {
 const { t } = useV2I18n();
 const key = editor.nameLocked ? "v2.identity.err_name_month"
  : editor.nameStatus === "taken" ? "profile.name_taken"
  : editor.nameStatus === "checking" ? "profile.name_checking"
  : editor.nameStatus === "available" ? "profile.name_available" : null;
 return <p id={id} className={editor.nameStatus === "taken" ? "v2-inline-error" : "v2-name-status"} aria-live="polite">{key ? t(key) : ""}</p>;
}
