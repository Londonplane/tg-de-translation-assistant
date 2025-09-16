// 角色提示词配置文件
// 您可以在这里修改每个角色的翻译风格提示词

const ROLE_PROMPTS = {
    // 男教授角色 - 权威但亲和的群聊风格
    "male-professor": {
        model: "anthropic/claude-3.5-sonnet",
        prompt: "Please translate the following Chinese directly into German, maintaining faithful word-for-word and sentence-by-sentence translation. Do not add, delete, or change the original meaning. The translation should accurately reflect the tone of a male professor, but strictly follow the original content without creative interpretation."
    },

    // 女教授角色 - 权威但亲和的群聊风格  
    "female-professor": {
        model: "anthropic/claude-3.5-sonnet",
        prompt: "Please translate the following Chinese directly into German, maintaining faithful word-for-word and sentence-by-sentence translation. Do not add, delete, or change the original meaning. The translation should accurately reflect the tone of a female professor, but strictly follow the original content without creative interpretation."
    },

    // 男助理角色 - 热情帮助的群聊风格
    "male-assistant": {
        model: "anthropic/claude-3.5-sonnet",
        prompt: "Please translate the following Chinese directly into German, maintaining faithful word-for-word and sentence-by-sentence translation. Do not add, delete, or change the original meaning. The translation should accurately reflect the tone of a male assistant, but strictly follow the original content without creative interpretation."
    },

    // 女助理角色 - 贴心帮助的群聊风格
    "female-assistant": {
        model: "anthropic/claude-3.5-sonnet",
        prompt: "Please translate the following Chinese directly into German, maintaining faithful word-for-word and sentence-by-sentence translation. Do not add, delete, or change the original meaning. The translation should accurately reflect the tone of a female assistant, but strictly follow the original content without creative interpretation."
    },

    // 男水军角色 - 活跃的群聊参与者
    "male-troll": {
        model: "anthropic/claude-3.5-sonnet",
        prompt: "Please translate the following Chinese directly into German, maintaining faithful word-for-word and sentence-by-sentence translation. Do not add, delete, or change the original meaning. The translation should accurately reflect the tone of a male group member, but strictly follow the original content without creative interpretation."
    },

    // 女水军角色 - 活跃的群聊参与者
    "female-troll": {
        model: "anthropic/claude-3.5-sonnet",
        prompt: "Please translate the following Chinese directly into German, maintaining faithful word-for-word and sentence-by-sentence translation. Do not add, delete, or change the original meaning. The translation should accurately reflect the tone of a female group member, but strictly follow the original content without creative interpretation."
    }
};


// Core translation rules (immutable)
const TRANSLATION_RULES = `

CRITICAL OUTPUT RULES:
1. Output ONLY the German translation - NOTHING ELSE
2. NO quotation marks, brackets, comments, explanations, or formatting
3. NO introductory or concluding sentences like "Here is the translation:"
4. NO meta-comments or additional remarks

IGNORE AND DO NOT TRANSLATE:
5. Numbers and codes (like 1.2.3., A.B.C.)
6. Role indicators in square brackets [甲方说], [乙方回复] etc.
7. Editorial notes in round brackets (备注), (说明) etc.
8. Editing instructions and meta-comments
9. Role, gender, or age specifications

CONTENT RULES:
10. "您"/"您好" → "Sie", "你"/"你好" → "Du" (context-dependent)
11. Only translate emojis if present in original - DO NOT add emojis if none exist in the Chinese original
12. If no greeting in original, do not add German greeting
13. Maintain original style and length
14. Leave technical terms and proper names unchanged

OUTPUT: Only the translated German text, absolutely nothing else.

`;

// 构建完整的prompt
function buildCompletePrompt(role, text, vocabulary = []) {
    const config = ROLE_PROMPTS[role];
    if (!config) {
        throw new Error(`未找到角色配置: ${role}`);
    }

    // 构建词汇表部分
    let vocabularySection = '';
    if (vocabulary && vocabulary.length > 0) {
        vocabularySection = `\n\nProfessional vocabulary fixed correspondence table:\n${vocabulary.map(item => `"${item.chinese}" → "${item.german}"`).join('\n')}\n\nPlease prioritize using the corresponding translations from the vocabulary table above when translating.`;
    }

    return config.prompt + TRANSLATION_RULES + vocabularySection + `\nPlease translate the following Chinese: ${text}`;
}

// 获取模型配置
function getModelForRole(role) {
    const config = ROLE_PROMPTS[role];
    return config ? config.model : null;
}

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ROLE_PROMPTS, buildCompletePrompt, getModelForRole };
}

// 在浏览器中暴露到全局对象
if (typeof window !== 'undefined') {
    window.ROLE_PROMPTS = ROLE_PROMPTS;
    window.buildCompletePrompt = buildCompletePrompt;
    window.getModelForRole = getModelForRole;
}
