import { useEffect, useRef, useState } from "react";
import { playSpecialTone } from "../services/sound";
export function PainhoPrank({ enabled, sound, effects, blocked, newsKey }: {
  enabled: boolean; sound: boolean; effects: boolean; blocked: boolean; newsKey: string;
}) {
  const [started, setStarted] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const previous = useRef(newsKey);
  const last = useRef(0);
  useEffect(() => {
    if (previous.current === newsKey) return;
    previous.current = newsKey;
    const now = Date.now();
    if (!enabled || blocked || started || now - last.current < 180000 || Math.random() >= 0.012) return;
    last.current = now;
    setRevealed(false);
    setStarted(now);
    playSpecialTone(sound);
  }, [newsKey, enabled, blocked, started, sound]);
  useEffect(() => {
    if (!started) return;
    const reveal = setTimeout(() => setRevealed(true), 4000);
    const end = setTimeout(() => setStarted(0), 10000);
    return () => { clearTimeout(reveal); clearTimeout(end); };
  }, [started]);
  if (!enabled || !started) return null;
  return <section className={`special-notice painho-prank ${effects && !blocked ? "prank-animated" : ""}`} role="status" aria-live="polite">
    <span aria-hidden="true">🫳💸</span><div>
      <div className="eyebrow">PLANTÃO BOSTA NEWS · SÁTIRA FICTÍCIA</div>
      <h2>{revealed ? "KKKKKK ERA PEGADINHA! SEU DINHEIRO DE MENTIRINHA CONTINUA AÍ!" : "🚨 CARAI BORRACHA! SEU PATRIMÔNIO FOI CONFISCADO!"}</h2>
      {!revealed && <><p>ME DÁ TUDO, CUMPANHEIRO! KKKKKKK</p><strong>PATRIMÔNIO CENOGRÁFICO: R$ 0,00 💀</strong></>}
      <small>Pegadinha visual. Seu saldo e suas operações continuam preservados.</small>
    </div><button className="icon-button" aria-label="Dispensar pegadinha" onClick={() => setStarted(0)}>×</button>
  </section>;
}
