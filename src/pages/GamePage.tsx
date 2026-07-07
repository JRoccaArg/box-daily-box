import { Link, useParams } from "react-router-dom";
import { gameById } from "@/components/games/registry";
import { GameShell } from "@/components/layout/GameShell";
import { Seo } from "@/components/layout/Seo";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "@/components/ui/Icon";
import { useI18n } from "@/context";
import { homePath } from "@/lib/routes";

/**
 * Pagina de un juego: resuelve el slug de la URL (/:lang/juego/:gameId)
 * contra el registro y delega TODO el ciclo de vida al GameShell. Si el slug
 * no existe, muestra un aviso simple.
 */
export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = gameId ? gameById(gameId) : undefined;
  const { t, locale } = useI18n();

  if (!game) {
    return (
      <div className="space-y-4">
        <Seo locale={locale} route={{ kind: "home" }} />
        <Link
          to={homePath(locale)}
          className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} />
          {t("shell.back")}
        </Link>
        <Panel className="text-center">
          <h1 className="font-display text-2xl font-bold text-white">{t("gamepage.not_found_title")}</h1>
          <p className="mt-1.5 text-ink-muted">{t("gamepage.not_found_body")}</p>
          <div className="mt-6">
            <Link to={homePath(locale)}>
              <Button variant="outline">{t("gamepage.see_all")}</Button>
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <>
      <Seo locale={locale} route={{ kind: "game", gameId: game.id }} />
      {/* `key` reinicia el estado del shell al cambiar de juego entre rutas. */}
      <GameShell key={game.id} game={game} date={new Date()} />
    </>
  );
}
