# 构建指南

根目录 .env / .env.local 的配置环境：
```
# CUSTOM_DOMAIN=www.ai233.top  #此条在本地时隐藏，但需要在vercel和github中配置原因是更适合seo的优化，否则会默认抓取vercel为首页地址
# BASE_PATH=/ #此条同上
NOTION_API_SECRET=ntn_XXXXXXXXXXXXXXXXXXXXXXXXXXX #替换成你的
DATABASE_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXX #替换成你的
ENABLE_LIGHTBOX=true #配置图片放大功能，如不需要则删除
```

## 环境要求
- Node.js 18.0.0 或更高版本
- npm 8.0.0 或更高版本
- 支持 Windows、macOS 和 Linux 系统

## 系统兼容性
- Windows 10/11
- macOS 10.15 或更高版本
- Linux (Ubuntu 20.04 或更高版本)

## 构建步骤

1. 克隆项目并安装依赖:

## Vercel 部署说明

### 自动部署
1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 配置环境变量（NOTION_API_SECRET 和 DATABASE_ID）
4. Vercel 会自动部署你的网站

### 内容更新机制
- 静态资源（图片等）：缓存1小时，后台更新24小时
- 博客文章：缓存1小时，后台更新24小时
- 首页：缓存1小时，后台更新24小时

### 配置网站图标
将 favicon.png 或 favicon.svg 放在 public/ 目录下，并在 layouts/Layout.astro 文件的 <head> 中通过 link 标签指定路径，如下所示
```
  <head>
    ...
+   <link rel="icon" href={getStaticFilePath('/favicon.svg')} />
    ...
  </head>
```

### 构建失败的处理
报错信息：`EISDIR: illegal operation on a directory, readlink 'D:\astro-notion-blog-main\dist\server\entry.mjs'`

解决方法：

```
Remove-Item -Recurse -Force .\dist\
```
解释：

-Recurse：递归删除里面的文件夹和内容
-Force：强制删除（即使是隐藏文件或只读文件）

删除后重新运行：`npm run build`

### 缓存说明

#### 1. **何时使用**
- **测试缓存效果**：部署后想立即验证缓存是否生效
- **紧急更新**：在 Notion 换了图片，但不想等10分钟缓存过期
- **调试问题**：怀疑缓存导致显示异常时

#### 2. **使用步骤**
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel 账号
vercel login

# 进入你的项目目录
cd your-blog-project

# 清除特定路径缓存
vercel cache clean api/blocks/*
```

#### 3. **注意事项**
- **需要权限**：必须是项目的所有者或有权限的团队成员
- **影响范围**：只清除 API 路由缓存，不影响其他页面
- **生产环境慎用**：清除缓存会导致下一次访问变慢

#### 4. **替代测试方案（更简单）**
直接在浏览器开发者工具中测试：
1. 打开 **Network 标签**
2. 访问一个图片页面
3. 查看请求头：
   ```http
   GET /api/blocks/xxx-xxx-xxx
   Cache-Control: max-age=600  ← 确认缓存头存在
   ```
4. 刷新页面，观察是否出现 `(from disk cache)` 提示

### 国内访问测试建议
由于 Vercel 在国内的访问问题，我推荐这样测试：

#### 测试工具
1. **17CE（国内多节点测试）**  
   [https://www.17ce.com/](https://www.17ce.com/)
   - 选择「网页测试」
   - 输入你的图片 URL（如 `https://你的域名/api/blocks/xxx`）
   - 查看全国各节点的响应时间和成功率

2. **站长之家Ping检测**  
   [https://ping.chinaz.com/](https://ping.chinaz.com/)

#### 测试指标
| 测试项 | 期望结果 | 说明 |
|--------|----------|------|
| **首次访问** | 1-3秒内完成 | 经Cloudflare代理 |
| **二次访问** | <0.5秒 | 从Cloudflare边缘节点加载 |
| **错误率** | <5% | 尤其关注北京/上海节点 |
| **HTTPS证书** | 完全正常 | 无警告 |

### 你的缓存方案价值（国内视角）
```
pie
    title 国内用户图片加载来源
    "Cloudflare缓存" ： 75
    "浏览器本地缓存" ： 20
    "直连Vercel" ： 5
```

> 部署后可以分享你的博客链接，我可以帮你从海外节点测试真实效果！目前你的方案是成本最低、效果最显著的优化，特别适合你的架构。

1. 静态资源（图片等）：
   - 缓存1小时（max-age=3600）
   - 后台更新24小时（stale-while-revalidate=86400）
   - 更新图片后1小时内可能看到旧图片
   - 1-24小时内会看到新图片
   - 24小时后强制更新

2. 博客文章：
   - 缓存1小时
   - 后台更新24小时
   - 修改文章后1小时内可能看到旧内容
   - 1-24小时内会看到新内容
   - 24小时后强制更新

3. 首页：
   - 缓存1小时
   - 后台更新24小时
   - 更新内容后1小时内可能看到旧内容
   - 1-24小时内会看到新内容
   - 24小时后强制更新

### 如何检查部署效果
1. 部署状态检查：
   - 访问 Vercel 仪表板
   - 查看 "Deployments" 标签页
   - 检查最新部署的状态是否为 "Ready"

2. 内容更新检查：
   - 在 Notion 中修改文章
   - 等待1-24小时（取决于缓存设置）
   - 访问网站查看更新是否生效

3. 性能检查：
   - 使用 Vercel Analytics 查看访问速度
   - 使用 Chrome DevTools 检查资源加载
   - 使用 Lighthouse 进行性能评分

### 手动触发更新
如果需要立即更新内容：
1. 访问 Vercel 仪表板
2. 找到你的项目
3. 点击 "Redeploy" 按钮
4. 等待部署完成
   
#### 保证了网站性能（1小时缓存）
1. 确保内容及时更新（24小时后台更新）
2. 避免用户看到过期的内容
如果你觉得1小时的缓存时间还是太长，可以改为更短的时间，比如：
- 30分钟：max-age=1800
- 15分钟：max-age=900
- 5分钟：max-age=300