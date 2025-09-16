// 多任务管理器
class MultiTaskManager {
    constructor() {
        this.maxTasks = 3;
        this.visibleTasks = new Set([1]); // 默认只显示任务1
        this.taskStates = {
            1: { visible: true, deletable: false },
            2: { visible: false, deletable: true },
            3: { visible: false, deletable: true }
        };
        this.debounceTimers = new Map(); // 每个任务的防抖定时器
        this.originalTextBackups = new Map(); // 每个任务的原文备份
        this.translationTimers = new Map(); // 每个任务的翻译计时器
    }

    // 添加任务
    addTask() {
        for (let i = 2; i <= this.maxTasks; i++) {
            if (!this.taskStates[i].visible) {
                this.showTask(i);
                return i;
            }
        }
        return null; // 已达到最大任务数
    }

    // 显示任务
    showTask(taskId) {
        if (taskId > this.maxTasks || taskId < 1) return false;
        
        const taskArea = document.getElementById(`task-area-${taskId}`);
        if (taskArea) {
            taskArea.style.display = 'block';
            this.taskStates[taskId].visible = true;
            this.visibleTasks.add(taskId);
            this.updateMultiTaskLayout();
            return true;
        }
        return false;
    }

    // 隐藏任务
    hideTask(taskId) {
        if (taskId === 1 || taskId > this.maxTasks || taskId < 1) return false; // 任务1不可删除
        
        const taskArea = document.getElementById(`task-area-${taskId}`);
        if (taskArea) {
            taskArea.style.display = 'none';
            this.taskStates[taskId].visible = false;
            this.visibleTasks.delete(taskId);
            this.clearTaskContent(taskId);
            this.updateMultiTaskLayout();
            return true;
        }
        return false;
    }

    // 清空任务内容
    clearTaskContent(taskId) {
        const cnInput = document.getElementById(`cn-input-${taskId}`);
        const deOutput = document.getElementById(`de-output-${taskId}`);
        const backTranslation = document.getElementById(`back-translation-${taskId}`);
        const pronounInfo = document.getElementById(`pronoun-info-${taskId}`);
        
        if (cnInput) cnInput.value = '';
        if (deOutput) deOutput.value = '';
        if (backTranslation) backTranslation.value = '';
        if (pronounInfo) pronounInfo.style.display = 'none';
        
        // 重置按钮状态
        this.resetTaskButtons(taskId);
        
        // 清除定时器和备份
        if (this.debounceTimers.has(taskId)) {
            clearTimeout(this.debounceTimers.get(taskId));
            this.debounceTimers.delete(taskId);
        }
        this.originalTextBackups.delete(taskId);
        
        // 清除翻译计时器
        this.clearTranslationTimer(taskId);
    }

    // 重置任务按钮状态
    resetTaskButtons(taskId) {
        const buttons = [
            `du-sie-switch-btn-${taskId}`,
            `remove-dash-btn-${taskId}`,
            `remove-emoji-btn-${taskId}`
        ];
        
        buttons.forEach(buttonId => {
            const btn = document.getElementById(buttonId);
            if (btn) btn.disabled = true;
        });

        // 重置去除备注按钮
        const removeCommentsBtn = document.getElementById(`remove-comments-btn-${taskId}`);
        if (removeCommentsBtn) {
            removeCommentsBtn.innerHTML = '<span class="btn-icon">🧹</span>去除备注';
        }
    }

    // 更新多任务布局
    updateMultiTaskLayout() {
        const container = document.querySelector('.multi-task-container');
        if (container) {
            if (this.visibleTasks.size > 1) {
                container.classList.add('multi-column');
            } else {
                container.classList.remove('multi-column');
            }
        }

        // 更新添加任务按钮状态
        const addTaskBtn = document.getElementById('add-task-btn');
        if (addTaskBtn) {
            const canAddMore = this.visibleTasks.size < this.maxTasks;
            addTaskBtn.style.display = canAddMore ? 'flex' : 'none';
        }
    }

    // 获取可见任务列表
    getVisibleTasks() {
        return Array.from(this.visibleTasks);
    }

    // 检查任务是否可见
    isTaskVisible(taskId) {
        return this.visibleTasks.has(taskId);
    }

    // 启动翻译计时器
    startTranslationTimer(taskId) {
        // 先停止可能存在的计时器
        this.stopTranslationTimer(taskId);
        
        const timerState = {
            startTime: Date.now(),
            interval: null,
            isRunning: true
        };
        
        // 显示计时器元素
        const timerDisplay = document.getElementById(`timer-display-${taskId}`);
        if (timerDisplay) {
            timerDisplay.style.display = 'block';
        }
        
        // 开始计时
        timerState.interval = setInterval(() => {
            this.updateTimerDisplay(taskId);
        }, 1000);
        
        this.translationTimers.set(taskId, timerState);
        
        // 初始显示
        this.updateTimerDisplay(taskId);
    }

