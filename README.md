# 正则实验室 (regex-lab)

一个交互式的正则表达式测试工具，支持实时匹配、替换预览、模式收藏和拖拽调整面板。

---

## 功能清单

- [x] 正则输入框（支持 g/i/m/s/u 标志位）
- [x] 测试文本框
- [x] 实时匹配显示（结果卡片含位置、匹配内容）
- [x] 替换功能（预览 + 支持 \n \t \r 转义）
- [x] 常用模式
- [ ] 用户收藏
- [x] 拖拽调整 panel 宽度（百分比限幅）
- [x] 左侧 sidebar 折叠
- [x] 各模块复制按钮（正则/替换/测试文本/替换结果）
- [ ] 编辑模式（批量删除收藏）
- [ ] 主题切换（深色/浅色）
- [ ] 导出数据（JSON 下载）
- [ ] 显示正则匹配解释
- [ ] 高亮显示正文匹配的内容
- [ ] 点击卡片跳转到测试文本对于位置
- [x] 常用 / 收藏可折叠

---

### 开发中

1. 收藏删除（hover 切换 ✕ 按钮）
2. 编辑功能
3. 侧边栏底部三按钮（编辑 / 主题 / 导出）

---

### 待实现：侧边栏底部按钮

在 `#saved-sidebar` 底部新增 `#sidebar-footer`，放三个工具按钮。展开时横向排列，折叠时竖向排列。

**HTML 结构：**
```
aside#saved-sidebar
├── button#toggle-btn (右上角)
├── section#saved-section (内容，折叠时隐藏)
└── div#sidebar-footer (底部，新增)
    ├── button#btn-edit   (编辑模式)
    ├── button#btn-theme  (主题切换)
    └── button#btn-export (导出数据)
```

**CSS 布局：**
```
展开：[编辑] [主题] [导出]     ← flex-direction: row
折叠：[编辑] / [主题] / [导出] ← flex-direction: column
```

```css
#sidebar-footer {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 8px;
}
#saved-sidebar.collapsed #sidebar-footer {
    flex-direction: column;
}
```

#### 按钮 1：编辑模式

- 作用：切换 `#saved-list.edit-mode`，显示卡片删除按钮
- 切换按钮文字：`编辑` ↔ `完成`
- 只对用户收藏生效，不影响常用区

#### 按钮 2：主题切换（深色/浅色）

- **原理**：给 `<html>` 加 `data-theme="light"` 属性，CSS 变量覆盖
- **持久化**：存 `localStorage.getItem('regexlab.theme')`
- **图标**：深色显 ☀️，浅色显 🌙
- **过渡动画**：`body { transition: background-color 0.3s; }`

```css
:root, [data-theme="dark"] {
    --bg-primary: hsl(60, 2%, 12%);
    --text-primary: #ffffff;
}
[data-theme="light"] {
    --bg-primary: hsl(60, 10%, 96%);
    --text-primary: #1a1a1a;
}
```

#### 按钮 3：导出数据

- **作用**：下载用户收藏为 JSON 文件
- **核心 API**：`Blob` + `URL.createObjectURL` + `<a download>`
- **文件名**：`regex-patterns-2024-01-15.json`（带日期）
- **格式化**：`JSON.stringify(patterns, null, 2)`（2 空格缩进，可读）

```js
const blob = new Blob([jsonStr], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `regex-patterns-${date}.json`;
a.click();
URL.revokeObjectURL(url);
```

#### 实现顺序

1. 加 `#sidebar-footer` HTML 结构
2. 写 CSS 布局（展开横向 / 折叠竖向）
3. 实现主题切换（CSS 变量覆盖 + localStorage）
4. 实现编辑模式（`classList.toggle` + 删除按钮显隐）
5. 实现导出（Blob + 下载链接）

---

## 已知问题

1. **saved-sidebar**：拖拽分割线时 saved-sidebar 宽度比例会随 flex 变化，固定宽度与折叠冲突
2. **分组信息**：结果卡片暂未展示捕获组详情
3. 结果卡片样式未优化
4. 变量变多，命名需要优化
5. p, e, ietm 混用不清
6. 单行文本太多时候，滚动条样式遮挡边框；文本内容超出边距

---

## 文件结构

```
regex-lab/
├── index.html
├── README.md
├── style/
│   ├── base.css          — CSS 变量、全局重置、button 基础样式
│   ├── layout.css        — workspace flex 布局、面板、分割线 ::after
│   ├── inputs.css        — input/textarea 样式、section-header-row、错误态
│   ├── saved.css         — 侧边栏折叠、toggle 按钮
│   ├── editor.css        — flags 排列、editor-panel 内部 section
│   └── result.css        — 结果区域、result-list 滚动、卡片样式
└── script/
    ├── storage.js         — 数据层：PRESETS 预设 + renderPresets
    ├── matcher.js         — 运算层：buildRegExp / runMatch
    ├── render.js          — 渲染层：renderResults / renderErrorResults
    ├── respace.js         — 替换层：replaceText（支持转义）
    ├── resizer.js         — 交互层：拖拽调整 editor/result 宽度
    └── main.js            — 调度层：防抖、事件绑定、复制、折叠
```

