import type { Block, RichText } from '../interfaces'

/**
 * 从富文本数组中提取纯文本内容
 */
export function getTextContent(richTexts: RichText[] | undefined): string {
  if (!richTexts || richTexts.length === 0) {
    return ''
  }
  return richTexts.map(richText => richText.PlainText || '').join('')
}

/**
 * 从区块 URL 中提取文本内容
 */
export function getTextContentFromUrl(blockUrl: string | undefined): string {
  if (!blockUrl) {
    return ''
  }
  return blockUrl
} 