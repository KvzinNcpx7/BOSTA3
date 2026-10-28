import { useEffect, useRef, useState } from "react";
import { chooseBanter, characters, type Context } from "../game/banter";
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
  });
  const say = (context: Context, toast = false) => {
    const selected = chooseBanter(context, school, recent.current);
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
    };
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
        !game.unlocked.some((id) => !p.unlocked.includes(id)),
      );
    } else if (total >= 1000000 && p.total < 1000000) say("rich", true);
    else if (total - p.total >= 200) say("gain", true);
    else if (total - p.total <= -200) say("loss", true);
    else if (game.news[0] !== p.news) say("event");
  }, [game, school]);
  return { comment, say };
}
