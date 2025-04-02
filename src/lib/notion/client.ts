import fs, { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import axios from 'axios'
import sharp from 'sharp'
import retry from 'async-retry'
import ExifTransformer from 'exif-be-gone'
import {
  NOTION_API_SECRET,
  DATABASE_ID,
  NUMBER_OF_POSTS_PER_PAGE,
  REQUEST_TIMEOUT_MS,
} from '../../server-constants'
import type { AxiosResponse } from 'axios'
import type * as responses from './responses'
import type * as requestParams from './request-params'
import type {
  Database,
  Post,
  Block,
  Paragraph,
  Heading1,
  Heading2,
  Heading3,
  BulletedListItem,
  NumberedListItem,
  ToDo,
  Image,
  Code,
  Quote,
  Equation,
  Callout,
  Embed,
  Video,
  File,
  Bookmark,
  LinkPreview,
  SyncedBlock,
  SyncedFrom,
  Table,
  TableRow,
  TableCell,
  Toggle,
  ColumnList,
  Column,
  TableOfContents,
  RichText,
  Text,
  Annotation,
  SelectProperty,
  Emoji,
  FileObject,
  LinkToPage,
  Mention,
  Reference,
} from '../interfaces'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Client, APIResponseError } from '@notionhq/client'
import { generateSlugFromTitleSync, generateSlugFromTitle } from '../slug-helpers'
import { buildURLToHTMLMap } from '../blog-helpers'
import * as fsPromises from 'fs/promises'

const client = new Client({
  auth: NOTION_API_SECRET,
})

let postsCache: Post[] | null = null
let dbCache: Database | null = null
let blocksCache: Record<string, Block[]> = {}
let pageCache: Record<string, Post> = {}
let tagsCache: SelectProperty[] | null = null
const MAX_CONCURRENT_REQUESTS = 3
let lastRequestTime = 0
const REQUEST_THROTTLE_MS = 300

const numberOfRetry = 2

async function throttleRequest(): Promise<void> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  
  if (timeSinceLastRequest < REQUEST_THROTTLE_MS) {
    const delay = REQUEST_THROTTLE_MS - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  lastRequestTime = Date.now()
}

