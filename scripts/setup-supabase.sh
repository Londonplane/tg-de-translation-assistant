#!/bin/bash

# Supabase项目自动设置脚本
echo "🚀 开始设置Supabase项目..."

# 检查是否安装了必要工具
check_dependencies() {
    echo "📋 检查依赖..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装"
        exit 1
    fi
    
    echo "✅ 依赖检查通过"
}

# 安装Supabase CLI
install_supabase_cli() {
    echo "📦 安装Supabase CLI..."
    
    if command -v supabase &> /dev/null; then
        echo "✅ Supabase CLI 已安装: $(supabase --version)"
    else
        echo "正在安装Supabase CLI..."
        npm install -g supabase
        
        if command -v supabase &> /dev/null; then
            echo "✅ Supabase CLI 安装成功: $(supabase --version)"
        else
            echo "❌ Supabase CLI 安装失败"
            exit 1
        fi
    fi
}

# 引导用户配置
configure_project() {
    echo ""
    echo "⚙️ 项目配置"
    echo "请按照以下步骤配置您的Supabase项目："
    echo ""
    echo "1. 访问 https://supabase.com 并创建账户"
    echo "2. 创建新项目 (项目名: tg-de-translation)"
    echo "3. 获取项目URL和API密钥"
    echo ""
    
    read -p "📝 请输入您的Supabase项目URL (例: https://abcdefghijk.supabase.co): " SUPABASE_URL
    read -p "🔑 请输入您的Supabase匿名密钥 (anon key): " SUPABASE_ANON_KEY
    
    if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" ]]; then
        echo "❌ URL和密钥不能为空"
        exit 1
    fi
    
    # 提取项目ID
    PROJECT_ID=$(echo $SUPABASE_URL | sed 's/.*\/\/\([^.]*\).*/\1/')
    echo "📋 检测到的项目ID: $PROJECT_ID"
}

# 更新配置文件
update_config() {
    echo "📝 更新配置文件..."
    
    # 备份原配置文件
    if [ -f "config.js" ]; then
        cp config.js config.js.backup
        echo "✅ 已备份原配置文件为 config.js.backup"
    fi
    
    # 更新config.js
    sed -i.bak "s|https://your-project-id.supabase.co|$SUPABASE_URL|g" config.js
    sed -i.bak "s|your-anon-key-here|$SUPABASE_ANON_KEY|g" config.js
    
    # 清理临时文件
    rm -f config.js.bak
    
    echo "✅ 配置文件已更新"
}

# 登录和连接项目
setup_supabase_connection() {
    echo "🔐 设置Supabase连接..."
    
    echo "请在浏览器中完成Supabase登录..."
    supabase login
    
    if [ $? -eq 0 ]; then
        echo "✅ Supabase登录成功"
    else
        echo "❌ Supabase登录失败"
        exit 1
    fi
    
    echo "🔗 连接到项目..."
    supabase link --project-ref $PROJECT_ID
    
    if [ $? -eq 0 ]; then
        echo "✅ 项目连接成功"
    else
        echo "❌ 项目连接失败，请检查项目ID是否正确"
        exit 1
    fi
}

# 部署Edge Function
deploy_edge_function() {
    echo "🚀 部署Edge Function..."
    
    supabase functions deploy deepl-proxy
    
    if [ $? -eq 0 ]; then
        echo "✅ Edge Function部署成功"
        echo ""
        echo "🔗 Function URL: $SUPABASE_URL/functions/v1/deepl-proxy"
    else
        echo "❌ Edge Function部署失败"
        exit 1
    fi
}

# 验证部署
verify_deployment() {
    echo "🧪 验证部署..."
    
    echo "正在测试Edge Function..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/functions/v1/deepl-proxy")
    
    if [ "$HTTP_STATUS" = "405" ] || [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ Edge Function响应正常 (HTTP $HTTP_STATUS)"
    else
        echo "⚠️ Edge Function可能未正确部署 (HTTP $HTTP_STATUS)"
    fi
}

# 完成提示
completion_message() {
    echo ""
    echo "🎉 Supabase设置完成！"
    echo ""
    echo "📋 设置摘要:"
    echo "   项目URL: $SUPABASE_URL"
    echo "   项目ID: $PROJECT_ID"
    echo "   Function URL: $SUPABASE_URL/functions/v1/deepl-proxy"
    echo ""
    echo "🚀 下一步:"
    echo "   1. 启动本地服务器: python -m http.server 8000"
    echo "   2. 访问: http://localhost:8000"
    echo "   3. 配置OpenRouter API密钥"
    echo "   4. 测试翻译功能"
    echo ""
    echo "📖 详细文档: docs/supabase-setup.md"
    echo ""
}

# 主执行流程
main() {
    echo "==============================================="
    echo "🇩🇪 中德翻译助手 - Supabase设置脚本"
    echo "==============================================="
    echo ""
    
    check_dependencies
    install_supabase_cli
    configure_project
    update_config
    setup_supabase_connection
    deploy_edge_function
    verify_deployment
    completion_message
}

# 执行主函数
main 