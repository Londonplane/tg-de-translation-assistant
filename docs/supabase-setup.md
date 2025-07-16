# Supabase设置指南

本指南将帮助您设置Supabase项目，替代Express代理服务。

## 📋 前置要求

1. Node.js 18+ 
2. npm 或 yarn
3. Supabase账户

## 🚀 步骤1：创建Supabase项目

### 1.1 注册Supabase账户
1. 访问 [Supabase官网](https://supabase.com)
2. 点击 "Start your project" 注册账户
3. 验证邮箱并登录

### 1.2 创建新项目
1. 在Dashboard中点击 "New Project"
2. 选择组织（个人账户即可）
3. 填写项目信息：
   - **项目名称**: `tg-de-translation`
   - **数据库密码**: 设置一个强密码（请记住）
   - **地区**: 选择离您最近的地区（推荐Singapore）
4. 点击 "Create new project"
5. 等待项目创建完成（约2分钟）

### 1.3 获取项目信息
项目创建完成后，在Dashboard中找到：
1. **Project URL**: 类似 `https://abcdefghijk.supabase.co`
2. **API Key (anon/public)**: 类似 `eyJhbGci...`

**⚠️ 请将这两个信息保存好，后面需要用到！**

## 🛠️ 步骤2：安装Supabase CLI

```bash
# 全局安装Supabase CLI
npm install -g supabase

# 验证安装
supabase --version
```

## 🔧 步骤3：初始化和部署

### 3.1 登录Supabase
```bash
# 登录您的Supabase账户
supabase login
```

### 3.2 连接项目
```bash
# 在项目根目录执行
supabase link --project-ref YOUR_PROJECT_ID
```
**注意**: `YOUR_PROJECT_ID` 是您的Project URL中的ID部分。例如URL是 `https://abcdefghijk.supabase.co`，则Project ID是 `abcdefghijk`。

### 3.3 部署Edge Function
```bash
# 部署DeepL代理函数
supabase functions deploy deepl-proxy

# 验证部署
supabase functions list
```

成功后您会看到：
```
┌─────────────┬─────────────┬─────────────────────────────────────────┐
│    NAME     │   STATUS    │                VERSION                  │
├─────────────┼─────────────┼─────────────────────────────────────────┤
│ deepl-proxy │  DEPLOYED   │ 1                                       │
└─────────────┴─────────────┴─────────────────────────────────────────┘
```

## ⚙️ 步骤4：配置应用

### 4.1 更新配置文件
编辑 `config.js` 文件，替换以下内容：

```javascript
const CONFIG = {
    // 替换为您的实际信息
    supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
    supabaseAnonKey: 'YOUR_ANON_KEY_HERE',
    
    // 其他配置保持不变...
};
```

### 4.2 测试Edge Function
在浏览器中访问：
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/deepl-proxy
```

应该看到CORS相关的响应，说明函数部署成功。

## 🧪 步骤5：本地测试

### 5.1 启动本地开发服务器
```bash
# 方法1：使用Python (推荐)
python -m http.server 8000

# 方法2：使用Node.js
npx serve .

# 方法3：使用Live Server (VS Code插件)
# 右键index.html -> Open with Live Server
```

### 5.2 测试功能
1. 打开浏览器访问 `http://localhost:8000`
2. 点击右下角的设置按钮 ⚙️
3. 添加用户配置，输入OpenRouter API密钥
4. 测试连接 - 应该显示成功

## 🔧 故障排除

### 常见问题

**Q: Edge Function部署失败**
```bash
# 检查Supabase CLI版本
supabase --version

# 重新登录
supabase logout
supabase login

# 检查项目连接
supabase projects list
```

**Q: CORS错误**
Edge Function已经配置了CORS头，如果仍有问题：
1. 确认函数已正确部署
2. 检查浏览器控制台错误信息
3. 验证配置文件中的URL是否正确

**Q: API密钥无效**
1. 确认使用的是 `anon/public` 密钥，不是 `service_role` 密钥
2. 检查密钥是否完整复制（通常很长）

### 获取帮助
- [Supabase官方文档](https://supabase.com/docs)
- [Edge Functions指南](https://supabase.com/docs/guides/functions)
- [GitHub Issues](../../issues) - 项目相关问题

## ✅ 下一步

配置完成后，您可以：
1. 继续配置GitHub Pages部署
2. 测试所有翻译功能
3. 移除Express相关文件

---

**💡 提示**: 保存好您的Supabase项目信息，建议创建一个安全的备份。 