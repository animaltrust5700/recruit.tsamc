/**
 * 静的アセットのURLにキャッシュバスティング用のクエリパラメータを付与する。
 * PUBLIC_BUILD_ID が設定されている場合（CI ビルド時）のみ付与し、
 * ローカル開発時はそのまま返す。
 */
export function assetUrl(path: string): string {
  const buildId = import.meta.env.PUBLIC_BUILD_ID;
  if (!buildId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${buildId}`;
}
