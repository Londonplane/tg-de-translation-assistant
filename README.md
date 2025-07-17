# 中德翻译助手

一个现代化的中德翻译单页面应用，提供多种翻译和德语学习功能。

## 🎯 主要功能

1. **中译德模块** 🇨🇳➡️🇩🇪
   - 7种角色翻译风格：教授、女助理(25/35岁)、公告助理、水军(1/2/3/4号)
   - 智能人称检测(Sie/Du)
   - 自动回译验证
   - 一键复制功能

2. **德译中模块** 🇩🇪➡️🇨🇳
   - 德语文本翻译成中文

3. **Du/Sie切换模块** 👤↔️
   - 德语人称形式转换

4. **德语检查模块** ✏️
   - AI语法检查和优化建议

5. **德语助手模块** 🤖
   - 语法解释、词汇查询、文化背景知识

## 🚀 快速开始

### 在线使用（推荐）
直接访问部署的网站：`https://[用户名].github.io/[仓库名]`

### 本地运行
```bash
# 下载项目
git clone <repo-url>
cd tg-de-translation-assistant

# 启动本地服务器
python -m http.server 8000
# 或者
npx serve .

# 访问应用
open http://localhost:8000
```

### 配置API密钥
1. 点击右下角设置按钮 ⚙️
2. 添加用户配置：
   - **OpenRouter API密钥**：用于AI翻译（必需）
   - **DeepL API密钥**：用于专业回译（可选）
3. 测试连接确保配置正确

## 🎭 角色特色

- 🎓 **教授**：正式学术风格，C1-C2语法水平
- 👩‍🎓 **25岁女助理**：年轻活泼，口语化表达
- 👩‍💼 **35岁女助理**：成熟稳重，专业可信
- 📢 **公告女助理**：简洁正式，公告风格
- 🗣️ **水军1-4号**：不同情绪和互动风格的社群表达

## 📱 技术特性

- **前端**：HTML5 + CSS3 + 原生JavaScript（无框架依赖）
- **后端**：Supabase Edge Functions（无服务器）
- **部署**：GitHub Pages（静态托管）
- **API**：OpenRouter AI + DeepL（可选）
- **特色**：响应式设计，支持多用户API管理

## 📁 核心文件

```
├── index.html              # 主页面
├── script.js               # 主应用逻辑
├── styles.css              # 样式文件
├── api-integration.js      # API集成模块
├── prompts-config.js       # 角色提示词配置
├── config.js               # 应用配置
├── 快速开始.md             # 快速开始指南
└── docs/                   # 详细文档
    ├── github-pages-setup.md
    └── supabase-setup.md
```

## 🔧 自定义配置

- 编辑 `prompts-config.js` 可修改角色提示词
- 编辑 `config.js` 可修改Supabase配置
- 无需重启，保存后立即生效

## 💰 成本分析

- **GitHub Pages**：免费（公开仓库）
- **Supabase**：免费额度（50万次/月函数调用）
- **总运营成本**：**0元**（在免费额度内）

## 📋 功能状态

✅ **完整功能**：多用户管理、7种个性化角色、智能人称检测  
✅ **双模型支持**：Gemini 2.5 Flash + Mistral Small 3.2  
✅ **质量保证**：回译验证、人称检测、错误处理  
✅ **用户体验**：响应式设计、状态监控、配置管理  

## 🔗 获取API密钥

- **OpenRouter**：访问 [OpenRouter.ai](https://openrouter.ai) 注册并获取API密钥
- **DeepL**：访问 [DeepL API](https://www.deepl.com/pro-api) 获取免费API密钥

---

**项目状态**：🟢 生产就绪，全功能运行  
**版本**：v3.0 - 无服务器架构翻译助手  
**架构**：Supabase + GitHub Pages（完全静态化） 