export async function getAllPosts(): Promise<Post[]> {
  if (postsCache !== null) {
    console.log('使用缓存的文章列表');
    return postsCache;
  }

  console.log('开始从 Notion API 获取文章列表');
  console.log('DATABASE_ID:', DATABASE_ID);

  const params: requestParams.QueryDatabase = {
    database_id: DATABASE_ID,
    filter: {
      and: [
        {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: new Date().toISOString(),
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
    page_size: 100,
  }

  let results: responses.PageObject[] = []
  while (true) {
    console.log('请求 Notion API...');
    const res = await retry(
      async (bail) => {
        try {
          return (await client.databases.query(
            params as any // eslint-disable-line @typescript-eslint/no-explicit-any
          )) as responses.QueryDatabaseResponse
        } catch (error: unknown) {
          console.error('Notion API 请求失败:', error);
          if (error instanceof APIResponseError) {
            if (error.status && error.status >= 400 && error.status < 500) {
              bail(error)
            }
          }
          throw error
        }
      },
      {
        retries: numberOfRetry,
      }
    )

    results = results.concat(res.results)
    console.log(`获取到 ${res.results.length} 个结果，当前总数: ${results.length}`);

    if (!res.has_more) {
      break
    }

    params['start_cursor'] = res.next_cursor as string
  }

  console.log(`总共获取到 ${results.length} 个页面对象`);

  // 过滤有效的页面对象
  const validResults = results.filter((pageObject) => _validPageObject(pageObject));
  console.log(`过滤后剩余 ${validResults.length} 个有效页面对象`);
  
  // 处理每个页面对象，生成 Post
  const posts: Post[] = [];
  for (const pageObject of validResults) {
    const post = _buildPost(pageObject);
    
    // 如果 Slug 为空，则异步生成一个
    if (!post.Slug) {
      post.Slug = await generateSlugIfNeeded(pageObject);
    }
    
    posts.push(post);
  }
  
  console.log(`成功生成 ${posts.length} 篇文章`);
  postsCache = posts;
  return posts;
}

export async function getPosts(pageSize = 10): Promise<Post[]> {
  const allPosts = await getAllPosts()
  return allPosts.slice(0, pageSize)
}

export async function getRankedPosts(pageSize = 10): Promise<Post[]> {
  const allPosts = await getAllPosts()
  return allPosts
    .filter((post) => !!post.Rank)
    .sort((a, b) => {
      if (a.Rank > b.Rank) {
        return -1
      } else if (a.Rank === b.Rank) {
        return 0
      }
      return 1
    })
    .slice(0, pageSize)
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // 检查缓存
  const cachedPost = Object.values(pageCache).find(post => post.Slug === slug);
  if (cachedPost) {
    return cachedPost;
  }
  
  const allPosts = await getAllPosts()
  const post = allPosts.find((post) => post.Slug === slug) || null;
  
  // 保存到缓存
  if (post) {
    pageCache[post.PageId] = post;
  }
  
  return post;
}

export async function getPostByPageId(pageId: string): Promise<Post | null> {
  // 检查缓存
  if (pageCache[pageId]) {
    return pageCache[pageId];
  }
  
  const allPosts = await getAllPosts()
  const post = allPosts.find((post) => post.PageId === pageId) || null;
  
  // 保存到缓存
  if (post) {
    pageCache[pageId] = post;
  }
  
  return post;
}

export async function getPostsByTag(
  tagName: string,
  pageSize = 10
): Promise<Post[]> {
  if (!tagName) return []

  const allPosts = await getAllPosts()
  const filteredPosts = allPosts.filter((post) => 
    post.Tags.find((tag) => tag.name === tagName)
  )
  
  console.log(`标签 "${tagName}" 下共有 ${filteredPosts.length} 篇文章`)
  console.log(`页面大小为 ${pageSize}，返回 ${Math.min(filteredPosts.length, pageSize)} 篇文章`)
  
  // 确保返回数量不超过要求的pageSize
  return filteredPosts.slice(0, pageSize)
}

// page starts from 1 not 0
export async function getPostsByPage(page: number): Promise<Post[]> {
  if (page < 1) {
    return []
  }

  const allPosts = await getAllPosts()

  const startIndex = (page - 1) * NUMBER_OF_POSTS_PER_PAGE
  const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE

  return allPosts.slice(startIndex, endIndex)
}

// page starts from 1 not 0
export async function getPostsByTagAndPage(
  tagName: string,
  page: number
): Promise<Post[]> {
  if (page < 1) {
    return []
  }

  const allPosts = await getAllPosts()
  const posts = allPosts.filter((post) =>
    post.Tags.find((tag) => tag.name === tagName)
  )

  console.log(`标签 "${tagName}" 第 ${page} 页: 总共找到 ${posts.length} 篇文章`)
  
  const startIndex = (page - 1) * NUMBER_OF_POSTS_PER_PAGE
  const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE
  
  console.log(`计算索引: 从 ${startIndex} 到 ${endIndex}，每页 ${NUMBER_OF_POSTS_PER_PAGE} 篇`)
  
  const pageArticles = posts.slice(startIndex, endIndex)
  console.log(`标签 "${tagName}" 第 ${page} 页实际返回 ${pageArticles.length} 篇文章`)

  return pageArticles
}

export async function getNumberOfPages(): Promise<number> {
  const allPosts = await getAllPosts()
  return (
    Math.floor(allPosts.length / NUMBER_OF_POSTS_PER_PAGE) +
    (allPosts.length % NUMBER_OF_POSTS_PER_PAGE > 0 ? 1 : 0)
  )
}

export async function getNumberOfPagesByTag(tagName: string): Promise<number> {
  const allPosts = await getAllPosts()
  const posts = allPosts.filter((post) =>
    post.Tags.find((tag) => tag.name === tagName)
  )
  
  // 确保页数计算是准确的
  const pageCount = Math.ceil(posts.length / NUMBER_OF_POSTS_PER_PAGE)
  
  console.log(`标签 "${tagName}" 总共有 ${posts.length} 篇文章，每页 ${NUMBER_OF_POSTS_PER_PAGE} 篇，计算出 ${pageCount} 页`)
  
  // 如果没有文章，至少返回1页，否则返回计算的页数
  return pageCount > 0 ? pageCount : 1
}

export async function getAllBlocksByBlockId(blockId: string): Promise<Block[]> {
  // 检查缓存
  if (blocksCache[blockId]) {
    return blocksCache[blockId]
  }

  let results: responses.BlockObject[] = []

  if (fs.existsSync(`tmp/${blockId}.json`)) {
    results = JSON.parse(fs.readFileSync(`tmp/${blockId}.json`, 'utf-8'))
  } else {
    // 请求节流
    await throttleRequest();
    
    const params: requestParams.RetrieveBlockChildren = {
      block_id: blockId,
    }

    while (true) {
      const res = await retry(
        async (bail) => {
          try {
            return (await client.blocks.children.list(
              params as any // eslint-disable-line @typescript-eslint/no-explicit-any
            )) as responses.RetrieveBlockChildrenResponse
          } catch (error: unknown) {
            if (error instanceof APIResponseError) {
              if (error.status && error.status >= 400 && error.status < 500) {
                bail(error)
              }
            }
            throw error
          }
        },
        {
          retries: numberOfRetry,
        }
      )

      results = results.concat(res.results)

      if (!res.has_more) {
        break
      }

      params['start_cursor'] = res.next_cursor as string
      
      // 添加请求节流
      await throttleRequest();
    }
  }

  const allBlocks = results.map((blockObject) => _buildBlock(blockObject))

  // 使用Promise.all和批量处理来限制并发请求数
  const processBatch = async (blocks: Block[], startIdx: number, batchSize: number) => {
    const endIdx = Math.min(startIdx + batchSize, blocks.length);
    const batchPromises = [];
    
    for (let i = startIdx; i < endIdx; i++) {
      const block = blocks[i];
      batchPromises.push(processBlock(block));
    }
    
    await Promise.all(batchPromises);
  };
  
  const processBlock = async (block: Block) => {
    if (block.Type === 'table' && block.Table) {
      block.Table.Rows = await _getTableRows(block.Id)
    } else if (block.Type === 'column_list' && block.ColumnList) {
      block.ColumnList.Columns = await _getColumns(block.Id)
    } else if (
      block.Type === 'bulleted_list_item' &&
      block.BulletedListItem &&
      block.HasChildren
    ) {
      block.BulletedListItem.Children = await getAllBlocksByBlockId(block.Id)
    } else if (
      block.Type === 'numbered_list_item' &&
      block.NumberedListItem &&
      block.HasChildren
    ) {
      block.NumberedListItem.Children = await getAllBlocksByBlockId(block.Id)
    } else if (block.Type === 'to_do' && block.ToDo && block.HasChildren) {
      block.ToDo.Children = await getAllBlocksByBlockId(block.Id)
    } else if (block.Type === 'synced_block' && block.SyncedBlock) {
      block.SyncedBlock.Children = await _getSyncedBlockChildren(block)
    } else if (block.Type === 'toggle' && block.Toggle) {
      block.Toggle.Children = await getAllBlocksByBlockId(block.Id)
    } else if (
      block.Type === 'paragraph' &&
      block.Paragraph &&
      block.HasChildren
    ) {
      block.Paragraph.Children = await getAllBlocksByBlockId(block.Id)
    } else if (
      block.Type === 'heading_1' &&
      block.Heading1 &&
      block.HasChildren
    ) {
      block.Heading1.Children = await getAllBlocksByBlockId(block.Id)
    } else if (
      block.Type === 'heading_2' &&
      block.Heading2 &&
      block.HasChildren
    ) {
      block.Heading2.Children = await getAllBlocksByBlockId(block.Id)
    } else if (
      block.Type === 'heading_3' &&
      block.Heading3 &&
      block.HasChildren
    ) {
      block.Heading3.Children = await getAllBlocksByBlockId(block.Id)
    } else if (block.Type === 'quote' && block.Quote && block.HasChildren) {
      block.Quote.Children = await getAllBlocksByBlockId(block.Id)
    } else if (block.Type === 'callout' && block.Callout && block.HasChildren) {
      block.Callout.Children = await getAllBlocksByBlockId(block.Id)
    }
  };

  // 以每批MAX_CONCURRENT_REQUESTS个块的大小批量处理
  for (let i = 0; i < allBlocks.length; i += MAX_CONCURRENT_REQUESTS) {
    await processBatch(allBlocks, i, MAX_CONCURRENT_REQUESTS);
  }

  // 保存到缓存
  blocksCache[blockId] = allBlocks;
  return allBlocks
}

export async function getBlock(blockId: string): Promise<Block> {
  const params: requestParams.RetrieveBlock = {
    block_id: blockId,
  }

  const res = await retry(
    async (bail) => {
      try {
        return (await client.blocks.retrieve(
          params as any // eslint-disable-line @typescript-eslint/no-explicit-any
        )) as responses.RetrieveBlockResponse
      } catch (error: unknown) {
        if (error instanceof APIResponseError) {
          if (error.status && error.status >= 400 && error.status < 500) {
            bail(error)
          }
        }
        throw error
      }
    },
    {
      retries: numberOfRetry,
    }
  )

  return _buildBlock(res)
}

export async function getAllTags(): Promise<SelectProperty[]> {
  if (tagsCache !== null) {
    return tagsCache
  }

  const allPosts = await getAllPosts()

  const tagNames: string[] = []
  const tags: SelectProperty[] = allPosts
    .flatMap((post) => post.Tags)
    .reduce((acc, tag) => {
      if (!tagNames.includes(tag.name)) {
        acc.push(tag)
        tagNames.push(tag.name)
      }
      return acc
    }, [] as SelectProperty[])
    .sort((a: SelectProperty, b: SelectProperty) =>
      a.name.localeCompare(b.name)
    )

  tagsCache = tags
  return tags
}

export async function downloadFile(url: URL) {
  let res!: AxiosResponse
  try {
    console.log(`开始下载图片: ${url.toString()}`);
    res = await axios({
      method: 'get',
      url: url.toString(),
      timeout: REQUEST_TIMEOUT_MS,
      responseType: 'stream',
    })
  } catch (err) {
    console.error(`下载图片失败: ${url.toString()}`, err);
    return Promise.resolve()
  }

  if (!res || res.status != 200) {
    console.error(`图片下载响应异常: ${url.toString()}`, res);
    return Promise.resolve()
  }

  // 创建有效的目录名
  const pathParts = url.pathname.split('/').filter(part => part.length > 0);
  const dirName = pathParts.length >= 2 ? pathParts[pathParts.length - 2] : 'external';
  const dir = `./public/notion/${dirName}`;
  
  try {
    if (!fs.existsSync(dir)) {
      console.log(`创建目录: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.error(`创建目录失败: ${dir}`, err);
    return Promise.resolve()
  }

  // 安全获取文件名
  const filename = pathParts.length > 0 
    ? decodeURIComponent(pathParts[pathParts.length - 1]) 
    : `image-${Date.now()}.jpg`;
    
  const filepath = `${dir}/${filename}`;
  console.log(`保存图片到: ${filepath}`);

  const writeStream = createWriteStream(filepath)
  const rotate = sharp().rotate()

  let stream = res.data

  if (res.headers['content-type'] === 'image/jpeg') {
    stream = stream.pipe(rotate)
  }
  try {
    await pipeline(stream, new ExifTransformer(), writeStream)
    console.log(`图片下载完成: ${filepath}`);
  } catch (err) {
    console.error(`图片处理失败: ${filepath}`, err);
    writeStream.end()
    return Promise.resolve()
  }
}

export const downloadPageCover = async (url: string): Promise<void> => {
  try {
    const parsedUrl = new URL(url);
    
    // 只处理Notion默认封面图片
    if (parsedUrl.hostname !== 'www.notion.so' || !parsedUrl.pathname.includes('/images/page-cover/')) {
      return;
    }
    
    const filename = parsedUrl.pathname.split('/').pop();
    if (!filename) {
      console.error('无法从URL中提取文件名:', url);
      return;
    }
    
    const directory = 'public/notion/page-cover';
    const savePath = `${directory}/${filename}`;
    
    // 检查目录是否存在，不存在则创建
    try {
      await fsPromises.mkdir(directory, { recursive: true });
    } catch (error) {
      console.error('创建目录失败:', error);
      return;
    }
    
    // 检查文件是否已存在
    try {
      await fsPromises.access(savePath, fsPromises.constants.F_OK);
      console.log(`封面图片已存在: ${savePath}`);
      return;
    } catch (e) {
      // 文件不存在，继续下载
    }
    
    // 下载图片
    console.log(`开始下载Notion默认封面图片: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fsPromises.writeFile(savePath, Buffer.from(buffer));
    console.log(`Notion默认封面图片下载完成: ${savePath}`);
  } catch (error) {
    console.error(`下载Notion默认封面图片失败:`, error);
  }
}

export async function getDatabase(): Promise<Database> {
  if (dbCache !== null) {
    return Promise.resolve(dbCache)
  }

  const params: requestParams.RetrieveDatabase = {
    database_id: DATABASE_ID,
  }

  const res = await retry(
    async (bail) => {
      try {
        return (await client.databases.retrieve(
          params as any // eslint-disable-line @typescript-eslint/no-explicit-any
        )) as responses.RetrieveDatabaseResponse
      } catch (error: unknown) {
        if (error instanceof APIResponseError) {
          if (error.status && error.status >= 400 && error.status < 500) {
            bail(error)
          }
        }
        throw error
      }
    },
    {
      retries: numberOfRetry,
    }
  )

  let icon: FileObject | Emoji | null = null
  if (res.icon) {
    if (res.icon.type === 'emoji' && 'emoji' in res.icon) {
      icon = {
        Type: res.icon.type,
        Emoji: res.icon.emoji,
      }
    } else if (res.icon.type === 'external' && 'external' in res.icon) {
      icon = {
        Type: res.icon.type,
        Url: res.icon.external?.url || '',
      }
    } else if (res.icon.type === 'file' && 'file' in res.icon) {
      icon = {
        Type: res.icon.type,
        Url: res.icon.file?.url || '',
      }
    }
  }

  let cover: FileObject | null = null
  if (res.cover) {
    cover = {
      Type: res.cover.type,
      Url: res.cover.external?.url || res.cover?.file?.url || '',
    }
  }

  const database: Database = {
    Title: res.title.map((richText) => richText.plain_text).join(''),
    Description: res.description
      .map((richText) => richText.plain_text)
      .join(''),
    Icon: icon,
    Cover: cover,
  }

  dbCache = database
  return database
}

function _buildBlock(blockObject: responses.BlockObject): Block {
  const block: Block = {
    Id: blockObject.id,
    Type: blockObject.type,
    HasChildren: blockObject.has_children,
  }

  switch (blockObject.type) {
    case 'paragraph':
      if (blockObject.paragraph) {
        const paragraph: Paragraph = {
          RichTexts: blockObject.paragraph.rich_text.map(_buildRichText),
          Color: blockObject.paragraph.color,
        }
        block.Paragraph = paragraph
      }
      break
    case 'heading_1':
      if (blockObject.heading_1) {
        const heading1: Heading1 = {
          RichTexts: blockObject.heading_1.rich_text.map(_buildRichText),
          Color: blockObject.heading_1.color,
          IsToggleable: blockObject.heading_1.is_toggleable,
        }
        block.Heading1 = heading1
      }
      break
    case 'heading_2':
      if (blockObject.heading_2) {
        const heading2: Heading2 = {
          RichTexts: blockObject.heading_2.rich_text.map(_buildRichText),
          Color: blockObject.heading_2.color,
          IsToggleable: blockObject.heading_2.is_toggleable,
        }
        block.Heading2 = heading2
      }
      break
    case 'heading_3':
      if (blockObject.heading_3) {
        const heading3: Heading3 = {
          RichTexts: blockObject.heading_3.rich_text.map(_buildRichText),
          Color: blockObject.heading_3.color,
          IsToggleable: blockObject.heading_3.is_toggleable,
        }
        block.Heading3 = heading3
      }
      break
    case 'bulleted_list_item':
      if (blockObject.bulleted_list_item) {
        const bulletedListItem: BulletedListItem = {
          RichTexts:
            blockObject.bulleted_list_item.rich_text.map(_buildRichText),
          Color: blockObject.bulleted_list_item.color,
        }
        block.BulletedListItem = bulletedListItem
      }
      break
    case 'numbered_list_item':
      if (blockObject.numbered_list_item) {
        const numberedListItem: NumberedListItem = {
          RichTexts:
            blockObject.numbered_list_item.rich_text.map(_buildRichText),
          Color: blockObject.numbered_list_item.color,
        }
        block.NumberedListItem = numberedListItem
      }
      break
    case 'to_do':
      if (blockObject.to_do) {
        const toDo: ToDo = {
          RichTexts: blockObject.to_do.rich_text.map(_buildRichText),
          Checked: blockObject.to_do.checked,
          Color: blockObject.to_do.color,
        }
        block.ToDo = toDo
      }
      break
    case 'video':
      if (blockObject.video) {
        const video: Video = {
          Caption: blockObject.video.caption?.map(_buildRichText) || [],
          Type: blockObject.video.type,
        }
        if (
          blockObject.video.type === 'external' &&
          blockObject.video.external
        ) {
          video.External = { Url: blockObject.video.external.url }
        }
        block.Video = video
      }
      break
    case 'image':
      if (blockObject.image) {
        const image: Image = {
          Caption: blockObject.image.caption?.map(_buildRichText) || [],
          Type: blockObject.image.type,
        }
        if (
          blockObject.image.type === 'external' &&
          blockObject.image.external
        ) {
          image.External = { Url: blockObject.image.external.url }
        } else if (
          blockObject.image.type === 'file' &&
          blockObject.image.file
        ) {
          image.File = {
            Type: blockObject.image.type,
            Url: blockObject.image.file.url,
            ExpiryTime: blockObject.image.file.expiry_time,
          }
        }
        block.Image = image
      }
      break
    case 'file':
      if (blockObject.file) {
        const file: File = {
          Caption: blockObject.file.caption?.map(_buildRichText) || [],
          Type: blockObject.file.type,
        }
        if (blockObject.file.type === 'external' && blockObject.file.external) {
          file.External = { Url: blockObject.file.external.url }
        } else if (blockObject.file.type === 'file' && blockObject.file.file) {
          file.File = {
            Type: blockObject.file.type,
            Url: blockObject.file.file.url,
            ExpiryTime: blockObject.file.file.expiry_time,
          }
        }
        block.File = file
      }
      break
    case 'code':
      if (blockObject.code) {
        const code: Code = {
          Caption: blockObject.code.caption?.map(_buildRichText) || [],
          RichTexts: blockObject.code.rich_text.map(_buildRichText),
          Language: blockObject.code.language,
        }
        block.Code = code
      }
      break
    case 'quote':
      if (blockObject.quote) {
        const quote: Quote = {
          RichTexts: blockObject.quote.rich_text.map(_buildRichText),
          Color: blockObject.quote.color,
        }
        block.Quote = quote
      }
      break
    case 'equation':
      if (blockObject.equation) {
        const equation: Equation = {
          Expression: blockObject.equation.expression,
        }
        block.Equation = equation
      }
      break
    case 'callout':
      if (blockObject.callout) {
        let icon: FileObject | Emoji | null = null
        if (blockObject.callout.icon) {
          if (
            blockObject.callout.icon.type === 'emoji' &&
            'emoji' in blockObject.callout.icon
          ) {
            icon = {
              Type: blockObject.callout.icon.type,
              Emoji: blockObject.callout.icon.emoji,
            }
          } else if (
            blockObject.callout.icon.type === 'external' &&
            'external' in blockObject.callout.icon
          ) {
            icon = {
              Type: blockObject.callout.icon.type,
              Url: blockObject.callout.icon.external?.url || '',
            }
          }
        }

        const callout: Callout = {
          RichTexts: blockObject.callout.rich_text.map(_buildRichText),
          Icon: icon,
          Color: blockObject.callout.color,
        }
        block.Callout = callout
      }
      break
    case 'synced_block':
      if (blockObject.synced_block) {
        let syncedFrom: SyncedFrom | null = null
        if (
          blockObject.synced_block.synced_from &&
          blockObject.synced_block.synced_from.block_id
        ) {
          syncedFrom = {
            BlockId: blockObject.synced_block.synced_from.block_id,
          }
        }

        const syncedBlock: SyncedBlock = {
          SyncedFrom: syncedFrom,
        }
        block.SyncedBlock = syncedBlock
      }
      break
    case 'toggle':
      if (blockObject.toggle) {
        const toggle: Toggle = {
          RichTexts: blockObject.toggle.rich_text.map(_buildRichText),
          Color: blockObject.toggle.color,
          Children: [],
        }
        block.Toggle = toggle
      }
      break
    case 'embed':
      if (blockObject.embed) {
        const embed: Embed = {
          Url: blockObject.embed.url,
        }
        block.Embed = embed
      }
      break
    case 'bookmark':
      if (blockObject.bookmark) {
        const bookmark: Bookmark = {
          Url: blockObject.bookmark.url,
        }
        block.Bookmark = bookmark
      }
      break
    case 'link_preview':
      if (blockObject.link_preview) {
        const linkPreview: LinkPreview = {
          Url: blockObject.link_preview.url,
        }
        block.LinkPreview = linkPreview
      }
      break
    case 'table':
      if (blockObject.table) {
        const table: Table = {
          TableWidth: blockObject.table.table_width,
          HasColumnHeader: blockObject.table.has_column_header,
          HasRowHeader: blockObject.table.has_row_header,
          Rows: [],
        }
        block.Table = table
      }
      break
    case 'column_list':
      const columnList: ColumnList = {
        Columns: [],
      }
      block.ColumnList = columnList
      break
    case 'table_of_contents':
      if (blockObject.table_of_contents) {
        const tableOfContents: TableOfContents = {
          Color: blockObject.table_of_contents.color,
        }
        block.TableOfContents = tableOfContents
      }
      break
    case 'link_to_page':
      if (blockObject.link_to_page && blockObject.link_to_page.page_id) {
        const linkToPage: LinkToPage = {
          Type: blockObject.link_to_page.type,
          PageId: blockObject.link_to_page.page_id,
        }
        block.LinkToPage = linkToPage
      }
      break
  }

  return block
}

async function _getTableRows(blockId: string): Promise<TableRow[]> {
  let results: responses.BlockObject[] = []

  if (fs.existsSync(`tmp/${blockId}.json`)) {
    results = JSON.parse(fs.readFileSync(`tmp/${blockId}.json`, 'utf-8'))
  } else {
    const params: requestParams.RetrieveBlockChildren = {
      block_id: blockId,
    }

    while (true) {
      const res = await retry(
        async (bail) => {
          try {
            return (await client.blocks.children.list(
              params as any // eslint-disable-line @typescript-eslint/no-explicit-any
            )) as responses.RetrieveBlockChildrenResponse
          } catch (error: unknown) {
            if (error instanceof APIResponseError) {
              if (error.status && error.status >= 400 && error.status < 500) {
                bail(error)
              }
            }
            throw error
          }
        },
        {
          retries: numberOfRetry,
        }
      )

      results = results.concat(res.results)

      if (!res.has_more) {
        break
      }

      params['start_cursor'] = res.next_cursor as string
    }
  }

  return results.map((blockObject) => {
    const tableRow: TableRow = {
      Id: blockObject.id,
      Type: blockObject.type,
      HasChildren: blockObject.has_children,
      Cells: [],
    }

    if (blockObject.type === 'table_row' && blockObject.table_row) {
      const cells: TableCell[] = blockObject.table_row.cells.map((cell) => {
        const tableCell: TableCell = {
          RichTexts: cell.map(_buildRichText),
        }

        return tableCell
      })

      tableRow.Cells = cells
    }

    return tableRow
  })
}

async function _getColumns(blockId: string): Promise<Column[]> {
  let results: responses.BlockObject[] = []

  if (fs.existsSync(`tmp/${blockId}.json`)) {
    results = JSON.parse(fs.readFileSync(`tmp/${blockId}.json`, 'utf-8'))
  } else {
    const params: requestParams.RetrieveBlockChildren = {
      block_id: blockId,
    }

    while (true) {
      const res = await retry(
        async (bail) => {
          try {
            return (await client.blocks.children.list(
              params as any // eslint-disable-line @typescript-eslint/no-explicit-any
            )) as responses.RetrieveBlockChildrenResponse
          } catch (error: unknown) {
            if (error instanceof APIResponseError) {
              if (error.status && error.status >= 400 && error.status < 500) {
                bail(error)
              }
            }
            throw error
          }
        },
        {
          retries: numberOfRetry,
        }
      )

      results = results.concat(res.results)

      if (!res.has_more) {
        break
      }

      params['start_cursor'] = res.next_cursor as string
    }
  }

  return await Promise.all(
    results.map(async (blockObject) => {
      const children = await getAllBlocksByBlockId(blockObject.id)

      const column: Column = {
        Id: blockObject.id,
        Type: blockObject.type,
        HasChildren: blockObject.has_children,
        Children: children,
      }

      return column
    })
  )
}

async function _getSyncedBlockChildren(block: Block): Promise<Block[]> {
  let originalBlock: Block = block
  if (
    block.SyncedBlock &&
    block.SyncedBlock.SyncedFrom &&
    block.SyncedBlock.SyncedFrom.BlockId
  ) {
    try {
      originalBlock = await getBlock(block.SyncedBlock.SyncedFrom.BlockId)
    } catch (err) {
      console.log(`Could not retrieve the original synced_block. error: ${err}`)
      return []
    }
  }

  const children = await getAllBlocksByBlockId(originalBlock.Id)
  return children
}

function _validPageObject(pageObject: responses.PageObject): boolean {
  const prop = pageObject.properties
  console.log('检查页面对象:', {
    id: pageObject.id,
    hasTitle: !!prop.Page.title,
    titleLength: prop.Page.title?.length || 0,
    hasDate: !!prop.Date.date
  });

  const isValid = (
    !!prop.Page.title &&
    prop.Page.title.length > 0 &&
    !!prop.Date.date
  );

  if (!isValid) {
    console.log('页面对象无效:', {
      id: pageObject.id,
      reason: !prop.Page.title ? '缺少标题' :
              prop.Page.title.length === 0 ? '标题为空' :
              !prop.Date.date ? '缺少日期' : '未知原因'
    });
  }

  return isValid;
}

async function generateSlugIfNeeded(pageObject: responses.PageObject): Promise<string> {
  const prop = pageObject.properties;
  
  // 获取标题
  const title = prop.Page.title
    ? prop.Page.title.map((richText) => richText.plain_text).join('')
    : '';
    
  // 如果 Slug 已存在，则使用现有的
  if (prop.Slug.rich_text && prop.Slug.rich_text.length > 0) {
    return prop.Slug.rich_text.map((richText) => richText.plain_text).join('');
  } 
  
  // 否则，根据标题生成 slug
  if (title) {
    return await generateSlugFromTitle(title);
  }
  
  // 如果没有标题，返回空字符串
  return '';
}

function _buildPost(pageObject: responses.PageObject): Post {
  const prop = pageObject.properties
  console.log('开始构建文章:', {
    id: pageObject.id,
    title: prop.Page.title?.map((richText) => richText.plain_text).join('') || '无标题'
  });

  let icon: FileObject | Emoji | null = null
  if (pageObject.icon) {
    if (pageObject.icon.type === 'emoji' && 'emoji' in pageObject.icon) {
      icon = {
        Type: pageObject.icon.type,
        Emoji: pageObject.icon.emoji,
      }
    } else if (
      pageObject.icon.type === 'external' &&
      'external' in pageObject.icon
    ) {
      icon = {
        Type: pageObject.icon.type,
        Url: pageObject.icon.external?.url || '',
      }
    }
  }

  let cover: FileObject | null = null
  if (pageObject.cover) {
    cover = {
      Type: pageObject.cover.type,
      Url: pageObject.cover.external?.url || '',
    }
  }

  let featuredImage: FileObject | null = null
  if (prop.FeaturedImage.files && prop.FeaturedImage.files.length > 0) {
    if (prop.FeaturedImage.files[0].external) {
      featuredImage = {
        Type: prop.FeaturedImage.type,
        Url: prop.FeaturedImage.files[0].external.url,
      }
    } else if (prop.FeaturedImage.files[0].file) {
      featuredImage = {
        Type: prop.FeaturedImage.type,
        Url: prop.FeaturedImage.files[0].file.url,
        ExpiryTime: prop.FeaturedImage.files[0].file.expiry_time,
      }
    }
  }

  // 初始化FirstImage属性为null，稍后在获取文章内容时会尝试提取实际内容中的第一张图片
  let firstImage: FileObject | null = null;

  const title = prop.Page.title
    ? prop.Page.title.map((richText) => richText.plain_text).join('')
    : '';

  // 获取 Slug，如果为空则使用同步方式生成一个临时的
  let slug = '';
  if (prop.Slug.rich_text && prop.Slug.rich_text.length > 0) {
    slug = prop.Slug.rich_text.map((richText) => richText.plain_text).join('');
  } else if (title) {
    // 使用标题同步生成 slug（不含翻译）
    slug = generateSlugFromTitleSync(title);
  }

  const post: Post = {
    PageId: pageObject.id,
    Title: title,
    Icon: icon,
    Cover: cover,
    Slug: slug,
    Date: prop.Date.date ? prop.Date.date.start : '',
    Tags: prop.Tags.multi_select ? prop.Tags.multi_select : [],
    Excerpt:
      prop.Excerpt.rich_text && prop.Excerpt.rich_text.length > 0
        ? prop.Excerpt.rich_text.map((richText) => richText.plain_text).join('')
        : '',
    FeaturedImage: featuredImage,
    FirstImage: firstImage,
    Rank: prop.Rank.number ? prop.Rank.number : 0,
  }

  console.log('文章构建完成:', {
    id: post.PageId,
    title: post.Title,
    slug: post.Slug,
    date: post.Date,
    tags: post.Tags.length,
    hasFeaturedImage: !!post.FeaturedImage,
    hasCover: !!post.Cover,
    hasFirstImage: !!post.FirstImage
  });

  return post
}

function _buildRichText(richTextObject: responses.RichTextObject): RichText {
  const annotation: Annotation = {
    Bold: richTextObject.annotations.bold,
    Italic: richTextObject.annotations.italic,
    Strikethrough: richTextObject.annotations.strikethrough,
    Underline: richTextObject.annotations.underline,
    Code: richTextObject.annotations.code,
    Color: richTextObject.annotations.color,
  }

  const richText: RichText = {
    Annotation: annotation,
    PlainText: richTextObject.plain_text,
    Href: richTextObject.href,
  }

  if (richTextObject.type === 'text' && richTextObject.text) {
    const text: Text = {
      Content: richTextObject.text.content,
    }

    if (richTextObject.text.link) {
      text.Link = {
        Url: richTextObject.text.link.url,
      }
    }

    richText.Text = text
  } else if (richTextObject.type === 'equation' && richTextObject.equation) {
    const equation: Equation = {
      Expression: richTextObject.equation.expression,
    }
    richText.Equation = equation
  } else if (richTextObject.type === 'mention' && richTextObject.mention) {
    const mention: Mention = {
      Type: richTextObject.mention.type,
    }

    if (richTextObject.mention.type === 'page' && richTextObject.mention.page) {
      const reference: Reference = {
        Id: richTextObject.mention.page.id,
      }
      mention.Page = reference
    }

    richText.Mention = mention
  }

  return richText
}

// 更新页面的点赞数
export async function updatePostLikes(pageId: string, action: 'like' | 'unlike'): Promise<number> {
  try {
    console.log(`开始${action === 'like' ? '点赞' : '取消点赞'}文章，pageId:`, pageId);
    
    // 先获取当前页面以获取当前点赞数
    const response = await client.pages.retrieve({ page_id: pageId });
    
    // 使用类型断言获取当前点赞数，如果属性不存在或值为空则默认为0
    const pageObject = response as any;
    const currentLikes = pageObject.properties.Likes?.number || 0;
    console.log('当前点赞数:', currentLikes);
    
    // 根据操作类型计算新的点赞数
    const newLikes = action === 'like' ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    console.log('更新后的点赞数将为:', newLikes);
    
    // 更新页面的点赞数
    const updateResult = await client.pages.update({
      page_id: pageId,
      properties: {
        Likes: { number: newLikes }
      }
    });
    console.log('Notion API更新响应:', JSON.stringify(updateResult, null, 2));
    
    // 返回更新后的点赞数
    return newLikes;
  } catch (error) {
    console.error('更新页面点赞数失败:', error);
    throw error;
  }
}

// 获取页面的点赞数
export async function getPostLikes(pageId: string): Promise<number> {
  try {
    console.log('开始获取页面点赞数，pageId:', pageId);
    const response = await client.pages.retrieve({ page_id: pageId });
    console.log('Notion API响应:', JSON.stringify(response, null, 2));
    
    // 使用类型断言处理响应
    const pageObject = response as any;
    
    // 检查响应中的properties
    if (!pageObject.properties) {
      console.error('响应中没有properties属性:', pageObject);
      return 0;
    }
    
    // 检查Likes属性是否存在
    if (!pageObject.properties.Likes) {
      console.error('页面中没有Likes属性，请确认Notion数据库中是否有名为"Likes"的属性(注意大小写)');
      console.log('可用的属性:', Object.keys(pageObject.properties));
      return 0;
    }
    
    const likes = pageObject.properties.Likes?.number || 0;
    console.log('获取到的点赞数:', likes);
    return likes;
  } catch (error) {
    console.error('获取页面点赞数失败:', error);
    throw error;
  }
}
