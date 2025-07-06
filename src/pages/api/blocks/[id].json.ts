import { getBlock } from '../../../lib/notion/client'
export const prerender = false;
export const config = {
  runtime: 'serverless',
}

export async function get({ params }: { params: { id: string } }) {
  const blockId: string = params.id
  const block = await getBlock(blockId)

  if (block.Type !== 'image') {
    return new Response(null, { status: 400, statusText: 'Invalid block type' })
  }
  //Cache-Control控制浏览器缓存10分钟，cf边缘控制2小时，缓存过期时再缓存1小时，后台异步拉新
  return new Response(JSON.stringify(block), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=600, s-maxage=7200, stale-while-revalidate=3600'
    }
  })
}