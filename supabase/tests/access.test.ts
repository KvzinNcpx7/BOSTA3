import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
const db = new PGlite();
const alice = "11111111-1111-4111-8111-111111111111";
const bob = "22222222-2222-4222-8222-222222222222";
let club: string, code: string;
async function asUser(id: string) {
  await db.exec(
    `reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`,
  );
}
beforeAll(async () => {
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;insert into auth.users values('${alice}'),('${bob}');`,
  );
  await db.exec(
    readFileSync(
      new URL("../migrations/001_clube_do_boleto.sql", import.meta.url),
      "utf8",
    ),
  );
}, 30000);
afterAll(async () => {
  await db.close();
});
describe.sequential("permissões reais do PostgreSQL no Clube do Boleto", () => {
  it("cria liga e perfil autenticados", async () => {
    await asUser(alice);
    await db.query(
      "insert into public.players(id,name,avatar,title,wealth,xp) values($1,$2,$3,$4,$5,$6)",
      [alice, "Duque do Boleto", "🦆", "CEO do Nada", 10000, 20],
    );
    const created = await db.query<{ id: string }>(
      "select public.create_club('Conselho da Laje') as id",
    );
    club = created.rows[0].id;
    const result = await db.query<{ invite_code: string }>(
      "select invite_code from public.clubs where id=$1",
      [club],
    );
    code = result.rows[0].invite_code;
    expect(code.length).toBe(32);
  });
  it("isola clubes e perfis de quem ainda não entrou", async () => {
    await asUser(bob);
    expect((await db.query("select * from public.clubs")).rows).toHaveLength(0);
    expect((await db.query("select * from public.players")).rows).toHaveLength(
      0,
    );
    await expect(
      db.query("select * from public.club_ranking($1)", [club]),
    ).rejects.toThrow("Membership required");
    await expect(
      db.query("select public.join_club('codigo_inventado')"),
    ).rejects.toThrow("Invalid invitation");
  });
  it("impede falsificar perfil de outro jogador e entrada direta", async () => {
    await asUser(bob);
    await expect(
      db.query(
        "insert into public.players(id,name,avatar,title,wealth,xp) values($1,$2,$3,$4,$5,$6)",
        [alice, "Fraude de RG", "🤡", "CEO da fraude", 99999, 0],
      ),
    ).rejects.toThrow();
    await expect(
      db.query("insert into public.club_members values($1,$2)", [club, bob]),
    ).rejects.toThrow();
    await db.query("update public.players set wealth=1 where id=$1", [alice]);
  });
  it("entra por convite e passa a ver somente ranking permitido", async () => {
    await asUser(bob);
    await db.query(
      "insert into public.players(id,name,avatar,title,wealth,xp) values($1,$2,$3,$4,$5,$6)",
      [bob, "Bob da Fofoca", "🗿", "Farinha Limer", 12000, 10],
    );
    await db.query("select public.join_club($1)", [code]);
    await db.query("select public.join_club($1)", [code]);
    const result = await db.query<{ id: string; wealth: string }>(
      "select * from public.club_ranking($1)",
      [club],
    );
    expect(result.rows.map((r) => r.id)).toEqual([bob, alice]);
    expect(Number(result.rows[1].wealth)).toBe(10000);
    const league = await db.query("select * from public.clubs");
    expect(league.rows).toHaveLength(1);
  });
  it("rejeita placar negativo e acesso anônimo", async () => {
    await asUser(bob);
    await expect(
      db.query("update public.players set wealth=-1 where id=$1", [bob]),
    ).rejects.toThrow();
    await db.exec(
      "reset role;set role anon;select set_config('request.jwt.claim.sub','',false)",
    );
    await expect(
      db.query("select * from public.club_ranking($1)", [club]),
    ).rejects.toThrow();
    await expect(db.query("select * from public.players")).rejects.toThrow();
  });
});
