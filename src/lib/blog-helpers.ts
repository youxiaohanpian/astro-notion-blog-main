import { BASE_PATH, REQUEST_TIMEOUT_MS } from '../server-constants'
import type {
  Block,
  Heading1,
  Heading2,
  Heading3,
  RichText,
  Column,
} from './interfaces'
import { pathJoin } from './utils'

export const filePath = (url: URL): string => {
  try {
    // 检测是否为Notion默认封面图片
    if (url.hostname === 'www.notion.so' && url.pathname.includes('/images/page-cover/')) {
      const filename = url.pathname.split('/').pop() || '';
      const localPath = pathJoin(BASE_PATH, `/notion/page-cover/${filename}`);
      
      // 验证文件是否已下载到本地
      try {
        // 这里不实际检查文件，而是记录日志，服务器端会处理文件下载
        console.log('处理Notion默认封面图片:', { 
          original: url.toString(), 
          processed: localPath,
          needsDownload: true
        });
        
        // 如果是开发环境，可以在这里提醒用户需要下载默认封面
        console.log('提示: Notion默认封面图片需要手动下载到public/notion/page-cover/目录');
        
        // 返回原始URL作为备选方案，确保图片可以显示
        return url.toString();
      } catch (error) {
        console.log('无法访问本地封面图片，使用原始URL:', url.toString());
        return url.toString();
      }
    }
    
    // 常规上传图片的处理逻辑
    const [dir, filename] = url.pathname.split('/').slice(-2)
    if (!dir || !filename) {
      console.error('无效的图片URL路径:', url.pathname);
      return url.toString();
    }
    const path = pathJoin(BASE_PATH, `/notion/${dir}/${filename}`);
    console.log('处理图片路径:', { original: url.toString(), processed: path });
    return path;
  } catch (error) {
    console.error('处理图片路径失败:', error);
    return url.toString();
  }
}

export const extractTargetBlocks = (
  blockType: string,
  blocks: Block[]
): Block[] => {
  return blocks
    .reduce((acc: Block[], block) => {
      if (block.Type === blockType) {
        acc.push(block)
      }

      if (block.ColumnList && block.ColumnList.Columns) {
        acc = acc.concat(
          _extractTargetBlockFromColums(blockType, block.ColumnList.Columns)
        )
      } else if (block.BulletedListItem && block.BulletedListItem.Children) {
        acc = acc.concat(
          extractTargetBlocks(blockType, block.BulletedListItem.Children)
        )
      } else if (block.NumberedListItem && block.NumberedListItem.Children) {
        acc = acc.concat(
          extractTargetBlocks(blockType, block.NumberedListItem.Children)
        )
      } else if (block.ToDo && block.ToDo.Children) {
        acc = acc.concat(extractTargetBlocks(blockType, block.ToDo.Children))
      } else if (block.SyncedBlock && block.SyncedBlock.Children) {
        acc = acc.concat(
          extractTargetBlocks(blockType, block.SyncedBlock.Children)
        )
      } else if (block.Toggle && block.Toggle.Children) {
        acc = acc.concat(extractTargetBlocks(blockType, block.Toggle.Children))
      } else if (block.Paragraph && block.Paragraph.Children) {
        acc = acc.concat(
          extractTargetBlocks(blockType, block.Paragraph.Children)
        )
      } else if (block.Heading1 && block.Heading1.Children) {
        acc = acc.concat(
          extractTargetBlocks(blockType, block.Heading1.Children)
        )
      } else if (block.Heading2 && block.Heading2.Children) {
        acc = acc.concat(
          extractTargetBlocks(blockType, block.Heading2.Children)
        )
      } else if (block.Heading3 && block.Heading3.Children) {
        acc = acc.concat(
          extractTargetBlocks(blockType, block.Heading3.Children)
        )
      } else if (block.Quote && block.Quote.Children) {
        acc = acc.concat(extractTargetBlocks(blockType, block.Quote.Children))
      } else if (block.Callout && block.Callout.Children) {
        acc = acc.concat(extractTargetBlocks(blockType, block.Callout.Children))
      }

      return acc
    }, [])
    .flat()
}

const _extractTargetBlockFromColums = (
  blockType: string,
  columns: Column[]
): Block[] => {
  return columns
    .reduce((acc: Block[], column) => {
      if (column.Children) {
        acc = acc.concat(extractTargetBlocks(blockType, column.Children))
      }
      return acc
    }, [])
    .flat()
}

export const buildURLToHTMLMap = async (
  urls: URL[]
): Promise<{ [key: string]: string }> => {
  const htmls: string[] = await Promise.all(
    urls.map(async (url: URL) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => {
        controller.abort()
      }, REQUEST_TIMEOUT_MS)

      return fetch(url.toString(), { signal: controller.signal })
        .then((res) => {
          return res.text()
        })
        .catch(() => {
          console.log('Request was aborted')
          return ''
        })
        .finally(() => {
          clearTimeout(timeout)
        })
    })
  )

  return urls.reduce((acc: { [key: string]: string }, url, i) => {
    if (htmls[i]) {
      acc[url.toString()] = htmls[i]
    }
    return acc
  }, {})
}

