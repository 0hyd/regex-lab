function replaceText(regex, text, replacement) {
    const processedReplacement = replacement
        .replace(/\\n/g, '\n')   // 换行
        .replace(/\\t/g, '\t')   // 制表符
        .replace(/\\r/g, '\r');  // 回车    
    const result = text.replace(regex, processedReplacement);
    return result;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderText(text) {
    return escapeHtml(text)
        .replace(/\n/g, '<span class="inv-char">↵</span>\n')
        .replace(/\t/g, '<span class="inv-char">→</span>');
}

function renderMatch(text) {
    return `<mark class="match-highlight">${renderText(text)}</mark>`;
}