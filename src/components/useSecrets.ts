import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Game } from "../game/engine";
import { discoverSecret } from "../game/fun";
export function useSecrets(
  school: boolean,
  update: Dispatch<SetStateAction<Game>>,
) {
  const hits = useRef<number[]>([]);
  const buffer = useRef({ text: "", at: 0 });
  useEffect(() => {
    const type = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        target?.closest?.("input,textarea,select,[contenteditable]") ||
        document.querySelector('[aria-modal="true"]') ||
        e.key.length !== 1 ||
        !/[a-z]/i.test(e.key)
      )
        return;
      const now = Date.now();
      buffer.current = {
        text: (now - buffer.current.at > 3000 ? "" : buffer.current.text)
          .concat(e.key.toUpperCase())
          .slice(-10),
        at: now,
      };
      const code = buffer.current.text;
      const id = code.endsWith("IRINEU")
        ? "irineu"
        : code.endsWith("BORABILL")
          ? "bill"
          : school && code.endsWith("IARARARA")
            ? "iar"
            : null;
      if (id) {
        update((g) => discoverSecret(g, id));
        buffer.current.text = "";
      }
    };
    document.addEventListener("keydown", type);
    return () => document.removeEventListener("keydown", type);
  }, [school, update]);
  return () => {
    const now = Date.now();
    hits.current = [...hits.current.filter((t) => now - t < 8000), now];
    if (hits.current.length >= 7) {
      update((g) => discoverSecret(g, "logo"));
      hits.current = [];
    }
  };
}
