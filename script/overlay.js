const inputTest = document.querySelector('#test-input');
const preTest   = document.querySelector('.highlight-layer');

function syncHighlight(matchArray = []) {
    const text = inputTest.value;
    let html = '';
    let lastIndex = 0;

    matchArray.forEach(item => {
        const matchStart = item.index;
        const matchEnd = matchStart + item.match.length;

        html += renderText(text.slice(lastIndex,matchStart));
        html += renderMatch(text.slice(matchStart,matchEnd));

        lastIndex = matchEnd;
    });

    html += renderText(text.slice(lastIndex));
        
    if (!html.endsWith('\n')) {
        html += '\n';
    }
    preTest.innerHTML = html;
}

// 同步滚动条
function syncScroll() {
    preTest.scrollTop = inputTest.scrollTop;
}