# WordPress と GitHub セットアップマニュアル

本サイトは Astro による静的サイトで、WordPress をヘッドレス CMS として利用する。GitHub Actions でビルドし、さくらインターネットへデプロイする。

---

## 1. WordPress 側の設定

### 1.1 必要なプラグイン

- **WPGraphQL**: GraphQL API を提供する
- **WPGraphQL for Advanced Custom Fields**（ACF 使用時）: 任意

### 1.2 WPGraphQL のインストール

1. WordPress 管理画面 > プラグイン > 新規追加
2. 「WPGraphQL」で検索し、インストール・有効化
3. GraphQL エンドポイントは `https://(WordPressのドメイン)/graphql` で公開される

### 1.3 カスタム投稿タイプ（お知らせ）

本テンプレートは `newsItems` というカスタム投稿タイプを想定している。WPGraphQL でカスタム投稿タイプを公開するには、プラグインまたはテーマで登録する。

**例: プラグインまたは functions.php で登録**

```php
add_action('init', function() {
  register_post_type('news_item', [
    'label' => 'お知らせ',
    'public' => true,
    'show_in_graphql' => true,
    'graphql_single_name' => 'newsItem',
    'graphql_plural_name' => 'newsItems',
    'supports' => ['title', 'editor', 'thumbnail'],
    'has_archive' => true,
  ]);
});
```

カスタムタクソノミー `news_cat` も同様に `show_in_graphql => true` で登録する。

### 1.4 GraphQL エンドポイントの確認

- URL: `https://wp.(ドメイン)/graphql`
- ブラウザでアクセスすると GraphQL Playground または IDE が表示される（WPGraphQL のバージョンによる）
- 外部からのリクエストを許可するため、CORS が正しく設定されていることを確認する

### 1.5 ローカル開発時の環境変数

1. `.env.example` を `.env` にコピーする
2. `WPGRAPHQL_ENDPOINT` を実際の GraphQL エンドポイント URL に書き換える

```
WPGRAPHQL_ENDPOINT=https://wp.example.com/graphql
```

`.env` は `.gitignore` に含め、リポジトリにコミットしない。

---

## 2. GitHub 側の設定

### 2.1 リポジトリの作成

1. GitHub で新規リポジトリを作成
2. テンプレートを push するか、既存リポジトリを clone して push

### 2.2 Secrets の設定

リポジトリ > Settings > Secrets and variables > Actions > Secrets で以下を追加する。

| Secret 名 | 説明 | 例 |
|-----------|------|-----|
| `SSH_PRIVATE_KEY` | さくらインターネットへ SSH 接続するための秘密鍵（全文） | `-----BEGIN OPENSSH PRIVATE KEY-----` から `-----END OPENSSH PRIVATE KEY-----` まで |
| `SSH_HOST` | さくらインターネットの SSH ホスト名 | `web7100.sakura.ne.jp` |
| `SSH_USERNAME` | SSH 接続時のユーザー名 | `web7100` |
| `SSH_TARGET_DIR` | デプロイ先のリモートディレクトリ（絶対パス） | `/home/web7100/www/recruit.tsamc/dist` |

### 2.3 Variables の設定

リポジトリ > Settings > Secrets and variables > Actions > Variables で以下を追加する。

| Variable 名 | 説明 | 例 |
|-------------|------|-----|
| `WPGRAPHQL_ENDPOINT` | WordPress の GraphQL エンドポイント URL | `https://wp.tsamc.jp/graphql` |

ビルド時にこの値が `WPGRAPHQL_ENDPOINT` 環境変数として渡され、Astro が WordPress からデータを取得する。

### 2.4 デプロイのトリガー

`.github/workflows/deploy.yml` により、以下のタイミングでビルド・デプロイが実行される。

| トリガー | 説明 |
|----------|------|
| `push` が `main` ブランチにマージされた時 | 自動でビルド・デプロイ |
| `workflow_dispatch` | Actions タブから手動実行 |

### 2.5 手動デプロイの手順

1. GitHub リポジトリ > Actions タブ
2. 「Build and Deploy」ワークフローを選択
3. 「Run workflow」をクリック
4. 必要に応じて reason を入力し、実行

---

## 3. さくらインターネット側の準備

### 3.1 SSH 鍵の登録

1. ローカルで SSH 鍵を生成（未所持の場合）: `ssh-keygen -t ed25519 -C "github-actions"`
2. 公開鍵をさくらのサーバーに登録
   - さくらインターネットのコントロールパネル > SSH 鍵登録
   - または `~/.ssh/authorized_keys` に追記
3. 秘密鍵の内容を GitHub の `SSH_PRIVATE_KEY` に登録

### 3.2 デプロイ先ディレクトリ

- `SSH_TARGET_DIR` で指定したディレクトリが `dist/` の内容で上書きされる
- `--delete` オプションにより、リモートにあってローカルにないファイルは削除される
- 既存の `.htaccess` 等を保持したい場合は、デプロイ先をサブディレクトリにするか、deploy.yml の `ARGS` を調整する

---

## 4. 設定の流れ（チェックリスト）

### 初回セットアップ

- [ ] WordPress に WPGraphQL をインストール・有効化
- [ ] カスタム投稿タイプ `newsItems` を登録（必要に応じて）
- [ ] GraphQL エンドポイントが動作することを確認
- [ ] `src/lib/wordpress.ts` の `DEFAULT_GRAPHQL_ENDPOINT` を `https://wp.(ドメイン)/graphql` に更新
- [ ] さくらインターネットに SSH 鍵を登録
- [ ] GitHub リポジトリに Secrets を設定（SSH_PRIVATE_KEY, SSH_HOST, SSH_USERNAME, SSH_TARGET_DIR）
- [ ] GitHub リポジトリに Variables を設定（WPGRAPHQL_ENDPOINT）
- [ ] `main` ブランチに push してデプロイを確認

### お知らせ更新時

- [ ] WordPress でお知らせを投稿・更新
- [ ] GitHub Actions を手動実行するか、Webhook で自動トリガーする（Webhook 設定は別途必要）

---

## 5. トラブルシューティング

### ビルド時に GraphQL エラーが出る

- `WPGRAPHQL_ENDPOINT` が正しいか確認
- WordPress の WPGraphQL が有効か確認
- ファイアウォールや CORS でブロックされていないか確認

### デプロイが失敗する

- `SSH_PRIVATE_KEY` が改行を含めて正しく登録されているか確認
- `SSH_HOST`、`SSH_USERNAME`、`SSH_TARGET_DIR` が正しいか確認
- さくらのサーバーから GitHub Actions の IP が接続許可されているか確認（必要に応じて）
