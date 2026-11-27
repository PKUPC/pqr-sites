# 第 4 期《保护隐私》

- 站点 ID 为 `protect-privacy`，本地路径为 `/protect-privacy/`。
- [站点源码](../../src/sites/protect-privacy/) 集中存放本期题库、样式和专属组件。

## 维护入口

- [题库](../../src/sites/protect-privacy/puzzles.json) 维护遮盖后的题面、原问句、答案和固定难度。
- 可选的 `explanation` 字段存放解析，答对后显示在题卡下方，并随已解进度恢复。
- 题面自动识别英文并使用自然字宽、按完整单词换行；遮盖层和原文层以同一份原文字形占位，保持切换对齐。
- [页面样式](../../src/sites/protect-privacy/style.css) 维护本期视觉和字号。[难度组件](../../src/sites/protect-privacy/components/Difficulty.tsx) 负责五格斜切难度条。
- [构建转换器](../../scripts/transformer/protect-privacy.mjs) 校验原问句存在，以及题面与原问句的字素槽位数相等，再输出黑条题面和原问句的分格。
- [单测](../../tests/unit/protect-privacy.test.ts) 覆盖转换器，[浏览器回归](../../tests/browser/protect-privacy.spec.ts) 覆盖题面切换、答题状态和通关文件。

如需查找合并前保留的静态稿、截图、工作树或暂存内容，可查看本地的 `.agents/local/merged-sources/`。该目录已被 Git 忽略，是否存在取决于当前工作副本。
