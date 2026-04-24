# 所沢さくら動物医療センター 採用サイト — デザイン指針

`recruit.tsamc.jp` 向け Astro フロントエンドのビジュアル言語と実装上の制約をまとめた文書です。新規セクション・ページ追加時に、**トーン・カラー・タイポ・コンポーネント**の一貫性を保つための参照用です。詳細なコーディングルールは `.cursor/rules/hp-project.mdc` も併せて参照してください。

---

## 1. プロダクト文脈

| 項目 | 内容 |
|------|------|
| サイト名 | 所沢さくら動物医療センター 採用サイト |
| 想定利用者 | 採用候補者（獣医師・看護師・トリマー等） |
| デザインの目的 | 病院の信頼感と、働きやすさ・学びの環境を同時に伝える |

**トーン（キーワード）:** soft / pastel × luxury / refined — 親しみやすさと洗練の両立。

**ブランドカラー（マスター）**

- **Slate Navy:** `#4a6086` — 主に見出し・ナビ・信頼感の軸
- **Sakura Pink:** 実装トークンでは `#ef8ca1`（`--color-accent`）をメインに使用。参考値 `#f2a3b0` はルール上の表記用

**さくらモチーフ:** 桜の花（SVG: `SakuraIcon` / `BrandSakuraMark`）を見出し・CTA・装飾に積極的に用い、ブランドの核として扱う。

---

## 2. カラーシステム

実体は `src/styles/app.css` の `:root` トークン。新規UIでは**直接16進を書かず**、必ずトークンを使う。

| トークン | 値 | 用途の目安 |
|----------|-----|------------|
| `--color-bg` | `#fffafc` | ページ基調背景 |
| `--color-bg-alt` | `#fdf2f5` | 交互セクション用の淡ピンク |
| `--color-bg-pink` | `#fbe4ea` | やや濃いピンク帯 |
| `--color-surface` | `#ffffff` | カード・面 |
| `--color-accent` | `#ef8ca1` | プライマリアクセント（CTA等） |
| `--color-accent-strong` | `#e06a85` | 強調テキスト・hover |
| `--color-accent-soft` | `#fde8ec` | タグ背景・アイコン下地 |
| `--color-navy` | `#4a6086` | ブランドネイビー |
| `--color-navy-deep` | `#2f3f61` | 見出し・本文色 |
| `--color-navy-soft` | `#e7ecf4` | 淡いネイビー面 |
| `--color-text` | `#2f3f61` | 本文 |
| `--color-text-muted` | `#8597b5` | 補足・メタ |
| `--color-border` | `rgba(74, 96, 134, 0.14)` | 一般枠線 |
| `--color-border-pink` | `rgba(239, 140, 161, 0.3)` | ピンク系枠 |

**シャドウ（参考）:** `--shadow-card` / `--shadow-card-hover` / `--shadow-cta` — カードとピンク系CTAで差別化。

**レイアウト定数:** `--content-max-width: 1200px`、`--header-height: 80px` など。

---

## 3. タイポグラフィ

| 役割 | スタック（CSS変数） | 主な使用場面 |
|------|---------------------|----------------|
| 本文 | `--font-sans`（Zen Kaku Gothic New 系） | `body` 既定 |
| 丸ゴ | `--font-rounded`（Zen Maru Gothic 系） | 見出し全般、ボタン、ラベル感の強いUI |
| 明朝 | `--font-mincho`（Shippori Mincho 等） | 署名・格調を要する短文 |
| 英字アクセント | `--font-script`（Cormorant Garamond 等, *italic*） | 英語ラベル、`.c-section-heading` の補助線付き行 |
| 手書き風 | `--font-handwriting` | 限定的（必要時のみ） |

**読み込み:** Google Fonts は `Layout.astro` の `<head>` で一括。

**本文:** `letter-spacing: 0.04em`（`html`）、行間はおおよそ 1.9（`body`）。

### フォントサイズ（実装ルール）

- コンポーネント内で任意の `font-size` を書かない。
- `has-*-font-size` + `data-layout="-fluid-typography"`（`design-system.css`）で制御。
- 目安: ヒーロー H1 → `has-4-xl-font-size`、ページ h1 → `has-3-xl-font-size`、セクション h2 → `has-2-xl-font-size`、カード h3 → `has-l-font-size` 〜 `has-m-font-size`。

