import { useState } from "react";
import { X } from "lucide-react";
import type { ResenhaState } from "../game/resenha";
import { specialEvents } from "../game/resenhaContent";
export function SpecialNotice({
  active,
  now,
  effects,
}: {
  active: NonNullable<ResenhaState["active"]>;
  now: number;
  effects: boolean;
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
          <div className="eyebrow">COMUNICADO EXTRAORDINÁRIO · {seconds}s</div>
          <h2>{event.name}</h2>
          {!collapsed && (
            <>
              <p>{event.description}</p>
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
