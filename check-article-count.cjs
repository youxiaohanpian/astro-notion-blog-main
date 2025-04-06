const fs = require('fs');
const path = require('path');

// 检查第一页的技术标签文章
const firstPagePath = path.join(__dirname, '.vercel/output/static/posts/tag/技术/index.html');
const firstPageContent = fs.readFileSync(firstPagePath, 'utf8');
const firstPageArticles = (firstPageContent.match(/<article class="blog-post"/g) || []).length;

// 检查第二页的技术标签文章（如果存在）
const secondPagePath = path.join(__dirname, '.vercel/output/static/posts/tag/技术/page/2/index.html');
let secondPageArticles = 0;
if (fs.existsSync(secondPagePath)) {
  const secondPageContent = fs.readFileSync(secondPagePath, 'utf8');
  secondPageArticles = (secondPageContent.match(/<article class="blog-post"/g) || []).length;
}

// 检查有多少文章包含技术标签
let articlesWithTechTag = 0;
const postsDir = path.join(__dirname, '.vercel/output/static/posts');
const postDirs = fs.readdirSync(postsDir).filter(dir => 
  dir !== 'tag' && dir !== 'page' && 
  fs.statSync(path.join(postsDir, dir)).isDirectory()
);

for (const postDir of postDirs) {
  const indexPath = path.join(postsDir, postDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    if (content.includes('"/posts/tag/%E6%8A%80%E6%9C%AF"')) {
      articlesWithTechTag++;
    }
  }
}

// 输出结果
console.log('技术标签文章统计:');
console.log('第一页文章数:', firstPageArticles);
console.log('第二页文章数:', secondPageArticles);
console.log('总计显示文章数:', firstPageArticles + secondPageArticles);
console.log('包含技术标签的文章总数:', articlesWithTechTag); 