**ユーティリティ:** `u-font-mincho` / `u-font-rounded` / `u-font-script` / `u-text-accent` / `u-text-navy` 等。

---

## 4. レイアウトと余白

- **幅:** コンテンツの最大幅は原則 `--content-max-width`。記事風の狭い面は `--page-content-max-width` 等。
- **スタック・グリッド:** `c-stack`（`data-gap="1"`〜`7"`）、`c-grid` + `c-grid_col2`〜`4`（`design-system.css`）。セクション内の大きな縦余白は `data-gap="5"` または `6` が標準、カード間は `2`〜`3`、見出し周りは `1`〜`2`。
- **コンテナ:** `c-container` で横ガターと最大幅を揃える。

---

## 5. コンポーネント（共通部品）

| 名前 | 役割 |
|------|------|
| `Layout` | 全ページの骨格、メタ、`IntersectionObserver` による `.fade-in` |
| `Header` | 固定ヘッダー、グロナビ、見学CTA、`MobileMenu` 連携 |
| `Footer` | 連絡先・SNS・補助ナビ |
| `SectionHeading` | 英ラベル + 日本語タイトル（`c-section-heading`、前後 `—` 風装飾） |
| `SakuraIcon` / `BrandSakuraMark` | 桜アイコン（`currentColor` 継承） |
| `DecorDots` | ドット格子の装飾SVG |

**ボタン:** `c-btn` + 修飾子

- `c-btn--navy` — 主アクション（ネイビー塗り）
- `c-btn--pink` — 強い誘導（ピンク塗り）
- `c-btn--ghost` — サブ（白地・枠線）

ボタン文言には `has-s-font-size` と `data-layout="-fluid-typography"` を付与する。リンクホバーは全般 `opacity` ベース（**インタラクティブ要素に `translateY` のホバー移動は使わない** — ルール上の禁止事項に準拠）。

---

## 6. ページ・セクションの CSS 命名（BEM 系）

**ページブロック例:** `p-hero`, `p-philosophy`, `p-director`, `p-feature`, `p-staff`, `p-cta`, `p-page-hero`, `p-page-body` ほか。下層: `p-info-table`, `p-timeline`, `p-job-grid`, `p-form` 等。

**共通:** `c-btn`, `c-section-heading`, `c-sakura`。

新規セクションを足す場合は、既存の `p-*` パターンに揃え、**単色平面的な帯の連打**ではなく、グラデーション・ぼかしオーブ・ドット・幾何装飾で**セクション境界を柔らかく**切る。

---

## 7. セクション背景（トップの例）

- **Hero:** 放射グラデ、ドット装飾、ぼかし円
- **Philosophy / Feature:** 白基調でクリーンに連結可能
- **Director:** 斜めグラデ（ピンク〜ラベンダー系）+ 前後ぼかし
- **Staff:** 淡ピンクのレイヤー + 幾何パターン
- **CTA:** 紫系グラデカード＋動物シルエット等の装飾

---

## 8. モーション

- スクロール入場: `fade-in` + 任意で `fade-in-delay-1` … `5`（スタガー）。`Layout.astro` 内スクリプトが `.is-visible` を付与。
- トランジション: `cubic-bezier(0.2, 0.8, 0.2, 1)` 等（`app.css` 参照）。

---

## 9. 画像・アセット

- `src/assets/img/`: `import` し Astro `Image` で最適化。
- `public/`: 固定URLが必要なものは `assetUrl()` 等の既存パターンに合わせる。

---

## 10. 編集上の注意（要約）

| 可 | 不可・注意 |
|----|------------|
| トークンと既存BEM | `design-system.css` の手編集（禁止） |
| `has-*-font-size` + fluid | 各所への直接 `font-size` |
| さくらモチーフの継続使用 | 絵文字、場当たり的な16進直書きの乱立 |
| | インライン style の多用（React例外・Astroは最小限） |

---

## 11. 関連ファイル

- `src/styles/app.css` — ブランドトークン、ページ/コンポーネントの見た目の本体
- `src/styles/design-system.css` — フルードタイポ、`c-stack` / `c-grid` / `c-container` 等（**原則編集しない**）
- `src/components/Layout.astro` — フォント読み込み、フェード用スクリプト
- `.cursor/rules/hp-project.mdc` — ルート一覧・厳密なコーディング規約

---

*最終更新の基準: リポジトリ内の上記ファイルに準拠。トークンやクラス名が変わった場合は本書と併せて更新すること。*
