import GithubSlugger from 'github-slugger';

const slugger = new GithubSlugger();

/**
 * 翻译服务接口
 */
interface TranslationService {
  translate(text: string, targetLang: string): Promise<string>;
}

/**
 * 谷歌翻译服务
 */
class GoogleTranslationService implements TranslationService {
  async translate(text: string, targetLang: string): Promise<string> {
    try {
      const { translate } = await import('@vitalets/google-translate-api');
      const result = await translate(text, { to: targetLang });
      return result.text;
    } catch (error) {
      console.error('谷歌翻译失败:', error);
      throw error;
    }
  }
}

/**
 * 简单的拼音转换服务（作为后备方案）
 * 当所有在线翻译服务都失败时使用
 */
class PinyinTranslationService implements TranslationService {
  // 简单的汉字转拼音映射（仅包含部分常用字作为示例）
  // 注意：完整的常用汉字有3500个以上，这里只列出少量示例
  private static readonly pinyinMap: Record<string, string> = {
    '的': 'de', '一': 'yi', '是': 'shi', '在': 'zai', '不': 'bu',
    '了': 'le', '有': 'you', '和': 'he', '人': 'ren', '这': 'zhe',
    '中': 'zhong', '大': 'da', '为': 'wei', '上': 'shang', '个': 'ge',
    '国': 'guo', '我': 'wo', '以': 'yi', '要': 'yao', '他': 'ta',
    '时': 'shi', '来': 'lai', '用': 'yong', '们': 'men', '生': 'sheng',
    '到': 'dao', '作': 'zuo', '地': 'di', '于': 'yu', '出': 'chu',
    '就': 'jiu', '分': 'fen', '对': 'dui', '成': 'cheng', '会': 'hui',
    '可': 'ke', '主': 'zhu', '发': 'fa', '年': 'nian', '动': 'dong',
    '同': 'tong', '工': 'gong', '也': 'ye', '能': 'neng', '下': 'xia',
    '过': 'guo', '子': 'zi', '说': 'shuo', '产': 'chan', '见': 'jian',
    '开': 'kai', '好': 'hao', '文章': 'wenzhang', '长': 'chang', '如': 'ru',
    '博': 'bo', '客': 'ke', '标': 'biao', '题': 'ti', '始': 'shi', 
    '你': 'ni', '旅': 'lv', '程': 'cheng'
  };

  async translate(text: string, targetLang: string): Promise<string> {
    try {
      // 尝试使用更智能的方法处理中文
      return this.convertToSlug(text);
    } catch (error) {
      console.error('拼音转换失败，使用基本方法:', error);
      // 如果智能方法失败，回退到基本方法
      return this.basicConvert(text);
    }
  }

  /**
   * 基本的字符转换方法
   */
  private basicConvert(text: string): string {
    // 将中文字符转换为拼音
    let result = '';
    for (const char of text) {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        // 如果是中文字符
        result += PinyinTranslationService.pinyinMap[char] || char;
      } else {
        // 非中文字符保持不变
        result += char;
      }
    }
    return result;
  }

  /**
   * 更智能的转换方法
   * 1. 提取中文文本的关键词
   * 2. 对关键词进行拼音转换
   * 3. 生成更有意义的 slug
   */
  private convertToSlug(text: string): string {
    // 简单的关键词提取（取前3-5个字）
    const maxKeywordLength = Math.min(5, text.length);
    const keyword = text.substring(0, maxKeywordLength);
    
    // 转换关键词
    let result = '';
    for (const char of keyword) {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        // 如果是中文字符
        result += PinyinTranslationService.pinyinMap[char] || char;
      } else {
        // 非中文字符保持不变
        result += char;
      }
    }
    
    // 添加时间戳确保唯一性
    const timestamp = new Date().getTime().toString().slice(-6);
    return `${result}-${timestamp}`;
  }
}

/**
 * 翻译服务工厂
 */
class TranslationServiceFactory {
  static getService(type: 'google' | 'pinyin' = 'google'): TranslationService {
    switch (type) {
      case 'google':
        return new GoogleTranslationService();
      case 'pinyin':
        return new PinyinTranslationService();
      default:
        return new GoogleTranslationService();
    }
  }
}

/**
 * 尝试使用多种翻译服务将文本翻译为目标语言
 * @param text 要翻译的文本
 * @param targetLang 目标语言
 * @returns 翻译后的文本
 */
async function translateWithFallback(text: string, targetLang: string): Promise<string> {
  // 定义翻译服务优先级
  const serviceTypes: Array<'google' | 'pinyin'> = ['google', 'pinyin'];
  
  for (const serviceType of serviceTypes) {
    try {
      const service = TranslationServiceFactory.getService(serviceType);
      return await service.translate(text, targetLang);
    } catch (error) {
      console.error(`使用 ${serviceType} 翻译失败，尝试下一个服务`, error);
      // 如果是最后一个服务，则返回原文
      if (serviceType === serviceTypes[serviceTypes.length - 1]) {
        console.error('所有翻译服务都失败，返回原文');
        return text;
      }
      // 否则继续尝试下一个服务
    }
  }
  
  // 如果所有服务都失败，返回原文
  return text;
}

/**
 * 将中文标题转换为英文 slug
 * @param title 中文标题
 * @param maxLength 最大长度限制，默认为 50
 * @returns 生成的 slug
 */
export async function generateSlugFromTitle(title: string, maxLength: number = 50): Promise<string> {
  try {
    // 检查标题是否包含中文字符
    const hasChinese = /[\u4e00-\u9fa5]/.test(title);
    
    let englishTitle = title;
    
    // 如果包含中文，则翻译为英文
    if (hasChinese) {
      try {
        englishTitle = await translateWithFallback(title, 'en');
      } catch (error) {
        console.error('翻译失败，使用原始标题:', error);
        // 如果翻译失败，使用原始标题
        englishTitle = title;
      }
    }
    
    // 使用 github-slugger 生成 slug
    slugger.reset();
    let slug = slugger.slug(englishTitle);
    
    // 限制 slug 长度
    if (slug.length > maxLength) {
      // 截取并确保不会在单词中间截断
      const words = slug.split('-');
      let result = '';
      
      for (const word of words) {
        if ((result + (result ? '-' : '') + word).length <= maxLength) {
          result += (result ? '-' : '') + word;
        } else {
          break;
        }
      }
      
      slug = result;
    }
    
    return slug;
  } catch (error) {
    console.error('生成 slug 失败:', error);
    // 如果出错，返回一个基于时间戳的 slug
    return `post-${Date.now()}`;
  }
}

/**
 * 同步版本的 slug 生成函数，用于无法使用异步函数的场景
 * 注意：此函数不会翻译中文，只会直接使用原始标题生成 slug
 */
export function generateSlugFromTitleSync(title: string, maxLength: number = 50): string {
  try {
    slugger.reset();
    let slug = slugger.slug(title);
    
    // 限制 slug 长度
    if (slug.length > maxLength) {
      const words = slug.split('-');
      let result = '';
      
      for (const word of words) {
        if ((result + (result ? '-' : '') + word).length <= maxLength) {
          result += (result ? '-' : '') + word;
        } else {
          break;
        }
      }
      
      slug = result;
    }
    
    return slug;
  } catch (error) {
    console.error('生成 slug 失败:', error);
    return `post-${Date.now()}`;
  }
} 