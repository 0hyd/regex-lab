// 渲染常用列表
const commonList = document.querySelector('#common-list');

function renderPresets(presets) {
    commonList.innerHTML = '';

    presets.forEach(preset => {
        const card  = document.createElement('article'); // 创建子元素
        card.classList.add('common-card');
        card.dataset.id = preset.id;

        const cardHeader = document.createElement('div');
        const title = document.createElement('h4');
        title.textContent = preset.name;
        const flags = document.createElement('span');
        flags.textContent = `/${preset.flags}`;

        cardHeader.appendChild(title);
        cardHeader.appendChild(flags);

        const regex = document.createElement('code');
        regex.textContent = preset.pattern;
        
        card.appendChild(cardHeader);
        card.appendChild(regex);

        commonList.appendChild(card);
    });
}

// 渲染收藏列表
const savedList = document.querySelector('#saved-list');

function renderSaved(savedData) { // idEdit 切换是否编辑
    savedList.innerHTML = '';

    savedData.slice().reverse().forEach(savedPattern => {
        const card  = document.createElement('article'); // 创建子元素
        card.classList.add('saved-card');
        card.dataset.id = savedPattern.id;
        
        const cardHeader = document.createElement('div');
        
        if (editMode) {
            const inputTitle = document.createElement('input');
            inputTitle.value = savedPattern.name;
            inputTitle.id= `name-${savedPattern.id}`;
            inputTitle.classList.add('card-name-input');
            cardHeader.appendChild(inputTitle);
        } else {
            const title = document.createElement('h4');
            title.textContent = savedPattern.name;
            cardHeader.appendChild(title);
        }
        const flags = document.createElement('span');
        flags.textContent = `/${savedPattern.flags}`;
        cardHeader.appendChild(flags);
        
        if (editMode) {
            const btnDelete = document.createElement('button');
            btnDelete.textContent = '❌';
            btnDelete.classList.add('btn-delete');
            cardHeader.appendChild(btnDelete);
        }
        
        card.appendChild(cardHeader);
        
        const regex = document.createElement('code');
        regex.textContent = savedPattern.regex;
        card.appendChild(regex);

        savedList.appendChild(card);
    }); 
}

// 渲染结果
const resultHeader    = document.querySelector('#result-header')
const resultList      = document.querySelector('#result-list');
const textareaReplace = document.querySelector('#replace-preview');

function render(matchArray) {
    resultList.innerHTML = '';

    resultHeader.textContent = `匹配结果 ${matchArray.length} 处`;

    if (matchArray.length === 0) {
        resultList.innerHTML = `<article id='no-match'>无匹配结果</article>`;
    } else {
        matchArray.forEach((matchResult, index) => {
            const card = document.createElement('article'); // 创建卡片

            const matchPosition = document.createElement('div');
            matchPosition.textContent = `${index + 1}. 位置 ${matchResult.index}-${matchResult.index + matchResult.match.length}:`;

            const matchText = document.createElement('div');
            matchText.textContent = matchResult.match;

            card.className = 'result-card';
            const captureList = document.createElement('ol');
            matchResult.groups.forEach(group => {
                const captureCard = document.createElement('li');
                captureCard.textContent = `组: ${group}`;
                captureCard.className = 'capture-card';
                captureList.appendChild(captureCard);
            });

            card.appendChild(matchPosition);
            card.appendChild(matchText);
            card.appendChild(captureList);
            
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
}

function renderErrorResults(matchArray, replacePreviewText) {
    render(matchArray);
    textareaReplace.classList.add('error');
    document.querySelector('#pattern-input').classList.add('error');
}
