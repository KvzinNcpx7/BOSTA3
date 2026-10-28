import { SlidersHorizontal } from "lucide-react";
import type { HumorPreferences } from "../game/resenha";
export function ResenhaControls({
  preferences,
  onChange,
}: {
  preferences: HumorPreferences;
  onChange: (key: keyof HumorPreferences, value: boolean) => void;
}) {
  return (
    <section
      className={`resenha-controls ${preferences.school ? "school-on" : ""}`}
      aria-label="Configurações de humor"
    >
      <label className="school-toggle">
        <span className="switch">
          <input
            type="checkbox"
            checked={preferences.school}
            onChange={(e) => onChange("school", e.target.checked)}
          />
          <span aria-hidden="true" />
        </span>
        <span>
          <strong>MODO RESENHA ESCOLAR 💀</strong>
          <small>
            {preferences.school
              ? "Personagens fictícios. O pregão entrou no grupo da escola."
              : "Humor brasileiro geral. Ative para entrar na resenha."}
          </small>
        </span>
      </label>
      <details className="humor-options">
        <summary>
          <SlidersHorizontal size={14} />
          Preferências do caos
        </summary>
        <div className="humor-options-body">
          <label>
            <input
              type="checkbox"
              checked={preferences.extraordinary}
              onChange={(e) => onChange("extraordinary", e.target.checked)}
            />
            <span>
              Eventos extraordinários
              <small>Acontecimentos raros com efeitos reais no pregão.</small>
            </span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.effects}
              onChange={(e) => onChange("effects", e.target.checked)}
            />
            <span>
              Efeitos visuais curtos
              <small>
                Também respeitam a redução de movimento do dispositivo.
              </small>
            </span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={preferences.sound}
              onChange={(e) => onChange("sound", e.target.checked)}
            />
            <span>
              Alerta sonoro nesta sessão
              <small>Dois tons gerados pelo site. Desligado ao reabrir.</small>
            </span>
          </label>
          <p>
            Os nomes do modo escolar são personagens caricatos e fictícios.
            Nenhuma foto ou dado pessoal é utilizado.
          </p>
        </div>
      </details>
    </section>
  );
}
