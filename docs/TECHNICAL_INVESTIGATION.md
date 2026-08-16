# Technical Investigation

调查日期：2026-08-16  
状态：完成第一轮公开证据核对；精确内容与规则数据仍有阻塞项。

## 1. 调查目标

这轮调查回答四个问题：

1. 原测试当前实际是什么，而不是旧文档写了什么；
2. 哪些规则已经有可靠证据，哪些仍然未知；
3. 本站如何独立实现，不复制原站程序代码；
4. 开工前必须解决哪些数据和版权问题。

## 2. 使用的证据

### 用户提供

- `Undertale Soul Quiz MVP SPEC v1.3`：需求线，状态为 Requirements Frozen。
- 关键词数据汇总：需求与 SEO 线；SIM 数值是最近 28 天体量，不等于官方月搜索量。

### 当前公开证据

- 原站：<https://undertale.jadenthejaded.uk/>
- 作者发布说明：<https://www.reddit.com/r/Undertale/comments/1vlqsg3/i_made_a_website_where_you_can_find_your_soul/>
- 2026-08-16 的 HTTP 响应、静态 HTML 结构和隔离浏览器实际交互。

社区帖子只用于发现线索。社区声称的 Egg、Room Between、Flowery、Heats Flamesman 等内容，在没有稳定复现前一律不是已确认实现规则。

## 3. 已确认事实

### 原站产品行为

| 项目 | 2026-08-16 当前证据 | 状态 |
|---|---|---|
| 题量 | 首页显示 `66 QUESTIONS`，答题页显示 `01 / 66` | CONFIRMED |
| 回答档位 | Strongly disagree / Disagree / Neutral / Agree / Strongly agree | CONFIRMED |
| 前进方式 | 选择答案后立即进入下一题 | CONFIRMED |
| 返回 | 第二题开始显示 Back | CONFIRMED |
| 刷新恢复 | 第一题作答进入第二题后刷新，仍恢复在第二题 | CONFIRMED |
| 本地处理声明 | 页面说明答案保存在设备本地 | CONFIRMED AS PAGE CLAIM |
| 分享 | 作者说明和页面 UI 均显示结果分享能力 | CONFIRMED |
| 七个 Soul | 页面存在七个 Soul 内容入口 | CONFIRMED |
| 配对内容 | HTML 中存在 42 个有方向的 Primary -> Secondary 组合 | CONFIRMED |

### 原站技术外形

- 当前是可直接读取的静态 HTML、CSS 和浏览器 JavaScript。
- 首页引用 `style.css`、`intro.js`、`questions.js` 和 `app.js`。
- 页面至少包含 Intro、Main、Quiz、Result、Special、Review、Souls 等浏览器状态视图。
- 响应头禁止第三方 iframe：
  - `Content-Security-Policy: frame-ancestors 'self'`
  - `X-Frame-Options: SAMEORIGIN`
- 原站 `robots.txt` 明确限制多种 AI user agent，并声明 `ai-input=no`、`ai-train=no`。因此本轮没有自动提取或保存其完整题库、JavaScript 和结果长文。

## 4. 与 MVP SPEC 的冲突

| 项目 | MVP SPEC v1.3 | 原站当前行为 | 结论 |
|---|---|---|---|
| 总题量 | 66 计分题 + 2 特殊题 = 68 | 明确显示 66 | BLOCKED：必须说明两道特殊题是什么、是否属于计数 |
| 导航 | Back + Next，作答后才可 Next | 选择后自动前进，之后可 Back | 产品可以重设计，但不能称为原交互一致 |
| 特殊规则 | 纳入已确认特殊题和彩蛋 | 只有部分社区线索 | BLOCKED：缺少可复现触发表 |
| 评分公式 | 给出 payout 和 curve | 精确归一化、舍入、并列规则未由独立证据验证 | BLOCKED：需要 Golden vectors |
| 结果内容 | 高度还原完整长文 | 原站长文属于作者创作内容 | BLOCKED：需要授权或改为原创 |

最重要的结论：**当前不能把“68 道完整数据已经确认”作为实施前提。**

## 5. 评分规则的确认层级

### 已由用户需求冻结

- 七个维度：`DET`、`BRV`、`JUS`、`KND`、`PAT`、`INT`、`PER`。
- 回答系数候选：`[-1.2, -0.72, 0, 0.6, 1]`。
- 曲线候选：`sign(x) * abs(x)^0.6`。
- 最终映射候选：`(curved + 1) / 2 * 100`。
- Raw Score 为 0 时结果是 50%。

### 仍然未知

- 每题七维权重的权威数据集与版本。
- `maximum possible positive score` 的精确定义。
- 负权重参与最大正分归一化的方式。
- Clamp 是发生在归一化之前还是之后的所有边界细节。
- 页面显示使用 round、floor、ceil 还是保留小数。
- Primary/Secondary 并列时的稳定排序规则。
- 特殊结果是否在普通评分前短路，以及多个特殊条件同时满足时的优先级。
- 修改历史答案后，彩蛋导航计数是否重算或保留。

这些未知项不能靠“看起来合理”补齐，必须用授权数据或参考结果向量确认。

## 6. 内容与权限风险

MVP SPEC 已接受可能的投诉和下架风险，但这不等于已获得内容使用权。需要分别处理：

- 程序代码：独立重写，不使用原站 JS 作为代码基础。
- 题目文本：完整复制需要明确的数据来源与使用权限。
- 七维权重：属于实现所需数据，仍需记录来源和版本。
- 结果长文与 Pairing：属于明显的创作性内容，优先取得授权；否则独立创作。
- Undertale 名称与素材：保持非官方声明，不复制官方或原站专属美术包装。

## 7. SEO 调查结论

- 首页第一主词保持 `undertale soul quiz`。
- `undertale soul test` 有 11.6K 最近 28 天 SIM 体量，应升级为第二核心词。
- `soul virtues extractor` 和 `soul trait extractor` 是 Viral 产品认知词，由首页自然承接。
- Jaden 相关词是来源和导航证据，不作为本站品牌、H1 或冒充式关键词。
- MVP 仍只建立一个核心搜索入口 `/`，不按同意图变体制造重复页面。

## 8. 技术结论

建议使用：

- Astro 静态输出支持构建期 HTML；
- 原生 TypeScript 实现 Quiz 状态机、评分、持久化和 Canvas；
- Vitest 测试纯评分与状态逻辑；
- Playwright 验证真实移动端流程、恢复、分享 fallback 和静态 SEO 输出。

不引入 React 等 UI 框架。这个产品交互集中、状态边界清楚，原生 TypeScript 足够，依赖更少，静态输出更直接。

## 9. 开工门槛

进入完整实现前必须满足：

1. 决定使用授权一致性内容，还是独立原创内容；
2. 解决 66/68 题口径；
3. 提供通过 schema 校验的题目与权重数据；
4. 提供至少一组普通结果和所有特殊结果的参考向量；
5. 确认百分比舍入和并列排序；
6. 确认特殊规则的明确优先级。

满足后才能把 Golden Tests 从计划变成真实验收门槛。