export const getStaticFilePath = (path: string): string => {
  return pathJoin(BASE_PATH, path)
}

export const getNavLink = (nav: string) => {
  if ((!nav || nav === '/') && BASE_PATH) {
    return pathJoin(BASE_PATH, '') + '/'
  }

  return pathJoin(BASE_PATH, nav)
}

export const getPostLink = (slug: string) => {
  return pathJoin(BASE_PATH, `/posts/${slug}`)
}

export const getTagLink = (tag: string) => {
  return pathJoin(BASE_PATH, `/posts/tag/${encodeURIComponent(tag)}`)
}

/**
 * 获取分页链接
 * 
 * 重要提示：标签分页的URL结构是固定的，必须与路由文件结构匹配
 * - 不带标签的分页: /posts/page/{page}
 * - 带标签的分页: /posts/tag/{tag}/page/{page}
 * 
 * @param page 页码，从1开始
 * @param tag 可选的标签名称
 * @returns 完整的分页URL路径
 */
export const getPageLink = (page: number, tag: string) => {
  // 第一页有特殊处理，标签页指向标签首页，普通分页指向博客首页
  if (page === 1) {
    return tag ? getTagLink(tag) : pathJoin(BASE_PATH, '/blog')
  }
  
  // 确保标签名称被正确编码，防止URL中的特殊字符问题
  const encodedTag = tag ? encodeURIComponent(tag) : '';
  
  // 构造URL，注意保持与文件路由结构一致:
  // - 对于标签分页：/posts/tag/[tag]/page/[page].astro
  // - 对于普通分页：/posts/page/[page].astro
  return tag
    ? pathJoin(BASE_PATH, `/posts/tag/${encodedTag}/page/${page.toString()}`)
    : pathJoin(BASE_PATH, `/posts/page/${page.toString()}`)
}

export const getDateStr = (date: string) => {
  const dt = new Date(date)

  if (date.indexOf('T') !== -1) {
    // Consider timezone
    const elements = date.split('T')[1].split(/([+-])/)
    if (elements.length > 1) {
      const diff = parseInt(`${elements[1]}${elements[2]}`, 10)
      dt.setHours(dt.getHours() + diff)
    }
  }

  const y = dt.getFullYear()
  const m = ('00' + (dt.getMonth() + 1)).slice(-2)
  const d = ('00' + dt.getDate()).slice(-2)
  return y + '-' + m + '-' + d
}

export const buildHeadingId = (heading: Heading1 | Heading2 | Heading3) => {
  return heading.RichTexts.map((richText: RichText) => {
    if (!richText.Text) {
      return ''
    }
    return richText.Text.Content
  })
    .join('')
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-') // 支持中文和英文，将特殊字符替换为连字符
    .replace(/^-+|-+$/g, '') // 移除首尾的连字符
}

export const isTweetURL = (url: URL): boolean => {
  if (
    url.hostname !== 'twitter.com' &&
    url.hostname !== 'www.twitter.com' &&
    url.hostname !== 'x.com' &&
    url.hostname !== 'www.x.com'
  ) {
    return false
  }
  return /\/[^/]+\/status\/[\d]+/.test(url.pathname)
}

export const isTikTokURL = (url: URL): boolean => {
  if (url.hostname !== 'tiktok.com' && url.hostname !== 'www.tiktok.com' && 
      url.hostname !== 'vm.tiktok.com') {
    return false
  }
  
  // 支持常规格式 /@username/video/videoId
  if (/\/[^/]+\/video\/[\d]+/.test(url.pathname)) {
    return true;
  }
  
  // 支持短链接格式 /t/videoId
  if (/\/t\/[\w]+/.test(url.pathname)) {
    return true;
  }
  
  // vm.tiktok.com短链接
  if (url.hostname === 'vm.tiktok.com' && url.pathname.length > 1) {
    return true;
  }
  
  return false;
}

export const isInstagramURL = (url: URL): boolean => {
  if (
    url.hostname !== 'instagram.com' &&
    url.hostname !== 'www.instagram.com'
  ) {
    return false
  }
  return /\/p\/[^/]+/.test(url.pathname)
}

export const isPinterestURL = (url: URL): boolean => {
  if (
    url.hostname !== 'pinterest.com' &&
    url.hostname !== 'www.pinterest.com' &&
    url.hostname !== 'pinterest.jp' &&
    url.hostname !== 'www.pinterest.jp'
  ) {
    return false
  }
  return /\/pin\/[\d]+/.test(url.pathname)
}

