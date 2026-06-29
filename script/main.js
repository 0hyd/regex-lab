function debounce(fn, delay) { // 防抖，function开口的会声明函数
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
const inputTest    = document.querySelector('#test-input');
const inputReplace = document.querySelector("#replace-input");
const formFlags    = document.querySelector('#flags');

let replacePreviewText = '';

function handlePatternInput() { // 会声明函数
    const textPattern = inputPattern.value;
    const textTest = inputTest.value;
    
    if (!textPattern || !textTest) {
        renderResults([], '');
        return;
    }
    const formFlagsData = new FormData(formFlags);
    const {regex, error} = buildRegExp(textPattern, formFlagsData); // 构造正则表达式

    if (error) {
        replacePreviewText = `${error}`;
        renderErrorResults([], `无效的正则：\n${error}`);
        return;
    }
    const matchArray = runMatch(regex, textTest); // 匹配结果

    const textReplace = inputReplace.value; 
    replacePreviewText = replaceText(regex, textTest, textReplace); // 预览替换

    renderResults(matchArray, replacePreviewText);
}

// 因为函数已经声明，可以写到开头，但逻辑上写到结尾更合理
inputPattern.addEventListener('input', debounce(handlePatternInput, 300));
inputTest.   addEventListener('input', debounce(handlePatternInput, 300));
inputReplace.addEventListener('input', debounce(handlePatternInput, 300));
formFlags.   addEventListener('input', handlePatternInput);

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
const btnCopyresult  = document.querySelector('#btn-copy-result');

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
bindCopy(btnCopyresult,  () => replacePreviewText);


/**
 * 侧边栏功能区：
 * 包裹折叠、收藏等功能
 */


// 边框折叠
const divSavedSidebar = document.querySelector('#saved-sidebar');
const btnToggle = document.querySelector('#toggle-btn');
btnToggle.addEventListener('click', () => {
    divSavedSidebar.classList.toggle('collapsed');
    const text = divSavedSidebar.classList.contains('collapsed') ? '▶' : '◀';
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
divCommonList.addEventListener('click', (e) => {
    const card = e.target.closest('.common-card');
    if (!card) return;

    const id = card.dataset.id;
    const preset = PRESETS.find(p => p.id === id);
    if (!preset) return;
    
    inputPattern.value = preset.pattern;
    inputReplace.value = preset.replace;
    inputTest.value    = preset.test;
    autoGrow(inputPattern, 88); // 刷新输入框高度
    autoGrow(inputReplace, 132);
    // flags
    document.querySelectorAll('#flags input').forEach(cb => {
        cb.checked = preset.flags.includes(cb.name);
    });

    handlePatternInput();
})

/**
 * 收藏功能
 */

// 收藏点击跳转
divSavedList.addEventListener('click', (e) => {
    const card = e.target.closest('.saved-card');
    if (!card) return;

    const id = card.dataset.id;
    const savedData = loadPatterns();
    const preset = savedData.find(p => p.id === id);
    if (!preset) return;
    
    inputPattern.value = preset.regex;
    inputReplace.value = preset.replace;
    inputTest.value = preset.text;
    autoGrow(inputPattern, 88); // 刷新输入框高度
    autoGrow(inputReplace, 132);

    // flags
    document.querySelectorAll('#flags input').forEach(cb => {
        cb.checked = preset.flags.includes(cb.name);
    });

    handlePatternInput();
})

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
    let Timer = null;
    clearTimeout(Timer);
    Timer = setTimeout(() => {
        btnSave.textContent = '收藏当前';
        btnSave.classList.remove('error');
    }, time);
}

/**
 * footer 功能区
 */