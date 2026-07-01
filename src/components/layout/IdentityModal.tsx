import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { getIdentity, updateIdentity, isIdentityComplete } from "@/lib/identity";
import { NATIONALITIES } from "@/data/nationalities";

type IdentityModalProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Modal para configurar nombre y pais del usuario.
 * Se muestra la primera vez que juega, o al tocar "Editar perfil".
 */
export function IdentityModal({ open, onClose }: IdentityModalProps) {
  const id = getIdentity();
  const [name, setName] = useState(id.displayName);
  const [country, setCountry] = useState(id.countryCode ?? "");

  const countries = Object.values(NATIONALITIES).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const canSave = name.trim().length > 0 && country.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    updateIdentity({
      displayName: name.trim().substring(0, 30),
      countryCode: country,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Tu perfil">
      <p className="text-sm text-ink-muted">
        Elegí un nombre y país para aparecer en el ranking global.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="identity-name" className="mb-1 block text-xs font-medium text-ink-muted">
            Nombre (visible en ranking)
          </label>
          <input
            id="identity-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="Tu nombre o apodo"
            autoComplete="off"
            className="w-full rounded-lg border border-white/15 bg-asphalt-700 px-4 py-3 text-ink placeholder:text-ink-faint focus:border-racing/50"
          />
        </div>

        <div>
          <label htmlFor="identity-country" className="mb-1 block text-xs font-medium text-ink-muted">
            País
          </label>
          <select
            id="identity-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-asphalt-700 px-4 py-3 text-ink"
          >
            <option value="">Selecciona tu país</option>
            {countries.map((n) => (
              <option key={n.code} value={n.code}>
                {n.flag} {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <Button variant="primary" block onClick={handleSave} disabled={!canSave}>
          Guardar
        </Button>
        {isIdentityComplete() && (
          <Button variant="ghost" block onClick={onClose}>
            Cancelar
          </Button>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-ink-faint">
        No se requiere email ni contraseña. Tu identidad se guarda en este navegador.
      </p>
    </Modal>
  );
}
