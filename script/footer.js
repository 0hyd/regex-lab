const btnTheme = document.querySelector("#btn-theme");
const root = document.documentElement;

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