import { useEffect, useRef, useState } from "react";
import {
  chooseBanter,
  characters,
  type Context,
  type CharacterId,
} from "../game/banter";
import { wealth, type Game } from "../game/engine";
export function useBanter(
  game: Game,
  school: boolean,
  notify: (text: string) => void,
) {
  const [comment, setComment] = useState(() => chooseBanter("welcome", school));
  const recent = useRef<string[]>([comment.text]);
  const previous = useRef({
    trades: game.trades,
    realized: game.realized,
    total: wealth(game),
    news: game.news[0],
    school,
    unlocked: game.unlocked,
    secrets: game.fun.secrets,
  });
  const say = (context: Context, toast = false, forced?: CharacterId) => {
    const selected = chooseBanter(
      context,
      school,
      recent.current,
      Math.random,
      forced,
    );
    recent.current = [...recent.current, selected.text].slice(-8);
    setComment(selected);
    if (toast) notify(`${characters[selected.speaker].name}: ${selected.text}`);
  };
  useEffect(() => {
    const p = previous.current;
    const total = wealth(game);
    previous.current = {
      trades: game.trades,
      realized: game.realized,
      total,
      news: game.news[0],
      school,
      unlocked: game.unlocked,
      secrets: game.fun.secrets,
    };
    const milestone =
      game.unlocked.some((id) => !p.unlocked.includes(id)) ||
      game.fun.secrets.some((id) => !p.secrets.includes(id));
    if (p.school !== school) {
      say("welcome");
      return;
    }
    if (game.trades !== p.trades) {
      const last = game.career.ledger.find(
        (r) => r.kind === "buy" || r.kind === "sell",
      );
      say(
        last?.kind === "buy"
          ? "buy"
          : game.realized < p.realized
            ? "sellLoss"
            : "sell",
        !milestone,
      );
    } else if (total >= 1000000 && p.total < 1000000) say("rich", !milestone);
    else if (total - p.total >= 200) say("gain", !milestone);
    else if (total - p.total <= -200)
      say("loss", !milestone, total <= 9500 ? "fiscal" : undefined);
    else if (game.news[0] !== p.news) say("event");
  }, [game, school]);
  return { comment, say };
}
