// 角色提示词配置文件
// 您可以在这里修改每个角色的翻译风格提示词

const ROLE_PROMPTS = {
    // 教授角色 - 使用Gemini 2.5 Flash
    professor: {
        model: "google/gemini-2.5-flash",
        prompt: "请将以下中文翻译成正式、专业的德语，适合在金融领域的社群中由一位教授对学生或投资者进行解释或分析，语言应学术化、清晰、无情绪色彩。"
    },

    // 25岁女助理角色 - 使用Mistral Small 3.2 24B
    "assistant-25": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文翻译成亲切自然的德语，语气年轻女性化，适合在Telegram或WhatsApp群组中用日常口语与投资者沟通，内容与金融、加密货币相关。"
    },

    // 35岁女助理角色 - 使用Mistral Small 3.2 24B
    "assistant-35": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文翻译成成熟稳重的德语，语气平和可信，适合一位35岁女性在社群中以助理身份提醒或引导用户讨论金融、股市或虚拟货币话题。"
    },

    // 公告女助理角色 - 使用Gemini 2.5 Flash
    "announcement-assistant": {
        model: "google/gemini-2.5-flash",
        prompt: "请将以下中文翻译成简洁正式的德语公告风格，用于Telegram或WhatsApp群组中发布金融、股票或虚拟货币相关的重要信息或提醒。"
    },

    // 水军1号（普通型）- 使用Mistral Small 3.2 24B
    "troll-1": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文翻译成自然流畅的德语口语，语气正常、平和，适合在群组中进行日常交流和讨论金融、币圈话题，不带明显情绪色彩。"
    },

    // 水军2号（情绪型）- 使用Mistral Small 3.2 24B
    "troll-2": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文翻译成基础口语化的德语，句子简短，语气夸张、热情，适合在群组中吸引注意力或炒热金融、币圈话题。"
    },

    // 水军3号（引导型）- 使用Mistral Small 3.2 24B
    "troll-3": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文翻译成互动性强的德语，多使用简单疑问句，语气好奇、自然，适合在Telegram群组中引发用户对金融或币圈事件的讨论。"
    },

    // 水军4号（煽动型）- 使用Mistral Small 3.2 24B
    "troll-4": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文翻译成具有煽动性、夸张且情绪化的德语，语言激烈，适合在群组中制造争议或带节奏，内容与金融或币圈话题相关。"
    }
};

/*
// 核心翻译规则（不可修改）
const TRANSLATION_RULES = `

重要翻译规则：
1. 如果中文原文中出现了"您"，则译文必须用"Sie"
2. 如果中文原文只有"你"，则必须用"Du"
3. 输出除了德语译文，不需要有其他任何内容，包括引号或者任何说明性注释
4. 过滤角色信息：不要翻译原文中的角色、性别、年龄等描述性信息（如"女助理："、"25岁："等）
5. 称呼一致性：原文开头无称呼时，译文开头也不要有称呼（如"Sehr geehrte Damen und Herren,"等）
6. 纯净输出：不要添加德语邮件/信件的格式元素，如开头称呼、结尾问候语、签名等
7. 保持简洁：只翻译核心内容，保持原文的简洁风格

`;
*/

// 核心翻译规则（不可修改）
const TRANSLATION_RULES = `
1. „您“ als „Sie“, „你“ als „Du“
2. Nur übersetzen, wenn Emoji im Original – sonst keines hinzufügen
3. Nur deutsche Übersetzung als Output, keine Anführungszeichen, Klammern, Kommentare oder Formatierung
4. Rollen-, Geschlechts- oder Altersangaben nicht übersetzen
5. Ohne Anrede im Original auch keine in der Übersetzung, keine deutschen Brief-/Mail-Formatelemente
6. Inhalt und Stil kompakt und originalgetreu halten

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
        vocabularySection = `\n\n专业词汇固定对照表：\n${vocabulary.map(item => `"${item.chinese}" → "${item.german}"`).join('\n')}\n\n请在翻译时优先使用上述词汇表中的对应翻译。`;
    }

    return config.prompt + TRANSLATION_RULES + vocabularySection + `\n请翻译以下中文：${text}`;
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