**JS 加载顺序：** `matcher.js` → `render.js` → `respace.js` → `resizer.js` → `main.js`

---

## CSS 设计系统

### CSS 变量（base.css）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--bg-primary` | `hsl(60, 2%, 12%)` | 页面主背景 |
| `--bg-secondary` | `hsl(60, 2%, 17%)` | 卡片、按钮背景 |
| `--bg-tertiary` | `hsl(60, 2%, 22%)` | hover 状态 |
| `--bg-panel-darker` | `hsl(60, 2%, 11%)` | sidebar / result-panel |
| `--text-primary` | `#ffffff` | 主文字 |
| `--text-secondary` | `#c3c2b7` | 次要文字（body 默认） |
| `--accent` | `#d97757` | 强调色（按钮、hover） |
| `--resizer` | `#494949` | 分割线颜色 |
| `--error` | `rgb(205, 72, 72)` | 错误边框色 |
| `--bg-error` | `rgba(206, 89, 89, 0.447)` | 错误光晕 |

### 文件职责

| 文件 | 职责 |
|------|------|
| `base.css` | 全局 box-sizing、CSS 变量、body 底色、button 基础 |
| `layout.css` | `#workspace` flex 三栏、三个 panel、`.line` 分割线 `::after` |
| `inputs.css` | 输入框/textarea 尺寸样式、`.section-header-row`、`.error` 错误态 |
| `saved.css` | 侧边栏宽度过渡、`.collapsed` 折叠、toggle 按钮定位 |
| `editor.css` | flags 居中、`#editor-panel > section` flex column |
| `result.css` | result 两区高度分配、result-list 滚动、卡片样式 |

---

## HTML 结构

```
div#workspace (display: flex)
├── aside#saved-sidebar (width: 20%, collapsible)
│   ├── button#toggle-btn + span.icon
│   └── section#saved-section
│       ├── h2 "常用" + div#common-list (空)
│       ├── h2 "收藏" + div#saved-list (空)
│       └── button#save-btn
├── div.line                      ← 侧边栏分割线 (5px, ::after 2px)
├── main#editor-panel (flex: 1 1 0, min-width: 260px)
│   ├── section#pattern-section
│   │   ├── div.section-header-row > label + button#btn-copy-regex
│   │   ├── input#pattern-input
│   │   ├── form#flags (g/i/m/s/u checkboxes)
│   │   └── div#pattern-error
│   ├── section#replace-section
│   │   ├── div.section-header-row > label + button#btn-copy-replace
│   │   └── input#replace-input
│   └── section#test-section (flex: 1)
│       ├── div.section-header-row > label + button#btn-copy-test
│       └── textarea#test-input
├── div#resizer.line (cursor: col-resize)  ← 可拖拽分割线
└── div#result-panel (flex: 0.6 1 0, min-width: 200px)
    ├── section#result-section (height: 45%)
    │   ├── div.section-header-row > label
    │   └── div#result-content
    │       ├── div#result-header ("匹配结果 N 处")
    │       └── div#result-list (overflow-y: auto)
    └── section#replace-result-section (flex: 1)
        ├── div.section-header-row > label + button#btn-copy-result
        └── textarea#replace-preview (disabled)
```

**面板布局规则：**
- Desktop：横向 flex 三栏，`#resizer` 可拖拽调整 editor/result 比例
- saved-sidebar 默认 20%，可折叠至 35px
- result-panel 拖拽范围 20%–60%（百分比例）

---

## JS 函数清单

### storage.js（数据层）

| 常量/函数 | 说明 |
|-----------|------|
| `PRESETS` | 5 个预设模式数组，含 id/name/pattern/flags/replace/test |
| `renderPresets(PRESETS)` | 渲染"常用"卡片到 `#common-list`，使用 `data-id` + 事件委托 |

### matcher.js（运算层 — 纯逻辑）

| 函数 | 签名 | 说明 |
|------|------|------|
| `buildRegExp` | `(textPattern, formFlagsData) → {regex, error}` | 用 FormData 收集 flags，try-catch 构建 RegExp，返回 `{regex, error}` 对象 |
| `runMatch` | `(regex, textTest) → [{index, match, groups}]` | matchAll（global）或 exec（非 global），返回匹配数组 |

### render.js（渲染层 — DOM 操作）

| 函数 | 签名 | 说明 |
|------|------|------|
| `render` | `(matchArray)` | 内部函数：清空 result-list，生成结果卡片，更新计数 |
| `renderResults` | `(matchArray, replacePreviewText)` | 正常渲染，移除 `.error` 类，写入 replacePreviewText |
| `renderErrorResults` | `(matchArray, errorText)` | 错误渲染，添加 `.error` 类（红色边框 + 光晕） |

