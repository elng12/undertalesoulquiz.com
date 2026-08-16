# ITERATION.md

这是 `undertalesoulquiz.com` 的长期迭代记录。计划、源码、Git、测试、staging、production 和真人验收必须分开记录。

## 当前状态

| 字段 | 当前事实 |
|---|---|
| 当前阶段 | Technical Investigation & Implementation Plan |
| 当前最重要目标 | 解决 66/68 题冲突并取得可合法使用、可验证的题库与权重数据 |
| 当前最大问题 | 需求写 68 题，原站在 2026-08-16 实际显示 66 题；精确权重和特殊触发尚无可验收数据集 |
| 源码 | 尚未创建业务代码 |
| Git | 当前目录不是 Git 仓库 |
| 测试 | 尚无测试工程；Golden Test 只有计划，没有真实预期值 |
| staging | 未建立 |
| production | 未建立 |
| 真人验收 | 未开始 |
| 下次复查 | 内容来源路线确定并收到数据集后立即复查 |

## 当前唯一下一步

在开始页面实现前，选择并完成一种内容数据路线：

1. **授权一致性路线：**取得允许使用的 66/68 题、七维权重、特殊规则和结果文案数据集，并提供版本与来源证据；或
2. **独立原创路线：**保留七维产品结构和评分思想，重新创作题目与结果文案，再用自己的校准样本建立 Golden Tests。

在路线未确定前，可以搭建与内容无关的工程骨架，但不能声称实现了原测试一致性。

## 2026-08-16 技术调查与计划

**问题：**需求已经冻结，但项目为空，且缺少实现评分正确性所需的可验证数据。

**用户资料：**

- 已读 `Undertale Soul Quiz MVP SPEC v1.3`。
- 已读关键词汇总，确认首页第一主词为 `undertale soul quiz`，`undertale soul test` 应升级为第二核心词。

**本轮边界：**

- 只做项目文档初始化、原站公开行为核对、数据契约、Golden Test 计划和实施计划。
- 不创建业务页面，不复制原站程序代码、完整题库或结果长文，不部署。

**调查结果：**

- 原站入口已确认：`https://undertale.jadenthejaded.uk/`。
- 2026-08-16 的真实页面显示 `66 QUESTIONS`，进入答题后显示 `01 / 66`。
- 第一题有五档回答；选择答案后自动前进，第二题开始出现 Back。
- 刷新后仍停留在第二题，证明当前原站存在同浏览器进度恢复行为。
- 首页引用 `style.css`、`intro.js`、`questions.js`、`app.js`；本项目不会复制这些程序代码。
- 响应头确认 `Content-Security-Policy: frame-ancestors 'self'` 和 `X-Frame-Options: SAMEORIGIN`，第三方 iframe 不是可行方案。
- 公开 HTML 中能确认七个 Soul 内容入口和 42 个有方向的 Primary/Secondary 配对，但精确结果规则仍未完成一致性验证。

**新增文档：**

- `docs/TECHNICAL_INVESTIGATION.md`
- `docs/DATA_CONTRACT.md`
- `docs/GOLDEN_TEST_PLAN.md`
- `docs/IMPLEMENTATION_PLAN.md`

**验证：**

- 项目文档存在性检查已完成。
- 原站 HTTP 响应和一次隔离浏览器流程已实际核对。
- 文档内所有未确认项均标为 `UNKNOWN`，没有用 Mock 或社区说法补齐。

**未做：**

- 未读取或复制原站 JavaScript 内容。
- 未获得完整题库、权重、舍入、并列和特殊触发的权威数据。
- 未初始化 Git、安装依赖、创建页面、运行构建或部署。

**下一步：**解决内容来源路线和 66/68 题口径，随后执行实施计划的 Phase 1。

## 记录模板

```md
## YYYY-MM-DD 迭代记录

问题：
证据：
本轮边界：
修改：
验证：
本地状态：
Git 状态：
测试状态：
staging 状态：
production 状态：
真人验收：
未做：
下一步：
```
