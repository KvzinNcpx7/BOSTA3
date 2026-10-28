import { createCanvas } from "@napi-rs/canvas";
import { describe, it, expect } from "vitest";
import { fresh, award } from "../game/engine";
import { receiptData, drawReceipt } from "./receipt";
describe("Comprovante de Vergonha PNG", () => {
  it("usa somente campos públicos escolhidos, nunca dados de conta ou convite", () => {
    const g = Object.assign(award({ ...fresh(), cash: 8000 }), {
      email: "privado@example.invalid",
      access_token: "nao-exportar",
      invite: "codigo-privado",
    });
    const card = receiptData(g, "Barão do Boleto");
    expect(Object.keys(card).sort()).toEqual(
      [
        "alias",
        "wealth",
        "bestProfit",
        "worstLoss",
        "title",
        "quip",
        "seal",
      ].sort(),
    );
    expect(JSON.stringify(card)).not.toContain("privado");
    expect(JSON.stringify(card)).not.toContain("nao-exportar");
    expect(card.alias).toBe("Barão do Boleto");
    expect(card.worstLoss).toBe(2000);
  });
  it.each([
    "email@example.invalid",
    "11999999999",
    "(11) 99999-9999",
    "https://exemplo.com",
    "www.exemplo.com",
    "a",
  ])("recusa dados de contato e apelido inválido: %s", (alias) => {
    expect(() => receiptData(fresh(), alias)).toThrow("apelido fictício");
  });
  it("renderiza um PNG real com dimensão e assinatura corretas", () => {
    const canvas = createCanvas(1, 1);
    drawReceipt(
      canvas as unknown as HTMLCanvasElement,
      receiptData(fresh(), "Acionista de Migalhas"),
    );
    const png = canvas.toBuffer("image/png");
    expect(Array.from(png.slice(0, 8))).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ]);
    const header = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect(header.getUint32(16)).toBe(1200);
    expect(header.getUint32(20)).toBe(1500);
    expect(png.byteLength).toBeGreaterThan(2000);
  });
});
