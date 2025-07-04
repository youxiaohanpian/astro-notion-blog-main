# 构建指南

根目录 .env / .env.local 的配置环境：
```
# CUSTOM_DOMAIN=www.ai233.top  #此条在本地时隐藏，但需要在vercel和github中配置原因是更适合seo的优化，否则会默认抓取vercel为首页地址
# BASE_PATH=/ #此条同上
NOTION_API_SECRET=ntn_XXXXXXXXXXXXXXXXXXXXXXXXXXX #替换成你的
DATABASE_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXX #替换成你的
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

### 缓存说明
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