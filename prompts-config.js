// 角色提示词配置文件
// 您可以在这里修改每个角色的翻译风格提示词

const ROLE_PROMPTS = {
    // 男教授角色 - 权威但亲和的群聊风格
    "male-professor": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文直接翻译成德语，保持逐字逐句的忠实翻译，不要添加、删减或改变原文含义。翻译要准确体现男性教授的语气，但严格按照原文内容翻译，不要自由发挥。"
    },

    // 女教授角色 - 权威但亲和的群聊风格  
    "female-professor": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文直接翻译成德语，保持逐字逐句的忠实翻译，不要添加、删减或改变原文含义。翻译要准确体现女性教授的语气，但严格按照原文内容翻译，不要自由发挥。"
    },

    // 男助理角色 - 热情帮助的群聊风格
    "male-assistant": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文直接翻译成德语，保持逐字逐句的忠实翻译，不要添加、删减或改变原文含义。翻译要准确体现男性助理的语气，但严格按照原文内容翻译，不要自由发挥。"
    },

    // 女助理角色 - 贴心帮助的群聊风格
    "female-assistant": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文直接翻译成德语，保持逐字逐句的忠实翻译，不要添加、删减或改变原文含义。翻译要准确体现女性助理的语气，但严格按照原文内容翻译，不要自由发挥。"
    },

    // 男水军角色 - 活跃的群聊参与者
    "male-troll": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文直接翻译成德语，保持逐字逐句的忠实翻译，不要添加、删减或改变原文含义。翻译要准确体现男性群友的语气，但严格按照原文内容翻译，不要自由发挥。"
    },

    // 女水军角色 - 活跃的群聊参与者
    "female-troll": {
        model: "mistralai/mistral-small-3.2-24b-instruct",
        prompt: "请将以下中文直接翻译成德语，保持逐字逐句的忠实翻译，不要添加、删减或改变原文含义。翻译要准确体现女性群友的语气，但严格按照原文内容翻译，不要自由发挥。"
    }
};


// 核心翻译规则（不可修改）
const TRANSLATION_RULES = `

KRITISCHE AUSGABE-REGELN:
1. NUR die deutsche Übersetzung ausgeben - NICHTS ANDERES
2. KEINE Anführungszeichen, Klammern, Kommentare, Erklärungen oder Formatierung
3. KEINE einleitenden oder abschließenden Sätze wie "Hier ist die Übersetzung:"
4. KEINE Metakommentare oder Zusatzbemerkungen

IGNORIEREN UND NICHT ÜBERSETZEN:
5. Nummern und Codes (wie 1.2.3., A.B.C.)
6. Rollenangaben in eckigen Klammern [甲方说], [乙方回复] etc.
7. Redaktionelle Notizen in runden Klammern (备注), (说明) etc.
8. Editierungshinweise und Metakommentare
9. Rollen-, Geschlechts- oder Altersangaben

INHALTLICHE REGELN:
10. „您"/„您好" → „Sie", „你"/„你好" → „Du" (kontextabhängig)
11. Emoji nur übersetzen wenn im Original vorhanden - KEINE Emojis hinzufügen wenn im chinesischen Original keine sind
12. Ohne Anrede im Original auch keine deutsche Anrede hinzufügen
13. Originalstil und -länge beibehalten
14. Technische Begriffe und Eigennamen unverändert lassen

AUSGABE: Nur der übersetzte deutsche Text, sonst absolut nichts.

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
