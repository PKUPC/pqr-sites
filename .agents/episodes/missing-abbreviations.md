# 第 2 期《缩略》

- 站点 ID 为 `missing-abbreviations`，本地路径为 `/missing-abbreviations/`。
- 存档入口见 [`eviations.pqr.pkupuzzle.art`](https://eviations.pqr.pkupuzzle.art/)。

## 维护入口

- [题库](../../src/sites/missing-abbreviations/puzzles.json) 维护题面、答案和提示，调整题序时保留题目 ID。
- 本期判题忽略英文句点和中文句号，兼容 `ie`／`i.e.`、`etc`／`etc.`、`sg`／`sg.`；空白、大小写与全角字符沿用默认归一化规则。
- 通关弹窗首次展示时按活动 ID 保存记录；之后点击满进度条的“回看通关”重新打开。`?preview=completion` 始终展示预览，保留正式进度与展示记录。
- [题卡](../../src/sites/missing-abbreviations/components/PuzzleCard.tsx) 维护本期题面和交互。[页面样式](../../src/sites/missing-abbreviations/style.css) 和 [无障碍样式](../../src/sites/missing-abbreviations/accessibility.css) 均在站点目录下。
- [浏览器回归](../../tests/browser/quiz.spec.ts) 覆盖错误答案、多个正确答案、进度保存、筛选和排序。
