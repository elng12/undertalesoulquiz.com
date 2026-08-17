# Undertale Soul Quiz 项目规则

## 项目目标

- 域名：`undertalesoulquiz.com`。
- 产品：一个面向移动端的非官方 Undertale Soul Quiz。
- 核心路径：`Search -> Quiz -> Result -> Share`。
- 首页 `/` 同时承接 Landing、Quiz 和 Result；支持页为 `/credits`、`/privacy`、`/terms`、`/contact`。
- 当前阶段：Phase 1a 至 Phase 5a 与完整原创内容生产已完成；`original-production-v1` 已接入首页，并通过题目、结果和体验三项独立 Agent 复验、正式 Golden vectors、本地浏览器全流程和公开 staging 验收。仓库已切换为可索引的正式构建并排除内部审阅路由；production 仍待用户部署后单独验收。

## 已冻结的产品边界

- 七个维度：`DET`、`BRV`、`JUS`、`KND`、`PAT`、`INT`、`PER`。
- 完整流程为 66 道常规计分题加 2 道不计分的 Gaster 风格特殊问题，共 68 次回答；页面进度只显示 66 道计分题。
- 五档回答系数已确认是 `[-1.2, -0.72, 0, 0.6, 1]`，曲线指数是 `0.6`。
- 结果至少包含 Primary、Secondary、七维百分比、Shadow、Pairing 和分享卡。
- SEO 主词是 `undertale soul quiz`；第二核心词是 `undertale soul test`。
- `soul virtues extractor`、`soul trait extractor` 等同意图词由首页统一承接，不建立重复 Landing Page。
- 不做账号、数据库、服务端评分、AI、博客、广告、付费和多语言。

## 证据规则

- 用户给出的需求文档是要求线；当前源码、真实页面和可复现测试是事实线。
- 不把社区猜测、搜索摘要或旧截图当成已确认规则。
- 66/68 题口径已经解决：原站代码数组共 68 项，其中 66 项参与计分，2 项是流程末尾的不计分特殊问题。
- 原站的题目、权重、结果文案、特殊触发和版本可能变化。导入任何数据时必须记录来源、获取日期、版本指纹和权限状态。
- 2026-08-16 参考镜像的 `app.js` 和 `questions.js` 与线上版本哈希一致；具体哈希记录在 `docs/TECHNICAL_INVESTIGATION.md`。
- Mock 只用于隔离单元测试，不能作为 Golden Test、原站一致性或 Production 验收证据。

## 独立实现与内容边界

- 不复制原站 `app.js`、`intro.js`、Logo、专属美术或完整品牌包装。
- 不把原站的受版权保护题库和结果长文自动抓取进仓库。
- 技术参考已经足够重写评分内核，但原版内容一致性仍只有两条合格路径：得到可使用的授权数据集，或由用户明确改为独立创作内容。
- 当前已选择独立创作内容：保留 66+2、七维结果和分享等产品契约，题目文字、完整权重矩阵、结果长文、Shadow、Pairing 和特殊文案全部重新创作。
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

## 常用命令

| 命令 | 用途 |
|---|---|
| `npm run dev` | 启动 Astro 本地开发服务器 |
| `npm run check` | 检查 Astro 和 TypeScript |
| `npm test` | 运行 Vitest 单元测试 |
| `npm run build` | 生成静态站点到 `dist/` |
| `npm run validate` | 依次运行 check、test、build、资源预算和构建后浏览器测试 |

## 发布门槛

- 题目数据、评分、舍入、并列处理和特殊规则都有已确认来源。
- Golden Tests 覆盖普通、边界、修改答案、恢复、特殊结果和分享卡一致性。
- 移动端无溢出，完整流程可完成，刷新可恢复有效进度。
- 构建产物中的 title、description、canonical、robots、sitemap 和静态正文正确。
- Production 只有经过真实线上页面验证后才能标记 PASS。
