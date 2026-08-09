const divResizer     = document.querySelector('#resizer');
const divEditorPanel = document.querySelector('#editor-panel');
const divResultPanel = document.querySelector('#result-panel');

let isResizing = false;
let startX = 0;
let startWidth = 0;
let workspaceWidth = 0;

const MIN_WIDTH = 20;
const MAX_WIDTH = 60;


divResizer.addEventListener('mousedown', (mInfo) => {
    isResizing = true;
    mInfo.preventDefault(); 
    startX = mInfo.clientX;
    startWidth = divResultPanel.offsetWidth;

    // 在按下时计算工作区长度，（每次拖拽都重新算）
    workspaceWidth = document.querySelector('#workspace').offsetWidth;
})

document.addEventListener('mousemove', (minfo) => {
    if (!isResizing) return;

    if (minfo.buttons === 0) {
        isResizing = false;
    }

    const deltaX = startX - minfo.clientX;
    const newWidthPx = startWidth + deltaX;

    let newWidth = (newWidthPx / workspaceWidth) * 100;

    newWidth = newWidth < MIN_WIDTH ? MIN_WIDTH : newWidth;
    newWidth = newWidth > MAX_WIDTH ? MAX_WIDTH : newWidth;

    divEditorPanel.style.flex = '1 1 0';
    divResultPanel.style.flex = '0 1 ' + newWidth + '%';
    autoGrow(inputPattern, 88); // 刷新输入框高度
    autoGrow(inputReplace, 132);
});

document.addEventListener('mouseup', () => {
    isResizing = false;
});
