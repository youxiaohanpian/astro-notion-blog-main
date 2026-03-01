require('dotenv').config({ path: '.env.local' })

const { Client } = require('@notionhq/client')

const notionToken = process.env.NOTION_API_SECRET

if (!notionToken) {
  console.error('❌ 缺少 NOTION_API_SECRET，请先在 .env.local 中配置')
  process.exit(1)
}

const notion = new Client({ auth: notionToken })

function normalizeDatabaseId(input) {
  if (!input || typeof input !== 'string') {
    return ''
  }

  const trimmed = input.trim()
  const match = trimmed.match(/[0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/)

  if (!match) {
    return ''
  }

  const raw = match[0].replace(/-/g, '').toLowerCase()
  if (raw.length !== 32) {
    return ''
  }

  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`
}

function defineProperty(type, extra = {}) {
  return {
    [type]: extra,
  }
}

const BLOG_SCHEMA = {
  Page: defineProperty('title'),
  Tags: defineProperty('multi_select'),
  Date: defineProperty('date'),
  Excerpt: defineProperty('rich_text'),
  FeaturedImage: defineProperty('files'),
  FirstImage: defineProperty('files'),
  Published: defineProperty('checkbox'),
  Rank: defineProperty('number', { format: 'number' }),
  Slug: defineProperty('rich_text'),
  Likes: defineProperty('number', { format: 'number' }),
  Type: defineProperty('select', {
    options: [
      { name: 'Post', color: 'blue' },
      { name: '/导航', color: 'purple' },
      { name: '/友链', color: 'green' },
      { name: '/备注', color: 'gray' },
    ],
  }),
}

const HOME_NAV_SCHEMA = {
  Title: defineProperty('title'),
  Url: defineProperty('url'),
  Slug: defineProperty('rich_text'),
  Description: defineProperty('rich_text'),
  OpenInNewTab: defineProperty('checkbox'),
  Sort: defineProperty('number', { format: 'number' }),
  Published: defineProperty('checkbox'),
  Note: defineProperty('rich_text'),
}

const FRIEND_LINK_SCHEMA = {
  Name: defineProperty('title'),
  Url: defineProperty('url'),
  Description: defineProperty('rich_text'),
  Avatar: defineProperty('files'),
  Category: defineProperty('select', {
    options: [
      { name: 'Design', color: 'pink' },
      { name: 'Tech', color: 'blue' },
      { name: 'AI', color: 'purple' },
      { name: 'Life', color: 'green' },
      { name: 'Other', color: 'gray' },
    ],
  }),
  Sort: defineProperty('number', { format: 'number' }),
  Published: defineProperty('checkbox'),
  Note: defineProperty('rich_text'),
}

function getErrorMessage(error) {
  if (!error) return 'Unknown error'
  if (typeof error.message === 'string' && error.message) return error.message
  if (error.body && typeof error.body.message === 'string') return error.body.message
  return String(error)
}

async function findChildDatabaseInPage(pageId, databaseName) {
  let startCursor = undefined
  const childDatabases = []

  while (true) {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
      start_cursor: startCursor,
    })

    for (const block of res.results) {
      if (block.type === 'child_database') {
        childDatabases.push({
          id: block.id,
          title: block.child_database?.title || '(untitled)',
        })
      }
    }

    if (!res.has_more || !res.next_cursor) {
      break
    }

    startCursor = res.next_cursor
  }

  if (childDatabases.length === 0) {
    console.log(`⚠️  ${databaseName}：这是一个页面，且该页面下未找到 child_database`) 
    return ''
  }

  if (childDatabases.length > 1) {
    console.log(`ℹ️  ${databaseName}：页面下找到多个数据库，默认使用第一个：${childDatabases[0].title}`)
  }

  return childDatabases[0].id
}

async function resolveDatabaseId(inputId, databaseName) {
  if (!inputId) {
    return ''
  }

  try {
    await notion.databases.retrieve({ database_id: inputId })
    return inputId
  } catch (error) {
    const message = getErrorMessage(error)

    if (message.includes('is a page, not a database')) {
      console.log(`⚠️  ${databaseName}：你提供的是页面 ID，正在尝试自动定位页面内数据库...`)

      try {
        const childDbId = await findChildDatabaseInPage(inputId, databaseName)
        if (!childDbId) {
          return ''
        }

        await notion.databases.retrieve({ database_id: childDbId })
        console.log(`✅ ${databaseName}：已自动定位数据库 ID -> ${childDbId}`)
        return childDbId
      } catch (nestedError) {
        console.log(`⚠️  ${databaseName}：自动定位失败，请直接填数据库 URL/ID`)
        console.log(`   详情：${getErrorMessage(nestedError)}`)
        return ''
      }
    }

    console.log(`⚠️  ${databaseName}：无法访问该 ID，已跳过。详情：${message}`)
    return ''
  }
}

async function setupDatabaseSchema(databaseId, databaseName, schema) {
  if (!databaseId) {
    console.log(`⚪️ 跳过 ${databaseName}：未配置数据库 ID`)
    return
  }

  console.log(`\n🔧 处理 ${databaseName}...`)

  const db = await notion.databases.retrieve({ database_id: databaseId })
  const existingProperties = db.properties || {}

  const titlePropertyEntry = Object.entries(existingProperties).find(
    ([, prop]) => prop.type === 'title'
  )
  const titlePropertyName = titlePropertyEntry ? titlePropertyEntry[0] : ''

  if (databaseName === '博客主数据库' && titlePropertyName && titlePropertyName !== 'Page') {
    console.log(
      `⚠️  检测到博客标题列是「${titlePropertyName}」，当前代码默认读取「Page」。建议改名为 Page 或让我帮你改代码兼容。`
    )
  }

  const hasTitleProperty = Object.values(existingProperties).some(
    (prop) => prop.type === 'title'
  )

  const newProperties = {}
  const skipped = []

  for (const [name, config] of Object.entries(schema)) {
    if (existingProperties[name]) {
      continue
    }

    const typeName = Object.keys(config)[0]
    if (typeName === 'title' && hasTitleProperty) {
      skipped.push(name)
      continue
    }

    newProperties[name] = config
  }

  if (Object.keys(newProperties).length === 0) {
    console.log(`✅ ${databaseName}：字段已齐全，无需变更`)
    if (skipped.length > 0) {
      console.log(`ℹ️  已跳过 title 字段（数据库已有标题列）：${skipped.join(', ')}`)
    }
    return
  }

  await notion.databases.update({
    database_id: databaseId,
    properties: newProperties,
  })

  console.log(`✅ ${databaseName}：已新增字段 -> ${Object.keys(newProperties).join(', ')}`)
  if (skipped.length > 0) {
    console.log(`ℹ️  已跳过 title 字段（数据库已有标题列）：${skipped.join(', ')}`)
  }
}

async function main() {
  try {
    const rawBlogDbId = normalizeDatabaseId(process.env.DATABASE_ID)
    const rawHomeNavDbId = normalizeDatabaseId(process.env.HOME_NAV_DATABASE_ID)
    const rawFriendLinkDbId = normalizeDatabaseId(process.env.FRIEND_LINK_DATABASE_ID)

    const blogDbId = await resolveDatabaseId(rawBlogDbId, '博客主数据库')
    const homeNavDbId = await resolveDatabaseId(rawHomeNavDbId, '首页导航数据库')
    const friendLinkDbId = await resolveDatabaseId(rawFriendLinkDbId, '友情链接数据库')

    if (!blogDbId && !homeNavDbId && !friendLinkDbId) {
      console.error('❌ 未检测到可用数据库 ID（DATABASE_ID / HOME_NAV_DATABASE_ID / FRIEND_LINK_DATABASE_ID）')
      process.exit(1)
    }

    await setupDatabaseSchema(blogDbId, '博客主数据库', BLOG_SCHEMA)
    await setupDatabaseSchema(homeNavDbId, '首页导航数据库', HOME_NAV_SCHEMA)
    await setupDatabaseSchema(friendLinkDbId, '友情链接数据库', FRIEND_LINK_SCHEMA)

    console.log('\n🎉 Notion 数据库字段补全完成')
  } catch (error) {
    console.error('\n❌ 执行失败:', error?.message || error)
    process.exit(1)
  }
}

main()
