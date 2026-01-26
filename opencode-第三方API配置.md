# OpenCode 第三方中转 API 配置指南

## 配置步骤

1. **运行 `/connect` 命令**，选择 "Other"
2. **输入提供商 ID**（如 `myproxy`）
3. **输入你的 API token**
4. **创建 `opencode.json` 配置文件**：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "myproxy": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "我的中转API",
      "options": {
        "baseURL": "https://你的中转地址.com/v1"
      },
      "models": {
        "gpt-4": {
          "name": "GPT-4"
        },
        "gpt-3.5-turbo": {
          "name": "GPT-3.5 Turbo"
        }
      }
    }
  }
}
```

## 关键配置项

- **baseURL**: 你的中转 API 地址
- **npm**: 使用 `@ai-sdk/openai-compatible`（适用于 OpenAI 兼容的 API）
- **models**: 配置你支持的模型名称

## 使用方法

配置完成后运行 `/models` 命令即可选择模型。

## 注意事项

- 配置文件通常放在项目根目录或 `~/.config/opencode/` 目录
- 确保中转地址兼容 OpenAI API 格式
- token 会在 `/connect` 时安全存储