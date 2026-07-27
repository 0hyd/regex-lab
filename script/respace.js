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