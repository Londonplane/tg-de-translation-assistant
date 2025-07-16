// 配置文件 - 请根据您的Supabase项目信息修改
const CONFIG = {
    // Supabase配置 - 需要您替换为实际的项目信息
    supabaseUrl: 'https://lztrfhjkivzckqisgrcc.supabase.co', // 替换为您的Supabase项目URL
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHJmaGpraXZ6Y2txaXNncmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODA5MzQsImV4cCI6MjA2ODE1NjkzNH0.AU5H7J_FcFDRO_lP6yFerqcEcB7bDqjWZ_GCZ3VZWWk', // 替换为您的Supabase anon key
    
    // OpenRouter配置
    openRouterBaseURL: 'https://openrouter.ai/api/v1/chat/completions',
    
    // 应用信息
    appName: '中德翻译助手',
    version: '2.0.0',
    
    // 开发环境配置
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // GitHub Pages配置（生产环境）
    githubPagesUrl: 'https://your-username.github.io/your-repo-name' // 替换为您的GitHub Pages URL
};

// 获取Supabase Edge Function URL
CONFIG.getDeepLProxyURL = function() {
    return `${this.supabaseUrl}/functions/v1/deepl-proxy`;
};

// 获取环境信息
CONFIG.getEnvironment = function() {
    return this.isDevelopment ? 'development' : 'production';
};

// 验证配置
CONFIG.validate = function() {
    const errors = [];
    
    if (this.supabaseUrl === 'https://your-project-id.supabase.co') {
        errors.push('请配置正确的Supabase项目URL');
    }
    
    if (this.supabaseAnonKey === 'your-anon-key-here') {
        errors.push('请配置正确的Supabase匿名密钥');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// 在浏览器中暴露配置
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    
    // 开发环境下显示配置验证信息
    if (CONFIG.isDevelopment) {
        const validation = CONFIG.validate();
        if (!validation.isValid) {
            console.warn('⚠️ 配置验证失败:', validation.errors);
            console.log('💡 请编辑 config.js 文件，填入正确的Supabase项目信息');
        } else {
            console.log('✅ 配置验证通过');
        }
    }
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 