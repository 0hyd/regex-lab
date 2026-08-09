let editMode = false; // 编辑模式
let editingId = null;
let savedInfoTimer = null;

function debounce(fn, delay) { // 防抖，function开头的会声明函数
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    }
}

/**
 * 编辑区：
 * 包括触发计算正则
 * 复制功能
 */

const inputPattern = document.querySelector('#pattern-input');
const inputReplace = document.querySelector("#replace-input");
const formFlags    = document.querySelector('#flags');

let replacePreviewText = '';

function handlePatternInput() { // 会声明函数
    const textPattern = inputPattern.value;
    const textTest = inputTest.value;

    if (!textPattern || !textTest) {
        renderResults([], '');
        syncHighlight([]);
        return;
    }
    const formFlagsData = new FormData(formFlags);
    const {regex, error} = buildRegExp(textPattern, formFlagsData); // 构造正则表达式

    if (error) {
        replacePreviewText = `${error}`;
        renderErrorResults([], `无效的正则：\n${error}`);
        syncHighlight([]);
        return;
    }
    const matchArray = runMatch(regex, textTest); // 匹配结果

    const textReplace = inputReplace.value; 
    replacePreviewText = replaceText(regex, textTest, textReplace); // 预览替换

    renderResults(matchArray, replacePreviewText);
    syncHighlight(matchArray);
}

const debouncedHandlePatternInput = debounce(handlePatternInput, 300);

// 因为函数已经声明，可以写到开头，但逻辑上写到结尾更合理
inputPattern.addEventListener('input', () => {
    syncHighlight([]);
    debouncedHandlePatternInput();
});
inputTest.   addEventListener('input', () => {
    syncHighlight([]);
    debouncedHandlePatternInput();
});
inputReplace.addEventListener('input', debouncedHandlePatternInput);
formFlags.   addEventListener('input', () => {
    syncHighlight([]);
    handlePatternInput();
});
inputTest.   addEventListener('scroll', syncScroll);

// 输入框大小灵活调整
function autoGrow(el, maxHeight) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
}
inputPattern.addEventListener('input', () => autoGrow(inputPattern, 88));
inputReplace.addEventListener('input', () => autoGrow(inputReplace, 132));

// 复制逻辑
const btnCopyRegex   = document.querySelector('#btn-copy-regex');
const btnCopyReplace = document.querySelector('#btn-copy-replace');
const btnCopyText    = document.querySelector('#btn-copy-test');
const btnCopyResult  = document.querySelector('#btn-copy-result');

function bindCopy(btn, text) {
    let Timer = null;
    btn.addEventListener('click', () => {
        navigator.clipboard.writeText(text());
        btn.textContent = '已复制!';
        clearTimeout(Timer);
        Timer = setTimeout(() => {
            btn.textContent = '复制';
        }, 1500);
    });
}

bindCopy(btnCopyRegex,   () => inputPattern.value);
bindCopy(btnCopyReplace, () => inputReplace.value);
bindCopy(btnCopyText,    () => inputTest.value);
bindCopy(btnCopyResult,  () => replacePreviewText);


/**
 * 侧边栏功能区：
 * 包裹折叠、收藏等功能
 */


// 边框折叠
const savedSidebar = document.querySelector('#saved-sidebar');
const btnToggle = document.querySelector('#toggle-btn');
btnToggle.addEventListener('click', () => {
    savedSidebar.classList.toggle('collapsed');
    const text = savedSidebar.classList.contains('collapsed') ? '▶' : '◀';
    btnToggle.textContent = text;
});

// 预设列表折叠
const h2HeadingCommon = document.querySelector('#heading-common');
h2HeadingCommon.addEventListener('click', (e) => {
    const header = e.target.closest('.collapsible');
    if (!header) return;
    header.classList.toggle('collapsed');
    const text = header.classList.contains('collapsed') ? '+ 常用' : '- 常用';
    h2HeadingCommon.textContent = text;
});
const h2HeadingSaved = document.querySelector('#heading-saved');
h2HeadingSaved.addEventListener('click', (e) => {
    const header = e.target.closest('.collapsible');
    header.classList.toggle('collapsed');
    const text = header.classList.contains('collapsed') ? '+ 收藏' : '- 收藏';
    h2HeadingSaved.textContent = text;
});


