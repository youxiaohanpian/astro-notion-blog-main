# Notion、CMS、astro-notion-blog、Vercel - necco Note｜necco inc.

Status: In progress
Type: Article

我通过中国人的这个博客，看到了关于介绍如何搭建一个博客：

https://astro-notion-blog-31g.pages.dev/posts/introduction-of-astro-notion-blog/ 

找到了下面然后我找到了这个日本妹子的网站：

https://necco.inc/note/19508

然后因为语言关系，将其翻译成了中文：

同时，本文参考了：[使用 Notion 作为内容源构建 Astro 5 开发者博客 --- Building a developer blog with Astro 5 using Notion for content (samuelhorn.com)](https://www.samuelhorn.com/posts/astro-blog-using-notion/)

**指数**

1. [制备](https://necco.inc/note/19508#heading0)
2. [在本地环境中确认作](https://necco.inc/note/19508#heading1)
3. [将您的 Git 存储库与 Vercel 集成](https://necco.inc/note/19508#heading2)
4. [设置您自己的域](https://necco.inc/note/19508#heading3)
5. [设置自定义域](https://necco.inc/note/19508#heading4)
6. [创建部署链接](https://necco.inc/note/19508#heading5)
7. [按时部署](https://necco.inc/note/19508#heading6)
8. [Astro 的安排很直观。](https://necco.inc/note/19508#heading7)
9. [使用 Notion 作为博客 CMS 是什么感觉](https://necco.inc/note/19508#heading8)
10. [astro-notion-blog 的精彩之处](https://necco.inc/note/19508#heading9)
11. [贡献](https://necco.inc/note/19508#heading10)
12. [更新将继续（计划）](https://necco.inc/note/19508#heading11)

[**astro-notion-blog**](https://github.com/otoyo/astro-notion-blog) 于 2023 年 1 月 23 日发布，它利用 Notion 作为 CMS，并使用 Astro 作为框架来生成博客网站。

> 写博客就是关于速度的。astro-notion-blog 是一个新的 Notion 博客，专为这些坚忍和有专家头脑的人创建。https://alpacat.com/blog/introduction-of-astro-notion-blog/
> 

astro-notion-blog README.md 介绍了 Cloudflare Pages 作为部署目的地，但这次我试图看看是否可以部署到 Vercel。

已完成的博客网站：[**LIMA note**](https://scrap.lima.world/)

### **为什么选择 Vercel？**

主要原因是我每天都在使用 Vercel。 Vercel 仪表板很漂亮。

## **制备**

第一步是将[**默认的 Notion 数据库**](https://www.notion.so/e2c5fa2e8660452988d6137ba57fd974?pvs=21)复制到你的 Notion 中，如 [**astro-notion-blog README.md**](https://github.com/otoyo/astro-notion-blog) 中所述。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-km1.png)

从重复页面的 URL 中提取数据库 ID，并将其记为`DATABASE_ID`

```
<https://notion.so/your-account/><ここがデータベースID>?v=xxxx
```

从 [**Notion 的 My integrations**](https://www.notion.so/my-integrations) 页面创建新集成，并将生成的 “Internal Integration Token” 记为 。`NOTION_API_SECRET`

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-kpo-1.png)

打开 Notion 页面并连接您刚刚创建的集成。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-l19.png)

[**fork astro-notion-blog GitHub 存储库**](https://github.com/otoyo/astro-notion-blog)并将 fork 的存储库克隆到您的 PC。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230211-qbq.png)

Fork 仓库

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230211-qf1.png)

单击 Code 按钮，然后从显示的选项中选择克隆方法。

之后，官方 README.md 介绍了从这里将 Git 存储库链接到 Cloudflare Pages 的过程，但我想将其连接到 Vercel，所以我将在本地检查作。

## **在本地环境中确认作**

官方推荐将 yarn 作为包管理器，但我是 npm 用户，所以我将使用 npm 安装它并启动 Astro。

```
npm i
npm run dev
```

Astro 已成功启动（良好）。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-kwp-1.png)

但是，此时我们还没有设置环境变量，因此文章不会显示，并且当我们尝试过渡到博客页面时，会出现错误。

【2023/03/06 更新】最新版本的 astro-notion-blog 不再包含 dotenv，所以请先安装 dotenv 再进行以下步骤`npm i dotenv`

在项目文件夹下，创建一个新文件并填写您记下的环境变量。`.env.local`

```
DATABASE_ID="XXXXXXXXXXXXXXX"
NOTION_API_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

- .env.local 包含应保密的信息，因此请勿将其提交/推送到 GitHub。 [**您可以将 .env.local 添加到您的 .gitignore 中**](https://qiita.com/sf213471118/items/efbc0abf028a3ead72e7)，以便您可以在提交时忽略该文件。

配置完成后，在 中重新启动 Astro。`npm run dev`

文章也被安全地展示出来了！

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-lgy.png)

博客名称和博客描述在 中定义。 根据需要重写。`src/server-constants.ts`

在同一文件中，您还可以设置要在一个页面上显示的文章数量和 Google Analytics 的跟踪 ID。 到处都是。

```
export const NOTION_API_SECRET = import.meta.env.NOTION_API_SECRET
export const DATABASE_ID = import.meta.env.DATABASE_ID
export const PUBLIC_GA_TRACKING_ID = import.meta.env.PUBLIC_GA_TRACKING_ID
export const NUMBER_OF_POSTS_PER_PAGE = 10

export const PUBLIC_SITE_TITLE = 'astro-notion-blog'
export const PUBLIC_SITE_DESCRIPTION = 'astro-notion-blog is generated statically by Astro'

```

## **将您的 Git 存储库与 Vercel 集成**

在 Vercel 中，单击 Add New... 从 → Project 中，创建一个新项目并导入您刚刚创建的 Git 存储库。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230211-r3q.png)

将 Environment Variables 设置为并按下底部的 Deploy 按钮。`DATABASE_IDNOTION_API_SECRET`

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/vercel-1.png)

… 哦，我的上帝！ 我能够在🎉不更改任何设置的情况下部署（发布）到 Vercel

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-lgy.png)

看起来它已经完成，但它需要一些额外的配置才能正确显示 OGP 信息。 此外，我们还将设置自己的域。

## **设置您自己的域**

在 Vercel 上，我们将设置自己的域。 在这种情况下，我们将设置一个子域。

转到设置 → 域 （1），输入要设置的域名 （2），然后按添加按钮 （3）。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-p14.png)

在你正在使用的域公司的管理屏幕上，添加 Vercel 上显示的 CNAME 记录。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-p1q.png)

由于我使用的是 Google Domains，因此设置如下。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-p35.png)

设置以上内容后，返回 Vercel 管理屏幕。 一旦 CNAME 设置生效，SSL 证书的颁发将开始，您自己的域的设置将完成。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-p50.png)

现在配置已完成，将选中 Valid Configuration （有效配置）。

## **设置自定义域**

在项目文件夹下有一个可以直接设置的地方。 在此处设置您自己的域。* 如果您不想设置自己的域名，请设置 Vercel 的初始公有域名。`astro.config.jsCUSTOM_DOMAIN`

此外，将 CloudFlare 的设置替换为 Vercel 的设置，并删除接下来的三行`process.env.CF_PAGESprocess.env.VERCEL_URL`

代码将如下所示：

```
const CUSTOM_DOMAIN = "scrap.lima.world"; // <- Set your costom domain if you have. e.g. alpacat.com

const getSite = function () {
  if (!process.env.VERCEL_URL) {
    return "<http://localhost:3000>";
  }

  if (CUSTOM_DOMAIN) {
    return `https://${CUSTOM_DOMAIN}`;
  }

  return `https://${process.env.VERCEL_URL}`;
};

```

- [**单击此处了解有关 Vercel 环境变量的详细信息。**](https://vercel.com/docs/concepts/projects/environment-variables)

保存代码，将其推送到 GitHub，Vercel 将开始部署。

就是这样，您已经建立了您的博客！

## **创建部署链接**

当您在 Notion 中创建或更改文章时，astro-notion-blog 不会立即反映在公共站点上。 只有当您使用 Vercel 部署它时，它才会反映在公共站点上。

虽然在 Notion 中放置指向 Vercel 仪表板的链接并通过按下仪表板上的 Re-deploy 按钮进行更新是一个好主意，但您可以使用 Vercel 的部署钩子，只需单击 Notion 页面的 URL，即可激活部署。

在 Git （1） →打开 Vercel 的 Project Settings（项目设置）。 在 Deploy Hooks 中，指定 Hook 的名称和分支名称 （2），然后单击 Create Hook 按钮 （3） 以创建新的部署挂钩。

- 在屏幕截图中，我忘记指定分支名称，但指定了 main。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-lr1.png)

创建部署挂钩后，单击 Copy （复制） 按钮以复制部署挂钩的 URL。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-lrm.png)

在 Notion 中，打开您博客的数据库页面，并将您刚刚复制的 URL 作为链接放在熟悉的地方。 单击此链接时，您将能够发布文章。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-lti.png)

单击该链接时，将显示文本，如下所示。 单击后的屏幕上，状态显示为 Pending （待处理），但如果您检查 Vercel 仪表板，则可以看到正在应用部署。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-lva.png)

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230128-lve.png)

## **按时部署**

如果您忘记按下发布按钮，您可以通过将上面获取的部署钩子与 GitHub Actions 相结合，轻松按时部署。 以下 wiki 中介绍了详细信息。

- [**使用 GitHub Actions 手动部署**](https://github.com/otoyo/astro-notion-blog/wiki/GitHub-Actions-%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%9F%E6%89%8B%E5%8B%95%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4)
- [**使用 GitHub Actions 的计划部署**](https://github.com/otoyo/astro-notion-blog/wiki/GitHub-Actions-%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%9F%E5%AE%9A%E6%99%82%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4)

## **Astro 的安排很直观。**

Astro 是一个简单的框架。 如果您曾经使用过像 Jekyll 这样的静态站点生成器，您很快就会明白它。 动态路由还具有使用 getStaticPaths 函数等功能，该函数类似于 Next.js，如果您同时具有这两种功能，则更容易理解。 为了生成 HTML 页面，我觉得 Astro 是一个充分利用了所有现有网站生成器的框架。

在查看代码时，我添加了以下排列。

- HTML 中的结构更改（标题）
- 大量样式
- 在主页上列出文章（不是固定内容页面）

astro-notion-blog 具有所有必要的功能，并且结构简单，因此很容易安排。

- 如果你正在考虑切换到 Next.js → Astro，我们还推荐文章 “[**在 Next.js 中如何处理 Astro**](https://blog.ojisan.io/next-astro/)”。

## **使用 Notion 作为博客 CMS 是什么感觉**

这一次，我从我过去创建的 WordPress 网站中迁移了几页内容，该网站现已关闭。 WordPress 也是世界上最著名的 CMS，所以我将它命名为比较（没有其他方式......！ ）

### **Notion 很容易写**

就写作的便利性而言，我发现 Notion 比 WordPress 更容易编写。 WordPress 块编辑器使用起来稍微复杂一些，因为它不仅适用于撰写博客文章，还设计用于多种用途，例如静态页面布局。 另一方面，Notion 使 body 列保持简单，因为它专门用于创建文档。

在智能手机上撰写或查看文章时，例如在旅途中时，我发现使用 Notion 的原生应用程序写作比在浏览器中登录 WordPress 更容易。 其实这篇 necco 博文也是在 Notion 中起草的，当手稿完成后，它会发布到 WordPress。 WordPress 不支持多人同时编辑同一篇文章，但 Notion 支持，因此很容易编写。

此外，如果您想在发布文章之前与外部用户共享文章并让他们更正文章，Notion 可以使用内置的页面共享和评论功能。

此外，与无头 CMS 相比，Notion 和 astro-notion-blog 都实现了“书签显示（博客卡片）”。 乍一看，实现起来似乎很简单，但实际上，要做的事情很多，而且很难......

### **Notion 是一个数据库**

我相信 Notion 是一个数据库。 如果您考虑结构、创建属性、适当关联它们并作它们，它将是一个**可以非常容易地管理和作且预算低的数据库**（我喜欢它）。 出于这个原因，我觉得 astro-notion-blog 也是可扩展的，因为你可以根据自己的想法自由添加你喜欢的分类和功能。 与 WordPress 本身提供的元字段相比，它很容易进入。

但是**，尽管它是一个数据库，但它不是输入表单**。 property 和 body 都不能有 required 字段。 此外，无法验证输入内容。 如果你松散地单独作它没有问题，但如果你开始与多人一起作它，你可能需要一本手册。 此外，有必要在正面进行处理，这样无论传递什么值都不会导致错误。

### **Notion 文本的局限性**

Notion 最初并不是作为在 Web 上发布内容的工具而创建的，因此我仍然觉得与 WordPress 等 CMS 相比，它受到限制。

例如，它没有 “arbitrary HTML/script insertion block”，因此无法粘贴附属部分。 此外，您不能更改每个部分的背景颜色、提供特殊装饰或使链接看起来像按钮。

如果你想实现它，你需要创建自己的类似短代码的机制，并在 Astro 端解析 Notion 文本并对其进行处理。 如果你真的想实现它，它很可能是一种模仿现有 Notion 工具用来构建网站的方法的形式（尽管我不能说这是剽窃......！ ）

此外，如果您的公共站点的设计或配色方案与 Notion 截然不同，则可能需要实施预览，因为您无法调整它在 Notion 中的外观。 特别是，如果背景颜色为黑色而正文为白色，则可能难以书写。 使用 WordPress，您可以应用与公共站点的配色方案匹配的编辑器样式。 如果您使用 Notion 作为 CMS，最好让您的公共页面的设计尽可能接近 Notion，这样您就不需要预览功能。

另外，我觉得很难安排一些内容进行续费，比如说 Notion 没有“版本”的概念，也没有在指定时间打部署钩子的功能。 我认为如果你努力工作，你就无法自己制作...... 使用 WordPress，这些更改可以通过插件和主题功能来处理。

### **何时使用**

我觉得它非常适合个人博客。 您可以免费使用 Notion，如果您是非营利组织，也可以免费使用 Vercel。 在 Notion 中编写很容易，也很容易维护，因为没有管理成本。 我还借此机会恢复了我的爱好博客。 写起来太容易了。

我也认为它适合构建以文本为中心的网站，例如总结常见问题的支持网站。

## **astro-notion-blog 的精彩之处**

astro-notion-blog 经过精心设计且易于安排。

其实我过去也研究过 API，看看能不能把 Notion 当作 CMS 来用，但当时我就放弃了，因为文本的规范非常复杂，这太重了，不能用于业余爱好。 如果 Notion 的 API 以 HTML 格式返回整个正文，则很容易安排，但它旨在返回每个文本块的内容，我必须编写一个对应于每个文本块的进程。 此外，一次可以检索的区块数量和访问 API 的频率是有上限的，因此需要采取各种措施。

我并不觉得 Notion 的 API 文档很广泛（虽然我很庆幸它被公开了），我觉得我自己处理不了。

astro-notion-blog 已经支持基本的块结构，所以我不必创建自己的块结构，所以我非常感谢能够使用它们。 它还支持在 Twitter、YouTube 等上嵌入...... 但是，您似乎需要制作自己的其他不是那么重要的嵌入块。 如果我自己做，我想向 astro-notion-blog 发送一个 pull request。

### **还支持更快的构建。**

随着 astro-notion-blog 的 v0.2 更新，它还支持使用名为 [**Nx Cloud**](https://nx.app/) 的服务进行更快的构建。 详情在[**“astro-notion-blog v0.2 更新内容介绍**](https://alpacat.com/blog/astro-notion-blog-02/)”一文中进行了解释，但似乎可以在 Cloudflare Pages 等远程构建时使用本地生成的缓存来高速构建。 了不起！

我立即根据 [**wiki 上发布的程序**](https://github.com/otoyo/astro-notion-blog/wiki/%E3%83%93%E3%83%AB%E3%83%89%E3%81%AE%E9%AB%98%E9%80%9F%E5%8C%96%28%E8%A8%98%E4%BA%8B%E6%95%B0%E3%81%8C%E5%A4%9A%E3%81%84%E4%BA%BA%E5%90%91%E3%81%91%29)进行了设置。

由于我使用的是 npm，因此该命令将更改为以下表示法。

```
npm i && npx nx g @nrwl/nx-cloud:init
npm run cache:fetch
```

此外，由于它将设置为 Vercel，因此在以下屏幕中设置了环境变量。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230212-ius.png)

设置 - > 环境变量

构建命令也将从下面的屏幕中更改。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230212-ivn.png)

设置 -> 通用 -> 构建和开发设置

不过，也许是因为我的博客只有 8 篇文章，好处不多，而且构建时间也差不多......！ 当文章很多时，它似乎很有效。

（如果你用 Nx Cloud 检查，它是 remote-cache-hit，所以应该自己做设置。

### **介绍程序的说明亲切**

仓库 README.md 详细解释了如何安装它，还有一个 [**wiki**](https://github.com/otoyo/astro-notion-blog/wiki)。 此外，我们[**接受您希望我们添加的文件请求**](https://github.com/otoyo/astro-notion-blog/issues/32)。 还有一个 [**Twitter 社区**](https://twitter.com/i/communities/1618017732653613056)，未来似乎会有更多的用户之间的互动。

## **贡献**

astro-notion-blog 有一个区域，你可以在文章详情页面上显示标签。 最初的标签设计是一个简单的链接样式。 我想确保我在 Notion 中设置的标签颜色反映在博客端。

更改前的标签设计

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230131-svk.png)

`src/lib/notion/client.ts`由于我们正在格式化从 house 中的 API 获取的数据，因此我们在格式化时更改了代码以包含标签的颜色信息。 此外，我们还更改了标签显示的 HTML 和 CSS，以便它可以根据获取的数据以 Notion 样式显示。

Notion 的标签设计

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230131-vdd.png)

也许还有其他人想以同样的方式看待它？ 所以我发送了一个 pull request，他们全心全意地接受了它！

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230211-pyp.png)

目前，标签的颜色已更改，不仅反映详细信息页面，还反映侧边栏中的类别（标签）列表。

### **关于 Notion 中的标签**

当您在 Notion 中添加标签时，标签会自动着色。 此标签的 UI 是 Notion 独有的原因之一。 我从未在其他服务中看到过在添加标签或类别时 “任意分配颜色” 的任何内容。 看到自动变得彩色的标签列表很有趣。

## **更新将继续（计划）**

截至今天撰写本文时，0.3 版本正在开发中。

![](https://wordpress.necco.inc/wp-content/uploads/2023/02/SCR-20230213-x79.png)

其实我本来打算在这个里面实现“文件块支持”，但是有一个我没想到的陷阱，“上传到 Notion 的文件的链接在 1 小时后过期”，我无法回应，因为（我的）时间已过期...... 我将接力棒交给开发者 otoyo，🙏我很抱歉你的三心二意。

astro-notion-blog也有一个pluriku欢迎和社区，所以如果你有兴趣，为什么不加入我们呢？

如果时间和时间允许，我想跟随我的直觉，参与我认为很棒的项目和产品。

我期待看到它在未来如何发展！