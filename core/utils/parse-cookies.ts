export function parseCookies(cookieHeader: string | undefined) {
  const cookies: Record<string, string | undefined> = {};
  if (!cookieHeader) return cookies;

  const cookiePairs = cookieHeader.split(";");
  cookiePairs.forEach((param) => {
    if (!param) return;
    const separator = param.indexOf("=");
    const chave = separator == -1 ? param : param.slice(0, separator).trim();
    const valor =
      separator == -1 ? "" : param.slice(separator + 1, param.length).trim();
    cookies[chave] = valor;
  });

  return cookies;
}