    // 停止翻译计时器
    stopTranslationTimer(taskId) {
        const timerState = this.translationTimers.get(taskId);
        if (timerState && timerState.interval) {
            clearInterval(timerState.interval);
            timerState.isRunning = false;
            this.translationTimers.set(taskId, timerState);
        }
        
        // 隐藏计时器元素
        const timerDisplay = document.getElementById(`timer-display-${taskId}`);
        if (timerDisplay) {
            timerDisplay.style.display = 'none';
        }
    }

    // 清除翻译计时器
    clearTranslationTimer(taskId) {
        this.stopTranslationTimer(taskId);
        this.translationTimers.delete(taskId);
    }

    // 更新计时器显示
    updateTimerDisplay(taskId) {
        const timerState = this.translationTimers.get(taskId);
        if (!timerState || !timerState.isRunning) return;
        
        const elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
        
        // 20分钟 = 1200秒
        if (elapsed >= 1200) {
            this.stopTranslationTimer(taskId);
            // 显示20:00+
            const timerValue = document.getElementById(`timer-value-${taskId}`);
            if (timerValue) {
                timerValue.textContent = '20:00+';
            }
            return;
        }
        
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerValue = document.getElementById(`timer-value-${taskId}`);
        if (timerValue) {
            timerValue.textContent = timeString;
        }
    }
}

// 应用状态管理
class TranslationApp {
    constructor() {
        this.currentModule = 'cn-to-de';
        this.debounceTimer = null; // 德语译文编辑防抖定时器（保留向后兼容）
        this.currentImageData = null; // 当前上传的图片数据
        this.originalTextBackup = null; // 原文备份（保留向后兼容）
        this.multiTaskManager = new MultiTaskManager(); // 多任务管理器
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.showLoadingMessage();
        
        // 初始化多任务管理器布局
        this.multiTaskManager.updateMultiTaskLayout();
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
        
        // OCR识别模块
        this.setupOCREvents();
        
        // 教程模态框事件
        this.setupTutorialEvents();
    }

    // 中译德模块事件
    setupCnToDeEvents() {
        // 设置多任务按钮事件
        const addTaskBtn = document.getElementById('add-task-btn');
        addTaskBtn?.addEventListener('click', () => this.handleAddTask());

        // 为每个任务设置事件监听器
        for (let taskId = 1; taskId <= 3; taskId++) {
            this.setupSingleTaskEvents(taskId);
        }
    }

    // 为单个任务设置事件监听器
    setupSingleTaskEvents(taskId) {
        const translateBtn = document.getElementById(`translate-btn-${taskId}`);
        const retranslateBtn = document.getElementById(`retranslate-btn-${taskId}`);
        const removeCommentsBtn = document.getElementById(`remove-comments-btn-${taskId}`);
        const duSieSwitchBtn = document.getElementById(`du-sie-switch-btn-${taskId}`);
        const removeDashBtn = document.getElementById(`remove-dash-btn-${taskId}`);
        const removeEmojiBtn = document.getElementById(`remove-emoji-btn-${taskId}`);
        const clearBtn = document.getElementById(`clear-btn-${taskId}`);
        const copyOriginal = document.getElementById(`copy-original-${taskId}`);
        const copyTranslation = document.getElementById(`copy-translation-${taskId}`);
        const copyBoth = document.getElementById(`copy-both-${taskId}`);
        const deOutput = document.getElementById(`de-output-${taskId}`);
        const removeTaskBtn = document.getElementById(`remove-task-btn-${taskId}`);

        translateBtn?.addEventListener('click', () => this.handleCnToDeTranslation(taskId));
        retranslateBtn?.addEventListener('click', () => this.handleCnToDeTranslation(taskId));
        removeCommentsBtn?.addEventListener('click', () => this.handleRemoveComments(taskId));
        duSieSwitchBtn?.addEventListener('click', () => this.handleDuSieSwitch(taskId));
        removeDashBtn?.addEventListener('click', () => this.handleRemoveDash(taskId));
        removeEmojiBtn?.addEventListener('click', () => this.handleRemoveEmoji(taskId));
        clearBtn?.addEventListener('click', () => this.clearCnToDeFields(taskId));
        
        copyOriginal?.addEventListener('click', () => this.copyToClipboard(`cn-input-${taskId}`));
        copyTranslation?.addEventListener('click', () => this.copyToClipboard(`de-output-${taskId}`));
        copyBoth?.addEventListener('click', () => this.copyBoth(taskId));
        
        // 删除任务按钮（任务1没有删除按钮）
        removeTaskBtn?.addEventListener('click', () => this.handleRemoveTask(taskId));

        // 德语译文编辑监听（延迟检测）
        if (deOutput) {
            deOutput.addEventListener('input', () => {
                // 清除之前的定时器
                const existingTimer = this.multiTaskManager.debounceTimers.get(taskId);
                if (existingTimer) {
                    clearTimeout(existingTimer);
                }
                
                // 设置1秒延迟，用户停止输入后触发回译
                const timer = setTimeout(() => {
                    this.handleGermanTextEdit(taskId);
                }, 1000);
                this.multiTaskManager.debounceTimers.set(taskId, timer);
            });
        }
    }

