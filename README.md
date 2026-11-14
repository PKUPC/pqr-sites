# PQR · P&KU Quiz Research

## 欢迎来到 PQR！

这是 P&KU 群在每周五晚 22:00 举行的 Quiz/微型谜题企划 **P&KU Quiz Research（PQR）**！我们围绕不同主题，尝试各种变体 Quiz 与微型谜题，把群聊中的灵感整理成可以随时游玩的线上存档。

**PQRST（P&KU Quiz Researchers）** 是参与建设 PQR 的出题组：从出题、提供企划灵感，到归档与页面设计，都欢迎大家一起参与。

## 怎样游玩线上存档

每期活动有自己的规则与例题。打开页面后，先阅读说明，再在题目下方输入答案并按回车提交；页面会提示答案是否正确，并记录解题进度。当前存档无需注册，进度保存在当前浏览器中，更换设备、域名或清除浏览器数据后不会自动同步。

| 期数 | 主题 | 线上存档 |
| --- | --- | --- |
| 第 2 期 | 缩略 | [开始游玩](https://eviations.pqr.pkupuzzle.art/) |
| 第 3 期 | unicode+1 | [开始游玩](https://unicode-plus-one.pqr.pkupuzzle.art/) |

## 关于 P&KU

**P&KU（Puzzle and Key Universe）** 是北京大学学生谜题协会出品的系列解谜企划，自 2021 年起举办。玩家通过破解谜题探索故事；题目融合 Puzzle Hunt、日式谜题、中国传统谜题等风格，也关注汉字字形、构词与读音等中文素材。

PQR 是在 P&KU 群中开展的每周 Quiz/微型谜题活动。想了解 P&KU 的世界、历届活动与谜题解析，可以阅读 [P&KU 资料站的介绍](https://info.pkupuzzle.art/archive/about)。

## 欢迎加入！

欢迎加入 P&KU 群，与我们一起解谜、交流灵感！如果您愿意建设每周五的 PQR 企划，无论是出题、提供企划灵感，还是帮助归档与设计每次的内容，都欢迎在群内联系并私聊群主加入 PQRST，和我们共同发现变体 Quiz 的乐趣。

- QQ 群号：**649943168**
- 微信公众号：**PKU谜协**

## 参与开发

开发前请阅读 [Agent 入口](AGENTS.md) 和 [.agents/rules/development.md](.agents/rules/development.md)。


## 本地开发

使用 Node.js 24 LTS（见 `.nvmrc`；也支持 Node.js 26 LTS）与 npm。当前是 React + TypeScript + Vite 多页面工程；线上只需要提供构建后的静态文件。

```sh
npm ci
npm run dev
```

本地开发地址为 `http://127.0.0.1:5173/`，两期页面分别位于 `/missing-abbreviations/` 和 `/unicode-plus-one/`。首页、每期页面均为独立 HTML 入口，无需客户端路由或服务器端 Node 服务。

```sh
npm run format
npm run check
npx playwright install chromium webkit
npm run test:e2e
npm run preview
```

`format` 使用 Prettier 统一源码、脚本、测试与文档的排版；`format:check` 只检查不修改。`check` 包含格式检查、代码检查、逻辑测试、类型检查、生产构建和公开产物检查。浏览器测试针对构建后的页面；先运行 `check` 或 `build`。`preview` 默认在 `http://127.0.0.1:4173/` 预览。Chromium/WebKit 自动化与移动视口检查不能代替 QQ／微信内置浏览器的真机验收。

## 内容与代码组织

- `src/sites/catalog.json`：活动目录，维护名称、期数、简介、题数和主题色，供首页及构建元信息使用。
- `src/sites/<site>/puzzles.json`：可编辑题库，保留稳定 ID；题目、答案均为公开的客户端数据。
- `src/sites/<site>/App.tsx`、`components/PuzzleCard.tsx`：每期自己的页面框架和题目卡片；特殊题面、状态和类型也放在该站点下。
- `src/sites/<site>/components/Introduction.tsx`、`style.css`、`accessibility.css`：每期独立介绍、署名、视觉样式与无障碍样式。
- `src/sites/<site>/index.html`、`main.tsx`：各期 HTML 与 React 入口，和题库、介绍、样式统一存放。开发配置将公开 URL 映射到对应入口；构建后仍输出 `<site>/index.html`，网址不包含 `src/sites/`。
- `src/components/<PascalCase>/index.tsx`：不依赖任何具体站点或题库的通用能力。`PuzzleCard` 通过 render prop 提供答题状态和表单事件，`Dialog` 基于 Base UI 提供模态与焦点控制，`Note` 基于 Base UI Popover 提供提示气泡；站点专属 DOM、文案、主题和特殊交互由站点实现并通过参数或 slot 接入。
- `src/components/BulbIcon/`：共用内联 SVG 灯泡，使用 `currentColor` 继承按钮颜色。`src/components/Completion/`：共用 PQR 完成视图与关闭状态，通过参数传入活动名称、期数及焦点恢复目标；站点维护全部样式，继续按钮仅使用 `.completion-close`。
- 公共组件和站点页面的子组件放在自身目录下的 `components/`；单文件子组件直接用 `PascalCase.tsx`，需要配套文件时再建 PascalCase 目录并以 `index.tsx` 为入口。组件专用 hook 直接与所属组件入口同层，不另建 `hooks/`。
- `src/hooks/`：独立通用 hook，`useQuiz` 提供进度/筛选状态，`useProgress` 管理浏览器进度。
- `src/lib/`、`src/types/`、`src/styles/`：通用判题与存储工具、数据类型、无障碍工具样式。
- `src/home/`：统一入口首页，包含 HTML 入口，不加载各期完整题库；构建后输出根目录 `index.html`。
- `scripts/prepare.mjs`：通用题库准备入口，负责读取、校验、调用可选转换器和输出生成数据。
- `scripts/transformer/<site-id>.mjs`：各期专用的构建转换器。unicode+1 的字素分格与原问句计算位于 `unicode-plus-one.mjs`；开发时修改题库或转换器会重新生成数据。
- `public/<site>/`：明确放入构建结果的图标和分享图，勿存放文档、凭据或工作记录。
- `src/generated/`、`dist/`：自动生成并被忽略。只将 `dist/` 作为未来静态发布的产物，不能部署整个仓库。

构建目标地址为 `https://pqr.pkupuzzle.art/` 及上述两个子路径，canonical、Open Graph 与 Twitter 元信息直接写入构建 HTML。README 上方的子域名链接仍是现有线上地址；本地重构不会切换服务器、DNS 或重定向。

进度按活动 ID 使用独立 localStorage 键，不主动过期、不跨设备同步。切换到新域名后不迁移旧域名进度；更改视觉或题序时不要更换存储键或重新编号题目。`?preview=completion` 只预览完成效果，不写入进度。

unicode+1 的字素分格在构建阶段完成，浏览器不依赖 `Intl.Segmenter`；不要用简单的字符拆分替代它，否则会破坏国旗等组合字符。新增题型可以选择自己的判题规则，不必沿用默认的 NFKC、去空白和忽略大小写规则。


## 为特殊题型添加转换器

普通题库无需转换器，准备步骤会直接输出校验后的数据。需要特殊处理时，在 `scripts/transformer/` 下添加与 `src/sites/catalog.json` 活动 ID 同名的 `.mjs` 文件，并导出 `transform(puzzles)`；它接收完整题库数组，返回转换后的数组，也可以返回 Promise。`prepare.mjs` 会按文件名自动引入，不需要增加题型判断或修改通用准备流程。

转换器只在本地开发和构建时运行，不修改原题库文件，也不处理服务器操作。已配置转换器的导入或执行失败会中止准备，不会悄悄退回原始数据。

## 通用交互组件

使用 `@base-ui/react` 的无样式 Dialog 与 Popover 承接焦点管理、键盘和气泡触发行为；公共组件只做必要封装，不引入 Material UI 或统一主题。`FloatingNotes` 只协调同时打开的提示。提示保留站点内的原有排版，Positioner 的布局由站点 CSS 指定；弹窗的遮罩、定位与视觉也由站点维护。新增复杂交互优先使用 Base UI，避免重复实现焦点陷阱或全局键盘监听。

弹层打开状态的 axe 检查仅排除 Base UI 自动生成的 `[data-base-ui-focus-guard]` 焦点哨兵，遵循[维护者对 VoiceOver 兼容行为的说明](https://github.com/mui/base-ui/issues/5237#issuecomment-4978602561)；实际弹窗、提示内容及键盘焦点行为仍需完整验证。

## 代码格式

Prettier 负责排版，ESLint 负责代码与依赖边界规则。统一使用 2 空格缩进、JavaScript/TypeScript 单引号、分号、100 列换行目标、尾随逗号和 LF 换行；具体配置见 `.prettierrc.json`。编辑后先运行 `npm run format`，再运行 `npm run check`。

`.prettierignore` 排除依赖、自动生成的数据、构建产物、锁文件、静态资源和本地验证记录；题库 JSON 作为可编辑源码参与格式检查。批量格式化与功能修改分开提交。
