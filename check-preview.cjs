const fs = require('fs');

// 读取从预览服务器获取的HTML
const previewContent = fs.readFileSync('preview-page.html', 'utf8');
const previewArticles = (previewContent.match(/<article class="blog-post"/g) || []).length;
const previewRedirect = previewContent.includes('redirectInfo') && previewContent.includes('shouldRedirect');

// 检查是否有文章列表但没有显示
const hasMainContent = previewContent.includes('<div id="tag-posts-container"') && 
                      previewContent.includes('<div class="masonry-grid">');

// 检查是否有重定向逻辑
const redirectScript = previewContent.match(/redirectInfo = ([^;]+);/);
const redirectInfo = redirectScript ? redirectScript[1] : '{}';

console.log('预览服务器第二页分析:');
console.log('显示的文章数:', previewArticles);
console.log('包含重定向逻辑:', previewRedirect);
console.log('有文章容器但无内容:', hasMainContent && previewArticles === 0);
console.log('重定向信息:', redirectInfo); 