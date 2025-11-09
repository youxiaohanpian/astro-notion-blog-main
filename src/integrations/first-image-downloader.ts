import type { AstroIntegration } from 'astro'
import { getAllPosts, getAllBlocksByBlockId, downloadFile } from '../lib/notion/client'
import { extractFirstImage } from '../lib/blog-helpers'

export default (): AstroIntegration => ({
  name: 'first-image-downloader',
  hooks: {
    'astro:build:start': async () => {
      const posts = await getAllPosts()

      await Promise.all(
        posts.map(async (post) => {
          // 如果已经有 FeaturedImage 或 Cover，不需要处理 FirstImage
          if (post.FeaturedImage?.Url || post.Cover?.Url) {
            return Promise.resolve()
          }

          try {
            // 获取文章内容块
            const blocks = await getAllBlocksByBlockId(post.PageId)
            // 提取第一张图片
            const firstImageObject = extractFirstImage(blocks)
            
            if (firstImageObject?.Url && firstImageObject.Url.trim() !== '') {
              let url!: URL
              try {
                url = new URL(firstImageObject.Url)
                console.log(`下载文章[${post.Title}]的第一张图片:`, url.toString())
                return downloadFile(url)
              } catch (error) {
                console.error(`文章[${post.Title}]的第一张图片URL无效:`, firstImageObject.Url)
              }
            }
          } catch (error) {
            console.error(`获取文章[${post.Title}]内容块失败:`, error)
          }
          return Promise.resolve()
        })
      )
    },
  },
}) 