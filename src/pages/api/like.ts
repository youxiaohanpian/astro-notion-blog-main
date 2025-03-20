import { getPostLikes, updatePostLikes } from '../../lib/notion/client';

// 处理GET请求 - 获取点赞数
export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const pageId = url.searchParams.get('pageId');
    
    if (!pageId) {
      return new Response(
        JSON.stringify({ success: false, message: '缺少页面ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const likes = await getPostLikes(pageId);
    
    return new Response(
      JSON.stringify({ success: true, likes }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('获取点赞数失败:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 处理POST请求 - 更新点赞数
export async function POST({ request }) {
  try {
    const { pageId, action } = await request.json();
    
    if (!pageId || !['like', 'unlike'].includes(action)) {
      return new Response(
        JSON.stringify({ success: false, message: '无效的请求参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const newLikes = await updatePostLikes(pageId, action);
    
    return new Response(
      JSON.stringify({ success: true, likes: newLikes }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('点赞操作失败:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
