# Undertale Soul Quiz 项目规则

## 项目目标

- 域名：`undertalesoulquiz.com`。
- 产品：一个面向移动端的非官方 Undertale Soul Quiz。
- 核心路径：`Search -> Quiz -> Result -> Share`。
- 首页 `/` 同时承接 Landing、Quiz 和 Result；支持页为 `/credits`、`/privacy`、`/terms`、`/contact`。
- 当前阶段：技术调查和实施计划，尚未进入业务代码实现。

## 已冻结的产品边界

- 七个维度：`DET`、`BRV`、`JUS`、`KND`、`PAT`、`INT`、`PER`。
- 五档回答，候选系数为 `[-1.2, -0.72, 0, 0.6, 1]`。
- 结果至少包含 Primary、Secondary、七维百分比、Shadow、Pairing 和分享卡。
- SEO 主词是 `undertale soul quiz`；第二核心词是 `undertale soul test`。
- `soul virtues extractor`、`soul trait extractor` 等同意图词由首页统一承接，不建立重复 Landing Page。
- 不做账号、数据库、服务端评分、AI、博客、广告、付费和多语言。

## 证据规则

- 用户给出的需求文档是要求线；当前源码、真实页面和可复现测试是事实线。
- 不把社区猜测、搜索摘要或旧截图当成已确认规则。
- 原站当前显示 66 题，而需求文档写 66 道计分题加 2 道特殊题。这个冲突解决前，不得声称 68 题数据已经齐全。
- 原站的题目、权重、结果文案、特殊触发和版本可能变化。导入任何数据时必须记录来源、获取日期、版本指纹和权限状态。
- Mock 只用于隔离单元测试，不能作为 Golden Test、原站一致性或 Production 验收证据。

## 独立实现与内容边界

- 不复制原站 `app.js`、`intro.js`、Logo、专属美术或完整品牌包装。
- 不把原站的受版权保护题库和结果长文自动抓取进仓库。
- 原版内容一致性只有两条合格路径：得到可使用的授权数据集，或由用户明确改为独立创作内容。
- 不冒充 Jaden、Toby Fox 或 Undertale 官方，也不宣称具有科学或诊断效力。
- Attribution 不等于 Permission；来源说明不能替代内容使用授权。

## 实现原则

- 计划技术栈：Astro 静态输出、原生 TypeScript Quiz 应用、Vitest、Playwright。
- 评分引擎必须是无 DOM、无 LocalStorage 的纯函数。
- 页面结果和分享卡必须使用同一个 `ResultViewModel`，禁止分别计算。
- LocalStorage 必须有 schema version、校验、迁移或安全丢弃策略。
- 特殊规则必须有明确优先级，不能散落在 UI 事件中。
- SEO 核心正文必须存在于构建后的 HTML，不得依赖浏览器执行 JavaScript 后才出现。

## 修改流程

1. 先读 `docs/ITERATION.md`、`docs/TECHNICAL_INVESTIGATION.md` 和相关计划。
2. 在 Git 项目建立后，修改前核对分支、HEAD、远程基线和工作区状态。
3. 每次只解决一个已授权范围，不顺便扩页面、关键词或功能。
4. 只暂存本轮相关文件，禁止 `git add .`。
5. 修改后运行受影响范围的类型检查、单元测试、构建和必要的浏览器测试。
6. 更新 `docs/ITERATION.md`，分别记录本地、Git、测试、staging、production 和真人验收状态。

## 发布门槛

- 题目数据、评分、舍入、并列处理和特殊规则都有已确认来源。
- Golden Tests 覆盖普通、边界、修改答案、恢复、特殊结果和分享卡一致性。
- 移动端无溢出，完整流程可完成，刷新可恢复有效进度。
- 构建产物中的 title、description、canonical、robots、sitemap 和静态正文正确。
- Production 只有经过真实线上页面验证后才能标记 PASS。
