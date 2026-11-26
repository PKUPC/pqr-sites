# Agent 工作入口

本仓库维护 PQR（P&KU Quiz Research）的公开静态存档。开始开发、修改文档或迁移内容之前，MUST 阅读以下文件，并检查实际 Git 状态：

1. [项目介绍](README.md)
2. [开发流程](.agents/rules/development.md)
3. [Git 提交与 PR 规范](.agents/rules/git.md)

开发流程、提交规范和分期维护说明放在 `.agents/` 下。工作日志、会话记录、验证过程与交接日志不得提交。需要本地保留时放在已忽略的 `.agents/local/` 下，无需在开发前阅读。MUST 表示必须遵守，SHOULD 表示推荐，偏离推荐时说明原因。

线上部署、DNS 和仓库保护设置按用户明确授权执行。

## 本地开发

本项目使用 React、TypeScript 和 Vite 构建静态多页面站点。使用 [`.nvmrc`](.nvmrc) 指定的 Node.js 24 LTS 与 npm，也支持 Node.js 26 LTS。

```sh
npm ci
npm run dev
```

开发服务器默认在 `http://127.0.0.1:5173/`。首页和各期页面都有独立的 HTML 入口，可直接访问对应路径，无需客户端路由或服务器端 Node.js。

```sh
npm run format
npm run check
```

`npm run check` 包含格式检查、ESLint、单测、类型检查、生产构建和静态产物检查。浏览器测试针对构建产物，先运行 `npm run check` 或 `npm run build`。首次运行浏览器测试需安装 Chromium 和 WebKit。

```sh
npx playwright install chromium webkit
npm run test:e2e
npm run preview
```

`preview` 默认在 `http://127.0.0.1:4173/` 预览构建产物。

## 分期维护

[活动目录](src/sites/catalog.json) 记录期数、站点 ID、活动名称、简介、题数和主题色，供首页及构建元信息使用。维护某一期时，阅读 [`.agents/episodes/`](.agents/episodes) 下以站点 ID 命名的 Markdown 文件。每期一个文件，用来记录该期的路径、题库、专属规则和验证入口。

## 内容与代码组织

- `src/home/` 是统一入口首页，构建后输出根目录的 `index.html`。首页从活动目录读取展示信息。
- `src/sites/<site>/` 集中存放每期的 `index.html`、`main.tsx`、`App.tsx`、`puzzles.json`、介绍、题卡、样式和无障碍样式。特殊题面、状态和类型也放在该站点下。题目和答案是公开的客户端数据。
- `src/components/<PascalCase>/index.tsx` 提供通用组件。公共组件和站点的子组件放在各自的 `components/`。单文件子组件用 `PascalCase.tsx`，需要配套文件时用 PascalCase 目录，以 `index.tsx` 为入口。组件专用 hook 与组件入口同层。
- `src/hooks/` 存放独立通用 hook。`useQuiz` 提供进度和筛选状态，`useProgress` 管理浏览器进度。
- `src/lib/`、`src/types/`、`src/styles/` 分别维护通用判题与存储工具、数据类型和无障碍样式。
- `scripts/prepare.mjs` 读取并校验题库，按需调用站点转换器，输出构建所需数据。
- `public/<site>/` 只放直接复制到构建产物的图标、分享图等静态资源。
- `src/generated/` 和 `dist/` 由构建流程生成，已加入 Git 忽略规则。静态发布仅使用 `dist/`。

构建目标是 `https://pqr.pkupuzzle.art/` 和该域名下的各期子路径。开发服务器把公开路径映射到各站点的 HTML 入口，构建输出为 `<site>/index.html`。canonical、Open Graph 和 Twitter 元信息写入构建后的 HTML。

各期按活动 ID 使用独立的 localStorage 键。进度长期保存在当前浏览器与域名下，跨设备或切换域名时需要重新积累。调整视觉或题序时保留存储键和题目 ID。`?preview=completion` 用于预览完成效果，保留原有解题进度。

默认判题使用 NFKC 规范化、去空白和忽略大小写。新题型可按需要使用自己的判题规则。

## 为特殊题型添加转换器

普通题库校验后可直接生成。需要额外处理时，在 `scripts/transformer/` 添加与活动 ID 同名的 `.mjs` 文件，导出 `transform(puzzles)`。该函数接收完整题库数组，返回转换后的数组或解析为数组的 Promise。

`scripts/prepare.mjs` 按文件名自动导入转换器。开发时修改题库或转换器会重新生成数据。转换器只在本地开发和构建阶段处理生成数据，原始题库文件保持原样。转换器导入或执行失败时，题库准备步骤会中止。

## 通用交互组件

`PuzzleCard` 通过 render prop 提供答题状态和表单事件。`Dialog` 和 `Note` 使用 `@base-ui/react` 的无样式 Dialog 与 Popover 处理模态、焦点、键盘和提示气泡。新增复杂交互优先复用 Base UI。各期负责专属 DOM、文案、主题、提示排版、Positioner 布局、弹窗遮罩和定位，通过参数或 slot 接入共享能力。

`FloatingNotes` 负责协调当前打开的提示。`BulbIcon` 是用 `currentColor` 继承按钮颜色的内联 SVG。`Completion` 提供通用完成视图和关闭状态，接收活动名称、期数和焦点恢复目标。继续按钮使用 `.completion-close`，样式由各期维护。

弹层打开时，axe 检查仅排除 Base UI 生成的 `[data-base-ui-focus-guard]` 焦点哨兵。弹窗、提示内容及实际键盘焦点行为仍需验证。 [Base UI 的 VoiceOver 兼容说明](https://github.com/mui/base-ui/issues/5237#issuecomment-4978602561)

## 代码格式

Prettier 统一源码、脚本、测试和文档的排版，ESLint 检查代码与依赖边界。使用 2 空格缩进、JavaScript 和 TypeScript 单引号、分号、100 列换行目标、尾随逗号和 LF 换行。具体规则见 [`.prettierrc.json`](.prettierrc.json)。

`npm run format` 写入格式变更，`npm run format:check` 只检查。 [`.prettierignore`](.prettierignore) 排除依赖、生成数据、构建产物、锁文件、静态资源和本地验证记录。可编辑的题库 JSON 参加格式检查。批量格式化与功能修改分开提交。
