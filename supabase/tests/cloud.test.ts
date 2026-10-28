import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
const db = new PGlite();
const a = "11111111-1111-4111-8111-111111111111", b = "22222222-2222-4222-8222-222222222222";
async function user(id: string) { await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);`); }
const sql = readFileSync(new URL("../migrations/002_private_cloud_saves.sql", import.meta.url), "utf8");
beforeAll(async () => {
 await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;insert into auth.users values('${a}'),('${b}');`);
 await db.exec(sql);
}, 30000);
afterAll(() => db.close());
describe.sequential("save privado com revisão atômica", () => {
 it("grava e lê apenas o próprio save", async () => {
  await user(a);
  expect((await db.query<{r:number}>("select public.save_game($1,0,'{\"version\":2,\"cash\":9876}') as r", [a])).rows[0].r).toBe(1);
  expect((await db.query("select * from public.game_saves")).rows).toHaveLength(1);
  await user(b); expect((await db.query("select * from public.game_saves")).rows).toHaveLength(0);
 });
 it("nega acesso cruzado, escrita direta e anônimos", async () => {
  await user(b);
  await expect(db.query("select public.save_game($1,1,'{\"version\":2}')", [a])).rejects.toThrow("Authentication required");
  await expect(db.query("update public.game_saves set revision=999")).rejects.toThrow();
  await expect(db.query("delete from public.game_saves")).rejects.toThrow();
  await db.exec("reset role;set role anon;");
  await expect(db.query("select * from public.game_saves")).rejects.toThrow();
  await expect(db.query("select public.save_game($1,0,'{\"version\":2}')", [b])).rejects.toThrow();
 });
 it("recusa inserção duplicada e versão antiga sem perder o último save", async () => {
  await user(a);
  await expect(db.query("select public.save_game($1,0,'{\"version\":2}')", [a])).rejects.toThrow("SAVE_CONFLICT");
  await db.query("select public.save_game($1,1,'{\"version\":2,\"cash\":1234}')", [a]);
  await expect(db.query("select public.save_game($1,1,'{\"version\":2,\"cash\":0}')", [a])).rejects.toThrow("SAVE_CONFLICT");
  const row = (await db.query<{payload:{cash:number};revision:number}>("select * from public.game_saves")).rows[0];
  expect(row.payload.cash).toBe(1234); expect(row.revision).toBe(2);
 });
 it("limita tamanho, versão e revisão; migração é repetível", async () => {
  await expect(db.query("select public.save_game($1,-1,'{\"version\":2}')", [a])).rejects.toThrow("Invalid revision");
  await expect(db.query("select public.save_game($1,2,'{\"version\":999}')", [a])).rejects.toThrow("Invalid save");
  await expect(db.query("select public.save_game($1,2,$2::jsonb)", [a, JSON.stringify({version:2,blob:'x'.repeat(1048576)})])).rejects.toThrow("Invalid save");
  await db.exec("reset role;"); await db.exec(sql); await user(a);
  expect((await db.query<{revision:number}>("select revision from public.game_saves")).rows[0].revision).toBe(2);
 });
});
