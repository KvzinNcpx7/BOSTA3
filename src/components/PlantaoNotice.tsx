import { useState } from "react";
import type { FunState } from "../game/fun";
export function PlantaoNotice({
  bulletin,
  effects,
  now,
}: {
  bulletin: NonNullable<FunState["bulletin"]>;
  effects: boolean;
  now: number;
}) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return (
    <>
      <section className="special-notice plantao-loss" role="status">
        <span className="special-emoji" aria-hidden="true">
          🚨
        </span>
        <div>
          <div className="eyebrow">PLANTÃO BOSTA NEWS · COTAÇÕES FICTÍCIAS</div>
          <h2>{bulletin.headline}</h2>
          <p>
            Uma queda de pelo menos 12% foi registrada na rodada. O fiscal
            trouxe a prancheta. Seu extrato continua disponível.
          </p>
        </div>
        <button
          className="icon-button"
          aria-label="Dispensar plantão"
          onClick={() => setClosed(true)}
        >
          ×
        </button>
      </section>
      {effects && now - bulletin.startedAt < 2200 && (
        <div className="special-splash plantao-splash" aria-hidden="true">
          <span>🚨</span>
          <strong>PLANTÃO BOSTA NEWS</strong>
        </div>
      )}
    </>
  );
}