export const isCodePenURL = (url: URL): boolean => {
  if (url.hostname !== 'codepen.io' && url.hostname !== 'www.codepen.io') {
    return false
  }
  return /\/[^/]+\/pen\/[^/]+/.test(url.pathname)
}

export const isShortAmazonURL = (url: URL): boolean => {
  if (url.hostname === 'amzn.to' || url.hostname === 'www.amzn.to') {
    return true
  }
  return false
}

export const isFullAmazonURL = (url: URL): boolean => {
  if (
    url.hostname === 'amazon.com' ||
    url.hostname === 'www.amazon.com' ||
    url.hostname === 'amazon.co.jp' ||
    url.hostname === 'www.amazon.co.jp'
  ) {
    return true
  }
  return false
}

export const isAmazonURL = (url: URL): boolean => {
  return isShortAmazonURL(url) || isFullAmazonURL(url)
}

export const isYouTubeURL = (url: URL): boolean => {
  if (['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname)) {
    return true
  }
  return false
}

// Supported URL
//
// - https://youtu.be/0zM3nApSvMg
// - https://www.youtube.com/watch?v=0zM3nApSvMg&feature=feedrec_grec_index
// - https://www.youtube.com/watch?v=0zM3nApSvMg#t=0m10s
// - https://www.youtube.com/watch?v=0zM3nApSvMg
// - https://www.youtube.com/v/0zM3nApSvMg?fs=1&amp;hl=en_US&amp;rel=0
// - https://www.youtube.com/embed/0zM3nApSvMg?rel=0
// - https://youtube.com/live/uOLwqWlpKbA
export const parseYouTubeVideoId = (url: URL): string => {
  if (!isYouTubeURL(url)) return ''

  if (url.hostname === 'youtu.be') {
    return url.pathname.split('/')[1]
  } else if (url.pathname === '/watch') {
    return url.searchParams.get('v') || ''
  } else {
    const elements = url.pathname.split('/')

    if (elements.length < 2) return ''

    if (
      elements[1] === 'v' ||
      elements[1] === 'embed' ||
      elements[1] === 'live'
    ) {
      return elements[2]
    }
  }

  return ''
}

/**
 * 从文章块中提取第一张图片
 */
export function extractFirstImage(blocks: any[]): { Type: string; Url: string } | null {
  if (!blocks || blocks.length === 0) return null;
  
  console.log(`检查 ${blocks.length} 个块以提取图片`);
  
  // 优先处理ColumnList块，因为通常列布局的图片是文章的主要图片
  for (const block of blocks) {
    if (block.Type === 'column_list' && block.ColumnList && block.ColumnList.Columns) {
      console.log(`找到列布局块: ${block.Id}, 列数: ${block.ColumnList.Columns.length}`);
      
      // 递归检查所有列中的图片
      for (const column of block.ColumnList.Columns) {
        if (column.Children && column.Children.length > 0) {
          // 递归检查每个列的子块
          const firstImageInColumn = extractFirstImage(column.Children);
          if (firstImageInColumn) {
            console.log('在列布局中找到图片:', firstImageInColumn.Url);
            return firstImageInColumn;
          }
        }
      }
    }
  }
  
  // 然后检查所有顶级图片块
  for (const block of blocks) {
    if (block.Type === 'image' && block.Image) {
      console.log('找到顶级图片块:', block.Id);
      if (block.Image.File && block.Image.File.Url) {
        console.log('提取到顶级文件图片:', block.Image.File.Url);
        return {
          Type: 'file',
          Url: block.Image.File.Url
        };
      } else if (block.Image.External && block.Image.External.Url) {
        console.log('提取到顶级外部图片:', block.Image.External.Url);
        return {
          Type: 'external',
          Url: block.Image.External.Url
        };
      }
    }
  }
  
  // 最后检查其他子块
  for (const block of blocks) {
    if (block.Type !== 'column_list') { // 跳过已经检查过的列布局
      // 检查块类型
      console.log(`检查块类型: ${block.Type || '未知类型'}, ID: ${block.Id || '未知ID'}`);
      
      // 递归检查子块
      const childBlocks = [
        ...(block.Paragraph?.Children || []),
        ...(block.Heading1?.Children || []),
        ...(block.Heading2?.Children || []),
        ...(block.Heading3?.Children || []),
        ...(block.BulletedListItem?.Children || []),
        ...(block.NumberedListItem?.Children || []),
        ...(block.ToDo?.Children || []),
        ...(block.Toggle?.Children || []),
        ...(block.Quote?.Children || []),
        ...(block.Callout?.Children || []),
        ...(block.SyncedBlock?.Children || [])
      ];
      
      if (childBlocks.length > 0) {
        console.log(`块 ${block.Id || '未知ID'} 有 ${childBlocks.length} 个子块，递归检查...`);
        const firstImageInChildren = extractFirstImage(childBlocks);
        if (firstImageInChildren) return firstImageInChildren;
      }
    }
  }
  
  return null;
}
