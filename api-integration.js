// API Integration for German Translation Assistant
// OpenRouter API集成模块

class APIIntegration {
    constructor() {
        this.users = {};  // 存储所有用户的API密钥
        this.currentUser = null;  // 当前选中的用户
        this.currentEditingUser = null;  // 当前正在编辑的用户
        this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
        this.init();
    }

    init() {
        // 从本地存储加载用户数据
        this.loadUsers();
        this.setupEventListeners();
        this.updateUI();
    }

    // 设置事件监听器
    setupEventListeners() {
        // API配置按钮
        document.getElementById('api-config-btn')?.addEventListener('click', () => {
            this.showAPIConfig();
        });

        // 关闭模态框
        document.getElementById('close-api-config')?.addEventListener('click', () => {
            this.hideAPIConfig();
        });

        // 点击模态框外部关闭
        document.getElementById('api-config-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'api-config-modal') {
                this.hideAPIConfig();
            }
        });

        // 用户选择
        document.getElementById('user-select')?.addEventListener('change', (e) => {
            this.selectUser(e.target.value);
        });

        // 添加新用户
        document.getElementById('add-user-btn')?.addEventListener('click', () => {
            this.showAddUser();
        });

        // 编辑用户配置
        document.getElementById('edit-user-btn')?.addEventListener('click', () => {
            this.showEditUser();
        });

        // 删除用户
        document.getElementById('delete-user-btn')?.addEventListener('click', () => {
            this.deleteCurrentUser();
        });

        // 复制OpenRouter API密钥
        document.getElementById('copy-openrouter-key')?.addEventListener('click', () => {
            this.copyToClipboard('api-key', 'copy-openrouter-key');
        });

        // 显示/隐藏OpenRouter API密钥
        document.getElementById('toggle-openrouter-key')?.addEventListener('click', () => {
            this.togglePasswordVisibility('api-key', 'toggle-openrouter-key');
        });

        // 导出用户配置
        document.getElementById('export-users-btn')?.addEventListener('click', () => {
            this.exportUsers();
        });

        // 保存API配置
        document.getElementById('save-api-config')?.addEventListener('click', () => {
            this.saveAPIConfig();
        });

        // 测试API连接
        document.getElementById('test-api')?.addEventListener('click', () => {
            this.testAPIConnection();
        });

        // 词汇表按钮
        document.getElementById('vocabulary-btn')?.addEventListener('click', () => {
            this.showVocabularyModal();
        });

        // 词汇表模态框相关事件
        document.getElementById('close-vocabulary-modal')?.addEventListener('click', () => {
            this.hideVocabularyModal();
        });
        
        document.getElementById('close-vocabulary')?.addEventListener('click', () => {
            this.hideVocabularyModal();
        });

        // 点击模态框外部关闭
        document.getElementById('vocabulary-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'vocabulary-modal') {
                this.hideVocabularyModal();
            }
        });

        // 词汇表用户选择
        document.getElementById('vocab-user-select')?.addEventListener('change', (e) => {
            this.selectVocabUser(e.target.value);
        });

        // 词汇表管理按钮
        document.getElementById('add-vocab-btn')?.addEventListener('click', () => {
            this.showAddVocabForm();
        });

        document.getElementById('save-vocab-btn')?.addEventListener('click', () => {
            this.saveVocabulary();
        });

        document.getElementById('cancel-vocab-btn')?.addEventListener('click', () => {
            this.hideAddVocabForm();
        });

        document.getElementById('import-vocab-btn')?.addEventListener('click', () => {
            this.importVocabulary();
        });

        document.getElementById('export-vocab-btn')?.addEventListener('click', () => {
            this.exportVocabulary();
        });

        document.getElementById('clear-vocab-btn')?.addEventListener('click', () => {
            this.clearVocabulary();
        });
    }

    // 显示API配置模态框
    showAPIConfig() {
        document.getElementById('api-config-modal').classList.remove('hidden');
        
        // 确保每次打开时都重置到干净状态
        document.getElementById('user-config').style.display = 'none';
        this.currentEditingUser = null;
        
        this.updateUserSelect();
        this.updateUI();
        this.updateConfigFormMode();
    }

    // 隐藏API配置模态框
    hideAPIConfig() {
        document.getElementById('api-config-modal').classList.add('hidden');
        // 隐藏用户配置区域
        document.getElementById('user-config').style.display = 'none';
        // 清除编辑状态
        this.currentEditingUser = null;
        this.updateConfigFormMode();
    }

    // 从本地存储加载用户数据
    loadUsers() {
        const usersData = localStorage.getItem('translation_users');
        if (usersData) {
            try {
                this.users = JSON.parse(usersData);
            } catch (error) {
                console.error('加载用户数据失败:', error);
                this.users = {};
            }
        }

        // 加载当前选中的用户
        const currentUserId = localStorage.getItem('current_user_id');
        if (currentUserId && this.users[currentUserId]) {
            this.currentUser = currentUserId;
        }
    }

    // 保存用户数据到本地存储
    saveUsers() {
        localStorage.setItem('translation_users', JSON.stringify(this.users));
        if (this.currentUser) {
            localStorage.setItem('current_user_id', this.currentUser);
        }
    }

    // 更新用户选择下拉框
    updateUserSelect() {
        const userSelect = document.getElementById('user-select');
        if (!userSelect) return;

        // 清空现有选项
        userSelect.innerHTML = '<option value="">请选择用户...</option>';

        // 添加所有用户
        Object.keys(this.users).forEach(userId => {
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = this.users[userId].name;
            if (userId === this.currentUser) {
                option.selected = true;
            }
            userSelect.appendChild(option);
        });
    }

    // 选择用户
    selectUser(userId) {
        if (userId && this.users[userId]) {
            this.currentUser = userId;
            this.saveUsers();
            
            // 如果用户配置界面是显示的，加载用户信息到表单并设置编辑状态
            if (document.getElementById('user-config').style.display === 'block') {
                this.currentEditingUser = userId; // 设置为编辑模式
                this.loadUserToForm(userId);
                this.updateConfigFormMode(); // 更新按钮文字
            }
        } else {
            this.currentUser = null;
        }
        this.updateUI();
    }

    // 将用户信息加载到表单中
    loadUserToForm(userId) {
        if (!this.users[userId]) return;
        
        const user = this.users[userId];
        document.getElementById('user-name').value = user.name || '';
        document.getElementById('api-key').value = user.apiKey || '';
    }

    // 显示添加用户界面
    showAddUser() {
        this.currentEditingUser = null; // 清除编辑状态
        document.getElementById('user-config').style.display = 'block';
        document.getElementById('user-name').value = '';
        document.getElementById('api-key').value = '';
        document.getElementById('user-name').focus();
        this.updateConfigFormMode();
    }

    // 显示编辑用户界面
    showEditUser() {
        if (!this.currentUser) {
            this.showMessage('请先选择要编辑的用户', 'error');
            return;
        }
        
        this.currentEditingUser = this.currentUser; // 设置编辑状态
        document.getElementById('user-config').style.display = 'block';
        this.loadUserToForm(this.currentUser);
        document.getElementById('user-name').focus();
        this.updateConfigFormMode();
    }

    // 更新配置表单模式（添加/编辑）
    updateConfigFormMode() {
        const saveBtn = document.getElementById('save-api-config');
        if (this.currentEditingUser) {
            saveBtn.textContent = '更新配置';
            saveBtn.title = '更新现有用户配置';
        } else {
            saveBtn.textContent = '保存配置';
            saveBtn.title = '保存新用户配置';
        }
    }

    // 保存API配置
    saveAPIConfig() {
        const userName = document.getElementById('user-name').value.trim();
        const apiKey = document.getElementById('api-key').value.trim();
        
        if (!userName) {
            this.showMessage('请输入用户名称', 'error');
            return;
        }
        
        if (!apiKey) {
            this.showMessage('请输入OpenRouter API密钥', 'error');
            return;
        }

        let userId;
        let isEditing = false;
        
        if (this.currentEditingUser) {
            // 编辑模式：更新现有用户
            userId = this.currentEditingUser;
            isEditing = true;
            
            // 更新用户信息
            this.users[userId] = {
                ...this.users[userId], // 保留原有信息
                name: userName,
                apiKey: apiKey,
                vocabulary: this.users[userId].vocabulary || [], // 保留原有词汇表
                updatedAt: new Date().toISOString()
            };
        } else {
            // 添加模式：检查是否已存在同名用户
            const existingUser = Object.values(this.users).find(user => user.name === userName);
            if (existingUser) {
                this.showMessage(`用户名 "${userName}" 已存在，请使用不同的名称或选择编辑现有用户`, 'error');
                return;
            }
            
            // 创建新用户
            userId = this.generateUserId(userName);
            
            // 保存用户信息
            this.users[userId] = {
                name: userName,
                apiKey: apiKey,
                vocabulary: [], // 初始化空词汇表
                createdAt: new Date().toISOString()
            };
        }
        
        // 设置为当前用户
        this.currentUser = userId;
        
        // 清除编辑状态
        this.currentEditingUser = null;
        
        // 保存到本地存储
        this.saveUsers();
        
        // 更新界面
        this.updateUserSelect();
        this.updateUI();
        // 移除自动关闭：this.hideAPIConfig();
        
        // 隐藏用户配置表单，返回到选择界面
        document.getElementById('user-config').style.display = 'none';
        
        this.showMessage(`用户 "${userName}" 配置已${isEditing ? '更新' : '保存'}，建议进行测试连接`, 'success');
    }

    // 生成用户ID
    generateUserId(userName) {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `${userName}_${timestamp}_${randomStr}`;
    }

    // 删除当前用户
    deleteCurrentUser() {
        if (!this.currentUser) {
            this.showMessage('没有选中的用户', 'error');
            return;
        }

        const userName = this.users[this.currentUser].name;
        
        if (confirm(`确定要删除用户 "${userName}" 吗？`)) {
            delete this.users[this.currentUser];
            this.currentUser = null;
            
            this.saveUsers();
            this.updateUserSelect();
            this.updateUI();
            
            this.showMessage(`用户 "${userName}" 已删除`, 'success');
        }
    }

    // 导出用户配置
    exportUsers() {
        if (Object.keys(this.users).length === 0) {
            this.showMessage('没有用户配置可导出', 'error');
            return;
        }

        const exportData = {
            users: this.users,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `translation_users_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showMessage('用户配置已导出', 'success');
    }

    // 更新整体UI状态
    updateUI() {
        this.updateCurrentUserInfo();
        this.updateModelStatus();
        this.updateDeleteButton();
    }

    // 更新当前用户信息显示
    updateCurrentUserInfo() {
        const currentUserName = document.getElementById('current-user-name');
        const currentApiStatus = document.getElementById('current-api-status');
        
        if (this.currentUser && this.users[this.currentUser]) {
            const user = this.users[this.currentUser];
            currentUserName.textContent = user.name;
            currentApiStatus.textContent = '🟢 已配置';
            currentApiStatus.style.color = '#10b981';
        } else {
            currentUserName.textContent = '未选择';
            currentApiStatus.textContent = '⚪ 未配置';
            currentApiStatus.style.color = '#6b7280';
        }
    }

    // 更新API状态显示
    updateModelStatus() {
        const openrouterStatus = document.getElementById('openrouter-status');
        
        const hasOpenrouterKey = this.getCurrentApiKey();
        
        // OpenRouter状态
        if (hasOpenrouterKey) {
            openrouterStatus.textContent = '🟢 已配置';
            openrouterStatus.style.color = '#10b981';
        } else {
            openrouterStatus.textContent = '⚪ 未配置';
            openrouterStatus.style.color = '#6b7280';
        }
    }

    // 更新按钮状态
    updateDeleteButton() {
        const deleteBtn = document.getElementById('delete-user-btn');
        const editBtn = document.getElementById('edit-user-btn');
        
        if (deleteBtn) {
            deleteBtn.disabled = !this.currentUser;
        }
        
        if (editBtn) {
            editBtn.disabled = !this.currentUser;
        }
    }

    // 复制到剪贴板
    async copyToClipboard(inputId, buttonId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        
        if (!input || !input.value.trim()) {
            this.showMessage('API密钥为空，无法复制', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(input.value);
            
            // 显示复制成功状态
            button.classList.add('copied');
            const originalText = button.textContent;
            button.textContent = '✓';
            
            setTimeout(() => {
                button.classList.remove('copied');
                button.textContent = originalText;
            }, 2000);
            
            this.showMessage('API密钥已复制到剪贴板', 'success');
        } catch (error) {
            // 降级方案：选中文本
            input.select();
            input.setSelectionRange(0, 99999); // 移动设备兼容
            
            try {
                document.execCommand('copy');
                this.showMessage('API密钥已复制到剪贴板', 'success');
            } catch (fallbackError) {
                this.showMessage('复制失败，请手动选择和复制', 'error');
            }
        }
    }

    // 切换密码可见性
    togglePasswordVisibility(inputId, buttonId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        
        if (!input || !button) return;

        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
            button.title = '隐藏密钥';
        } else {
            input.type = 'password';
            button.textContent = '👁️';
            button.title = '显示密钥';
        }
    }

    // 测试API连接
    async testAPIConnection() {
        const openrouterKey = this.getCurrentApiKey();
        
        if (!openrouterKey) {
            this.showMessage('请先选择用户并配置OpenRouter API密钥', 'error');
            return;
        }

        const testBtn = document.getElementById('test-api');
        const originalText = testBtn.textContent;
        testBtn.textContent = '测试中...';
        testBtn.disabled = true;

        try {
            let results = [];
            
            // 测试OpenRouter API
            try {
                const openrouterResponse = await this.callAPI('professor', '测试');
                if (openrouterResponse) {
                    results.push('✅ OpenRouter API连接成功');
                }
            } catch (error) {
                results.push(`❌ OpenRouter API连接失败: ${error.message}`);
            }
            
            // 测试AI回译功能
            try {
                const backTranslationTest = await this.translateGermanToChinese('Hallo Welt');
                if (backTranslationTest && !backTranslationTest.includes('暂时不可用')) {
                    results.push('✅ AI回译功能连接成功');
                } else {
                    results.push('❌ AI回译功能连接失败');
                }
            } catch (error) {
                results.push(`❌ AI回译功能连接失败: ${error.message}`);
            }

            const allSuccess = results.every(r => r.includes('✅'));
            const hasWarning = results.some(r => r.includes('⚠️'));
            
            this.showMessage(results.join('\n'), allSuccess ? 'success' : (hasWarning ? 'warning' : 'error'));

        } catch (error) {
            console.error('API Test Error:', error);
            this.showMessage(`API测试失败: ${error.message}`, 'error');
        } finally {
            testBtn.textContent = originalText;
            testBtn.disabled = false;
        }
    }

    // 获取当前用户的API密钥
    getCurrentApiKey() {
        if (this.currentUser && this.users[this.currentUser]) {
            return this.users[this.currentUser].apiKey;
        }
        return null;
    }

    // 调用OpenRouter API
    async callAPI(role, text) {
        const apiKey = this.getCurrentApiKey();
        if (!apiKey) {
            throw new Error('未配置API密钥');
        }

        // 检查角色配置是否存在
        if (!window.ROLE_PROMPTS || !window.ROLE_PROMPTS[role]) {
            throw new Error(`未找到角色配置: ${role}`);
        }

        const model = window.getModelForRole(role);
        const vocabulary = this.getCurrentUserVocabulary();
        const prompt = window.buildCompletePrompt(role, text, vocabulary);

        console.log('API Request:', {
            role,
            model,
            user: this.currentUser ? this.users[this.currentUser].name : 'Unknown',
            prompt: prompt.substring(0, 100) + '...',
            text
        });

        const requestBody = {
            model: model,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        };

        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant'
                },
                body: JSON.stringify(requestBody)
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
            
            // 检测人称使用
            const pronounType = this.detectPronounUsage(translation);

            return {
                translation,
                pronounType,
                model: model,
                role: role,
                user: this.currentUser ? this.users[this.currentUser].name : 'Unknown'
            };

        } catch (error) {
            console.error('API Call Error:', error);
            throw error;
        }
    }

    // 检测德语译文中的人称使用
    detectPronounUsage(text) {
        const lowerText = text.toLowerCase();
        
        // 检测Sie的使用（您）
        const siePatterns = [
            /\bsie\b/g,
            /\bihnen\b/g,
            /\bihr\b/g,
            /\bihre\b/g,
            /\bihres\b/g,
            /\bihrem\b/g,
            /\bihren\b/g,
            /\bihrer\b/g
        ];

        // 检测Du的使用（你）
        const duPatterns = [
            /\bdu\b/g,
            /\bdich\b/g,
            /\bdir\b/g,
            /\bdein\b/g,
            /\bdeine\b/g,
            /\bdeines\b/g,
            /\bdeinem\b/g,
            /\bdeinen\b/g,
            /\bdeiner\b/g
        ];

        let sieCount = 0;
        let duCount = 0;

        // 计算Sie相关词汇出现次数
        siePatterns.forEach(pattern => {
            const matches = lowerText.match(pattern);
            if (matches) sieCount += matches.length;
        });

        // 计算Du相关词汇出现次数  
        duPatterns.forEach(pattern => {
            const matches = lowerText.match(pattern);
            if (matches) duCount += matches.length;
        });

        // 判断主要使用的人称
        if (sieCount > duCount && sieCount > 0) {
            return 'Sie (您)';
        } else if (duCount > sieCount && duCount > 0) {
            return 'Du (你)';
        } else if (sieCount === 0 && duCount === 0) {
            return '无人称';
        } else {
            return '混合人称';
        }
    }

    // 中德翻译
    async translateChineseToGerman(text, role) {
        try {
            const result = await this.callAPI(role, text);
            
            // 执行回译检查
            const backTranslation = await this.translateGermanToChinese(result.translation);
            
            return {
                translation: result.translation,
                pronounType: result.pronounType,
                backTranslation: backTranslation,
                model: result.model,
                role: result.role
            };

        } catch (error) {
            console.error('Translation Error:', error);
            throw error;
        }
    }

    // 德中翻译（回译功能）- 直接使用AI回译
    async translateGermanToChinese(germanText) {
        console.log('AI Back Translation Request:', {
            text: germanText.substring(0, 100) + '...',
            user: this.currentUser ? this.users[this.currentUser].name : 'Unknown'
        });

        return this.aiBackTranslation(germanText);
    }

    // AI回译功能
    async aiBackTranslation(germanText) {
        try {
            const apiKey = this.getCurrentApiKey();
            if (!apiKey) {
                return '回译功能不可用：未配置API密钥';
            }

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Chinese-German-Translation-Assistant'
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.5-flash',
                    messages: [{
                        role: 'user',
                        content: `请将以下德语文本翻译成中文，只输出中文翻译结果，不要添加任何解释：\n\n${germanText}`
                    }],
                    temperature: 0.3,
                    max_tokens: 500
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0] && data.choices[0].message) {
                    return data.choices[0].message.content.trim();
                }
            }
            
            return '回译功能暂时不可用';
        } catch (error) {
            console.error('AI Back Translation Error:', error);
            return '回译功能暂时不可用';
        }
    }

    // 显示消息提示
    showMessage(message, type = 'info') {
        // 调用主应用的消息显示功能
        if (window.translationApp) {
            window.translationApp.showMessage(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // 检查API是否已配置（只需要OpenRouter API密钥）
    isConfigured() {
        return !!this.getCurrentApiKey();
    }

    // ==================== 词汇表管理功能 ====================

    // 显示词汇表模态框
    showVocabularyModal() {
        document.getElementById('vocabulary-modal').classList.remove('hidden');
        this.updateVocabUserSelect();
        this.hideAddVocabForm();
        this.selectVocabUser(this.currentUser);
    }

    // 隐藏词汇表模态框
    hideVocabularyModal() {
        document.getElementById('vocabulary-modal').classList.add('hidden');
        this.hideAddVocabForm();
    }

    // 更新词汇表用户选择下拉框
    updateVocabUserSelect() {
        const userSelect = document.getElementById('vocab-user-select');
        if (!userSelect) return;

        // 清空现有选项
        userSelect.innerHTML = '<option value="">请选择用户...</option>';

        // 添加所有用户
        Object.keys(this.users).forEach(userId => {
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = this.users[userId].name;
            if (userId === this.currentUser) {
                option.selected = true;
            }
            userSelect.appendChild(option);
        });
    }

    // 选择词汇表用户
    selectVocabUser(userId) {
        if (userId && this.users[userId]) {
            this.currentVocabUser = userId;
            this.updateVocabList();
            this.updateVocabManagement();
        } else {
            this.currentVocabUser = null;
            this.updateVocabList();
            this.updateVocabManagement();
        }
    }

    // 更新词汇表列表显示
    updateVocabList() {
        const vocabList = document.getElementById('vocab-list');
        if (!vocabList) return;

        if (!this.currentVocabUser || !this.users[this.currentVocabUser]) {
            vocabList.innerHTML = '<div class="vocab-empty">请选择用户查看词汇表</div>';
            return;
        }

        const vocabulary = this.users[this.currentVocabUser].vocabulary || [];
        
        if (vocabulary.length === 0) {
            vocabList.innerHTML = '<div class="vocab-empty">暂无词汇条目，点击"添加词汇"开始添加</div>';
            return;
        }

        let html = '';
        vocabulary.forEach((item, index) => {
            html += `
                <div class="vocab-item">
                    <div class="vocab-pair">
                        <div class="vocab-chinese">${this.escapeHtml(item.chinese)}</div>
                        <div class="vocab-german">${this.escapeHtml(item.german)}</div>
                    </div>
                    <div class="vocab-actions-item">
                        <button class="btn btn-outline btn-small" onclick="window.apiIntegration.editVocabItem(${index})">编辑</button>
                        <button class="btn btn-secondary btn-small" onclick="window.apiIntegration.deleteVocabItem(${index})">删除</button>
                    </div>
                </div>
            `;
        });

        vocabList.innerHTML = html;
    }

    // 更新词汇表管理界面
    updateVocabManagement() {
        const vocabManagement = document.getElementById('vocab-management');
        if (!vocabManagement) return;

        if (this.currentVocabUser) {
            vocabManagement.style.display = 'block';
            const vocabulary = this.users[this.currentVocabUser].vocabulary || [];
            
            // 更新统计信息
            const userName = this.users[this.currentVocabUser].name;
            const count = vocabulary.length;
            vocabManagement.querySelector('label').textContent = `${userName}的词汇表管理 (${count}个词汇)`;
        } else {
            vocabManagement.style.display = 'none';
        }
    }

    // 显示添加词汇表单
    showAddVocabForm() {
        if (!this.currentVocabUser) {
            this.showMessage('请先选择用户', 'error');
            return;
        }
        
        document.getElementById('vocab-add-form').style.display = 'block';
        document.getElementById('vocab-chinese').value = '';
        document.getElementById('vocab-german').value = '';
        document.getElementById('vocab-chinese').focus();
    }

    // 隐藏添加词汇表单
    hideAddVocabForm() {
        document.getElementById('vocab-add-form').style.display = 'none';
        
        // 重置编辑状态
        this.editingVocabIndex = undefined;
        document.getElementById('save-vocab-btn').textContent = '保存';
    }

    // 保存词汇
    saveVocabulary() {
        if (!this.currentVocabUser) {
            this.showMessage('请先选择用户', 'error');
            return;
        }

        const chinese = document.getElementById('vocab-chinese').value.trim();
        const german = document.getElementById('vocab-german').value.trim();

        if (!chinese || !german) {
            this.showMessage('请输入中文词汇和德语表达', 'error');
            return;
        }

        const vocabulary = this.users[this.currentVocabUser].vocabulary || [];
        
        // 检查是否为编辑模式
        if (this.editingVocabIndex !== undefined) {
            // 编辑模式：直接更新指定索引的词汇
            vocabulary[this.editingVocabIndex] = { chinese, german };
            this.editingVocabIndex = undefined;
            
            // 恢复保存按钮文本
            document.getElementById('save-vocab-btn').textContent = '保存';
        } else {
            // 添加模式：检查是否已存在相同的中文词汇
            const existingIndex = vocabulary.findIndex(item => item.chinese === chinese);
            
            if (existingIndex !== -1) {
                if (confirm(`词汇 "${chinese}" 已存在，是否要覆盖现有的德语表达？`)) {
                    vocabulary[existingIndex] = { chinese, german };
                } else {
                    return;
                }
            } else {
                vocabulary.push({ chinese, german });
            }
        }

        // 保存到用户数据
        this.users[this.currentVocabUser].vocabulary = vocabulary;
        this.saveUsers();

        // 更新界面
        this.updateVocabList();
        this.updateVocabManagement();
        this.hideAddVocabForm();

        this.showMessage('词汇已添加', 'success');
    }

    // 编辑词汇条目
    editVocabItem(index) {
        if (!this.currentVocabUser) return;

        const vocabulary = this.users[this.currentVocabUser].vocabulary || [];
        if (index < 0 || index >= vocabulary.length) return;

        const item = vocabulary[index];
        
        // 显示编辑表单
        document.getElementById('vocab-add-form').style.display = 'block';
        document.getElementById('vocab-chinese').value = item.chinese;
        document.getElementById('vocab-german').value = item.german;
        document.getElementById('vocab-chinese').focus();

        // 设置编辑模式
        this.editingVocabIndex = index;
        
        // 更新保存按钮文本
        document.getElementById('save-vocab-btn').textContent = '更新';
    }

    // 删除词汇条目
    deleteVocabItem(index) {
        if (!this.currentVocabUser) return;

        const vocabulary = this.users[this.currentVocabUser].vocabulary || [];
        if (index < 0 || index >= vocabulary.length) return;

        const item = vocabulary[index];
        
        if (confirm(`确定要删除词汇 "${item.chinese}" → "${item.german}" 吗？`)) {
            vocabulary.splice(index, 1);
            this.users[this.currentVocabUser].vocabulary = vocabulary;
            this.saveUsers();
            
            this.updateVocabList();
            this.updateVocabManagement();
            this.showMessage('词汇已删除', 'success');
        }
    }

    // 导入词汇表
    importVocabulary() {
        if (!this.currentVocabUser) {
            this.showMessage('请先选择用户', 'error');
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(data)) {
                        throw new Error('文件格式不正确，应该是词汇数组');
                    }

                    // 验证数据格式
                    const validItems = data.filter(item => 
                        item && 
                        typeof item.chinese === 'string' && 
                        typeof item.german === 'string' &&
                        item.chinese.trim() && 
                        item.german.trim()
                    );

                    if (validItems.length === 0) {
                        throw new Error('没有找到有效的词汇数据');
                    }

                    // 合并到现有词汇表
                    const currentVocab = this.users[this.currentVocabUser].vocabulary || [];
                    const mergedVocab = [...currentVocab];
                    
                    let addedCount = 0;
                    let skippedCount = 0;
                    
                    validItems.forEach(item => {
                        const existingIndex = mergedVocab.findIndex(existing => existing.chinese === item.chinese);
                        if (existingIndex === -1) {
                            mergedVocab.push({
                                chinese: item.chinese.trim(),
                                german: item.german.trim()
                            });
                            addedCount++;
                        } else {
                            skippedCount++;
                        }
                    });

                    this.users[this.currentVocabUser].vocabulary = mergedVocab;
                    this.saveUsers();
                    
                    this.updateVocabList();
                    this.updateVocabManagement();
                    
                    this.showMessage(`导入完成！添加了 ${addedCount} 个词汇，跳过了 ${skippedCount} 个重复词汇`, 'success');
                    
                } catch (error) {
                    console.error('Import error:', error);
                    this.showMessage(`导入失败：${error.message}`, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // 导出词汇表
    exportVocabulary() {
        if (!this.currentVocabUser) {
            this.showMessage('请先选择用户', 'error');
            return;
        }

        const vocabulary = this.users[this.currentVocabUser].vocabulary || [];
        if (vocabulary.length === 0) {
            this.showMessage('词汇表为空，无法导出', 'error');
            return;
        }

        const userName = this.users[this.currentVocabUser].name;
        const exportData = vocabulary.map(item => ({
            chinese: item.chinese,
            german: item.german
        }));

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${userName}_词汇表_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showMessage('词汇表已导出', 'success');
    }

    // 清空词汇表
    clearVocabulary() {
        if (!this.currentVocabUser) {
            this.showMessage('请先选择用户', 'error');
            return;
        }

        const userName = this.users[this.currentVocabUser].name;
        const vocabulary = this.users[this.currentVocabUser].vocabulary || [];
        
        if (vocabulary.length === 0) {
            this.showMessage('词汇表已经是空的', 'info');
            return;
        }

        if (confirm(`确定要清空 "${userName}" 的所有词汇吗？此操作不可恢复。`)) {
            this.users[this.currentVocabUser].vocabulary = [];
            this.saveUsers();
            
            this.updateVocabList();
            this.updateVocabManagement();
            this.showMessage('词汇表已清空', 'success');
        }
    }

    // 获取当前用户的词汇表
    getCurrentUserVocabulary() {
        if (this.currentUser && this.users[this.currentUser]) {
            return this.users[this.currentUser].vocabulary || [];
        }
        return [];
    }

    // HTML转义工具函数
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// 全局API集成实例
window.apiIntegration = new APIIntegration();
 