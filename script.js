// 应用状态管理
class TranslationApp {
    constructor() {
        this.currentModule = 'cn-to-de';
        this.debounceTimer = null; // 德语译文编辑防抖定时器
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.showLoadingMessage();
    }

    // 导航切换功能
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const modules = document.querySelectorAll('.module');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetModule = button.dataset.module;
                this.switchModule(targetModule);
            });
        });
    }

    switchModule(moduleId) {
        // 更新导航按钮状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-module="${moduleId}"]`).classList.add('active');

        // 切换模块显示
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('active');
        });
        document.getElementById(moduleId).classList.add('active');

        this.currentModule = moduleId;
    }

    // 设置事件监听器
    setupEventListeners() {
        // 中译德模块
        this.setupCnToDeEvents();
        
        // 德译中模块
        this.setupDeToCnEvents();
        
        // Du/Sie切换模块
        this.setupDuSieEvents();
        
        // 德语检查模块
        this.setupGrammarCheckEvents();
        
        // 德语助手模块
        this.setupAssistantEvents();
    }

    // 中译德模块事件
    setupCnToDeEvents() {
        const translateBtn = document.getElementById('translate-btn');
        const retranslateBtn = document.getElementById('retranslate-btn');
        const duSieSwitchBtn = document.getElementById('du-sie-switch-btn');
        const removeDashBtn = document.getElementById('remove-dash-btn');
        const clearBtn = document.getElementById('clear-btn');
        const copyOriginal = document.getElementById('copy-original');
        const copyTranslation = document.getElementById('copy-translation');
        const copyBoth = document.getElementById('copy-both');
        const deOutput = document.getElementById('de-output');

        translateBtn?.addEventListener('click', () => this.handleCnToDeTranslation());
        retranslateBtn?.addEventListener('click', () => this.handleCnToDeTranslation());
        duSieSwitchBtn?.addEventListener('click', () => this.handleDuSieSwitch());
        removeDashBtn?.addEventListener('click', () => this.handleRemoveDash());
        clearBtn?.addEventListener('click', () => this.clearCnToDeFields());
        
        copyOriginal?.addEventListener('click', () => this.copyToClipboard('cn-input'));
        copyTranslation?.addEventListener('click', () => this.copyToClipboard('de-output'));
        copyBoth?.addEventListener('click', () => this.copyBoth());

        // 德语译文编辑监听（延迟检测）
        if (deOutput) {
            deOutput.addEventListener('input', () => {
                // 清除之前的定时器
                if (this.debounceTimer) {
                    clearTimeout(this.debounceTimer);
                }
                
                // 设置1秒延迟，用户停止输入后触发回译
                this.debounceTimer = setTimeout(() => {
                    this.handleGermanTextEdit();
                }, 1000);
            });
        }
    }

    // 德译中模块事件
    setupDeToCnEvents() {
        const translateBtn = document.getElementById('de-to-cn-translate');
        const retranslateBtn = document.getElementById('de-to-cn-retranslate');
        const copyBtn = document.getElementById('de-to-cn-copy');

        translateBtn?.addEventListener('click', () => this.handleDeToCnTranslation());
        retranslateBtn?.addEventListener('click', () => this.handleDeToCnTranslation());
        copyBtn?.addEventListener('click', () => this.copyToClipboard('cn-output'));
    }

    // Du/Sie切换模块事件
    setupDuSieEvents() {
        const convertToDu = document.getElementById('convert-to-du');
        const convertToSie = document.getElementById('convert-to-sie');

        convertToDu?.addEventListener('click', () => this.handleDuSieConversion('du'));
        convertToSie?.addEventListener('click', () => this.handleDuSieConversion('sie'));
    }

    // 德语检查模块事件
    setupGrammarCheckEvents() {
        const checkBtn = document.getElementById('check-grammar');
        const clearBtn = document.getElementById('clear-grammar');
        
        checkBtn?.addEventListener('click', () => this.handleGrammarCheck());
        clearBtn?.addEventListener('click', () => this.clearGrammarFields());
    }

    // 德语助手模块事件
    setupAssistantEvents() {
        const askBtn = document.getElementById('ask-assistant');
        const copyBtn = document.getElementById('copy-assistant-answer');
        const clearBtn = document.getElementById('clear-assistant');
        
        askBtn?.addEventListener('click', () => this.handleAssistantQuery());
        copyBtn?.addEventListener('click', () => this.copyAssistantAnswer());
        clearBtn?.addEventListener('click', () => this.clearAssistantFields());
    }

    // 德语文本编辑处理（自动回译）
    async handleGermanTextEdit() {
        const deOutput = document.getElementById('de-output').value.trim();
        if (!deOutput) {
            return; // 如果德语译文为空，不执行回译
        }

        // 检查API是否已配置
        if (!window.apiIntegration || !window.apiIntegration.isConfigured()) {
            return; // 静默返回，不显示错误消息
        }

        try {
            // 更新人称检测
            const pronounType = window.apiIntegration.detectPronounUsage(deOutput);
            const pronounInfo = document.getElementById('pronoun-info');
            if (pronounInfo) {
                pronounInfo.textContent = `德语译文使用的是：${pronounType}`;
                pronounInfo.style.display = 'block';
            }

            // 执行回译检查
            const backTranslation = await window.apiIntegration.translateGermanToChinese(deOutput);
            document.getElementById('back-translation').value = backTranslation;
            
            // 显示回译备注
            const backTranslationNote = document.getElementById('back-translation-note');
            if (backTranslationNote) {
                backTranslationNote.style.display = 'block';
            }

            // 静默更新，不显示成功消息，避免干扰用户编辑
        } catch (error) {
            console.warn('自动回译失败:', error);
            // 静默处理错误，不影响用户编辑体验
        }
    }

    // 中译德翻译处理
    async handleCnToDeTranslation() {
        const cnInput = document.getElementById('cn-input').value.trim();
        if (!cnInput) {
            this.showMessage('请输入中文内容', 'error');
            return;
        }

        const role = document.querySelector('input[name="role"]:checked').value;

        // 检查API是否已配置
        if (!window.apiIntegration || !window.apiIntegration.isConfigured()) {
            this.showMessage('请先配置API密钥', 'error');
            setTimeout(() => {
                window.apiIntegration?.showAPIConfig();
            }, 1000);
            return;
        }

        this.showLoading(true);
        
        try {
            // 使用真实API进行翻译
            const result = await window.apiIntegration.translateChineseToGerman(cnInput, role);
            
            document.getElementById('de-output').value = result.translation;
            document.getElementById('back-translation').value = result.backTranslation;
            
            // 显示人称信息
            const pronounInfo = document.getElementById('pronoun-info');
            pronounInfo.textContent = `德语译文使用的是：${result.pronounType}`;
            pronounInfo.style.display = 'block';
            
            // 显示回译备注
            const backTranslationNote = document.getElementById('back-translation-note');
            if (backTranslationNote) {
                backTranslationNote.style.display = 'block';
            }
            
            // 启用"你您切换"和"去短横线"按钮
            const duSieSwitchBtn = document.getElementById('du-sie-switch-btn');
            if (duSieSwitchBtn) {
                duSieSwitchBtn.disabled = false;
            }
            const removeDashBtn = document.getElementById('remove-dash-btn');
            if (removeDashBtn) {
                removeDashBtn.disabled = false;
            }
            
            this.showMessage(`翻译完成！使用模型：${result.model}`, 'success');
        } catch (error) {
            this.showMessage(`翻译失败：${error.message}`, 'error');
            console.error('Translation error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // 德译中翻译处理
    async handleDeToCnTranslation() {
        const deInput = document.getElementById('de-input').value.trim();
        if (!deInput) {
            this.showMessage('请输入德语内容', 'error');
            return;
        }

        // 检查API是否已配置
        if (!window.apiIntegration || !window.apiIntegration.isConfigured()) {
            this.showMessage('请先配置API密钥', 'error');
            setTimeout(() => {
                window.apiIntegration?.showAPIConfig();
            }, 1000);
            return;
        }

        this.showLoading(true);
        
        try {
            // 使用OpenRouter API进行德译中翻译
            const apiKey = window.apiIntegration.getCurrentApiKey();
            
            const prompt = `请把以下德语翻译成恰当的中文。只需要给出一个版本的中文译文，除了译文不要包含其他任何内容，包括不限于解释性注释和引号。

德语文本：${deInput}`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant-DeToCn'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API请求失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API返回数据格式错误');
            }

            const translation = data.choices[0].message.content.trim();
            document.getElementById('cn-output').value = translation;
            this.showMessage('翻译完成！', 'success');

        } catch (error) {
            this.showMessage(`翻译失败：${error.message}`, 'error');
            console.error('德译中翻译错误:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // 中译德页面的Du/Sie智能切换
    async handleDuSieSwitch() {
        const deOutput = document.getElementById('de-output').value.trim();
        if (!deOutput) {
            this.showMessage('没有德语译文可以转换', 'error');
            return;
        }

        // 检查API是否已配置
        if (!window.apiIntegration || !window.apiIntegration.isConfigured()) {
            this.showMessage('请先配置API密钥', 'error');
            setTimeout(() => {
                window.apiIntegration?.showAPIConfig();
            }, 1000);
            return;
        }

        this.showLoading(true);

        try {
            // 使用OpenRouter API进行Du/Sie智能切换
            const apiKey = window.apiIntegration.getCurrentApiKey();
            
            const prompt = `请将以下德语文本在Du/Sie形式之间进行转换：
- 如果文本使用Du(你)形式，请转换为Sie(您)形式
- 如果文本使用Sie(您)形式，请转换为Du(你)形式
- 如果文本没有明确的人称，请保持原文不变
- 除了人称代词及其相关变位，请保持其他内容完全不变

德语文本：
${deOutput}

请只返回转换后的德语文本，不要添加任何解释。`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant-DuSie-Switch'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API请求失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API返回数据格式错误');
            }

            const convertedText = data.choices[0].message.content.trim();
            
            // 更新德语译文
            document.getElementById('de-output').value = convertedText;
            
            // 检测新的人称类型并更新显示
            const newPronounType = window.apiIntegration.detectPronounUsage(convertedText);
            const pronounInfo = document.getElementById('pronoun-info');
            pronounInfo.textContent = `德语译文使用的是：${newPronounType}`;
            
            // 确保回译备注显示
            const backTranslationNote = document.getElementById('back-translation-note');
            if (backTranslationNote) {
                backTranslationNote.style.display = 'block';
            }
            
            // 重新进行回译检查
            try {
                const backTranslation = await window.apiIntegration.translateGermanToChinese(convertedText);
                document.getElementById('back-translation').value = backTranslation;
            } catch (backTranslationError) {
                console.warn('回译更新失败:', backTranslationError);
                // 回译失败不影响主要功能
            }

            this.showMessage('Du/Sie转换完成！', 'success');

        } catch (error) {
            this.showMessage(`Du/Sie转换失败：${error.message}`, 'error');
            console.error('Du/Sie Switch Error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // 去短横线处理
    async handleRemoveDash() {
        const deOutput = document.getElementById('de-output').value.trim();
        if (!deOutput) {
            this.showMessage('没有德语译文可以处理', 'error');
            return;
        }

        // 检查API是否已配置
        if (!window.apiIntegration || !window.apiIntegration.isConfigured()) {
            this.showMessage('请先配置API密钥', 'error');
            setTimeout(() => {
                window.apiIntegration?.showAPIConfig();
            }, 1000);
            return;
        }

        this.showLoading(true);

        try {
            // 使用OpenRouter API去掉短横线
            const apiKey = window.apiIntegration.getCurrentApiKey();
            
            const prompt = `请去掉以下德语文本中的短横线符号（–, —, -）换成逗号，保持其他内容完全不变。仅去除作为连接符或破折号的短横线，不要去除复合词中的连字符。

德语文本：
${deOutput}

请只返回处理后的德语文本，不要添加任何解释。`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant-Remove-Dash'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API请求失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API返回数据格式错误');
            }

            const processedText = data.choices[0].message.content.trim();
            
            // 更新德语译文
            document.getElementById('de-output').value = processedText;
            
            // 保持人称信息显示
            const pronounInfo = document.getElementById('pronoun-info');
            if (pronounInfo.style.display !== 'none') {
                const currentPronounType = window.apiIntegration.detectPronounUsage(processedText);
                pronounInfo.textContent = `德语译文使用的是：${currentPronounType}`;
            }
            
            // 确保回译备注显示
            const backTranslationNote = document.getElementById('back-translation-note');
            if (backTranslationNote) {
                backTranslationNote.style.display = 'block';
            }
            
            // 重新进行回译检查
            try {
                const backTranslation = await window.apiIntegration.translateGermanToChinese(processedText);
                document.getElementById('back-translation').value = backTranslation;
            } catch (backTranslationError) {
                console.warn('回译更新失败:', backTranslationError);
                // 回译失败不影响主要功能
            }

            this.showMessage('短横线已去除！', 'success');

        } catch (error) {
            this.showMessage(`去短横线失败：${error.message}`, 'error');
            console.error('Remove Dash Error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // Du/Sie转换处理（独立页面使用）
    async handleDuSieConversion(targetType) {
        const input = document.getElementById('du-sie-input').value.trim();
        if (!input) {
            this.showMessage('请输入德语文本', 'error');
            return;
        }

        // 检查API是否已配置
        if (!window.apiIntegration || !window.apiIntegration.isConfigured()) {
            this.showMessage('请先配置API密钥', 'error');
            setTimeout(() => {
                window.apiIntegration?.showAPIConfig();
            }, 1000);
            return;
        }

        this.showLoading(true);
        
        try {
            // 使用OpenRouter API进行Du/Sie转换
            const apiKey = window.apiIntegration.getCurrentApiKey();
            
            const prompt = targetType === 'du' 
                ? `请把以下德语文本转换为Duzen形式。只转换指向对话对象的人称代词(Sie/Ihnen/Ihre→du/dir/dich/deine)，不要改变说话者(ich)或第三人称代词。保持句子原意不变。如果已经是Duzen形式，直接输出原文。\n\n德语文本：${input}`
                : `请把以下德语文本转换为Siezen形式。只转换指向对话对象的人称代词(du/dir/dich/deine→Sie/Ihnen/Ihre)，不要改变说话者(ich)或第三人称代词。保持句子原意不变。如果已经是Siezen形式，直接输出原文。\n\n德语文本：${input}`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant-DuSie-Conversion'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API请求失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API返回数据格式错误');
            }

            const convertedText = data.choices[0].message.content.trim();
            document.getElementById('du-sie-output').value = convertedText;
            this.showMessage(`已转换为 ${targetType === 'du' ? 'Du(你)' : 'Sie(您)'} 形式`, 'success');

        } catch (error) {
            this.showMessage(`转换失败：${error.message}`, 'error');
            console.error('Du/Sie转换错误:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // 德语检查处理
    async handleGrammarCheck() {
        const germanInput = document.getElementById('grammar-input').value.trim();
        const chineseInput = document.getElementById('grammar-chinese-input').value.trim();
        
        if (!germanInput) {
            this.showMessage('请输入德语文本', 'error');
            return;
        }

        // 检查API是否已配置
        if (!window.apiIntegration || !window.apiIntegration.isConfigured()) {
            this.showMessage('请先配置API密钥', 'error');
            setTimeout(() => {
                window.apiIntegration?.showAPIConfig();
            }, 1000);
            return;
        }

        this.showLoading(true);
        
        try {
            // 使用OpenRouter API进行德语检查
            const apiKey = window.apiIntegration.getCurrentApiKey();
            
            // 根据是否有中文文本构建不同的提示词
            let prompt;
            if (chineseInput) {
                prompt = `请检查以下德语文本的质量，背景是投资股票基金虚拟货币的社交媒体群组。

1. 基础错误检查：详细指出语法、动词变位、格变、大小写、标点符号等问题
2. 表达风格：如有问题用1-2句话简述
3. 翻译准确性：如有问题用1-2句话简述
4. 人称对应：如有你/您与du/Sie不对应的问题用1-2句话简述

德语文本：${germanInput}

中文对照：${chineseInput}

要求：重点关注基础错误，其他方面除非有明显问题否则简述或不提。直接给出问题和建议，不要客套话。`;
            } else {
                prompt = `请检查以下德语文本的质量，背景是投资股票基金虚拟货币的社交媒体群组。

1. 基础错误检查：详细指出语法、动词变位、格变、大小写、标点符号等问题
2. 表达风格：如有问题用1-2句话简述
3. 表达自然性：如有问题用1-2句话简述

德语文本：${germanInput}

要求：重点关注基础错误，其他方面除非有明显问题否则简述或不提。直接给出问题和建议，不要客套话。`;
            }

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant-Grammar-Check'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.3,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API请求失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API返回数据格式错误');
            }

            const checkResult = data.choices[0].message.content.trim();
            const resultDiv = document.getElementById('grammar-result');
            resultDiv.innerHTML = this.formatGrammarApiResult(checkResult);
            this.showMessage('检查完成！', 'success');

        } catch (error) {
            this.showMessage(`检查失败：${error.message}`, 'error');
            console.error('德语检查错误:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // 德语助手处理
    async handleAssistantQuery() {
        const input = document.getElementById('assistant-input').value.trim();
        if (!input) {
            this.showMessage('请输入您的问题', 'error');
            return;
        }

        // 检查API是否已配置
        if (!window.apiIntegration || !window.apiIntegration.isConfigured()) {
            this.showMessage('请先配置API密钥', 'error');
            setTimeout(() => {
                window.apiIntegration?.showAPIConfig();
            }, 1000);
            return;
        }

        this.showLoading(true);
        
        try {
            // 使用OpenRouter API进行德语助手查询
            const apiKey = window.apiIntegration.getCurrentApiKey();
            
            const prompt = `你是一个熟知德语和德国生活和文化的人，请基于以下问题提供准确、实用的回答：

用户问题：${input}

请用中文回答，并在涉及德语时提供解释。`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant-German-Helper'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API请求失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('API返回数据格式错误');
            }

            const answer = data.choices[0].message.content.trim();
            const resultDiv = document.getElementById('assistant-result');
            resultDiv.innerHTML = this.formatAssistantApiResult(answer);
            this.showMessage('回答完成！', 'success');

        } catch (error) {
            this.showMessage(`查询失败：${error.message}`, 'error');
            console.error('德语助手查询错误:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // 模拟翻译API（将来替换为真实API）
    async simulateTranslation(text, direction, options = {}) {
        // 模拟API延迟
        await this.sleep(1500);
        
        if (direction === 'cn-to-de') {
            const pronounTypes = ['Sie (您)', 'Du (你)', '无人称'];
            const randomPronoun = pronounTypes[Math.floor(Math.random() * pronounTypes.length)];
            
            return {
                translation: `[模拟德语翻译] ${text} (角色: ${options.role}, 场景: ${options.scene})`,
                backTranslation: `[回译检查] ${text}`,
                pronounType: randomPronoun
            };
        } else {
            return {
                translation: `[模拟中文翻译] ${text}`
            };
        }
    }

    // 模拟Du/Sie转换
    async simulateConversion(text, targetType) {
        await this.sleep(1000);
        return {
            convertedText: `[转换为${targetType === 'du' ? 'Du' : 'Sie'}] ${text}`
        };
    }

    // 模拟语法检查
    async simulateGrammarCheck(text) {
        await this.sleep(1200);
        return {
            errors: [
                {
                    type: '语法错误',
                    description: '示例语法问题',
                    suggestion: '修改建议'
                }
            ],
            correctedText: `[检查后的文本] ${text}`,
            hasErrors: Math.random() > 0.5
        };
    }

    // 模拟助手查询
    async simulateAssistantQuery(query) {
        await this.sleep(1000);
        return {
            answer: `关于 "${query}" 的回答：\n\n这是一个模拟回答。在实际应用中，这里会显示AI助手基于德语语境提供的详细解答，包括语法解释、词汇分析、文化背景等信息。`,
            relatedTopics: ['相关话题1', '相关话题2']
        };
    }

    // 格式化语法检查结果
    formatGrammarResult(result) {
        let html = '';
        
        if (result.hasErrors) {
            html += '<div class="error-section"><h4>发现的问题：</h4>';
            result.errors.forEach(error => {
                html += `
                    <div class="error-item">
                        <strong>${error.type}:</strong> ${error.description}
                        <br><em>建议：${error.suggestion}</em>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<div class="success-message">未发现明显的语法错误！</div>';
        }
        
        html += `
            <div class="corrected-section">
                <h4>建议文本：</h4>
                <div class="corrected-text">${result.correctedText}</div>
            </div>
        `;
        
        return html;
    }

    // 格式化API德语检查结果
    formatGrammarApiResult(result) {
        // 首先移除不需要的部分
        let cleanedResult = result
            // 删除开头的客套话
            .replace(/^(?:好的，|我来|让我|首先).*?(?=检查结果|1\.|基础错误|问题)/s, '')
            // 删除重复的德语文本部分
            .replace(/德语文本：[^]*?(?=中文对照：|检查结果|1\.|基础错误)/g, '')
            // 删除重复的中文对照部分
            .replace(/中文对照：[^]*?(?=---|检查结果|1\.|基础错误)/g, '')
            // 删除分隔线
            .replace(/---+/g, '')
            // 删除冗余的正面评价
            .replace(/(?:准确|自然流畅|很好|合适|恰当|正确|没有错误)[。，]/g, '')
            .replace(/(?:表达|翻译|用法)(?:准确|自然|流畅|清晰|恰当)[。，]/g, '')
            .replace(/总结：.*?(?:准确性|合适|恰当|很好)[^。]*[。]/g, '')
            // 删除最终改进建议部分
            .replace(/(?:综合评价|整体.*?评价|最终.*?建议|总结：)[^]*$/g, '')
            // 删除多余的空行
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();

        // 简化格式化，避免复杂的Markdown
        const formattedResult = cleanedResult
            // 只处理基本的粗体格式
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 处理列表项，统一用简单的项目符号
            .replace(/^[\*\-•]\s+/gm, '• ')
            // 处理数字列表项
            .replace(/^(\d+\.\s+)/gm, '<strong>$1</strong>')
            // 处理段落
            .replace(/\n\n+/g, '</p><p>')
            // 处理单换行
            .replace(/\n/g, '<br>');

        return `<div class="grammar-api-result"><p>${formattedResult}</p></div>`;
    }

    // 格式化助手回答
    formatAssistantResult(result) {
        let html = `
            <div class="answer-section">
                <div class="answer-text">${result.answer}</div>
            </div>
        `;
        
        if (result.relatedTopics.length > 0) {
            html += `
                <div class="related-topics">
                    <h4>相关话题：</h4>
                    <ul>
                        ${result.relatedTopics.map(topic => `<li>${topic}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        return html;
    }

    // 格式化API德语助手回答
    formatAssistantApiResult(answer) {
        // 简单的格式化处理
        const formattedAnswer = answer
            // 处理基本的粗体格式
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 处理段落
            .replace(/\n\n+/g, '</p><p>')
            // 处理单换行
            .replace(/\n/g, '<br>');

        return `<div class="assistant-api-result"><p>${formattedAnswer}</p></div>`;
    }

    // 清空中译德字段
    clearCnToDeFields() {
        document.getElementById('cn-input').value = '';
        document.getElementById('de-output').value = '';
        document.getElementById('back-translation').value = '';
        document.getElementById('pronoun-info').style.display = 'none';
        
        // 隐藏回译备注
        const backTranslationNote = document.getElementById('back-translation-note');
        if (backTranslationNote) {
            backTranslationNote.style.display = 'none';
        }
        
        // 禁用"你您切换"和"去短横线"按钮
        const duSieSwitchBtn = document.getElementById('du-sie-switch-btn');
        if (duSieSwitchBtn) {
            duSieSwitchBtn.disabled = true;
        }
        const removeDashBtn = document.getElementById('remove-dash-btn');
        if (removeDashBtn) {
            removeDashBtn.disabled = true;
        }
        
        // 清除可能存在的编辑定时器
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        
        this.showMessage('已清空所有内容', 'success');
    }

    // 清空德语检查字段
    clearGrammarFields() {
        document.getElementById('grammar-input').value = '';
        document.getElementById('grammar-chinese-input').value = '';
        document.getElementById('grammar-result').innerHTML = '';
        
        this.showMessage('已清空所有内容', 'success');
    }

    // 清空德语助手字段
    clearAssistantFields() {
        document.getElementById('assistant-input').value = '';
        document.getElementById('assistant-result').innerHTML = '';
        
        this.showMessage('已清空所有内容', 'success');
    }

    // 复制助手回答
    async copyAssistantAnswer() {
        const resultDiv = document.getElementById('assistant-result');
        const text = resultDiv.textContent || resultDiv.innerText;
        
        if (!text.trim()) {
            this.showMessage('没有回答内容可复制', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('已复制助手回答到剪贴板', 'success');
        } catch (error) {
            // 备用方案
            this.fallbackCopyTextToClipboard(text);
        }
    }

    // 复制到剪贴板
    async copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const text = element.value || element.textContent;
        
        if (!text.trim()) {
            this.showMessage('没有内容可复制', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showMessage('已复制到剪贴板', 'success');
        } catch (error) {
            // 备用方案
            this.fallbackCopyTextToClipboard(text);
        }
    }

    // 复制原文+译文
    async copyBoth() {
        const original = document.getElementById('cn-input').value;
        const translation = document.getElementById('de-output').value;
        
        if (!original.trim() || !translation.trim()) {
            this.showMessage('请确保原文和译文都有内容', 'error');
            return;
        }

        const combinedText = `${original}\n\n${translation}`;
        
        try {
            await navigator.clipboard.writeText(combinedText);
            this.showMessage('已复制原文和译文到剪贴板', 'success');
        } catch (error) {
            this.fallbackCopyTextToClipboard(combinedText);
        }
    }

    // 备用复制方案
    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showMessage('已复制到剪贴板', 'success');
        } catch (err) {
            this.showMessage('复制失败，请手动复制', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    // 显示加载状态
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 移除现有消息
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建新消息
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-toast ${type}`;
        messageDiv.textContent = message;
        
        // 添加样式
        Object.assign(messageDiv.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            fontWeight: '500',
            zIndex: '1001',
            animation: 'slideInRight 0.3s ease-out',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // 根据类型设置颜色
        if (type === 'success') {
            Object.assign(messageDiv.style, {
                background: '#d1fae5',
                border: '2px solid #10b981',
                color: '#065f46'
            });
        } else if (type === 'error') {
            Object.assign(messageDiv.style, {
                background: '#fef2f2',
                border: '2px solid #ef4444',
                color: '#991b1b'
            });
        } else if (type === 'warning') {
            Object.assign(messageDiv.style, {
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                color: '#92400e'
            });
        } else {
            Object.assign(messageDiv.style, {
                background: '#dbeafe',
                border: '2px solid #3b82f6',
                color: '#1e40af'
            });
        }

        document.body.appendChild(messageDiv);

        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 3000);
    }

    // 显示初始加载消息
    showLoadingMessage() {
        this.showMessage('中德翻译助手已准备就绪！', 'success');
    }

    // 工具函数：延迟
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 添加滑动动画的CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .error-item {
        margin: 0.5rem 0;
        padding: 0.5rem;
        background: #fef2f2;
        border-left: 4px solid #ef4444;
        border-radius: 4px;
    }
    
    .corrected-text {
        background: #f9fafb;
        padding: 1rem;
        border-radius: 8px;
        border: 2px solid #e5e7eb;
        margin-top: 0.5rem;
        font-family: monospace;
        white-space: pre-wrap;
    }
    
    .answer-text {
        white-space: pre-wrap;
        line-height: 1.6;
    }
    
    .related-topics {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
    }
    
    .related-topics ul {
        margin-left: 1rem;
    }
    
    .related-topics li {
        margin: 0.25rem 0;
    }
`;
document.head.appendChild(style);

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.translationApp = new TranslationApp();
});

// 键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter 在各模块中触发主要操作
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const app = window.translationApp;
        if (!app) return;

        switch (app.currentModule) {
            case 'cn-to-de':
                document.getElementById('translate-btn')?.click();
                break;
            case 'de-to-cn':
                document.getElementById('de-to-cn-translate')?.click();
                break;
            case 'grammar-check':
                document.getElementById('check-grammar')?.click();
                break;
            case 'assistant':
                document.getElementById('ask-assistant')?.click();
                break;
        }
    }
}); 