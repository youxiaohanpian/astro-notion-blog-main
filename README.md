# Astro Notion Blog Enhanced

[中文](#astro-notion-blog-增强版) | [English](README.en.md) | [日本語](README.ja.md)

## 项目简介

Astro Notion Blog Enhanced 是一个基于原始 [Astro Notion Blog](https://github.com/otoyo/astro-notion-blog) 的增强优化版本。在保留原始功能的同时，我们对界面和用户体验进行了多项改进，使其更加美观、易用和高效。

## 快速开始

详细的构建和部署说明请参考 [BUILD.md](BUILD.md)。

## 更新日志
### 2025-01-25
- **统一样式管理**：创建统一的标签云样式文件 `src/styles/tag-cloud.css`，支持暗色主题切换
- **修复卡片摘要显示不一致**：统一所有列表页（/blog、/posts/tag/*、/posts/page/*）的卡片摘要行数为6行
- **优化标签云样式**：
  - 移除重复的样式代码，提高可维护性
  - 统一所有列表页的标签云样式和类名
  - 完善暗色主题支持，使用CSS变量确保主题切换一致
- **文本对比度优化**：调整概要文字颜色对比度，使其比标题看起来更弱，提升视觉层次
- **涉及页面**：
  - `/blog` - 所有日志列表页
  - `/posts/tag/[tag]/page/[page]` - 标签分页页
  - `/posts/page/[page]` - 日志分页页

### 2025-11-09
大的代码更新，用以下命令确保无缓存，方便build测试，缺点是需要等很久
```
if (Test-Path .\dist\) { 
    Remove-Item -Recurse -Force .\dist\ 
    Write-Host "已删除 dist 目录"
} else {
    Write-Host "dist 目录不存在，无需删除"
}
```

### 2025-08-04
- 因项目切换，更新了 Node.js 版本要求
- 启动命令更新：可能需要运行 `npm run dev -- --host` 才能启动项目

### 2025-07-19
1. 将网站改回静态部署，回滚中间件，无需中间件
2. 修复部分 CSS 兼容问题
3. 修正文章中插入目录的问题
4. 移除 like.ts，目前无需此功能，点赞功能为模拟
5. 分享功能改为复制链接+标题的形式
6. 修复 searchModal 中中文搜索匹配问题，绑定在 input 上【重要】
7. 网站语言改为：lang="zh-CN"
8. 增加 GitHub 建议的 SECURITY.md
9. 更新 version.json 的 CSP 内容，包含自身、Notion 资源、Google Analytics 域名、Vercel Insights 域名

## 环境要求

### Node.js 版本
- 推荐使用 Node.js 20.11.1 LTS 版本
- 最低要求：Node.js >= 18.0.0
- npm 版本：10.2.4 或更高版本

### 主要依赖版本
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
    "dotenv-cli": "^8.0.0"  // 用于构建时加载环境变量
  }
}
```

### 环境变量配置
1. 创建 `.env.local` 文件（不要提交到 Git）：

```
# Notion API 密钥
NOTION_API_SECRET=your_notion_api_secret

# Notion 数据库 ID
DATABASE_ID=your_database_id

# 首页导航数据库（可选）
HOME_NAV_DATABASE_ID=your_home_nav_database_id

# 友情链接数据库（可选）
FRIEND_LINK_DATABASE_ID=your_friend_link_database_id

# Giscus 评论（可选）
ENABLE_GISCUS=true
GISCUS_REPO=your_github_user/your_repo
GISCUS_REPO_ID=your_repo_id
GISCUS_CATEGORY=Announcements
GISCUS_CATEGORY_ID=your_category_id
GISCUS_MAPPING=pathname
GISCUS_STRICT=0
GISCUS_REACTIONS_ENABLED=1
GISCUS_EMIT_METADATA=0
GISCUS_INPUT_POSITION=top
GISCUS_THEME=preferred_color_scheme
GISCUS_LANG=zh-CN

# 博客基础路径（如果部署在子目录下）
BASE_PATH=/

# 自定义域名（可选）
CUSTOM_DOMAIN=your_custom_domain.com

# 每页文章数量
NUMBER_OF_POSTS_PER_PAGE=10

# 请求超时时间（毫秒）
REQUEST_TIMEOUT_MS=30000
```

2. 环境变量加载说明：
   - 开发环境（`npm run dev`）：自动加载 `.env.local`
   - 构建环境（`npm run build`）：使用 dotenv-cli 加载 `.env.local`
   - 注意：不要使用 `.env` 文件，因为可能会被意外提交到 Git

### 安装步骤
1. 确保使用正确的 Node.js 版本：
   ```bash
   nvm use 18.20.8
   ```

2. 安装依赖：
   ```bash
   npm install
   npm install --save-dev dotenv-cli  # 用于构建时加载环境变量
   ```

3. 配置环境变量：
   - 复制上面的环境变量模板到 `.env.local` 文件
   - 填写你的 Notion API 密钥和数据库 ID

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

5. 构建生产版本：
   ```bash
   npm run build
   ```

6. 预览构建结果：
   ```bash
   npm run preview
   ```
   - 这将启动一个本地服务器来预览构建后的网站
   - 默认地址为 http://localhost:4321
   - 预览模式会模拟生产环境，可以检查构建后的效果

## Notion 数据库配置

### 必需字段
1. **Page**：标题字段，用于文章标题
2. **Tags**：多选字段，用于文章分类
3. **Date**：日期字段，用于文章发布日期
4. **Excerpt**：文本字段，用于文章摘要
5. **FeaturedImage**：文件字段，用于文章特色图片
6. **Published**：复选框字段，用于控制文章是否发布
7. **Rank**：数字字段，用于控制文章置顶顺序
8. **Slug**：文本字段，用于文章 URL 路径（建议手动填写英文）

### 配置步骤
1. 在 Notion 中创建一个新数据库
2. 添加上述所有必需字段
3. 获取数据库 ID（从数据库 URL 中提取）
4. 将数据库 ID 添加到 `.env.local` 文件中
5. 共享数据库给你的 Notion 集成应用

### 可选：首页导航数据库字段
用于首页「首页导航」模块（配置 `HOME_NAV_DATABASE_ID` 后生效）：
1. **Title**（title）或 **Name**（title）
2. **Url**（url）或 **URL**（rich_text/url）
3. **Slug**（rich_text，可选；当 Url 为空时用于站内跳转）
4. **Description**（rich_text，可选）
5. **OpenInNewTab**（checkbox，可选；勾选后新标签打开）
6. **Sort**（number，可选）
7. **Published**（checkbox，可选，默认展示）

### 可选：友情链接数据库字段
用于首页「友情链接」模块（配置 `FRIEND_LINK_DATABASE_ID` 后生效）：
1. **Name**（title）或 **Title**（title）
2. **Url**（url）或 **URL**（rich_text/url）
3. **Description**（rich_text，可选）
4. **Avatar**（files/url，可选）
5. **Category**（select，可选）
6. **Sort**（number，可选）
7. **Published**（checkbox，可选，默认展示）

## 开发与构建环境说明

### 开发环境（`npm run dev`）
- 支持热重载
- 自动加载 `.env.local` 环境变量
- 适合开发和调试

### 构建环境（`npm run build`）
- 生成静态文件
- 使用 dotenv-cli 加载 `.env.local` 环境变量
- 优化和压缩资源

### 预览环境（`npm run preview`）
- 模拟生产环境
- 用于测试构建结果
- 检查性能和兼容性

## 部署指南

### Vercel 部署
1. 注册或登录 Vercel 账号
2. 点击 "New Project" 按钮
3. 导入你的 GitHub 仓库
4. 配置环境变量（与 `.env.local` 相同）
5. 点击 "Deploy" 按钮
6. 等待部署完成

### Netlify 部署
1. 注册或登录 Netlify 账号
2. 点击 "New site from Git" 按钮
3. 选择你的 GitHub 仓库
4. 配置构建命令：`npm run build`
5. 配置发布目录：`dist`
6. 配置环境变量（与 `.env.local` 相同）
7. 点击 "Deploy site" 按钮
8. 等待部署完成

## 常见问题

### 1. 构建时环境变量问题
- 错误：`API token is invalid`
- 原因：构建时没有正确加载 `.env.local` 文件
- 解决：确保已安装 `dotenv-cli` 并正确配置构建脚本

### 2. Node.js 版本兼容性
- 错误：`SyntaxError: missing ) after argument list`
- 原因：Node.js 22.x 版本与某些依赖不兼容
- 解决：使用 Node.js 18.x LTS 版本

### 3. PowerShell 环境问题
- 错误：`无法将"node.exe"项识别为 cmdlet`
- 原因：PowerShell 中的 Node.js 路径问题
- 解决：使用 CMD 而不是 PowerShell 执行命令

### 4. Notion API 访问问题
- 错误：`Unauthorized` 或 `Invalid database ID`
- 原因：Notion API 密钥无效或数据库未共享给集成应用
- 解决：检查 API 密钥是否正确，并确保数据库已共享给集成应用

### 5. 图片不显示问题
- 错误：图片无法加载
- 原因：可能是图片链接无效或权限问题
- 解决：确保 Notion 中的图片是公开的，或使用本地图片

## 主要特性与改进

### 统一设计系统
- **统一圆角设计**：所有组件圆角统一为4px（表格、引用、Callout、代码块、图片和书签）
- **字体系统优化**：
  - 英文使用 Inter 字体，提供最佳的现代阅读体验
  - 中文使用 PingFang SC（macOS/iOS）、Microsoft YaHei（Windows）等系统字体
  - 统一所有组件的字体定义，移除重复的硬编码字体
  - 智能字体回退机制，确保跨平台一致性
- **主题系统优化**：完善的暗色主题支持，所有组件统一使用CSS变量
- **文本层次优化**：调整文本颜色对比度，标题、概要、元信息有明确的视觉层次
- **标签云统一**：创建独立的标签云样式文件，确保所有列表页样式一致性
- **响应式设计**：移动端和桌面端都有良好的显示效果

### 博客卡片优化
- **统一摘要显示**：所有列表页的卡片摘要统一显示6行内容
- **交互优化**：移除"阅读更多"按钮，整个卡片可点击
- **标签布局**：优化标签样式与布局，支持暗色主题
- **响应式设计**：改进移动端体验，确保在各种设备上都有良好显示
- **图片显示逻辑**：支持三种图片源，优先级明确：
  1. FeaturedImage（第一优先级）：Notion 字段中的图片，经过优化处理
  2. Cover（第二优先级）：在线图库图片，适合需要高质量封面的文章
  3. FirstImage（第三优先级）：文章内第一张图片，适合临时使用
- 图片加载优化：
  - 使用懒加载提升性能
  - 异步解码减少阻塞
  - 固定宽高比避免布局偏移
  - 支持开发环境和生产环境的不同处理方式
- 图片显示规则：
  - 如果三种图片源都没有上传，则只显示文章标题和内容
  - 可以删除 Cover 字段，系统会自动降级使用 FirstImage
  - 建议至少上传一张图片，以提升文章展示效果

### 文章导航改进
- 优化导航布局：上一篇在左侧，下一篇在右侧
- 添加精美悬停效果（微弱上浮与阴影增强）
- 优化文本对齐（上一篇左对齐，下一篇右对齐）
- 确保在所有设备上均有良好显示效果

### 文章详情页优化
- 调整时间显示位置至标题下方，与首页保持一致
- 统一标签样式与交互效果
- 优化移动端菜单按钮，滚动时保持固定位置

### Notion 块样式优化
- Callout块添加圆角效果，提升视觉美感
- Quote块增加右侧圆角与轻微背景色
- Code块增强复制按钮悬停效果与自定义滚动条
- Image块添加圆角与阴影效果，提升整体质感

### 类型安全增强
- 为所有组件添加类型检查，确保Notion块存在
- 添加类型保护函数，提高代码健壮性
- 修复多处类型错误，符合TypeScript最佳实践

### 本地化优化
- 界面文本中文化，提升中文用户体验
- 优化字体配置，完美支持中文显示

### 面包屑导航
- 在搜索按钮旁添加面包屑导航，清晰指示当前位置
- 提供简单API允许每个页面定义自己的面包屑路径
- 小屏幕上自动隐藏首页文本，仅显示图标，节省空间
- 设计风格与整体UI一致，包括悬停效果和圆角设计

### Slug 必填选项
- 尝试自动构建Slug，但中文的支持不是很好
- 需要手动在 notion 里填写英文
- 如果Slug为空，系统会使用Notion页面ID作为后备，确保链接有效

### 日志置顶排序规则
- 支持 Notion 数据库的 Rank 字段实现日志置顶排序
- Rank 填写大于 0 的数字，数字越大越靠前（更置顶）
- 没填 Rank 或 Rank=0 的文章，排在所有有 Rank 的文章后面，按发布时间倒序排列
- 例如：Rank=3 > Rank=2 > Rank=1 > 没填/Rank=0
- 只填一篇 Rank=1，其它都不填，则该篇置顶；有 Rank=2、Rank=1，则 2 置顶、1 次之，其它按时间倒序

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
  description="查看所有日志分类" 
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

## 项目结构

```
astro-notion-blog/
├── .cursor/               # Cursor IDE 配置
├── .github/               # GitHub 配置
├── .vscode/               # VS Code 配置
├── cline_docs/            # 项目文档
├── public/                # 静态资源
├── scripts/               # 脚本文件
├── src/                   # 源代码
│   ├── components/        # 组件
│   ├── content/           # 内容
│   ├── images/            # 图片资源
│   ├── integrations/      # Astro 集成
│   ├── layouts/           # 布局
│   ├── lib/               # 工具函数
│   ├── pages/             # 页面
│   └── styles/            # 样式
│       ├── blog.module.css    # 博客布局样式
│       ├── globals.css        # 全局样式和变量
│       ├── notion-color.css   # Notion 颜色样式
│       ├── tag-cloud.css      # 统一的标签云样式
│       └── syntax-coloring.css # 代码高亮样式
├── astro.config.mjs       # Astro 配置
├── package.json           # 依赖配置
├── README.md              # 项目说明
└── ...                    # 其他配置文件
```

## 开发规范

### 🧪 **QA 测试清单（推送前必须执行）**

**每次推送代码前，必须完成以下QA测试：**

#### 🏗️ **构建测试**
```bash
# 1. 清理缓存
npm run clean || rm -rf dist node_modules/.cache

# 2. 安装依赖
npm install

# 3. 构建测试
npm run build

# 4. 预览测试
npm run preview
```

#### 🌐 **功能测试**
- [ ] 首页 (`/`) 正常加载，所有链接可访问
- [ ] 博客列表页 (`/blog`) 卡片显示正常，标签云功能完整
- [ ] 标签页 (`/posts/tag/[tag]`) 分页功能正常，标签过滤有效
- [ ] 文章详情页 (`/posts/[slug]`) 内容完整，图片加载正常
- [ ] 搜索功能 (`Ctrl+K`) 搜索结果准确，响应及时
- [ ] 移动端适配：各种设备尺寸下布局正常
- [ ] 暗色/浅色主题切换正常，无样式错乱

#### 🎨 **样式一致性检查**
- [ ] 字体系统：中英文字体显示一致，无硬编码字体
- [ ] 颜色系统：所有页面使用统一的CSS变量
- [ ] 间距系统：圆角、阴影、边距保持一致
- [ ] 响应式设计：断点正确，无水平滚动条

#### ⚡ **性能检查**
- [ ] 页面加载速度：首页 < 3秒，文章页 < 2秒
- [ ] 图片优化：懒加载工作正常，无布局偏移
- [ ] Lighthouse 评分：Performance > 80, SEO > 90
- [ ] 无内存泄漏：长时间使用无卡顿

#### 🔍 **代码质量**
- [ ] TypeScript：无类型错误，所有接口定义完整
- [ ] ESLint：无警告，代码风格一致
- [ ] 可访问性：所有图片有 alt 属性，按钮有 aria 标签
- [ ] SEO：meta 标签完整，结构化数据正确

#### 🧪 **边界情况测试**
- [ ] 无数据状态：空标签页、无搜索结果页面
- [ ] 错误处理：404页面友好提示，网络错误处理
- [ ] 特殊字符：文章标题和内容中的特殊字符显示正常
- [ ] 长内容：超长标题、超长列表的显示处理

#### 📱 **多浏览器测试**
- [ ] Chrome 最新版本：功能完全正常
- [ ] Safari 最新版本：功能完全正常
- [ ] Firefox 最新版本：功能完全正常
- [ ] Edge 最新版本：功能完全正常

### 🔒 **AI 助手不会遗漏的情况**

**我承诺在以下情况下不会遗漏 QA 检查：**

#### ✅ **推送前触发条件**
1. **任何代码修改后**：无论是样式、逻辑还是配置文件
2. **新功能开发后**：每次完成新功能实现
3. **Bug 修复后**：每次修复问题都要验证修复效果
4. **重构代码后**：任何代码结构调整
5. **依赖更新后**：npm 包版本变更
6. **环境变量修改后**：配置文件变更

#### ✅ **必须检查的文件类型**
- 🎨 **样式文件**：`.css`, `.astro` 中的 `<style>`
- 🧩 **组件文件**：`.astro`, `.ts`, `.tsx`
- 📄 **页面文件**：`src/pages/` 下所有文件
- ⚙️ **配置文件**：`astro.config.mjs`, `package.json`
- 🌐 **环境配置**：`.env.*`, 环境变量相关代码

#### ✅ **强制检查清单**
```markdown
- [ ] 构建成功：npm run build 无错误
- [ ] 类型检查：TypeScript 无错误
- [ ] 核心页面：首页、列表页、详情页正常
- [ ] 移动端：响应式布局正确
- [ ] 主题切换：暗色/浅色模式正常
- [ ] 搜索功能：输入、结果、跳转正常
```

#### ✅ **特殊情况处理**
- **网络问题**：如果无法推送，会明确说明原因
- **依赖冲突**：会先解决冲突再推送
- **权限问题**：会检查仓库权限并说明
- **分支问题**：会确认当前分支正确

### 📋 **QA 报告模板**

**每次推送前我会提供：**
```markdown
## 🧪 QA 测试报告

✅ **构建测试**：npm run build 成功
✅ **类型检查**：TypeScript 无错误
✅ **核心功能**：首页、列表页、文章页正常
✅ **响应式**：移动端适配正确
✅ **主题切换**：暗色模式正常
⚠️ **注意项**：[如有问题会明确说明]

🚀 **准备推送到**：[分支名]
📝 **提交信息**：[简短说明]
```

---

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. **🧪 完成 QA 测试**（参考上方清单）
4. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 开启一个 Pull Request

## 致谢

特别感谢原作者 [otoyo](https://github.com/otoyo) 提供的优秀项目框架和思路。原项目为我们提供了一个将 Notion 作为 CMS 的绝佳解决方案，使我们能够专注于内容创作而不必担心后端管理。

本增强版在原有基础上进行了界面和用户体验的优化，希望能为更多中文用户提供更好的博客体验。

## 许可证

与原项目保持一致，本项目采用 [MIT 许可证](LICENSE)。
