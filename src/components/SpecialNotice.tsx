import { useState } from "react";
import { X } from "lucide-react";
import type { ResenhaState } from "../game/resenha";
import { specialEvents } from "../game/resenhaContent";
export function SpecialNotice({
  active,
  now,
  effects,
  displayedWealth,
}: {
  active: NonNullable<ResenhaState["active"]>;
  now: number;
  effects: boolean;
  displayedWealth?: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const event = specialEvents.find((e) => e.id === active.kind)!;
  const seconds = Math.max(0, Math.ceil((active.until - now) / 1000));
  return (
    <>
      <section
        className={`special-notice special-${event.id}`}
        role="status"
        aria-live="polite"
      >
        <span className="special-emoji" aria-hidden="true">
          {event.emoji}
        </span>
        <div>
          <div className="eyebrow">PLANTÃO BOSTA NEWS · {seconds}s</div>
          <h2>
            {event.id === "erika"
              ? "ÉRIKA DA GALERA CONVOCA TODOS OS ACIONISTAS. METADE NEM SABIA QUE TINHA AÇÕES."
              : event.name}
          </h2>
          {!collapsed && (
            <>
              <p>{event.description}</p>
              {event.id === "painho" && (
                <div className="confisco-pegadinha" aria-label="Confisco cenográfico: o patrimônio real do jogo está intacto">
                  <strong>SEU PATRIMÔNIO: R$ 0,00 💀</strong>
                  <span>PEGADINHA! Seu patrimônio verdadeiro no jogo continua {typeof displayedWealth === "number" ? displayedWealth.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "preservado"}. Nada foi retirado.</span>
                </div>
              )}
              <small>{event.consequence}</small>
            </>
          )}
        </div>
        <button
          className="icon-button"
          aria-label={collapsed ? "Expandir comunicado" : "Recolher comunicado"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "↗" : <X size={15} />}
        </button>
      </section>
      {effects && now - active.startedAt < 2800 && (
        <div className="special-splash" aria-hidden="true">
          <span>{event.emoji}</span>
          <strong>{event.name}</strong>
        </div>
      )}
    </>
  );
}
