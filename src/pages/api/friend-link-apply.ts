import type { APIRoute } from 'astro'

export const prerender = false
import { Client } from '@notionhq/client'
import { FRIEND_LINK_DATABASE_ID, NOTION_API_SECRET } from '../../server-constants'

const RATE_LIMIT_MS = 5 * 60 * 1000
const submissions = new Map<string, number>()

const client = new Client({
  auth: NOTION_API_SECRET,
})

type DatabaseProperty = {
  type: string
}

let cachedDatabase:
  | {
      titleProperty: string
      properties: Record<string, DatabaseProperty>
    }
  | null = null

const getDatabaseMeta = async () => {
  if (cachedDatabase) return cachedDatabase
  if (!FRIEND_LINK_DATABASE_ID) {
    throw new Error('FRIEND_LINK_DATABASE_ID 未配置')
  }
  const database = await client.databases.retrieve({
    database_id: FRIEND_LINK_DATABASE_ID,
  })
  const properties = database.properties as Record<string, DatabaseProperty>
  const titleProperty =
    Object.keys(properties).find(
      (key) => properties[key]?.type === 'title'
    ) || 'Name'
  cachedDatabase = { titleProperty, properties }
  return cachedDatabase
}

const pickPropertyName = (
  properties: Record<string, DatabaseProperty>,
  candidates: string[]
) => candidates.find((name) => properties[name])

const normalizeUrl = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!NOTION_API_SECRET) {
      return new Response(JSON.stringify({ error: 'NOTION_API_SECRET 未配置' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      })
    }
    if (!FRIEND_LINK_DATABASE_ID) {
      return new Response(
        JSON.stringify({ error: 'FRIEND_LINK_DATABASE_ID 未配置' }),
        {
          status: 500,
          headers: { 'content-type': 'application/json' },
        }
      )
    }
    const ip = getClientIp(request)
    const now = Date.now()
    if (ip !== 'unknown') {
      const lastTime = submissions.get(ip)
      if (lastTime && now - lastTime < RATE_LIMIT_MS) {
        return new Response(JSON.stringify({ error: '提交过于频繁，请稍后再试。' }), {
          status: 429,
          headers: { 'content-type': 'application/json' },
        })
      }
    }

    const contentType = request.headers.get('content-type') || ''
    const requestClone = request.clone()
    let payload: Record<string, unknown> | null = null

    if (contentType.includes('application/json')) {
      payload = (await request.json().catch(() => null)) as Record<
        string,
        unknown
      > | null
      if (!payload) {
        const raw = await requestClone.text().catch(() => '')
        if (raw) {
          try {
            payload = JSON.parse(raw)
          } catch {
            payload = null
          }
        }
      }
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const formData = await request.formData()
      payload = Object.fromEntries(formData.entries())
    } else {
      const raw = await request.text().catch(() => '')
      if (raw) {
        try {
          payload = JSON.parse(raw)
        } catch {
          payload = null
        }
      }
    }

    if (!payload) {
      return new Response(JSON.stringify({ error: '请求体为空或格式不正确' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    const honeypot = String(payload.website || '').trim()
    if (honeypot) {
      return new Response(JSON.stringify({ error: '提交异常' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    const title = String(payload.title || '').trim()
    const url = normalizeUrl(String(payload.url || ''))
    const description = String(payload.description || '').trim()
    const category = String(payload.category || '').trim() || 'Others'
    const email = String(payload.email || '').trim()
    const note = String(payload.note || '').trim()

    if (!title || !url) {
      return new Response(
        JSON.stringify({ error: '请填写网站名称与网址。' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      )
    }

    const { titleProperty, properties } = await getDatabaseMeta()

    const data: Record<string, unknown> = {
      [titleProperty]: {
        title: [
          {
            text: { content: title },
          },
        ],
      },
    }

    const urlProperty = pickPropertyName(properties, ['Url', 'URL'])
    if (urlProperty) {
      data[urlProperty] = { url }
    }

    const descriptionProperty = pickPropertyName(properties, ['Description', 'Desc'])
    if (descriptionProperty && description) {
      data[descriptionProperty] = {
        rich_text: [{ text: { content: description } }],
      }
    }

    const categoryProperty = pickPropertyName(properties, ['Category', '分类', '类别'])
    if (categoryProperty && category) {
      const propertyType = properties[categoryProperty]?.type
      if (propertyType === 'multi_select') {
        data[categoryProperty] = { multi_select: [{ name: category }] }
      } else {
        data[categoryProperty] = { select: { name: category } }
      }
    }

    const emailProperty = pickPropertyName(properties, ['Email', '邮箱'])
    if (emailProperty && email) {
      data[emailProperty] = { email }
    }

    const noteProperty = pickPropertyName(properties, ['Note', '备注'])
    if (noteProperty && note) {
      data[noteProperty] = { rich_text: [{ text: { content: note } }] }
    }

    const publishedProperty = pickPropertyName(properties, ['Published', '发布'])
    if (publishedProperty) {
      data[publishedProperty] = { checkbox: false }
    }

    await client.pages.create({
      parent: { database_id: FRIEND_LINK_DATABASE_ID },
      properties: data,
    })

    if (ip !== 'unknown') {
      submissions.set(ip, now)
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : '提交失败，请稍后再试。'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
