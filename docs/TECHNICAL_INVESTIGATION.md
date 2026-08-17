# Technical Investigation

调查日期：2026-08-16  
状态：原站结构、题量、评分和主要特殊规则已经确认；内容使用权限仍未确认。

## 1. 调查目标

这轮调查回答四个问题：

1. 原测试当前实际是什么，而不是只看页面标题；
2. 66 和 68 的题量口径是否冲突；
3. 评分、结果、持久化、分享和特殊规则实际如何工作；
4. 哪些内容可以作为独立实现的技术参考，哪些仍需要授权或原创替代。

## 2. 证据

### 用户提供

- `Undertale Soul Quiz MVP SPEC v1.3`。
- 关键词数据汇总。
- SiteSucker 镜像：`/Users/elng/Downloads/us.sitesucker.mac.sitesucker-pro/undertale.jadenthejaded.uk`。

### 当前线上核对

- 原站：<https://undertale.jadenthejaded.uk/>
- 2026-08-16 的 HTTP 响应和隔离浏览器运行结果。
- 浏览器运行时 `window.__SOUL__` 实际返回：68 个流程问题、66 个计分问题、2 个 Gaster 特殊问题。

### 版本一致性

本地镜像的核心文件与 2026-08-16 线上文件逐字节一致：

| 文件 | SHA-256 | 线上一致 |
|---|---|---|
| `app.js` | `c1de683e51c22b901da9bebba255831551d3edce48a814726386ce33a817cafb` | YES |
| `questions.js` | `f6a150c79a6e4d39cb83d1b7813628b131a6e015e37bb80003e1756872012dc9` | YES |
| `intro.js` | `aa8e8ebf346179cfc6a80e91ada3e23b285157cc5737e6e6ab1b375a56357a1f` | YES |
| `style.css` | `958298f0e88027b27a50ce05d35d6e4f7156b95d0f3415bd64c045d9d35f5667` | YES |

视频、图标也一致。`index.html` 的内容差异只有 SiteSucker 把 canonical 和 OG image 从绝对 URL 改成相对路径。

## 3. 66 / 68 题口径

结论：**不存在题量冲突。**

- `questions.js` 含 66 道常规 Likert 计分题。
- 文件末尾还有 2 道 Gaster 风格特殊问题。
- `QUESTIONS` 数组总长度为 68。
- `countedQuestions()` 排除 `gaster` 项，所以首页和 HUD 显示 66。
- 两道特殊问题仍进入答案数组、本地恢复和完整流程，但 `computeScores()` 明确跳过它们。

因此正确产品口径是：

> 66 scored questions + 2 unscored special questions = 68 responses in the complete flow.

两道特殊问题控制叙事和条件式后续对话，不改变七维分数。

## 4. 题库结构

66 道计分题的维度分布：

| 每题影响维度数 | 题数 |
|---|---:|
| 1 个 | 16 |
| 2 个 | 41 |
| 3 个 | 9 |

各维度参与情况：

| 维度 | 涉及题数 | 正权重 | 负权重 | 绝对权重和 / MAXP |
|---|---:|---:|---:|---:|
| DET | 16 | 8 | 8 | 33 |
| BRV | 18 | 10 | 8 | 45 |
| JUS | 14 | 9 | 5 | 35.5 |
| KND | 26 | 23 | 3 | 50 |
| PAT | 14 | 10 | 4 | 35 |
| INT | 23 | 15 | 8 | 57 |
| PER | 14 | 8 | 6 | 37 |

题目源的运行时 FNV-1a 风格版本指纹为 `9d0eb711`。原站用这个指纹使旧题库的 LocalStorage 进度失效。

## 5. 已确认评分算法

常量：

```txt
PAYOUT = [-1.2, -0.72, 0, 0.6, 1]
CURVE = 0.6
```

每个计分题的计算：

1. `lean = answerIndex - 2`，范围是 `-2` 到 `2`；
2. 正权重按回答方向使用 payout；
3. 负权重反转回答方向；
4. 单题贡献是 `abs(weight) * payout`，不是直接用带符号 weight 相乘；
5. 每个维度的 raw score 除以该维度所有题的绝对权重和 `MAXP`；
6. Clamp 到 `[-1, 1]`；
7. 应用 `sign(x) * abs(x)^0.6`；
8. 映射为 `(curved + 1) / 2 * 100`。

这意味着反对某个 Virtue 的最大惩罚为 `-1.2`，强于同级赞同的 `+1`，归一化后低端会被 Clamp 到 `-1`。

展示规则：

- 文本百分比使用 `toFixed(0)`；
- 进度条宽度使用 `toFixed(1)`；
- Primary/Secondary 按精确百分比排序，不按显示后的整数排序；
- 当前没有显式 tie-break 代码；完全并列时依赖稳定排序，保留 `DET, BRV, JUS, KND, PAT, INT, PER` 的原始顺序。独立实现应把这个行为写成明确规则并测试。

## 6. 参考结果向量

在隔离浏览器中直接调用当前线上运行时，给前 66 题循环输入 `0,1,2,3,4`，后两题输入 `1,1`，得到：

