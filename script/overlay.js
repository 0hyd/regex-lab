const inputTest = document.querySelector('#test-input');
const preTest   = document.querySelector('.highlight-layer');

function syncHighlight() {
    const text = inputTest.value;

    let htmlText = escapeHtml(text)
        .replace(/\n/g, '<span class="inv-char">↵</span>\n')
        .replace(/\t/g, '<span class="inv-char">→</span>');

    if (!htmlText.endsWith('\n')) {
        htmlText += '\n';
    }
    preTest.innerHTML = htmlText;
}

// 同步滚动条
function syncScroll() {
    preTest.scrollTop = inputTest.scrollTop;
}