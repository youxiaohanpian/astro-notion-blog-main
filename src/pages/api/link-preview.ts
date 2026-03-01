import type { APIRoute } from 'astro'

export const prerender = false

const isPrivateHost = (hostname: string) => {
  const lower = hostname.toLowerCase()
  if (lower === 'localhost' || lower.endsWith('.localhost')) return true
  if (lower === '127.0.0.1' || lower === '0.0.0.0') return true
  if (lower.startsWith('10.')) return true
  if (lower.startsWith('192.168.')) return true
  if (lower.startsWith('172.')) {
    const second = Number(lower.split('.')[1])
    if (second >= 16 && second <= 31) return true
  }
  return false
}

const pickMeta = (html: string, pattern: RegExp): string | null => {
  const match = html.match(pattern)
  if (!match || !match[1]) return null
  return match[1].replace(/\s+/g, ' ').trim()
}

const normalizeTarget = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const fetchHtml = async (parsed: URL) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 7000)
  const response = await fetch(parsed.toString(), {
    redirect: 'follow',
    signal: controller.signal,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FriendLinkBot/1.0)',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  })
  clearTimeout(timeout)

  if (!response.ok) {
    throw new Error(`目标网站返回 ${response.status} ${response.statusText}`)
  }

  return response.text()
}

const buildCandidates = (base: URL) => {
  const candidates: URL[] = []
  const pushIfNew = (value: URL) => {
    if (!candidates.find((item) => item.toString() === value.toString())) {
      candidates.push(value)
    }
  }

  pushIfNew(base)

  if (base.protocol === 'https:') {
    const httpUrl = new URL(base.toString())
    httpUrl.protocol = 'http:'
    pushIfNew(httpUrl)
  }

  if (!base.hostname.startsWith('www.')) {
    const withWww = new URL(base.toString())
    withWww.hostname = `www.${base.hostname}`
    pushIfNew(withWww)

    if (withWww.protocol === 'https:') {
      const httpWww = new URL(withWww.toString())
      httpWww.protocol = 'http:'
      pushIfNew(httpWww)
    }
  }

  return candidates
}

const previewFromUrl = async (target: string) => {
  let parsed: URL
  try {
    parsed = new URL(normalizeTarget(target))
  } catch {
    return new Response(JSON.stringify({ error: '无效的 URL' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return new Response(JSON.stringify({ error: '仅支持 http/https' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  if (isPrivateHost(parsed.hostname)) {
    return new Response(JSON.stringify({ error: '不支持内网地址' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  try {
    let html = ''
    let lastError: unknown = null
    const candidates = buildCandidates(parsed)

    for (const candidate of candidates) {
      try {
        html = await fetchHtml(candidate)
        lastError = null
        break
      } catch (error) {
        lastError = error
      }
    }

    if (!html && lastError) {
      throw lastError
    }
    const title =
      pickMeta(html, /<title[^>]*>([^<]*)<\/title>/i) ??
      pickMeta(html, /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    const description =
      pickMeta(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i) ??
      pickMeta(html, /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i)

    return new Response(
      JSON.stringify({
        title: title || '',
        description: description || '',
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    )
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === 'AbortError'
        ? '读取超时'
        : error instanceof Error && error.message
          ? error.message
          : '获取失败'
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }
}

const parseTargetFromRequest = async (request: Request) => {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => null)
    return body?.url ? String(body.url) : ''
  }
  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const form = await request.formData()
    return String(form.get('url') || '')
  }
  const text = await request.text().catch(() => '')
  return text
}

export const GET: APIRoute = async ({ url }) => {
  const target = url.searchParams.get('url')
  if (!target) {
    return new Response(JSON.stringify({ error: '缺少 url 参数' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  return previewFromUrl(target)
}

export const POST: APIRoute = async ({ request }) => {
  const target = (await parseTargetFromRequest(request)).trim()
  if (!target) {
    return new Response(JSON.stringify({ error: '缺少 url 参数' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  return previewFromUrl(target)
}
