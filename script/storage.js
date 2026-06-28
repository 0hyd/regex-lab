const PRESETS = [
    {
        id: 'preset-email',
        name: '📧 邮箱',
        pattern: '(?<!\\w)[\\w.+-]+@[\\w-]+\\.[\\w.]+(?!\\w)',
        flags: 'gi',
        replace: '[这是邮箱]',
        test: '联系邮箱：zhangsan@example.com\n' +
              '备用邮箱：lisi_test@company.co.cn\n' +
              '客服邮箱：service@shop.com\n' +
              '无效格式：admin@domain（不匹配）\n' +
              '技术支持：support+dev@mail.org'
    },
    {
        id: 'preset-phone',
        name: '📱 手机号',
        pattern: '(?<!\\d)1[3-9]\\d{9}(?!\\d)',
        flags: 'g',
        replace: '[这是手机]',
        test: '张三：13812345678\n' +
              '李四：15987654321\n' +
              '客服热线：400-800-8888（不匹配）\n' +
              '王五：18666668888\n' +
              '紧急联系人：17712349999\n' +
              '座机：010-12345678（不匹配）\n' +
              '错误号码：12345678901（不匹配）'
    },
    {
        id: 'preset-url',
        name: '🌐 URL',
        pattern: '(?<![\\w./-])https?://[\\w./?=&%-]+',
        flags: 'gi',
        replace: '[这是链接]',
        test: '官网：https://www.example.com\n' +
              'API文档：http://api.example.com/v1/users\n' +
              '搜索链接：https://example.com/search?q=regex&lang=zh-CN\n' +
              'GitHub仓库：https://github.com/user/repo\n' +
              '普通文本不含链接行'
    },
    {
        id: 'preset-idcard',
        name: '🪪 身份证',
        pattern: '(?<!\\d)\\d{17}[\\dXx](?!\\d)',
        flags: 'g',
        replace: '[这是身份证]',
        test: '申请人：张三，身份证号：110101199001011234\n' +
              '申请人：李四，身份证号：440305198505056789\n' +
              '申请人：王五，身份证号：31011520001010123X\n' +
              '银行卡号：6222021234567890123（不匹配，19位）\n' +
              '邮编：518000（不匹配）'
    },
    {
        id: 'preset-ip',
        name: '💻 IP地址',
        pattern: '(?<!\\d)((25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1?\\d?\\d)(?!\\d)',
        flags: 'g',
        replace: '[这是IP]',
        test: '服务器地址：192.168.1.1\n' +
              'DNS服务器：8.8.8.8\n' +
              '访问来源：10.0.0.138\n' +
              '版本号：v1.2.3（不匹配，数字太少）\n' +
              '子网掩码：255.255.255.0'
    }
];

renderPresets(PRESETS);
renderSaved(loadPatterns());  // 页面加载时从 localStorage 读取并渲染

// 用户收藏
//加载本地数据
function loadPatterns() {
    let patterns = localStorage.getItem('regexlab.patterns');
    if (!patterns) {
        return [];
    }
    try {
        const jsonPatterns = JSON.parse(patterns); //转为数组
        return jsonPatterns;
    } catch(e) {
        console.error(e.massage); // todo 错误提示
        return [];
    }

}

// 写入本地数据
function saveToLocal(savedData) {
    const jsonStr = JSON.stringify(savedData); // 转 JSON 格式
    try { // 达到储存上限
        localStorage.setItem('regexlab.patterns',jsonStr);
    } catch(e) {
       if (e.name === 'QuotaExceededError') {
            alert('存储已满，请删除部分收藏'); // todo what
        }
    }

    renderSaved(loadPatterns());
}

const MAX_TEST_LENGTH = 10000;     // test 字段上限

// 保存正则、标志位、替换
function savePattern(regex, flags, replace, text) { 
    /** @type {Array} */               //类型注释
    let savedData = loadPatterns();

    // 判重
    const isAlreadyHave = savedData.some(item =>
        item.regex === regex &&
        item.flags === flags &&
        item.replace === replace &&
        item.text === text
    );
    if (isAlreadyHave) {
        btnSavedError('该收藏已存在', 1000);
        return;
    }

    // 过长丢弃
    if (
        regex.length > MAX_TEST_LENGTH ||
        replace.length > MAX_TEST_LENGTH) {
            btnSavedError('正则过长，保存失败', 3000);
            return;
        }
    if (text.length > MAX_TEST_LENGTH) {
        text = '';
        btnSavedError('测试文本过长，仅保存正则相关内容', 3000);
    }

    // 保存
    const newSavedData = {
        id     : 'user-' + Date.now(), // 时间戳
        name   : new Date().toLocaleString(), // 命名1为中文格式时间
        regex  : regex,
        flags  : flags,
        replace: replace,
        text   : text
    };

    savedData.push(newSavedData);
    saveToLocal(savedData);

    console.log('收藏成功');
}

// 删除
function deletePattern(id) {
    /** @type {Array} */
    let savedData = loadPatterns();
    savedData.filter(item => item.id !== id);
    saveToLocal(savedData);
}

