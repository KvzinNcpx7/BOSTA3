const PENDING = "bosta3-pending-invite-v1";
export function parseInvite(input: string): string | null {
  let text = input.trim();
  if (!/^[a-f0-9]{32}$/i.test(text)) {
    try {
      text = new URL(text).searchParams.get("clube") || "";
    } catch {
      return null;
    }
  }
  return /^[a-f0-9]{32}$/i.test(text) ? text.toLowerCase() : null;
}
export function rememberInvite(code: string, now = Date.now()) {
  const valid = parseInvite(code);
  if (!valid) return;
  try {
    localStorage.setItem(PENDING, JSON.stringify({ code: valid, at: now }));
  } catch {
    /* The current form keeps working when browser storage is unavailable. */
  }
}
export function pendingInvite(now = Date.now()): string {
  const query = new URLSearchParams(window.location.search).get("clube");
  const fromUrl = query ? parseInvite(query) : null;
  if (fromUrl) {
    rememberInvite(fromUrl, now);
    return fromUrl;
  }
  try {
    const raw = JSON.parse(localStorage.getItem(PENDING) || "null");
    if (
      raw &&
      Number.isFinite(raw.at) &&
      now - raw.at >= 0 &&
      now - raw.at < 7 * 86400000
    )
      return parseInvite(raw.code) || "";
    localStorage.removeItem(PENDING);
  } catch {}
  return "";
}
export function clearInvite() {
  try {
    localStorage.removeItem(PENDING);
  } catch {}
  const url = new URL(window.location.href);
  url.searchParams.delete("clube");
  window.history.replaceState(null, "", url.pathname + url.search + url.hash);
}
export function signupReturnUrl(invite: string) {
  const url = new URL(window.location.origin + window.location.pathname);
  const code = parseInvite(invite);
  if (code) url.searchParams.set("clube", code);
  return url.toString();
}
export function socialError(error: unknown): string {
  const e = error as { code?: string; message?: string };
  if (e?.code === "invalid_credentials")
    return "E-mail ou senha não conferem. O pombo digitou com o bico? Confira e tente de novo.";
  if (e?.code === "email_not_confirmed")
    return "Confirme sua conta pelo e-mail recebido antes de entrar.";
  if (
    e?.message?.includes("Invalid invitation") ||
    e?.message?.includes("Convite inválido")
  )
    return "Esse convite não foi reconhecido. Peça ao amigo um novo link ou o código de 32 caracteres.";
  if (e?.message?.includes("Club limit"))
    return "Você já participa de 20 ligas. O sindicato do caos está sem cadeiras.";
  return "O cartório digital não respondeu como esperado. Confira sua conexão e tente novamente; seus dados locais continuam aqui.";
}
