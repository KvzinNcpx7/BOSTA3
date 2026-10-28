import { money, wealth, type Game } from "../game/engine";
import { receiptQuips } from "../game/funContent";
export type ReceiptData = {
  alias: string;
  wealth: number;
  bestProfit: number;
  worstLoss: number;
  title: string;
  quip: string;
  seal: string;
};
export function receiptData(
  game: Game,
  alias: string,
  quip = receiptQuips[Math.floor(Math.random() * receiptQuips.length)],
): ReceiptData {
  const name = alias.trim().replace(/\s+/g, " ");
  if (
    name.length < 3 ||
    name.length > 40 ||
    /@|https?:|www\./i.test(name) ||
    /(?:\d[() .+-]*){7,}/.test(name)
  )
    throw Error(
      "Use um apelido fictício de 3 a 40 caracteres, sem e-mail, telefone ou link.",
    );
  const value = wealth(game);
  return {
    alias: name,
    wealth: value,
    bestProfit: Math.max(game.fun.bestProfit, value - 10000, 0),
    worstLoss: Math.max(game.fun.worstLoss, 10000 - value, 0),
    title:
      value < 10000
        ? "DOUTORADO EM DECISÕES QUESTIONÁVEIS"
        : value > 11000
          ? "LUCRO SOB INVESTIGAÇÃO METAFÓRICA"
          : "CAPITAL ABERTO, BOM SENSO FECHADO",
    quip,
    seal: "SELO OFICIAL BOSTA3 · 100% FICTÍCIO",
  };
}
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  line: number,
  maxLines = 5,
) {
  let current = "";
  let count = 0;
  for (const word of text.split(" ")) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > width && current) {
      ctx.fillText(current, x, y);
      y += line;
      count++;
      current = word;
      if (count >= maxLines - 1) break;
    } else current = next;
  }
  if (current) ctx.fillText(current, x, y);
  return y;
}
function fit(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  size: number,
  min = 20,
) {
  ctx.font = `bold ${size}px sans-serif`;
  while (ctx.measureText(text).width > width && size > min) {
    size -= 2;
    ctx.font = `bold ${size}px sans-serif`;
  }
}
/** Draw only the whitelisted public card payload: no account or authentication object enters this function. */
export function drawReceipt(canvas: HTMLCanvasElement, data: ReceiptData) {
  canvas.width = 1200;
  canvas.height = 1500;
  const ctx = canvas.getContext("2d");
  if (!ctx)
    throw Error(
      "Seu navegador não conseguiu criar a imagem. O saldo continua intacto.",
    );
  ctx.fillStyle = "#0c1010";
  ctx.fillRect(0, 0, 1200, 1500);
  const gradient = ctx.createLinearGradient(0, 0, 1200, 900);
  gradient.addColorStop(0, "#293921");
  gradient.addColorStop(1, "#101615");
  ctx.fillStyle = gradient;
  ctx.fillRect(34, 34, 1132, 1432);
  ctx.strokeStyle = "#668c45";
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, 1132, 1432);
  ctx.fillStyle = "#c1f36b";
  ctx.font = "bold 40px sans-serif";
  ctx.fillText("BOSTA3", 85, 120);
  ctx.fillStyle = "#8b9b85";
  ctx.font = "19px sans-serif";
  ctx.fillText("DOCUMENTO SEM VALOR FINANCEIRO OU MORAL", 85, 165);
  ctx.fillStyle = "#dce7d2";
  ctx.font = "bold 63px sans-serif";
  ctx.fillText("COMPROVANTE", 85, 300);
  ctx.fillText("DE VERGONHA", 85, 375);
  ctx.fillStyle = "#a5b89b";
  ctx.font = "21px sans-serif";
  ctx.fillText("INVESTIDOR DE MENTIRINHA", 85, 460);
  ctx.fillStyle = "#f0f4e9";
  fit(ctx, data.alias, 1000, 39);
  wrap(ctx, data.alias, 85, 515, 1000, 46, 2);
  ctx.strokeStyle = "#3c5030";
  ctx.beginPath();
  ctx.moveTo(85, 590);
  ctx.lineTo(1115, 590);
  ctx.stroke();
  ctx.fillStyle = "#a5b89b";
  ctx.font = "22px sans-serif";
  ctx.fillText("PATRIMÔNIO FICTÍCIO", 85, 650);
  ctx.fillStyle = data.wealth >= 10000 ? "#c1f36b" : "#f3969d";
  const amount = money(data.wealth);
  fit(ctx, amount, 1030, 69);
  ctx.fillText(amount, 85, 745);
  ctx.fillStyle = "#8c9d84";
  ctx.font = "18px sans-serif";
  ctx.fillText("MAIOR LUCRO OBSERVADO", 85, 835);
  ctx.fillText("MAIOR PREJUÍZO OBSERVADO", 640, 835);
  ctx.font = "bold 34px sans-serif";
  ctx.fillStyle = "#c1f36b";
  fit(ctx, money(data.bestProfit), 465, 34);
  ctx.fillText(money(data.bestProfit), 85, 890);
  ctx.fillStyle = "#f3969d";
  fit(ctx, data.worstLoss ? `−${money(data.worstLoss)}` : money(0), 465, 34);
  ctx.fillText(
    data.worstLoss ? `−${money(data.worstLoss)}` : money(0),
    640,
    890,
  );
  ctx.fillStyle = "#c1f36b";
  ctx.font = "bold 24px sans-serif";
  wrap(ctx, data.title, 85, 995, 1000, 34, 2);
  ctx.fillStyle = "#c1cdb8";
  ctx.font = "30px sans-serif";
  wrap(ctx, `“${data.quip}”`, 85, 1100, 1000, 43, 4);
  ctx.strokeStyle = "#8eae65";
  ctx.lineWidth = 3;
  ctx.strokeRect(85, 1320, 1030, 65);
  ctx.fillStyle = "#c1f36b";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(data.seal, 600, 1360);
  ctx.fillStyle = "#77896d";
  ctx.font = "17px sans-serif";
  ctx.fillText("O único lugar onde falir é parte da experiência.", 600, 1425);
  ctx.textAlign = "left";
}
export function receiptPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(Error("O PNG não foi gerado. Tente novamente.")),
      "image/png",
    ),
  );
}
