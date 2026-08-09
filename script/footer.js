const btnTheme = document.querySelector("#btn-theme");
const btnExport = document.querySelector('#btn-export');
const btnImport = document.querySelector('#btn-import');
const root = document.documentElement;
const IMPORT_MAX_FIELD_LENGTH = 10000;

function applyTheme(theme) {
    root.dataset.theme = theme;
    btnTheme.textContent = theme === 'light' ? '深色' : '浅色';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('regexlab.theme');
    const theme = savedTheme === 'light' ? 'light' : 'dark'; // 输入校验

    applyTheme(theme);
}

function toggleTheme() {
    const currentTheme = root.dataset.theme;
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';

    applyTheme(nextTheme);
    localStorage.setItem('regexlab.theme', nextTheme);
}

loadTheme();

btnTheme.addEventListener('click', toggleTheme);

function exportPatterns() {
    const patterns = getExportPatterns();
    if (patterns.length === 0) {
        alert('暂无收藏可导出');
        return;
    }

    const exportData = {
        version: 1,
        patterns
    };
    const jsonText = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonText], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `regexlab-patterns-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function isValidImportData(data) {
    return data &&
        typeof data === 'object' &&
        data.version === 1 &&
        Array.isArray(data.patterns);
}

function isValidImportPattern(item) {
    return item &&
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        typeof item.regex === 'string' &&
        typeof item.flags === 'string' &&
        typeof item.replace === 'string' &&
        typeof item.text === 'string' &&
        item.name.length <= IMPORT_MAX_FIELD_LENGTH &&
        item.regex.length <= IMPORT_MAX_FIELD_LENGTH &&
        item.replace.length <= IMPORT_MAX_FIELD_LENGTH &&
        item.text.length <= IMPORT_MAX_FIELD_LENGTH &&
        /^(?!.*(.).*\1)[gimsu]*$/.test(item.flags);
}

const inputImportFile = document.createElement('input');
inputImportFile.type = 'file';
inputImportFile.accept = 'application/json,.json';
inputImportFile.hidden = true;
document.body.append(inputImportFile);

async function handleImportFile() {
    const file = inputImportFile.files[0];
    if (!file) return;

    try {
        const importData = JSON.parse(await file.text());
        if (!isValidImportData(importData)) {
            alert('导入失败：不是有效的 Regex Lab 备份文件');
            return;
        }

        const validPatterns = importData.patterns.filter(isValidImportPattern);
        const invalidCount = importData.patterns.length - validPatterns.length;
        const {importedCount, duplicateCount} = importPatterns(validPatterns);

        alert(`导入完成：新增 ${importedCount} 条，跳过重复 ${duplicateCount} 条，跳过无效 ${invalidCount} 条`);
    } catch (error) {
        alert('导入失败：文件不是有效的 JSON');
    } finally {
        inputImportFile.value = '';
    }
}

btnExport.addEventListener('click', exportPatterns);
btnImport.addEventListener('click', () => inputImportFile.click());
inputImportFile.addEventListener('change', handleImportFile);
