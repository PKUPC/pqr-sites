# 第 3 期《unicode+1》

- 站点 ID 为 `unicode-plus-one`，本地路径为 `/unicode-plus-one/`。
- 存档入口见 [`unicode-plus-one.pqr.pkupuzzle.art`](https://unicode-plus-one.pqr.pkupuzzle.art/)。

## 维护入口

- [题库](../../src/sites/unicode-plus-one/puzzles.json) 维护加一后的题面和答案。[题面组件](../../src/sites/unicode-plus-one/components/Question.tsx) 使用生成的字素槽位显示编码与原问句。
- [构建转换器](../../scripts/transformer/unicode-plus-one.mjs) 用 `Intl.Segmenter` 按字素分格，再逐个码位减一还原问句，保留编码后的分格。国旗等组合字符仍占一个格子。浏览器直接使用预计算的分格，可以在没有 `Intl.Segmenter` 的环境中游玩。
- [浏览器回归](../../tests/browser/quiz.spec.ts) 覆盖原问句切换、全部答完后的行为，以及浏览器缺少 `Intl.Segmenter` 时的游玩。
