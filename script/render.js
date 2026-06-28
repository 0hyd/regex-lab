// 渲染常用列表
const divCommonList = document.querySelector('#common-list');

function renderPresets(presets) {
    divCommonList.innerHTML = ``;

    presets.forEach((item, idx) => {
        const card  = document.createElement('article'); // 创建子元素
        card.classList.add('common-card');
        card.dataset.id = item.id;

        const cardHeader = document.createElement('div');
        const title = document.createElement('h4');
        title.textContent = item.name;
        const flags = document.createElement('span');
        flags.textContent = `/${item.flags}`;

        cardHeader.appendChild(title);
        cardHeader.appendChild(flags);

        const regex = document.createElement('code');
        regex.textContent = item.pattern;
        
        card.appendChild(cardHeader);
        card.appendChild(regex);

        divCommonList.appendChild(card);
    });
}

// 渲染收藏列表
const divSavedList = document.querySelector('#saved-list');

function renderSaved(savedData) {
    divSavedList.innerHTML = ``;

    savedData.slice().reverse().forEach((item) => {
        const card  = document.createElement('article'); // 创建子元素
        card.classList.add('saved-card');
        card.dataset.id = item.id;

        const cardHeader = document.createElement('div');
        const title = document.createElement('h4');
        title.textContent = item.name;
        const flags = document.createElement('span');
        flags.textContent = `/${item.flags}`;

        cardHeader.appendChild(title);
        cardHeader.appendChild(flags);

        const regex = document.createElement('code');
        regex.textContent = item.regex;
        
        card.appendChild(cardHeader);
        card.appendChild(regex);

        divSavedList.appendChild(card);
    }); 
}

// 渲染结果
const resultHeader    = document.querySelector('#result-header')
const resultList      = document.querySelector('#result-list');
const textareaReplace = document.querySelector('#replace-preview');

function render(matchArray) {
    resultList.innerHTML = ``;

    resultHeader.textContent = `匹配结果 ${matchArray.length} 处`;

    if (matchArray.length === 0) {
        resultList.innerHTML = `<article id='no-match'>无匹配结果</article>`;
    } else {
        matchArray.forEach((item,idx) => {
            const card = document.createElement('article');
            card.textContent = `${idx+1}. 位置 ${item.index}-${item.index+item.match.length}: ${item.match}`;
            card.className = 'result-card';
            resultList.appendChild(card);
        });
    }
    textareaReplace.value = replacePreviewText;
}

function renderResults(matchArray, replacePreviewText) {
    // 渲染替换结果
    render(matchArray);
    textareaReplace.classList.remove('error');
    document.querySelector('#pattern-input').classList.remove('error');
    textareaReplace.value = replacePreviewText;
}

function renderErrorResults(matchArray, replacePreviewText) {
    render(matchArray);
    textareaReplace.classList.add('error');
    document.querySelector('#pattern-input').classList.add('error');
}