// 常用点击跳转
commonList.addEventListener('click', (e) => {
    const card = e.target.closest('.common-card');
    if (!card) return;

    const id = card.dataset.id;
    const preset = PRESETS.find(preset => preset.id === id);
    if (!preset) return;
    
    inputPattern.value = preset.pattern;
    inputReplace.value = preset.replace;
    inputTest.value    = preset.test;
    autoGrow(inputPattern, 88); // 刷新输入框高度
    autoGrow(inputReplace, 132);
    // flags
    document.querySelectorAll('#flags input').forEach(flagInput => {
        flagInput.checked = preset.flags.includes(flagInput.name);
    });

    handlePatternInput();
})

/**
 * 收藏功能
 */

// 收藏点击跳转

function savedToShow(id) {
    const savedData = loadPatterns();
    const savedPattern = savedData.find(savedPattern => savedPattern.id === id);
    if (!savedPattern) return;
    
    inputPattern.value = savedPattern.regex;
    inputReplace.value = savedPattern.replace;
    inputTest.value = savedPattern.text;
    autoGrow(inputPattern, 88); // 刷新输入框高度
    autoGrow(inputReplace, 132);

    // flags
    document.querySelectorAll('#flags input').forEach(flagInput => {
        flagInput.checked = savedPattern.flags.includes(flagInput.name);
    });

    handlePatternInput();
}

savedList.addEventListener('click', (e) => {
    const card = e.target.closest('.saved-card');
    if (!card) return;
    if (e.target.closest('.card-name-input')) return;
    
    if (e.target.closest('.btn-delete')) { // 删除功能
        deletePattern(card.dataset.id);
        return;
    }

    editingId = card.dataset.id;
    savedToShow(editingId); // 显示收藏

    savedList.querySelectorAll('.saved-card.editing').forEach(savedCard => {
        savedCard.classList.remove('editing');
    });

    card.classList.add('editing');
})

// 编辑收藏名称
savedList.addEventListener('input', (e) => {
    const card = e.target.closest('.saved-card');
    const input = e.target.closest('.card-name-input');
    editSavedTitle(card.dataset.id, input.value);
});


// 收藏当前
const btnSave = document.querySelector('#save-btn');

btnSave.addEventListener('click', () => {
    const pattern = inputPattern.value;
    const text = inputTest.value;

    if (!pattern) {
        btnSavedInfo('空的正则表达式', 1000, 'error');
        return;
    }

    // 获取flags
    let flags = '';
    const formFlagsData = new FormData(formFlags);
    formFlagsData.forEach((value, name) => { flags += name; });

    const replace = inputReplace.value;

    savePattern(pattern, flags, replace, text);
});

// 按钮错误信息显示
function btnSavedInfo(info, time, type) {
    btnSave.textContent = info;
    if (type === 'error') {
        btnSave.classList.add('error');
    }
    clearTimeout(savedInfoTimer);
    savedInfoTimer = setTimeout(() => {
        if (editMode) {
            btnSave.textContent = '编辑模式：保存至当前选中项';
        } else {
            btnSave.textContent = '收藏当前';
        }
        btnSave.classList.remove('error');
    }, time);
}

/**
 * footer 功能区：
 */
const btnEditSaved = document.querySelector('#btn-edit-saved');
const workspace = document.querySelector('#workspace');
btnEditSaved.addEventListener('click', () => {
    editMode = !editMode;
    if (editMode) {
        workspace.classList.add('edit-mode');
        btnSave.textContent = '编辑模式：保存至当前选中项';
        btnEditSaved.textContent = '退出';
    } else {
        workspace.classList.remove('edit-mode');
        btnSave.textContent = '收藏当前';
        btnEditSaved.textContent = '编辑';
    }
    renderSaved(loadPatterns());
})

renderPresets(PRESETS);
renderSaved(loadPatterns());  // 页面加载时从 localStorage 读取并渲染
