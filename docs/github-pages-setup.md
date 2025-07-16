# GitHub Pages 部署指南

## 概览

此项目现在已经完全迁移到静态架构，可以通过GitHub Pages免费托管。后端API通过Supabase Edge Functions提供服务。

## 部署步骤

### 1. 推送代码到GitHub

确保你的代码已经推送到GitHub仓库的`main`分支：

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### 2. 启用GitHub Pages

1. 访问你的GitHub仓库页面
2. 点击 **Settings** 标签
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 部分，选择 **GitHub Actions**
5. 保存设置

### 3. 配置部署权限

确保GitHub Actions有部署权限：

1. 在仓库的 **Settings** → **Actions** → **General**
2. 在 **Workflow permissions** 部分
3. 选择 **Read and write permissions**
4. 勾选 **Allow GitHub Actions to create and approve pull requests**
5. 点击 **Save**

### 4. 触发首次部署

部署会在以下情况自动触发：
- 推送代码到`main`分支
- 创建针对`main`分支的Pull Request

你也可以手动触发：
1. 进入 **Actions** 标签
2. 选择 **Deploy to GitHub Pages** 工作流
3. 点击 **Run workflow**

### 5. 访问部署的网站

部署完成后：
1. 在 **Actions** 标签中查看部署状态
2. 部署成功后，在 **Settings** → **Pages** 中会显示网站URL
3. 通常格式为：`https://[username].github.io/[repository-name]`

## 配置检查

### Supabase配置

确保`config.js`中的Supabase配置正确：

```javascript
window.CONFIG = {
    supabaseUrl: 'https://lztrfhjkivzckqisgrcc.supabase.co',
    supabaseAnonKey: 'your-anon-key-here'
};
```

### DeepL API配置

确保在前端界面中正确配置了DeepL API密钥。

## 故障排除

### 部署失败

1. 检查 **Actions** 标签中的错误日志
2. 确保所有必需文件都已提交
3. 验证工作流文件语法正确

### 网站无法访问

1. 确认GitHub Pages已启用
2. 检查仓库是否为公开仓库（私有仓库需要付费计划）
3. 等待DNS传播（最多10分钟）

### API调用失败

1. 验证Supabase Edge Function是否正常运行
2. 检查浏览器开发者工具中的网络请求
3. 确认DeepL API密钥配置正确

## 自定义域名（可选）

如果你有自定义域名：

1. 在 **Settings** → **Pages** 中配置自定义域名
2. 在你的DNS提供商处添加CNAME记录
3. 等待SSL证书自动配置

## 监控和维护

- 部署历史可在 **Actions** 标签中查看
- 每次推送都会自动部署新版本
- Supabase提供Edge Function的使用统计

## 成本分析

- **GitHub Pages**: 免费（公开仓库）
- **Supabase**: 免费额度（每月50万Edge Function调用）
- **域名**: 可选，需要单独购买

总运营成本：**0元**（在免费额度内） 