/**
 * Astro の base を含めた URL を返す。
 * 公開確認環境のようにサブディレクトリ配下へ配置する場合でも、
 * 内部リンクと public 配下の静的アセットが正しいパスを向くようにする。
 */
export function routeUrl(path: string): string {
  if (isExternalUrl(path) || path.startsWith("#")) return path;

  const [pathname, suffix] = splitUrl(path);
  const base = normalizeBase(import.meta.env.BASE_URL);
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (!base) return `${normalizedPath}${suffix}`;
  if (normalizedPath === "/") return `${base}/${suffix}`;
  if (normalizedPath === base || normalizedPath.startsWith(`${base}/`)) {
    return `${normalizedPath}${suffix}`;
  }

  return `${base}${normalizedPath}${suffix}`;
}

export function stripBasePath(pathname: string): string {
  const base = normalizeBase(import.meta.env.BASE_URL);
  if (!base) return pathname || "/";
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length) || "/";
  return pathname || "/";
}

/**
 * 静的アセットのURLにキャッシュバスティング用のクエリパラメータを付与する。
 * PUBLIC_BUILD_ID が設定されている場合（CI ビルド時）のみ付与し、
 * ローカル開発時はそのまま返す。
 */
export function assetUrl(path: string): string {
  const buildId = import.meta.env.PUBLIC_BUILD_ID;
  const url = routeUrl(path);
  if (!buildId) return url;
  return appendQuery(url, "v", buildId);
}

function normalizeBase(baseUrl: string): string {
  if (!baseUrl || baseUrl === "/") return "";
  return `/${baseUrl.replace(/^\/+|\/+$/g, "")}`;
}

function splitUrl(path: string): readonly [string, string] {
  const match = path.match(/^([^?#]*)(.*)$/);
  return [match?.[1] ?? path, match?.[2] ?? ""];
}

function appendQuery(url: string, key: string, value: string): string {
  const hashIndex = url.indexOf("#");
  const withoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const separator = withoutHash.includes("?") ? "&" : "?";
  return `${withoutHash}${separator}${key}=${encodeURIComponent(value)}${hash}`;
}

function isExternalUrl(path: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//");
}