| 排名 | 维度 | 精确百分比 | 页面显示 |
|---:|---|---:|---:|
| 1 | PAT | 77.75169275865976 | 78% |
| 2 | INT | 65.57611647843527 | 66% |
| 3 | KND | 44.6654627832068 | 45% |
| 4 | JUS | 27.645663801029123 | 28% |
| 5 | PER | 25.121529875982663 | 25% |
| 6 | DET | 24.81910951073224 | 25% |
| 7 | BRV | 23.074417067802656 | 23% |

这个向量可以作为第一条独立实现 Golden Test，但还需要更多边界和特殊结果样例。

## 7. 特殊结果

普通 66 题全部作答后，以下模式绕过标准结果：

| ID | 触发条件 |
|---|---|
| `all-disagree` | 66 题全部选择索引 0 |
| `all-neutral` | 66 题全部选择索引 2 |
| `all-agree` | 66 题全部选择索引 4 |
| `all-switch` | 前 33 题全部索引 0，后 33 题全部索引 4 |

`all-switch` 显示 PAT 50 / DET 50 的特殊皮肤。其余三个使用 Null Soul 皮肤和各自文案。

如果所有常规答案都在 0/1 或都在 3/4，但不满足上面的全同模式，仍进入普通评分，只显示“非常有主见”的结果提示。

两道 Gaster 特殊问题的答案不影响上述特殊结果判断，也不影响评分。

## 8. 已确认彩蛋

### Room Between / Egg

- 触发位置是第 57、58 道计分题之间；
- 每次正向或反向跨越该边界有 2% 概率触发；
- 获得 Egg 后不再重复触发；
- 完成 Room 对话后把 Egg 存入 LocalStorage；
- Egg 显示在普通结果页和分享卡中，展示后从进度存储中删除。

第 57、58 题的极端选项文字是这个机制的线索，但选择那些文字本身不是直接触发条件。

### 键盘隐藏词

- 输入 `flowery`：普通结果增加 `FLOWERYNESS 1%`，并进入分享卡；不持久化，刷新后消失。
- 输入代码中 Base64 隐藏的另一个词：触发黑屏并清除答题进度。
- 输入 `ballgame`：把 Determination 临时重命名为 Ball Game。

第 63 题的 `Heats Flamesman` 是特殊选项文字；当前代码没有为它配置独立结果触发器。

## 9. 结果与分享

原站 HTML 含：

- 七套 Primary 描述；
- 七套 Shadow；
- 七套容易混淆的 Virtue 解释；
- 42 个有方向的 Primary -> Secondary 配对；
- 结果复查列表；
- Canvas 分享卡。

分享卡以 460 CSS px 为设计宽度、2 倍像素渲染，包含 Primary、七维排序、结果短句、站点 URL，以及可选的 Egg 和 Floweryness。支持保存 PNG、`navigator.share()` 和复制文本。

差距：四类特殊 Null/Switch 结果页当前只有 Reset，没有保存或分享能力；独立站如果按 MVP SPEC 实现，需要补齐特殊结果分享。

## 10. 持久化

- LocalStorage key：`soul-quiz`；
- schema version：`v: 1`；
- 保存 question source hash、当前索引、68 个答案、完成状态和设置；
- 题库 hash 或答案长度变化时不恢复旧进度；
- Reset/Retake 清除答题进度。

原站的不足：

- 写入失败被静默忽略；
- 只校验版本、hash 和数组长度，没有严格校验每个答案的类型与范围；
- `done` 状态被篡改时可能用不完整答案生成结果。

独立实现应使用严格 schema 校验并向用户提示存储不可用。

## 11. SiteSucker 镜像完整性

镜像包含核心 HTML、CSS、JavaScript、背景视频和图标，总计约 812 KB。核心逻辑和视觉结构足以完成调查。

镜像缺少 10 个运行时按需加载的音频文件，包括背景音乐、按键声、文字声和 Room/Egg 音效。线上这些 URL 当前均返回 200。因此：

- 核心代码镜像：完整且与线上一致；
- 完整离线体验：不完整，声音和彩蛋音频会缺失。

## 12. SEO 与 URL 现状

原站当前：

- `/` 返回 200；
- `/credits`、`/privacy`、`/terms`、`/contact` 和 `/sitemap.xml` 返回 404；
- Credits 与 Contact 是首页 overlay；
- 有 `robots.txt`；
- HTML 有 2 个 H1、7 个 Soul article、42 个 H4 pairing 标题；
- 没有 FAQPage 结构化数据。

这不改变本站的冻结策略：本站仍应使用一个核心 `/` 承接 Quiz/Test/Extractor 同意图词，并建立独立支持页面和 sitemap。

## 13. 当前结论

已经确认：

- 66 + 2 的完整流程；
- 66 题权重结构；
- 评分公式、MAXP、显示舍入和当前并列行为；
- 四类特殊结果；
- Room/Egg、Flowery、黑屏清档和 Ball Game 彩蛋；
- LocalStorage、结果与分享卡结构；
- 本地镜像与线上版本一致性。

仍未确认：

- 原题、结果长文和 42 组 Pairing 的使用权限；
- 原站未来更新时是否继续保持相同规则；
- 所有真人可达路径的完整浏览器验收。

因此技术调查已经足够进入评分内核和 Golden Tests；完整内容导入仍必须走授权数据或独立原创路线。