    // 添加任务处理
    handleAddTask() {
        const newTaskId = this.multiTaskManager.addTask();
        if (newTaskId) {
            this.showMessage(`任务${newTaskId}已添加`, 'success');
        } else {
            this.showMessage('已达到最大任务数量限制', 'warning');
        }
    }

    // 删除任务处理
    handleRemoveTask(taskId) {
        if (this.multiTaskManager.hideTask(taskId)) {
            this.showMessage(`任务${taskId}已删除`, 'success');
        } else {
            this.showMessage('无法删除此任务', 'error');
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

    // OCR识别模块事件
    setupOCREvents() {
        const uploadArea = document.getElementById('image-upload-area');
        const fileInput = document.getElementById('image-file-input');
        const recognizeBtn = document.getElementById('ocr-recognize');
        const retryBtn = document.getElementById('ocr-retry');
        const copyBtn = document.getElementById('ocr-copy');
        const clearBtn = document.getElementById('ocr-clear');
        const removeImageBtn = document.getElementById('remove-image-btn');

        // 点击上传区域触发文件选择
        uploadArea?.addEventListener('click', () => {
            fileInput?.click();
        });

        // 文件选择处理
        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageFile(file);
            }
        });

        // 拖拽上传
        uploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea?.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageFile(files[0]);
            }
        });

        // 剪贴板粘贴
        document.addEventListener('paste', (e) => {
            if (this.currentModule === 'ocr-recognition') {
                const items = e.clipboardData.items;
                for (let item of items) {
                    if (item.type.indexOf('image') !== -1) {
                        const file = item.getAsFile();
                        if (file) {
                            this.handleImageFile(file);
                        }
                        break;
                    }
                }
            }
        });

        // 按钮事件
        recognizeBtn?.addEventListener('click', () => this.handleOCRRecognition());
        retryBtn?.addEventListener('click', () => this.handleOCRRecognition());
        copyBtn?.addEventListener('click', () => this.copyToClipboard('ocr-output'));
        clearBtn?.addEventListener('click', () => this.clearOCRFields());
        removeImageBtn?.addEventListener('click', () => this.removeImage());
    }

    // 教程模态框事件
    setupTutorialEvents() {
        const tutorialBtn = document.getElementById('tutorial-btn');
        const tutorialModal = document.getElementById('tutorial-modal');
        const closeTutorialModal = document.getElementById('close-tutorial-modal');
        const closeTutorial = document.getElementById('close-tutorial');

        // 打开教程模态框
        tutorialBtn?.addEventListener('click', () => this.showTutorial());

        // 关闭教程模态框 - X按钮
        closeTutorialModal?.addEventListener('click', () => this.hideTutorial());

        // 关闭教程模态框 - "开始使用"按钮
        closeTutorial?.addEventListener('click', () => this.hideTutorial());

        // 点击模态框背景关闭
        tutorialModal?.addEventListener('click', (e) => {
            if (e.target === tutorialModal) {
                this.hideTutorial();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !tutorialModal?.classList.contains('hidden')) {
                this.hideTutorial();
            }
        });
    }

    // 显示教程模态框
    showTutorial() {
        const tutorialModal = document.getElementById('tutorial-modal');
        if (tutorialModal) {
            tutorialModal.classList.remove('hidden');
            // 防止背景滚动
            document.body.style.overflow = 'hidden';
        }
    }

    // 隐藏教程模态框
    hideTutorial() {
        const tutorialModal = document.getElementById('tutorial-modal');
        if (tutorialModal) {
            tutorialModal.classList.add('hidden');
            // 恢复背景滚动
            document.body.style.overflow = '';
        }
    }

    // 德语文本编辑处理（自动回译）
    async handleGermanTextEdit(taskId = 1) {
        const deOutput = document.getElementById(`de-output-${taskId}`).value.trim();
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
            const pronounInfo = document.getElementById(`pronoun-info-${taskId}`);
            if (pronounInfo) {
                pronounInfo.textContent = `人称：${pronounType}`;
                pronounInfo.style.display = 'block';
            }

            // 执行回译检查
            const backTranslation = await window.apiIntegration.translateGermanToChinese(deOutput);
            document.getElementById(`back-translation-${taskId}`).value = backTranslation;

            // 静默更新，不显示成功消息，避免干扰用户编辑
        } catch (error) {
            console.warn('自动回译失败:', error);
            // 静默处理错误，不影响用户编辑体验
        }
    }

    // 中译德翻译处理
    async handleCnToDeTranslation(taskId = 1) {
        const cnInput = document.getElementById(`cn-input-${taskId}`).value.trim();
        if (!cnInput) {
            this.showMessage('请输入中文内容', 'error');
            return;
        }

        const role = document.querySelector(`input[name="role-${taskId}"]:checked`).value;

        // 检查API是否已配置
        if (!window.apiIntegration || !window.apiIntegration.isConfigured()) {
            this.showMessage('请先配置API密钥', 'error');
            setTimeout(() => {
                window.apiIntegration?.showAPIConfig();
            }, 1000);
            return;
        }

        this.showTaskLoading(taskId, true);
        
        // 停止之前的计时器（重新翻译）
        this.multiTaskManager.stopTranslationTimer(taskId);
        
        try {
            // 使用真实API进行翻译
            const result = await window.apiIntegration.translateChineseToGerman(cnInput, role);
            
            document.getElementById(`de-output-${taskId}`).value = result.translation;
            document.getElementById(`back-translation-${taskId}`).value = result.backTranslation;
            
            // 显示人称信息
            const pronounInfo = document.getElementById(`pronoun-info-${taskId}`);
            pronounInfo.textContent = `人称：${result.pronounType}`;
            pronounInfo.style.display = 'block';
            
            // 启用"你您切换"、"去短横线"和"去除表情"按钮
            const duSieSwitchBtn = document.getElementById(`du-sie-switch-btn-${taskId}`);
            if (duSieSwitchBtn) {
                duSieSwitchBtn.disabled = false;
            }
            const removeDashBtn = document.getElementById(`remove-dash-btn-${taskId}`);
            if (removeDashBtn) {
                removeDashBtn.disabled = false;
            }
            const removeEmojiBtn = document.getElementById(`remove-emoji-btn-${taskId}`);
            if (removeEmojiBtn) {
                removeEmojiBtn.disabled = false;
            }
            
            // 启动翻译完成计时器
            this.multiTaskManager.startTranslationTimer(taskId);
            
            this.showMessage(`任务${taskId}翻译完成！`, 'success');
        } catch (error) {
            this.showMessage(`任务${taskId}翻译失败：${error.message}`, 'error');
            console.error('Translation error:', error);
        } finally {
            this.showTaskLoading(taskId, false);
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
            const apiKey = window.apiIntegration.getCurrentApiKey();
            
            // 语言检测和翻译并行进行
            const [detectedLanguage, translationData] = await Promise.all([
                // 语言检测
                this.performLanguageDetection(deInput, apiKey),
                // 德译中翻译
                this.performTranslation(deInput, apiKey)
            ]);
            
            // 显示翻译结果
            document.getElementById('cn-output').value = translationData;
            
            // 显示语言检测结果
            this.showLanguageDetection(detectedLanguage);
            
            this.showMessage('翻译完成！', 'success');

        } catch (error) {
            this.showMessage(`翻译失败：${error.message}`, 'error');
            console.error('德译中翻译错误:', error);
            // 如果翻译失败，隐藏语言检测结果
            this.hideLanguageDetection();
        } finally {
            this.showLoading(false);
        }
    }

    // 执行语言检测
    async performLanguageDetection(text, apiKey) {
        try {
            const prompt = `请检测以下文本的语言。只需要回复语言名称，不要包含任何解释或额外内容。
支持的语言包括：德语、英语、法语、意大利语、西班牙语、中文、日语、韩语、俄语等。

文本：${text}`;
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant-Language-Detection'
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3.5-sonnet',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.1,
                    max_tokens: 50
                })
            });

            if (!response.ok) {
                throw new Error('语言检测请求失败');
            }

            const data = await response.json();
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('语言检测数据格式错误');
            }

            return data.choices[0].message.content.trim();
        } catch (error) {
            console.warn('语言检测失败:', error);
            return '未知';
        }
    }

    // 执行翻译
    async performTranslation(deInput, apiKey) {
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
                model: 'anthropic/claude-3.5-sonnet',
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
        
        return data.choices[0].message.content.trim();
    }

    // 显示语言检测结果
    showLanguageDetection(detectedLanguage) {
        const langDetectionDiv = document.getElementById('language-detection');
        const detectedLangSpan = document.getElementById('detected-language');
        
        if (!langDetectionDiv || !detectedLangSpan) return;
        
        // 清除之前的样式类
        langDetectionDiv.classList.remove('german', 'non-german', 'unknown');
        
        // 设置检测结果文本
        detectedLangSpan.textContent = detectedLanguage;
        
        // 根据检测结果设置样式
        const language = detectedLanguage.toLowerCase();
        if (language.includes('德') || language.includes('german') || language === 'deutsch') {
            langDetectionDiv.classList.add('german');
        } else if (detectedLanguage === '未知' || language.includes('unknown')) {
            langDetectionDiv.classList.add('unknown');
        } else {
            langDetectionDiv.classList.add('non-german');
        }
        
        // 显示检测结果
        langDetectionDiv.style.display = 'block';
    }

    // 隐藏语言检测结果
    hideLanguageDetection() {
        const langDetectionDiv = document.getElementById('language-detection');
        if (langDetectionDiv) {
            langDetectionDiv.style.display = 'none';
        }
    }

    // 中译德页面的Du/Sie智能切换
    async handleDuSieSwitch(taskId = 1) {
        const deOutput = document.getElementById(`de-output-${taskId}`).value.trim();
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

        this.showTaskLoading(taskId, true, 'du-sie');

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
                    model: 'anthropic/claude-3.5-sonnet',
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
            document.getElementById(`de-output-${taskId}`).value = convertedText;
            
            // 检测新的人称类型并更新显示
            const newPronounType = window.apiIntegration.detectPronounUsage(convertedText);
            const pronounInfo = document.getElementById(`pronoun-info-${taskId}`);
            pronounInfo.textContent = `人称：${newPronounType}`;
            
            // 重新进行回译检查
            try {
                const backTranslation = await window.apiIntegration.translateGermanToChinese(convertedText);
                document.getElementById(`back-translation-${taskId}`).value = backTranslation;
            } catch (backTranslationError) {
                console.warn('回译更新失败:', backTranslationError);
                // 回译失败不影响主要功能
            }

            this.showMessage(`任务${taskId}Du/Sie转换完成！`, 'success');

        } catch (error) {
            this.showMessage(`任务${taskId}Du/Sie转换失败：${error.message}`, 'error');
            console.error('Du/Sie Switch Error:', error);
        } finally {
            this.showTaskLoading(taskId, false, 'du-sie');
        }
    }

    // 去短横线处理
    async handleRemoveDash(taskId = 1) {
        const deOutput = document.getElementById(`de-output-${taskId}`).value.trim();
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

        this.showTaskLoading(taskId, true, 'remove-dash');

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
                    model: 'anthropic/claude-3.5-sonnet',
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
                pronounInfo.textContent = `人称：${currentPronounType}`;
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
            this.showTaskLoading(taskId, false, 'remove-dash');
        }
    }

    // 去除表情处理
    async handleRemoveEmoji(taskId = 1) {
        const deOutput = document.getElementById(`de-output-${taskId}`).value.trim();
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
        this.showTaskLoading(taskId, true, 'remove-emoji');
        try {
            // 使用OpenRouter API去除表情符号
            const apiKey = window.apiIntegration.getCurrentApiKey();
            
            const prompt = `请去掉以下德语文本中的所有emoji表情符号和表情图标，保持其他内容完全不变。只需要去除emoji符号，不要改变任何德语单词、标点符号或格式。
德语文本：
${deOutput}
请只返回去除表情符号后的德语文本，不要添加任何解释。`;
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant-Remove-Emoji'
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3.5-sonnet',
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
            document.getElementById(`de-output-${taskId}`).value = processedText;
            
            // 保持人称信息显示
            const pronounInfo = document.getElementById(`pronoun-info-${taskId}`);
            if (pronounInfo && pronounInfo.style.display !== 'none') {
                const currentPronounType = window.apiIntegration.detectPronounUsage(processedText);
                pronounInfo.textContent = `人称：${currentPronounType}`;
            }
            
            // 重新进行回译检查
            try {
                const backTranslation = await window.apiIntegration.translateGermanToChinese(processedText);
                document.getElementById(`back-translation-${taskId}`).value = backTranslation;
            } catch (backTranslationError) {
                console.warn('回译更新失败:', backTranslationError);
                // 回译失败不影响主要功能
            }
            
            this.showMessage(`任务${taskId}表情符号已去除！`, 'success');
        } catch (error) {
            this.showMessage(`任务${taskId}去除表情失败：${error.message}`, 'error');
            console.error('Remove Emoji Error:', error);
        } finally {
            this.showTaskLoading(taskId, false, 'remove-emoji');
        }
    }

    // 去除备注处理
    async handleRemoveComments(taskId = 1) {
        const cnInput = document.getElementById(`cn-input-${taskId}`);
        const cnText = cnInput.value.trim();
        if (!cnText) {
            this.showMessage('请输入中文内容', 'error');
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

        // 检查是否已有备份，如果有则表示当前是撤销操作
        const removeCommentsBtn = document.getElementById(`remove-comments-btn-${taskId}`);
        const backup = this.multiTaskManager.originalTextBackups.get(taskId);
        if (backup !== undefined) {
            // 撤销清洗，恢复原文
            cnInput.value = backup;
            this.multiTaskManager.originalTextBackups.delete(taskId);
            removeCommentsBtn.innerHTML = '<span class="btn-icon">🧹</span>去除备注';
            this.showMessage(`任务${taskId}已恢复原文`, 'success');
            return;
        }

        this.showTaskLoading(taskId, true, 'remove-comments');

        try {
            // 备份原文
            this.multiTaskManager.originalTextBackups.set(taskId, cnText);
            
            // 使用OpenRouter API去除备注
            const apiKey = window.apiIntegration.getCurrentApiKey();
            
            const prompt = `请清洗以下中文文本，去除其中的甲方备注、编号、角色信息等无关内容，只保留需要翻译的核心内容。

清洗规则：
1. 去除明显的备注文字（如括号内的说明、注释）
2. 去除编号（如1、2、3或（一）（二）等）
3. 去除角色标识（如"客户："、"经理："、"注："等）
4. 去除格式标记和多余的标点符号
5. 保留所有实际需要翻译的内容，不要遗漏重要信息
6. 如果不确定某部分是否应该删除，请保留

只返回清洗后的中文文本，不要添加任何解释或说明。

原始文本：
${cnText}`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant-Remove-Comments'
                },
                body: JSON.stringify({
                    model: 'anthropic/claude-3.5-sonnet',
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

            const cleanedText = data.choices[0].message.content.trim();
            
            // 更新中文文本
            cnInput.value = cleanedText;
            
            // 更新按钮状态为撤销模式
            removeCommentsBtn.innerHTML = '<span class="btn-icon">↩️</span>撤销清洗';
            
            this.showMessage(`任务${taskId}备注清洗完成！如有问题可点击"撤销清洗"恢复原文`, 'success');

        } catch (error) {
            // 如果出错，清除备份
            this.multiTaskManager.originalTextBackups.delete(taskId);
            this.showMessage(`任务${taskId}清洗失败：${error.message}`, 'error');
            console.error('Remove Comments Error:', error);
        } finally {
            this.showTaskLoading(taskId, false, 'remove-comments');
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
                    model: 'anthropic/claude-3.5-sonnet',
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
                    model: 'anthropic/claude-3.5-sonnet',
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
                    model: 'openai/gpt-4o-mini',
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
    clearCnToDeFields(taskId = 1) {
        document.getElementById(`cn-input-${taskId}`).value = '';
        document.getElementById(`de-output-${taskId}`).value = '';
        document.getElementById(`back-translation-${taskId}`).value = '';
        document.getElementById(`pronoun-info-${taskId}`).style.display = 'none';
        
        // 禁用"你您切换"、"去短横线"和"去除表情"按钮
        const duSieSwitchBtn = document.getElementById(`du-sie-switch-btn-${taskId}`);
        if (duSieSwitchBtn) {
            duSieSwitchBtn.disabled = true;
        }
        const removeDashBtn = document.getElementById(`remove-dash-btn-${taskId}`);
        if (removeDashBtn) {
            removeDashBtn.disabled = true;
        }
        const removeEmojiBtn = document.getElementById(`remove-emoji-btn-${taskId}`);
        if (removeEmojiBtn) {
            removeEmojiBtn.disabled = true;
        }
        
        // 清除可能存在的编辑定时器
        const existingTimer = this.multiTaskManager.debounceTimers.get(taskId);
        if (existingTimer) {
            clearTimeout(existingTimer);
            this.multiTaskManager.debounceTimers.delete(taskId);
        }
        
        // 停止翻译计时器
        this.multiTaskManager.stopTranslationTimer(taskId);
        
        // 重置原文备份和按钮状态
        this.multiTaskManager.originalTextBackups.delete(taskId);
        const removeCommentsBtn = document.getElementById(`remove-comments-btn-${taskId}`);
        if (removeCommentsBtn) {
            removeCommentsBtn.innerHTML = '<span class="btn-icon">🧹</span>去除备注';
        }
        
        this.showMessage(`任务${taskId}已清空所有内容`, 'success');
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

    // OCR相关方法

    // 处理图片文件
    handleImageFile(file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showMessage('请选择有效的图片文件', 'error');
            return;
        }

        // 验证文件大小 (最大10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showMessage('图片文件不能超过10MB', 'error');
            return;
        }

        // 读取并显示图片
        const reader = new FileReader();
        reader.onload = (e) => {
            this.displayImagePreview(e.target.result);
            this.currentImageData = e.target.result;
            
            // 启用识别按钮
            const recognizeBtn = document.getElementById('ocr-recognize');
            const retryBtn = document.getElementById('ocr-retry');
            if (recognizeBtn) recognizeBtn.disabled = false;
            if (retryBtn) retryBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // 显示图片预览
    displayImagePreview(imageSrc) {
        const uploadArea = document.getElementById('image-upload-area');
        const previewArea = document.getElementById('image-preview');
        const previewImage = document.getElementById('preview-image');

        if (uploadArea && previewArea && previewImage) {
            uploadArea.style.display = 'none';
            previewImage.src = imageSrc;
            previewArea.style.display = 'block';
        }
    }

    // 移除图片
    removeImage() {
        const uploadArea = document.getElementById('image-upload-area');
        const previewArea = document.getElementById('image-preview');
        const fileInput = document.getElementById('image-file-input');
        const recognizeBtn = document.getElementById('ocr-recognize');
        const retryBtn = document.getElementById('ocr-retry');

        if (uploadArea && previewArea) {
            uploadArea.style.display = 'flex';
            previewArea.style.display = 'none';
        }

        if (fileInput) {
            fileInput.value = '';
        }

        // 禁用识别按钮
        if (recognizeBtn) recognizeBtn.disabled = true;
        if (retryBtn) retryBtn.disabled = true;

        this.currentImageData = null;
        this.showMessage('已移除图片', 'success');
    }

    // 处理OCR识别
    async handleOCRRecognition() {
        if (!this.currentImageData) {
            this.showMessage('请先上传图片', 'error');
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
            const apiKey = window.apiIntegration.getCurrentApiKey();
            
            // 调用OpenRouter的Qwen2.5 VL 72B Instruct API
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant-OCR'
                },
                body: JSON.stringify({
                    model: 'qwen/qwen2.5-vl-72b-instruct',
                    messages: [{
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: '请识别图片中的所有文字内容。图片中主要包含德语和中文文字。请按照以下要求输出：\n1. 准确识别所有可见的文字\n2. 保持原有的文字排列和格式\n3. 如果有多行文字，请保持换行格式\n4. 在开头用中文对图片内容进行描述，然后只输出识别到的文字内容，不要添加任何解释或说明\n5. 如果某些文字不清楚，请用[不清楚]标注'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: this.currentImageData
                                }
                            }
                        ]
                    }],
                    temperature: 0.1,
                    max_tokens: 2000
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

            const recognizedText = data.choices[0].message.content.trim();
            document.getElementById('ocr-output').value = recognizedText;
            
            this.showMessage('文字识别完成！', 'success');

        } catch (error) {
            this.showMessage(`识别失败：${error.message}`, 'error');
            console.error('OCR识别错误:', error);
        } finally {
            this.showLoading(false);
        }
    }

    // 清空OCR字段
    clearOCRFields() {
        document.getElementById('ocr-output').value = '';
        this.removeImage();
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
    async copyBoth(taskId = 1) {
        const original = document.getElementById(`cn-input-${taskId}`).value;
        const translation = document.getElementById(`de-output-${taskId}`).value;
        
        if (!original.trim() || !translation.trim()) {
            this.showMessage('请确保原文和译文都有内容', 'error');
            return;
        }

        const combinedText = `${original}\n\n${translation}`;
        
        try {
            await navigator.clipboard.writeText(combinedText);
            this.showMessage(`任务${taskId}已复制原文和译文到剪贴板`, 'success');
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

    // 显示任务级加载状态
    showTaskLoading(taskId, show, buttonType = 'translate') {
        const taskArea = document.getElementById(`task-area-${taskId}`);
        
        if (show) {
            // 添加加载中的视觉反馈
            if (taskArea) taskArea.classList.add('task-loading');
            
            // 根据按钮类型设置不同的加载状态
            switch (buttonType) {
                case 'translate':
                    const translateBtn = document.getElementById(`translate-btn-${taskId}`);
                    const retranslateBtn = document.getElementById(`retranslate-btn-${taskId}`);
                    if (translateBtn) {
                        translateBtn.innerHTML = '<span class="btn-icon">⏳</span>翻译中...';
                        translateBtn.disabled = true;
                    }
                    if (retranslateBtn) {
                        retranslateBtn.innerHTML = '<span class="btn-icon">⏳</span>翻译中...';
                        retranslateBtn.disabled = true;
                    }
                    break;
                case 'du-sie':
                    const duSieBtn = document.getElementById(`du-sie-btn-${taskId}`);
                    if (duSieBtn) {
                        duSieBtn.disabled = true;
                        duSieBtn.innerHTML = '<span class="btn-icon">⏳</span>转换中...';
                    }
                    break;
                case 'remove-dash':
                    const removeDashBtn = document.getElementById(`remove-dash-btn-${taskId}`);
                    if (removeDashBtn) {
                        removeDashBtn.disabled = true;
                        removeDashBtn.innerHTML = '<span class="btn-icon">⏳</span>处理中...';
                    }
                    break;
                case 'remove-emoji':
                    const removeEmojiBtn = document.getElementById(`remove-emoji-btn-${taskId}`);
                    if (removeEmojiBtn) {
                        removeEmojiBtn.disabled = true;
                        removeEmojiBtn.innerHTML = '<span class="btn-icon">⏳</span>处理中...';
                    }
                    break;
                case 'remove-comments':
                    const removeCommentsBtn = document.getElementById(`remove-comments-btn-${taskId}`);
                    if (removeCommentsBtn) {
                        removeCommentsBtn.disabled = true;
                        removeCommentsBtn.innerHTML = '<span class="btn-icon">⏳</span>清洗中...';
                    }
                    break;
            }
        } else {
            // 移除加载中的视觉反馈
            if (taskArea) taskArea.classList.remove('task-loading');
            
            // 恢复按钮状态
            switch (buttonType) {
                case 'translate':
                    const translateBtn = document.getElementById(`translate-btn-${taskId}`);
                    const retranslateBtn = document.getElementById(`retranslate-btn-${taskId}`);
                    if (translateBtn) {
                        translateBtn.innerHTML = '<span class="btn-icon">🔄</span>翻译';
                        translateBtn.disabled = false;
                    }
                    if (retranslateBtn) {
                        retranslateBtn.innerHTML = '<span class="btn-icon">🔄</span>重新翻译';
                        retranslateBtn.disabled = false;
                    }
                    break;
                case 'du-sie':
                    const duSieBtn = document.getElementById(`du-sie-btn-${taskId}`);
                    if (duSieBtn) {
                        duSieBtn.disabled = false;
                        duSieBtn.innerHTML = '<span class="btn-icon">↔️</span>Du/Sie';
                    }
                    break;
                case 'remove-dash':
                    const removeDashBtn = document.getElementById(`remove-dash-btn-${taskId}`);
                    if (removeDashBtn) {
                        removeDashBtn.disabled = false;
                        removeDashBtn.innerHTML = '<span class="btn-icon">➖</span>去短横线';
                    }
                    break;
                case 'remove-emoji':
                    const removeEmojiBtn = document.getElementById(`remove-emoji-btn-${taskId}`);
                    if (removeEmojiBtn) {
                        removeEmojiBtn.disabled = false;
                        removeEmojiBtn.innerHTML = '<span class="btn-icon">😐</span>去表情';
                    }
                    break;
                case 'remove-comments':
                    const removeCommentsBtn = document.getElementById(`remove-comments-btn-${taskId}`);
                    if (removeCommentsBtn) {
                        removeCommentsBtn.disabled = false;
                        // 检查是否有备份来决定按钮文本
                        const backup = this.multiTaskManager.originalTextBackups.get(taskId);
                        if (backup !== undefined) {
                            removeCommentsBtn.innerHTML = '<span class="btn-icon">↩️</span>撤销清洗';
                        } else {
                            removeCommentsBtn.innerHTML = '<span class="btn-icon">🧹</span>去除备注';
                        }
                    }
                    break;
            }
        }
    }

    // 显示全局加载状态（保留用于其他模块）
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
            case 'ocr-recognition':
                document.getElementById('ocr-recognize')?.click();
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