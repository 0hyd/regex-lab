function buildRegExp(textPattern, formFlagsData) {
    let flags = '';

    for (const [name, value] of formFlagsData) {
        if (value) {
            flags += name;
        }
    }

    try {
        const regex = new RegExp(textPattern, flags);
        return {regex, error: null};
    } catch (e) {
        return {regex: null, error: e.message};
    }
}

function runMatch(regex, textTest) {
    let iterator = null;
    if (regex.global) {
        iterator = [...textTest.matchAll(regex)]; // 展开迭代器
    } else {
        const match = regex.exec(textTest);
        iterator = match ? [match] : [];
    }
    const matchArray = iterator.map((match) => { // 遍历数组元素
            return {
                index: match.index,
                match: match[0],
                groups: [...match].slice(1)
            }
        });
    return matchArray;
    
}