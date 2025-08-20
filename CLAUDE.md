# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在处理此代码库时提供指导。

## 语言使用规范

**重要**: 所有与用户的对话和生成的文档必须使用中文。这是一个中文项目，用户期望得到中文回复。

## 开发命令

### 本地开发
```bash
# 启动本地开发服务器（选择其中一种）：
python -m http.server 8000
# 或者
npx serve .
# 或者使用 VS Code Live Server 扩展

# 访问应用程序
open http://localhost:8000
```

### 无构建系统
这是一个静态的 HTML/CSS/JavaScript 应用程序，无需构建过程、包管理器或安装依赖项。所有开发工作直接使用源文件进行。

## 应用架构

### 前端架构
- **纯静态单页应用**：使用原生 HTML5、CSS3 和 JavaScript 构建（无框架）
- **模块化设计**：6个独立的功能模块，可独立运行
- **基于类的状态管理**：`TranslationApp` 类管理应用状态和模块切换
- **响应式布局**：移动优先设计，支持桌面端和移动端

### 后端架构（无服务器）
- **Supabase Edge Functions**：使用 Deno 运行时的无服务器后端
- **API 代理服务**：位于 `supabase/functions/deepl-proxy/index.ts` 的 DeepL API 代理
- **双 API 集成**：
  - OpenRouter API 用于 AI 翻译（主要）
  - DeepL API 用于专业回译（可选）

### 数据存储
- **浏览器本地存储**：用户配置和词汇表存储在客户端
- **多用户支持**：每个浏览器支持多个 API 密钥配置
- **无数据库**：完全无状态的后端架构

## 项目文件结构

### 核心文件
- `index.html` - 主应用程序界面，包含所有模块定义
- `script.js` - 主应用程序逻辑、`TranslationApp` 类和模块处理器
- `api-integration.js` - API 集成层、用户管理、OpenRouter/DeepL 调用
- `styles.css` - 所有模块的完整响应式样式
- `prompts-config.js` - 基于角色的 AI 提示配置（包含中文字符）
- `config.js` - Supabase 配置和环境检测

### 后端服务
- `supabase/functions/deepl-proxy/index.ts` - 无服务器 DeepL API 代理，支持 CORS 处理
- `supabase/config.toml` - Supabase 本地配置

### 部署与CI/CD
- `.github/workflows/deploy.yml` - GitHub Pages 自动部署工作流

### 文档
- `README.md` - 中文完整功能文档
- `快速开始.md` - 中文快速入门指南
- `docs/github-pages-setup.md` - GitHub Pages 部署指南
- `docs/supabase-setup.md` - Supabase 配置指南

### 开发工具
- `.vscode/` - VS Code 编辑器配置
- `.gitignore` - Git 忽略文件配置

## 核心功能和模块

### 1. 中德翻译 (`cn-to-de`)
- 6种基于角色的翻译风格（男/女教授、男/女助理、男/女水军）
- 智能 Sie/Du（正式/非正式）检测和转换
- 自动回译验证
- 词汇管理，支持自定义术语翻译
- 备注清洗功能
- 去除短横线和表情符号处理

### 2. 德中翻译 (`de-to-cn`)
- 标准德语到中文翻译

### 3. OCR 图像识别 (`image-recognition`)
- 拖拽上传图片
- 剪贴板粘贴支持
- 从图片提取文本

### 4. Sie/Du 转换 (`du-sie-switch`)
- 德语正式/非正式代词转换

### 5. 德语语法检查 (`german-check`)
- AI 驱动的语法检查和优化

### 6. 德语助手 (`german-assistant`)
- 语法解释、词汇查询、文化背景

## AI 模型和配置

### 基于角色的模型
- **Gemini 2.5 Flash**：用于教授和公告助手角色
- **Mistral Small 3.2**：用于助手角色和社交媒体人物
- **模型选择**：在 `prompts-config.js` 中配置每个角色

### API 集成
- **OpenRouter**：翻译和聊天的主要 AI 服务
- **DeepL**：可选的专业翻译服务，用于回译

## 配置管理

### 用户 API 密钥
- 支持多用户，每个用户独立管理 API 密钥
- 本地存储持久化
- 通过齿轮图标访问设置模态框
- API 连接测试功能

### 环境配置
- 开发环境与生产环境检测
- `config.js` 中的 Supabase URL 和密钥
- GitHub Pages 部署配置

## 部署

### GitHub Pages（生产环境）
- 通过 `.github/workflows/deploy.yml` 自动部署
- 静态文件复制到构建目录
- 无需构建过程
- 推送到主分支时自动部署

### 本地测试
- 任何 HTTP 服务器都可以提供静态文件服务
- 通过 Supabase Edge Functions 处理 CORS
- 无需本地后端

## 项目清理总结

### 已清理的内容
- **移除冗余代码**：删除了 `script.js` 中的模拟函数（`simulateTranslation`、`simulateConversion` 等），这些早期占位符已被真实API调用替代
- **清理注释代码**：移除了 `prompts-config.js` 中被注释的旧版翻译规则
- **更新文档**：修正了 README.md 中的过时信息，准确反映6种角色而非7种

### 项目现状
- **代码精简**：移除了约100行不必要的模拟代码
- **文档一致**：所有文档现在准确反映实际功能
- **功能完整**：6个核心模块全部基于真实API实现，无占位符代码

## 开发指南

### 项目特点
- **零依赖管理**：无需 npm install 或包管理
- **直接编辑**：修改源码即时生效
- **浏览器兼容**：支持现代浏览器的ES6+特性
- **UTF-8编码**：`prompts-config.js` 包含中文字符，确保编码正确

### 调试信息
- 项目中保留了错误处理的 console 输出用于调试
- 生产环境中这些日志有助于问题诊断和监控