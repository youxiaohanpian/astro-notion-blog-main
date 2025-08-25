# Astro Notion Blog 強化版

[中文](README.md) | [English](README.en.md) | [日本語](#astro-notion-blog-強化版)

## プロジェクト紹介

Astro Notion Blog 強化版は、元の [Astro Notion Blog](https://github.com/otoyo/astro-notion-blog) をベースに最適化されたバージョンです。元の機能を保持しながら、インターフェースとユーザーエクスペリエンスをいくつかの改善を行い、より美しく、使いやすく、効率的にしました。

## クイックスタート

詳細な構築とデプロイの手順については、[BUILD.md](BUILD.md) を参照してください。

## 更新履歴

### 2025-08-04
- プロジェクトの切り替えにより、Node.js バージョンの要件を更新
- 開始コマンドの更新：`npm run dev -- --host` を実行する必要がある場合があります

### 2025-07-19
1. ウェブサイトを静的デプロイに戻し、ミドルウェアをロールバック、ミドルウェアは不要
2. 一部の CSS 互換性の問題を修正
3. 記事内の目次挿入の問題を修正
4. like.ts を削除、現在この機能は不要、いいね機能はシミュレーション
5. 共有機能をリンク+タイトルのコピー形式に変更
6. searchModal の中国語検索のマッチング問題を修正、input にバインド【重要】
7. ウェブサイトの言語を：lang="ja-JP" に変更
8. GitHub が推奨する SECURITY.md を追加
9. version.json の CSP コンテンツを更新、自身、Notion リソース、Google Analytics ドメイン、Vercel Insights ドメインを含む

## 環境要件

### Node.js バージョン
- 推奨：Node.js 20.11.1 LTS
- 最低：Node.js >= 18.0.0
- npm バージョン：10.2.4 以上

### 主な依存関係のバージョン
```json
{
  "dependencies": {
    "astro": "^5.1.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@notionhq/client": "^2.2.15"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "typescript": "^5.0.0",
    "dotenv-cli": "^8.0.0"  // ビルド時の環境変数の読み込みに使用
  }
}
```

### 環境変数の設定
1. `.env.local` ファイルを作成する（Git にコミットしないでください）：

```
# Notion API シークレット
NOTION_API_SECRET=your_notion_api_secret

# Notion データベース ID
DATABASE_ID=your_database_id

# ブログのベースパス（サブディレクトリにデプロイする場合）
BASE_PATH=/

# カスタムドメイン（オプション）
CUSTOM_DOMAIN=your_custom_domain.com

# ページあたりの投稿数
NUMBER_OF_POSTS_PER_PAGE=10

# リクエストタイムアウト（ミリ秒）
REQUEST_TIMEOUT_MS=30000
```

2. 環境変数の読み込みの説明：
   - 開発環境（`npm run dev`）：`.env.local` を自動的に読み込む
   - ビルド環境（`npm run build`）：dotenv-cli を使用して `.env.local` を読み込む
   - 注意：`.env` ファイルは使用しないでください、誤って Git にコミットされる可能性があります

### インストール手順
1. 正しい Node.js バージョンを使用していることを確認します：
   ```bash
   nvm use 18.20.8
   ```

2. 依存関係をインストールします：
   ```bash
   npm install
   npm install --save-dev dotenv-cli  # ビルド時の環境変数の読み込みに使用
   ```

3. 環境変数を設定します：
   - 上記の環境変数テンプレートを `.env.local` ファイルにコピーします
   - Notion API シークレットとデータベース ID を入力します

4. 開発サーバーを起動します：
   ```bash
   npm run dev
   ```

5. 本番バージョンをビルドします：
   ```bash
   npm run build
   ```

6. ビルド結果をプレビューします：
   ```bash
   npm run preview
   ```
   - これにより、ビルドされたウェブサイトをプレビューするためのローカルサーバーが起動します
   - デフォルトのアドレスは http://localhost:4321 です
   - プレビューモードでは本番環境がシミュレートされ、ビルド結果を確認できます

## Notion データベースの設定

### 必須フィールド
1. **Page**：記事のタイトル用のタイトルフィールド
2. **Tags**：記事のカテゴリ用のマルチセレクトフィールド
3. **Date**：記事の公開日用の日付フィールド
4. **Excerpt**：記事の要約用のテキストフィールド
5. **FeaturedImage**：記事のフィーチャー画像用のファイルフィールド
6. **Published**：記事を公開するかどうかを制御するチェックボックスフィールド
7. **Rank**：記事のピン留め順序を制御する数値フィールド
8. **Slug**：記事の URL パス用のテキストフィールド（手動で英語を入力することを推奨）

### 設定手順
1. Notion で新しいデータベースを作成します
2. 上記のすべての必須フィールドを追加します
3. データベース ID を取得します（データベース URL から抽出）
4. データベース ID を `.env.local` ファイルに追加します
5. データベースを Notion インテグレーションアプリと共有します

## 開発とビルド環境の説明

### 開発環境（`npm run dev`）
- ホットリロードをサポート
- `.env.local` 環境変数を自動的に読み込む
- 開発とデバッグに適しています

### ビルド環境（`npm run build`）
- 静的ファイルを生成
- dotenv-cli を使用して `.env.local` 環境変数を読み込む
- リソースの最適化と圧縮

### プレビュー環境（`npm run preview`）
- 本番環境をシミュレート
- ビルド結果のテストに使用
- パフォーマンスと互換性のチェック

## デプロイガイド

### Vercel デプロイ
1. Vercel アカウントに登録またはログインします
2. 「New Project」ボタンをクリックします
3. GitHub リポジトリをインポートします
4. 環境変数を設定します（`.env.local` と同じ）
5. 「Deploy」ボタンをクリックします
6. デプロイが完了するのを待ちます

### Netlify デプロイ
1. Netlify アカウントに登録またはログインします
2. 「New site from Git」ボタンをクリックします
3. GitHub リポジトリを選択します
4. ビルドコマンドを設定します：`npm run build`
5. 公開ディレクトリを設定します：`dist`
6. 環境変数を設定します（`.env.local` と同じ）
7. 「Deploy site」ボタンをクリックします
8. デプロイが完了するのを待ちます

## よくある問題

### 1. ビルド時の環境変数の問題
- エラー：`API token is invalid`
- 原因：ビルド中に `.env.local` ファイルが正しく読み込まれなかった
- 解決策：`dotenv-cli` がインストールされていることを確認し、ビルドスクリプトが正しく設定されていることを確認します

### 2. Node.js バージョンの互換性
- エラー：`SyntaxError: missing ) after argument list`
- 原因：Node.js 22.x バージョンが一部の依存関係と互換性がない
- 解決策：Node.js 18.x LTS バージョンを使用します

### 3. PowerShell 環境の問題
- エラー：`无法将"node.exe"项识别为 cmdlet`（「node.exe」をコマンドレットとして認識できません）
- 原因：PowerShell の Node.js パスの問題
- 解決策：コマンドの実行に PowerShell ではなく CMD を使用します

### 4. Notion API アクセスの問題
- エラー：`Unauthorized` または `Invalid database ID`
- 原因：無効な Notion API シークレット、またはデータベースがインテグレーションアプリと共有されていない
- 解決策：API シークレットが正しいかどうかを確認し、データベースがインテグレーションアプリと共有されていることを確認します

### 5. 画像が表示されない
- エラー：画像が読み込まれない
- 原因：無効な画像リンクまたは権限の問題
- 解決策：Notion の画像がパブリックであることを確認するか、ローカル画像を使用します

## 主な機能と改善点

### 統一された角丸デザイン
- すべてのコンポーネントの角丸を 4px に統一（テーブル、引用、コールアウト、コードブロック、画像、ブックマーク）
- 視覚的な階層を高めるために微妙な影効果を追加
- インタラクション体験を向上させるためにホバー状態を最適化

### ブログカードの最適化
- 「もっと読む」ボタンを削除、カード全体がクリック可能
- タグのレイアウトとスタイルを最適化
- モバイル体験を向上させるためにレスポンシブデザインを改善
- 3 つの画像ソースをサポートする画像表示ロジックを強化：
  1. FeaturedImage（最優先）：Notion フィールドの画像、最適化済み
  2. Cover（第 2 優先）：オンラインギャラリーの画像、高品質なカバーに適しています
  3. FirstImage（第 3 優先）：記事内の最初の画像、一時的な使用に適しています
- 画像読み込みの最適化：
  - パフォーマンスを向上させるための遅延読み込み
  - ブロッキングを減らすための非同期デコード
  - レイアウトシフトを避けるための固定アスペクト比
  - 開発環境と本番環境の異なる処理方法をサポート
- 画像表示の規則：
  - 3 つの画像ソースのいずれもアップロードされていない場合、記事のタイトルとコンテンツのみが表示されます
  - Cover フィールドを削除できます、システムは自動的に FirstImage にダウングレードします
  - 記事の表示効果を高めるために、少なくとも 1 つの画像をアップロードすることを推奨します

### 記事ナビゲーションの改善
- ナビゲーションレイアウトを最適化：前の記事を左、次の記事を右に配置
- 美しいホバー効果を追加（わずかな浮き上がりと影の強化）
- テキストの配置を最適化（前の記事を左揃え、次の記事を右揃え）
- すべてのデバイスで良好な表示効果を確保

### 記事詳細ページの最適化
- 時間表示の位置をタイトルの下に調整し、ホームページと一致させる
- タグのスタイルとインタラクション効果を統一
- モバイルメニューボタンを最適化、スクロール中に固定位置を維持

### Notion ブロックスタイルの最適化
- コールアウトブロックに角丸を追加し、視覚的な魅力を高める
- 引用ブロックに右角丸と微妙な背景色を追加
- コードブロックのコピーボタンのホバー効果とカスタムスクロールバーを強化
- 画像ブロックに角丸と影効果を追加し、全体的な質感を向上

### 型安全性の強化
- すべてのコンポーネントに型チェックを追加し、Notion ブロックが存在することを確保
- コードの堅牢性を高めるために型ガード関数を追加
- TypeScript のベストプラクティスに準拠するように複数の型エラーを修正

### ローカライズの最適化
- 中国語ユーザーの体験を向上させるために、インターフェーステキストを簡体字中国語に
- 中国語表示を完全にサポートするためにフォント設定を最適化

### パンくずリスト
- 現在の位置を明確に示すために、検索ボタンの横にパンくずリストを追加
- 各ページが独自のパンくずパスを定義できるシンプルな API を提供
- 小さな画面ではホームページのテキストを自動的に非表示にし、アイコンのみを表示してスペースを節約
- ホバー効果や角丸デザインを含め、全体的な UI と一致するデザインスタイル

### Slug 必須オプション
- Slug を自動的に構築しようとしますが、中国語のサポートはあまり良くありません
- Notion で手動で英語を入力する必要があります
- Slug が空の場合、システムはリンクの有効性を確保するために Notion ページ ID をフォールバックとして使用します

### 記事のピン留めソート規則
- Notion データベースの Rank フィールドをサポートし、記事のピン留めソートを実装
- Rank に 0 より大きい数字を入力します、数字が大きいほど上位に表示されます（よりピン留めされます）
- Rank がない、または Rank=0 の記事は、Rank のあるすべての記事の後にランク付けされ、公開日時の降順で並べ替えられます
- 例：Rank=3 > Rank=2 > Rank=1 > Rank なし/Rank=0
- 1 つの記事にのみ Rank=1 を設定し、他に設定しない場合、その記事がピン留めされます。Rank=2、Rank=1 がある場合、2 が最初にピン留めされ、1 が次になり、他は日時の降順になります

## 拡張とカスタマイズガイド

### 翻訳サービスの変更または拡張方法

`src/lib/slug-helpers.ts` ファイルを編集します：

1. **新しい翻訳サービスクラスを作成**：
```typescript
class YourTranslationService implements TranslationService {
  async translate(text: string, targetLang: string): Promise<string> {
    // 翻訳ロジックを実装
    return translatedText;
  }
}
```

2. **TranslationServiceFactory に新しいサービスを追加**：
```typescript
static getService(type: 'google' | 'pinyin' | 'your-service' = 'google'): TranslationService {
  switch (type) {
    case 'your-service':
      return new YourTranslationService();
    // ... 他のサービス
  }
}
```

3. **translateWithFallback 関数のサービスの優先順位を更新**：
```typescript
const serviceTypes: Array<'google' | 'pinyin' | 'your-service'> = ['google', 'your-service', 'pinyin'];
```

### 拼音変換サービスについて

現在の拼音変換サービスには、一般的に使用される漢字の数が少なく含まれています。中国の一般規範漢字表には 8105 文字が収録されており、そのうち常用字（1 級字表）は 3500 文字です。

**専門的な拼音ライブラリの使用を推奨**：

1. 専門的な拼音ライブラリをインストールします：
```bash
npm install pinyin
```

2. `PinyinTranslationService` クラスを変更します：
```typescript
import pinyin from 'pinyin';

class PinyinTranslationService implements TranslationService {
  async translate(text: string, targetLang: string): Promise<string> {
    const result = pinyin(text, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false
    }).flat().join('');
    
    return result;
  }
}
```

これにより、少数の例の文字だけでなく、すべての漢字に対する完全なサポートが提供されます。

## パンくずリストの使用ガイド

任意のページコンポーネントで、Layout コンポーネントに breadcrumbs プロパティを渡すことで、パンくずリストを追加できます：

```astro
<Layout 
  title="記事カテゴリ" 
  description="すべてのログカテゴリを表示" 
  path="/categories" 
  ogImage="" 
  breadcrumbs={[
    { label: 'カテゴリ', href: '/categories' }
  ]}
>
  <!-- ページコンテンツ -->
</Layout>
```

より深い階層のページの場合、複数のパンくずアイテムを追加できます：

```astro
<Layout 
  title="技術記事" 
  description="技術に関するすべての記事" 
  path="/categories/tech" 
  ogImage="" 
  breadcrumbs={[
    { label: 'カテゴリ', href: '/categories' },
    { label: '技術', href: '/categories/tech' }
  ]}
>
  <!-- ページコンテンツ -->
</Layout>
```

パンくずリストは自動的にホームページリンクを追加しますので、手動で追加する必要はありません。小さな画面では、ホームページのテキストが自動的に非表示になり、スペースを節約するためにアイコンのみが表示されます。

## プロジェクト構造

```
astro-notion-blog/
├── .cursor/               # Cursor IDE の設定
├── .github/               # GitHub の設定
├── .vscode/               # VS Code の設定
├── cline_docs/            # プロジェクトドキュメント
├── public/                # 静的リソース
├── scripts/               # スクリプトファイル
├── src/                   # ソースコード
│   ├── components/        # コンポーネント
│   ├── content/           # コンテンツ
│   ├── images/            # 画像リソース
│   ├── integrations/      # Astro インテグレーション
│   ├── layouts/           # レイアウト
│   ├── lib/               # ユーティリティ関数
│   ├── pages/             # ページ
│   └── styles/            # スタイル
├── astro.config.mjs       # Astro の設定
├── package.json           # 依存関係の設定
├── README.md              # プロジェクトの説明
└── ...                    # その他の設定ファイル
```

## 貢献ガイド

1. このリポジトリをフォークします
2. 機能ブランチを作成します（`git checkout -b feature/AmazingFeature`）
3. 変更をコミットします（`git commit -m 'Add some AmazingFeature'`）
4. ブランチにプッシュします（`git push origin feature/AmazingFeature`）
5. プルリクエストを開きます

## 謝辞

元の作者である [otoyo](https://github.com/otoyo) に、優れたプロジェクトフレームワークとアイデアを提供していただき、特別な感謝を申し上げます。元のプロジェクトは、Notion を CMS として使用するための優れたソリューションを提供しており、バックエンド管理を心配することなく、コンテンツ作成に集中することができます。

この強化版は、元のベースでインターフェースとユーザーエクスペリエンスを最適化し、より多くの中国語ユーザーにより良いブログ体験を提供できることを願っています。

## ライセンス

元のプロジェクトと同様に、このプロジェクトは [MIT ライセンス](LICENSE) を採用しています。