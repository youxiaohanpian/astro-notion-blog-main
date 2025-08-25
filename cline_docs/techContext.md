# techContext.md

## 使用的技术
1. **核心框架**：Astro - 静态网站生成器，采用岛架构提升性能
2. **编程语言**：JavaScript/TypeScript
3. **API 集成**：Notion API - 用于获取和同步 Notion 内容
4. **样式处理**：CSS Modules、全局 CSS
5. **构建工具**：Nx - 可能用于构建优化
6. **代码规范**：ESLint、Prettier
7. **版本控制**：Git

## 开发环境
1. **运行时**：Node.js
2. **包管理器**：npm
3. **编辑器**：VS Code (从 .vscode 目录看出)
4. **CI/CD**：GitHub Actions (从 .github/workflows 目录看出)
5. **部署平台**：Vercel (从 vercel.json 文件看出)

## 技术限制
1. **Notion API 限制**：受到 Notion API 的请求速率限制
2. **静态网站限制**：无法直接处理服务器端动态逻辑
3. **构建性能**：大型博客可能面临构建时间较长的问题
4. **依赖管理**：需要维护多个依赖包的版本兼容性
5. **浏览器兼容性**：需要考虑不同浏览器对新特性的支持情况