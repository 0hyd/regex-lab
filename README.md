# 正则实验室

一个纯前端的正则表达式测试工具。可实时查看匹配结果与替换预览，管理常用正则收藏，并将收藏导入或导出为 JSON 备份文件。

## 功能

- 实时构建正则，支持 `g`、`i`、`m`、`s`、`u` 标志位。
- 显示匹配数量、匹配位置、匹配内容和捕获组。
- 支持替换预览；替换文本中的 `\n`、`\t`、`\r` 会转换为对应字符。
- 测试文本 overlay 高亮匹配内容，并显示换行符和制表符。
- 内置邮箱、手机号、URL、身份证号和 IP 地址五个常用模式。
- 用户收藏支持保存、加载、编辑名称、修改内容和删除。
- 收藏区和常用区可折叠，左侧边栏可收起。
- 编辑区和结果区之间的分割线支持拖拽调整宽度。
- 支持复制正则、替换文本、测试文本和替换结果。
- 支持深色与浅色主题切换，并保存主题选择。
- 支持将用户收藏导出为 JSON，并以合并、去重方式导入备份。

## 使用

直接访问 [GitHub Pages](https://0hyd.github.io/regex-lab/) 使用

### 自部署

这是一个无构建步骤的静态页面。可直接打开 `index.html`，也可使用任意静态文件服务器运行，例如：

```bash
npx serve .
```

打开服务输出的本地地址后：

1. 在“正则”输入表达式，并按需勾选标志位。
2. 在“测试文本”输入需要匹配的内容。
3. 在“替换文本”输入替换内容，右侧会显示替换预览。
4. 点击“收藏当前”保存当前配置。
5. 点击收藏卡片可重新载入配置；进入“编辑”模式后可改名、修改已选中项或删除收藏。

## 收藏与备份

用户收藏和主题选择均保存在浏览器 `localStorage`：

| 数据 | 键名 |
| --- | --- |
| 用户收藏 | `regexlab.patterns` |
| 主题 | `regexlab.theme` |

浏览器清除站点数据后，本地收藏也会被删除。重要收藏请使用“导出”备份。

### 导出

点击侧边栏底部的“导出”，浏览器会下载形如 `regexlab-patterns-YYYY-MM-DD.json` 的文件。导出文件不包含仅对当前浏览器有效的内部 `id`。

### 导入

点击“导入”并选择之前导出的 JSON 文件。导入过程会：

- 校验 JSON 格式、数据版本和每个收藏字段。
- 仅接受 `g`、`i`、`m`、`s`、`u` 标志位，且不允许重复标志位。
- 合并到现有收藏，不会覆盖本地数据。
- 根据 `regex`、`flags`、`replace`、`text` 判断重复项并跳过。
- 跳过格式错误的单条记录，同时保留其他合法记录。

当前备份格式版本为 `1`：

```json
{
  "version": 1,
  "patterns": [
    {
      "name": "手机号",
      "regex": "(?<!\\d)1[3-9]\\d{9}(?!\\d)",
      "flags": "g",
      "replace": "[手机号]",
      "text": "联系号码：13812345678"
    }
  ]
}
```

## 项目结构

```text
regex-lab/
├── index.html
├── assets/
│   ├── edit.svg
│   ├── export.svg
│   ├── import.svg
│   └── theme.svg
├── style/
│   ├── base.css       # 全局重置、主题变量、基础按钮样式
│   ├── layout.css     # 三栏工作区与分割线
│   ├── inputs.css     # 输入框、标题行和错误状态
│   ├── saved.css      # 侧边栏、收藏卡片和编辑状态
│   ├── editor.css     # 编辑区与 flags 布局
│   ├── result.css     # 匹配结果和替换预览区
│   ├── overlay.css    # 测试文本视觉层和匹配高亮
│   └── footer.css     # 侧边栏底部工具按钮
└── script/
    ├── matcher.js     # 构建 RegExp、执行匹配
    ├── render.js      # 渲染预设、收藏和匹配结果
    ├── respace.js     # 替换转义处理与 overlay 文本渲染
    ├── resizer.js     # 拖拽调整编辑区和结果区比例
    ├── storage.js     # 预设数据、收藏 localStorage CRUD、导入导出数据处理
    ├── overlay.js     # 高亮层内容与滚动同步
    ├── footer.js      # 主题切换、JSON 文件导入导出
    └── main.js        # 编辑器事件、匹配调度、复制和收藏交互
```

脚本按以下顺序加载，后续模块可以使用前面脚本声明的函数：

```text
matcher.js -> render.js -> respace.js -> resizer.js -> storage.js -> overlay.js -> footer.js -> main.js
```

## 实现说明

### 匹配与替换

`matcher.js` 通过 `new RegExp()` 构建表达式。构建失败时返回错误信息，界面会显示无效正则状态。全局正则使用 `String.prototype.matchAll()` 收集所有匹配；非全局正则只返回第一个匹配。

`respace.js` 会先处理替换文本中的 `\n`、`\t` 和 `\r`，再调用 `String.prototype.replace()` 生成预览。

### 文本高亮

测试文本使用真实的 `<textarea>` 接收输入，并用覆盖在其下方的 `<pre>` 视觉层显示内容。视觉层依据匹配结果的原始位置切分文本，以 `<mark>` 包裹匹配片段；换行与制表符会显示为可见符号。

输入测试文本时会立即同步普通文本显示，正则计算与匹配高亮使用 300ms 防抖，避免每次按键都重复执行匹配和结果渲染。

### 主题

深色主题是默认值。主题切换会更新 `<html>` 的 `data-theme` 属性：

```html
<html data-theme="light">
```

`base.css` 中的 `:root[data-theme="light"]` 覆盖同名 CSS 变量，因此各组件只需引用语义变量，不需要分别定义浅色样式。

### 收藏编辑

`main.js` 维护 `editMode` 和 `editingId`：

- 普通模式下，“收藏当前”创建新收藏。
- 编辑模式下，先选择一条收藏，再保存会更新该条内容。
- 收藏标题通过 `#saved-list` 的事件委托即时写入本地存储。

## 技术栈

- HTML
- CSS Custom Properties
- 原生 JavaScript
- Web Storage API
- File API、Blob 和 Object URL

## 已知限制

- 项目当前没有自动化测试或构建流程。
- 测试文本高亮使用 `textarea` 与 `<pre>` overlay。极端自动换行场景下，不同浏览器对中文、emoji、tab 或滚动条宽度的排版计算可能产生轻微偏差。
- 收藏仅保存在当前浏览器与站点范围内；跨设备使用需手动导出和导入。
