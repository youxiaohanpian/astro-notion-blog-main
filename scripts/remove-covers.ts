import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

// 加载环境变量
dotenv.config()

const notion = new Client({
  auth: process.env.NOTION_API_SECRET,
})

const DATABASE_ID = process.env.DATABASE_ID

async function removeCovers() {
  try {
    // 获取数据库中的所有页面
    const response = await notion.databases.query({
      database_id: DATABASE_ID!,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
        ],
      },
    })

    console.log(`找到 ${response.results.length} 篇文章`)

    // 遍历每篇文章
    for (const page of response.results) {
      if (!('properties' in page)) continue;
      
      try {
        // 移除 cover
        await notion.pages.update({
          page_id: page.id,
          cover: null,
        })
        const pageObj = page as PageObjectResponse
        const title = pageObj.properties['Page']?.title?.[0]?.plain_text || '无标题'
        console.log(`已移除文章 "${title}" 的封面`)
      } catch (error) {
        const pageObj = page as PageObjectResponse
        const title = pageObj.properties['Page']?.title?.[0]?.plain_text || '无标题'
        console.error(`移除文章 "${title}" 封面时出错:`, error)
      }
    }

    console.log('所有文章的封面已移除完成')
  } catch (error) {
    console.error('执行过程中出错:', error)
  }
}

// 执行脚本
removeCovers() 