### respace.js（替换层）

| 函数 | 签名 | 说明 |
|------|------|------|
| `replaceText` | `(regex, text, replacement) → string` | 处理 `\n` `\t` `\r` 转义后执行 `String.replace()` |

### resizer.js（交互层 — 拖拽调整宽度）

| 变量/函数 | 说明 |
|-----------|------|
| `isResizing` / `startX` / `startWidth` | 拖拽状态变量 |
| `MIN_WIDTH` = 20, `MAX_WIDTH` = 60 | result-panel 百分比限幅 |
| `mousedown` on `#resizer` | `preventDefault()` + 记录起始值 + 计算 workspace 宽度 |
| `mousemove` on `document` | 计算新宽度百分比，限制范围，设置 `resultPanel.style.flex` |
| `mouseup` on `document` | 重置 isResizing |
| `minfo.buttons === 0` 检测 | 鼠标按键已松开但事件未触发的兜底（解决窗口外松开问题） |

### main.js（调度层）

| 函数 | 说明 |
|------|------|
| `debounce(fn, delay=300)` | 通用防抖，返回闭包 |
| `handlePatternInput()` | 核心调度：取 pattern+flags+text → buildRegExp → runMatch → replaceText → renderResults |
| `bindCopy(btn, textFn)` | 通用复制绑定：clipboard.writeText + "已复制!" 1.5s 反馈 |
| sidebar toggle | `classList.toggle('collapsed')` |

**复制按钮绑定：**
- `#btn-copy-regex` → `inputPattern.value`
- `#btn-copy-replace` → `inputReplace.value`
- `#btn-copy-test` → `inputTest.value`
- `#btn-copy-result` → `replacePreviewText`（实时更新的变量）

---

## 边界处理

| 场景 | 做法 |
|------|------|
| 空 pattern 或空 text | `renderResults([], '')` 显示 "无匹配结果" |
| 非法正则 | `buildRegExp` 返回 `{error}` → `renderErrorResults` 红色边框 + 错误信息 |
| 替换文本含 `\n` `\t` `\r` | `respace.js` 先转义再替换 |
| result-panel 宽度超限 | `resizer.js` 限制 20%–60% |
| 拖拽时鼠标飞出窗口 | `minfo.buttons === 0` 兜底检测 + `preventDefault` |
| sidebar 折叠 | `#saved-sidebar.collapsed` → width: 35px, padding: 0, 内容 hidden |
| 快速连续点击复制 | `clearTimeout` + 重新计时，防止提示闪烁 |

---

## 预设模式（5 个）— 已实现

| 名称 | 正则 | 标志 |
|------|------|:----:|
| 📧 邮箱 | `(?<!\w)[\w.+-]+@[\w-]+\.[\w.]+(?!\w)` | gi |
| 📱 手机号 | `(?<!\d)1[3-9]\d{9}(?!\d)` | g |
| 🌐 URL | `(?<![\w./-])https?://[\w./?=&%-]+` | gi |
| 🪪 身份证 | `(?<!\d)\d{17}[\dXx](?!\d)` | g |
| 💻 IP地址 | `(?<!\d)((25[0-5]\|2[0-4]\d\|1?\d?\d)\.){3}(25[0-5]\|2[0-4]\d\|1?\d?\d)(?!\d)` | g |

> 所有正则均使用**零宽断言**（lookbehind / lookahead）确保边界精确，避免匹配长数字串的子串。

---

## 实现顺序

1. ✅ HTML 骨架 + CSS 变量 + 布局
2. ✅ matcher.js（buildRegExp + runMatch）
3. ✅ render.js（结果卡片 + 错误渲染）
4. ✅ respace.js（replaceText 转义支持）
5. ✅ main.js（防抖 + 复制 + 折叠）
6. ✅ resizer.js（拖拽调整面板宽度）
7. ✅ storage.js（PRESETS 预设数据 + renderPresets） / ⬜ localStorage CRUD + renderSavedList
8. ⬜ 调试 + 移动端适配
9. ⬜ 工具箱入口卡片

---

## 技术要点

- **防抖**：闭包 + setTimeout/clearTimeout，300ms
- **matchAll**：迭代器 `[...text.matchAll(regex)]` 转数组
- **flex vs width**：拖拽用 `style.flex = '0 1 ' + N + '%'` 而非 `style.width`（flex-basis 优先级更高）
- **`::after` 分割线**：`.line` 5px 透明，`::after` 2px 可见线，`position: absolute` + `transform: translateX(-50%)` 居中
- **拖拽稳定性**：`mousedown.preventDefault()` 阻止文本选中，`minfo.buttons === 0` 检测鼠标已松开
- **CSS 变量**：统一深色主题色板，修改一处全局生效
- **错误态**：`.error` 类添加 `box-shadow: inset` 红色边框 + `rgba` 光晕
- **零宽断言**：(?<!) 负向后看 + (?!`) 负向前看确保边界精确，避免误匹配长数字串子串

---
