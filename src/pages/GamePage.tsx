import { Link, useParams } from "react-router-dom";
import { gameById } from "@/components/games/registry";
import { GameShell } from "@/components/layout/GameShell";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "@/components/ui/Icon";

/**
 * Pagina de un juego: resuelve el slug de la URL (/juego/:gameId) contra el
 * registro y delega TODO el ciclo de vida al GameShell. Si el slug no existe,
 * muestra un aviso simple.
 */
export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = gameId ? gameById(gameId) : undefined;

  if (!game) {
    return (
      <div className="space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} />
          Inicio
        </Link>
        <Panel className="text-center">
          <h1 className="font-display text-2xl font-bold text-white">Juego no encontrado</h1>
          <p className="mt-1.5 text-ink-muted">
            El reto que buscas no existe o cambio de direccion.
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button variant="outline">Ver todos los retos</Button>
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  // `key` reinicia el estado del shell al cambiar de juego entre rutas.
  return <GameShell key={game.id} game={game} date={new Date()} />;
}
