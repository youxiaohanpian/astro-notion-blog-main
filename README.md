# Astro Notion Blog 增强版

[中文](#astro-notion-blog-增强版) | [English](#astro-notion-blog-enhanced-version) | [日本語](#astro-notion-blog-強化版)

## 主要特性与改进

### 1. 统一圆角设计
- 所有组件圆角统一为4px（表格、引用、Callout、代码块、图片和书签）
- 添加轻微阴影效果，提升视觉层次感
- 优化悬停状态，增强交互体验

### 2. 博客卡片优化
- 移除"阅读更多"按钮，整个卡片可点击
- 优化标签布局与样式
- 改进响应式设计，提升移动端体验
- 增强图片显示逻辑，同时支持FeaturedImage和Cover字段（优先使用FeaturedImage）

### 3. 文章导航改进
- 优化导航布局：上一篇在左侧，下一篇在右侧
- 添加精美悬停效果（微弱上浮与阴影增强）
- 优化文本对齐（上一篇左对齐，下一篇右对齐）
- 确保在所有设备上均有良好显示效果

### 4. 文章详情页优化
- 调整时间显示位置至标题下方，与首页保持一致
- 统一标签样式与交互效果
- 优化移动端菜单按钮，滚动时保持固定位置

### 5. Notion 块样式优化
- Callout块添加圆角效果，提升视觉美感
- Quote块增加右侧圆角与轻微背景色
- Code块增强复制按钮悬停效果与自定义滚动条
- Image块添加圆角与阴影效果，提升整体质感

### 6. 类型安全增强
- 为所有组件添加类型检查，确保Notion块存在
- 添加类型保护函数，提高代码健壮性
- 修复多处类型错误，符合TypeScript最佳实践

### 7. 本地化优化
- 界面文本中文化，提升中文用户体验
- 优化字体配置，完美支持中文显示

### 8. 面包屑导航
- 在搜索按钮旁添加面包屑导航，清晰指示当前位置
- 提供简单API允许每个页面定义自己的面包屑路径
- 小屏幕上自动隐藏首页文本，仅显示图标，节省空间
- 设计风格与整体UI一致，包括悬停效果和圆角设计

### 9. 自动生成 Slug
- 自动从标题生成Slug，无需手动设置
- 支持中文标题自动翻译为英文并生成适当Slug
- 实现多种翻译服务支持，失败时自动切换备用服务
- 本地拼音转换作为最终备用方案，确保离线时也能生成有意义的Slug
- 优化Slug长度，确保URL简洁易读
- 允许删除Notion数据表中的Slug字段，系统会自动处理

## 扩展与自定义指南

### 如何修改或扩展翻译服务

编辑 `src/lib/slug-helpers.ts` 文件：

1. **创建新的翻译服务类**：
```typescript
class YourTranslationService implements TranslationService {
  async translate(text: string, targetLang: string): Promise<string> {
    // 实现您的翻译逻辑
    return translatedText;
  }
}
```

2. **在 TranslationServiceFactory 中添加新服务**：
```typescript
static getService(type: 'google' | 'pinyin' | 'your-service' = 'google'): TranslationService {
  switch (type) {
    case 'your-service':
      return new YourTranslationService();
    // ... 其他服务
  }
}
```

3. **更新 translateWithFallback 函数中的服务优先级**：
```typescript
const serviceTypes: Array<'google' | 'pinyin' | 'your-service'> = ['google', 'your-service', 'pinyin'];
```

### 关于拼音转换服务

当前拼音转换服务仅包含少量常用汉字。中国通用规范汉字表收录了8105个汉字，其中常用字（一级字表）有3500个。

**推荐使用专业拼音库**：

1. 安装专业拼音库：
```bash
npm install pinyin
```

2. 修改 `PinyinTranslationService` 类：
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

这将提供对所有中文字符的完整支持，而不仅限于少量示例字符。

## 面包屑导航使用指南

在任何页面组件中，都可以通过向Layout组件传递breadcrumbs属性来添加面包屑导航：

```astro
<Layout 
  title="文章分类" 
  description="查看所有文章分类" 
  path="/categories" 
  ogImage="" 
  breadcrumbs={[
    { label: '分类', href: '/categories' }
  ]}
>
  <!-- 页面内容 -->
</Layout>
```

对于更深层次的页面，可以添加多个面包屑项：

```astro
<Layout 
  title="技术文章" 
  description="所有关于技术的文章" 
  path="/categories/tech" 
  ogImage="" 
  breadcrumbs={[
    { label: '分类', href: '/categories' },
    { label: '技术', href: '/categories/tech' }
  ]}
>
  <!-- 页面内容 -->
</Layout>
```

面包屑导航会自动添加首页链接，不需要手动添加。在小屏幕上，首页文字会自动隐藏，只显示图标，以节省空间。

## 致谢

特别感谢原作者 [otoyo](https://github.com/otoyo) 提供的优秀项目框架和思路。原项目为我们提供了一个将 Notion 作为 CMS 的绝佳解决方案，使我们能够专注于内容创作而不必担心后端管理。

本增强版在原有基础上进行了界面和用户体验的优化，希望能为更多中文用户提供更好的博客体验。

## 使用方法

请参考原项目的 [使用文档](https://github.com/otoyo/astro-notion-blog#readme)，设置过程与原项目相同。

## 许可证

与原项目保持一致，本项目采用 [MIT 许可证](LICENSE)。

---

# Astro Notion Blog Enhanced Version

[中文](#astro-notion-blog-增强版) | [English](#astro-notion-blog-enhanced-version) | [日本語](#astro-notion-blog-強化版)

This project is an enhanced and optimized version based on the original [Astro Notion Blog](https://github.com/otoyo/astro-notion-blog). While preserving the original functionality, we have made several improvements to the interface and user experience.

## Major Features & Enhancements

### 1. Unified Border Radius Design
- Standardized 4px border radius for all components (tables, quotes, callouts, code blocks, images, and bookmarks)
- Added subtle shadow effects to enhance visual hierarchy
- Optimized hover states for better interaction experience

### 2. Blog Card Optimization
- Removed "Read More" button, making entire cards clickable
- Optimized tag layout and styling
- Improved responsive design for better mobile experience
- Enhanced image display logic supporting both FeaturedImage and Cover fields (prioritizing FeaturedImage)

### 3. Article Navigation Improvements
- Optimized navigation layout: previous article on left, next on right
- Added elegant hover effects (slight elevation and shadow enhancement)
- Optimized text alignment (previous left-aligned, next right-aligned)
- Ensured proper display across all devices

### 4. Article Detail Page Optimization
- Adjusted time display position to below title, consistent with homepage
- Unified tag styles and interaction effects
- Optimized mobile menu button to remain fixed during scrolling

### 5. Notion Block Style Optimization
- Added border radius to Callout blocks for visual appeal
- Enhanced Quote blocks with right-side border radius and subtle background
- Improved Code blocks with enhanced copy button hover effects and custom scrollbars
- Added border radius and shadow effects to Image blocks, enhancing overall quality

### 6. Type Safety Enhancements
- Added type checking for all components to ensure Notion blocks exist
- Added type guard functions to improve code robustness
- Fixed multiple type errors to comply with TypeScript best practices

### 7. Localization Optimization
- Chinese interface text for improved Chinese user experience
- Optimized font configuration for perfect Chinese display

### 8. Breadcrumb Navigation
- Added breadcrumb navigation next to search button for clear position indication
- Provided simple API allowing each page to define its own breadcrumb path
- Automatically hides homepage text on small screens, showing only icons to save space
- Design style consistent with overall UI, including hover effects and border radius

### 9. Automatic Slug Generation
- Automatically generates slugs from titles, eliminating manual setup
- Supports automatic translation of Chinese titles to English for appropriate slugs
- Implements multiple translation services with automatic fallback when one fails
- Local Pinyin conversion as final fallback, ensuring meaningful slugs even offline
- Optimized slug length for concise, readable URLs
- Allows removal of Slug field in Notion database as system handles it automatically

## Extension & Customization Guide

### How to Modify or Extend Translation Services

Edit the `src/lib/slug-helpers.ts` file:

1. **Create a new translation service class**:
```typescript
class YourTranslationService implements TranslationService {
  async translate(text: string, targetLang: string): Promise<string> {
    // Implement your translation logic
    return translatedText;
  }
}
```

2. **Add the new service to TranslationServiceFactory**:
```typescript
static getService(type: 'google' | 'pinyin' | 'your-service' = 'google'): TranslationService {
  switch (type) {
    case 'your-service':
      return new YourTranslationService();
    // ... other services
  }
}
```

3. **Update service priority in translateWithFallback function**:
```typescript
const serviceTypes: Array<'google' | 'pinyin' | 'your-service'> = ['google', 'your-service', 'pinyin'];
```

### About the Pinyin Conversion Service

The current Pinyin conversion service only includes a limited number of common Chinese characters. The Table of General Standard Chinese Characters includes 8,105 characters, with 3,500 commonly used characters (Level 1).

**Recommended: Use a professional Pinyin library**:

1. Install a professional Pinyin library:
```bash
npm install pinyin
```

2. Modify the `PinyinTranslationService` class:
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

This provides complete support for all Chinese characters, not just a limited set of examples.

## Breadcrumb Navigation Usage Guide

In any page component, add breadcrumb navigation by passing the breadcrumbs attribute to the Layout component:

```astro
<Layout 
  title="Article Categories" 
  description="View all article categories" 
  path="/categories" 
  ogImage="" 
  breadcrumbs={[
    { label: 'Categories', href: '/categories' }
  ]}
>
  <!-- Page content -->
</Layout>
```

For deeper pages, add multiple breadcrumb items:

```astro
<Layout 
  title="Technical Articles" 
  description="All articles about technology" 
  path="/categories/tech" 
  ogImage="" 
  breadcrumbs={[
    { label: 'Categories', href: '/categories' },
    { label: 'Technology', href: '/categories/tech' }
  ]}
>
  <!-- Page content -->
</Layout>
```

Breadcrumb navigation automatically adds the homepage link. On small screens, homepage text is hidden, showing only icons to save space.

## Acknowledgements

Special thanks to [otoyo](https://github.com/otoyo) for providing the excellent original project framework. The original project offers a great solution for using Notion as a CMS, allowing us to focus on content creation without backend management concerns.

This enhanced version builds upon the original foundation with interface and user experience optimizations, aiming to provide a better blogging experience for more users.

## Usage

Please refer to the original project's [documentation](https://github.com/otoyo/astro-notion-blog#readme) for setup instructions, as the process remains the same.

## License

Consistent with the original project, this project is licensed under the [MIT License](LICENSE).

---

# Astro Notion Blog 強化版

[中文](#astro-notion-blog-增强版) | [English](#astro-notion-blog-enhanced-version) | [日本語](#astro-notion-blog-強化版)

このプロジェクトは、オリジナルの [Astro Notion Blog](https://github.com/otoyo/astro-notion-blog) をベースに強化・最適化したバージョンです。元の機能を保持しながら、インターフェースとユーザーエクスペリエンスに多くの改善を加えました。

## 主な機能と改善点

### 1. 統一された角丸デザイン
- すべてのコンポーネントの角丸を4pxに統一（テーブル、引用、Callout、コードブロック、画像、ブックマーク）
- 視覚的な階層を強化する微妙な影効果を追加
- ホバー状態を最適化し、インタラクション体験を向上

### 2. ブログカードの最適化
- "もっと読む"ボタンを削除し、カード全体をクリック可能に
- タグのレイアウトとスタイルを最適化
- レスポンシブデザインを改善し、モバイル体験を向上
- 画像表示ロジックを強化し、FeaturedImageとCoverの両フィールドをサポート（FeaturedImageを優先）

### 3. 記事ナビゲーションの改善
- ナビゲーションレイアウトを最適化：前の記事は左側、次の記事は右側に配置
- エレガントなホバー効果を追加（わずかな浮上と影の強化）
- テキスト配置を最適化（前の記事は左揃え、次の記事は右揃え）
- すべてのデバイスで適切に表示されることを確認

### 4. 記事詳細ページの最適化
- 時間表示位置をタイトルの下に調整し、ホームページと一貫性を持たせる
- タグのスタイルとインタラクション効果を統一
- スクロール中も固定されるようにモバイルメニューボタンを最適化

### 5. Notionブロックスタイルの最適化
- Calloutブロックに角丸を追加し、視覚的な魅力を向上
- Quote（引用）ブロックに右側の角丸と微妙な背景を追加
- Codeブロックを改善し、コピーボタンのホバー効果とカスタムスクロールバーを強化
- 画像ブロックに角丸と影効果を追加し、全体的な品質を向上

### 6. 型安全性の強化
- すべてのコンポーネントに型チェックを追加し、Notionブロックの存在を確認
- コードの堅牢性を向上させる型ガード関数を追加
- TypeScriptのベストプラクティスに準拠するために複数の型エラーを修正

### 7. ローカライゼーションの最適化
- 中国語ユーザー向けに中国語インターフェーステキストを採用
- 完璧な中国語表示のためのフォント設定を最適化

### 8. パンくずナビゲーション
- 検索ボタンの隣にパンくずナビゲーションを追加し、位置を明確に示す
- 各ページが独自のパンくずパスを定義できるシンプルなAPIを提供
- 小さな画面ではホームページテキストを自動的に非表示にし、スペースを節約するためにアイコンのみを表示
- ホバー効果や角丸を含む全体的なUIと一貫したデザインスタイル

### 9. 自動スラグ生成
- タイトルから自動的にスラグを生成し、手動設定を不要に
- 中国語タイトルを英語に自動翻訳し、適切なスラグを生成
- 複数の翻訳サービスを実装し、一つが失敗すると自動的にフォールバック
- 最終的なフォールバックとしてのローカルピンイン変換により、オフラインでも意味のあるスラグを確保
- 簡潔で読みやすいURLのためのスラグ長の最適化
- システムが自動的に処理するため、NotionデータベースのSlugフィールドの削除が可能

## 拡張とカスタマイズガイド

### 翻訳サービスの修正または拡張方法

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

2. **TranslationServiceFactoryに新しいサービスを追加**：
```typescript
static getService(type: 'google' | 'pinyin' | 'your-service' = 'google'): TranslationService {
  switch (type) {
    case 'your-service':
      return new YourTranslationService();
    // ... 他のサービス
  }
}
```

3. **translateWithFallback関数でサービスの優先順位を更新**：
```typescript
const serviceTypes: Array<'google' | 'pinyin' | 'your-service'> = ['google', 'your-service', 'pinyin'];
```

### ピンイン変換サービスについて

現在のピンイン変換サービスには限られた数の一般的な中国語文字のみが含まれています。中国の一般標準漢字表には8,105文字があり、そのうち一般的に使用される文字（レベル1）は3,500文字です。

**推奨：プロフェッショナルなピンインライブラリを使用**：

1. プロフェッショナルなピンインライブラリをインストール：
```bash
npm install pinyin
```

2. `PinyinTranslationService` クラスを修正：
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

これにより、限られた例だけでなく、すべての中国語文字の完全なサポートが提供されます。

## パンくずナビゲーション使用ガイド

任意のページコンポーネントで、Layoutコンポーネントにbreadcrumbs属性を渡してパンくずナビゲーションを追加します：

```astro
<Layout 
  title="記事カテゴリ" 
  description="すべての記事カテゴリを表示" 
  path="/categories" 
  ogImage="" 
  breadcrumbs={[
    { label: 'カテゴリ', href: '/categories' }
  ]}
>
  <!-- ページコンテンツ -->
</Layout>
```

より深いページでは、複数のパンくず項目を追加します：

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

パンくずナビゲーションは自動的にホームページリンクを追加します。小さな画面では、スペースを節約するためにホームページテキストは非表示になり、アイコンのみが表示されます。

## 謝辞

優れたオリジナルプロジェクトのフレームワークを提供してくださった[otoyo](https://github.com/otoyo)氏に特別な感謝を捧げます。オリジナルプロジェクトはNotionをCMSとして使用するための素晴らしいソリューションを提供し、バックエンド管理の心配なしにコンテンツ作成に集中できるようにしています。

この強化版はオリジナルの基盤の上に、インターフェースとユーザーエクスペリエンスの最適化を構築し、より多くのユーザーにより良いブログ体験を提供することを目指しています。

## 使用方法

セットアップ手順は同じですので、オリジナルプロジェクトの[ドキュメント](https://github.com/otoyo/astro-notion-blog#readme)を参照してください。

## ライセンス

オリジナルプロジェクトと一貫して、このプロジェクトは[MITライセンス](LICENSE)の下でライセンスされています。

{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
} 