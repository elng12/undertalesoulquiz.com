# ITERATION.md

这是 `undertalesoulquiz.com` 的长期迭代记录。计划、源码、Git、测试、staging、production 和真人验收必须分开记录。

## 当前状态

| 字段 | 当前事实 |
|---|---|
| 当前阶段 | 正式域名 production 已上线；Agent 404、Markdown 内容协商、`llms.txt` when-to-use 和 Organization JSON-LD 已发布并通过线上协议验收 |
| 当前最重要目标 | 等待搜索引擎重新抓取后复查品牌名搜索；决定是否有可公开、可验证的组织地址或电话 |
| 当前最大问题 | 当前搜索结果仍未发现 `undertalesoulquiz.com`；项目没有已确认的公开 PostalAddress 或电话，不能为扫描器分数编造 NAP |
| 源码 | 五个正式页面可按 `Accept` 返回 HTML 或 Markdown；缺失路径有 HTML/Markdown 404 恢复入口；根目录提供 `llms.txt`；首页有 Organization + email ContactPoint |
| Git | Agent readiness 实现提交 `41d2f5c` 已在本地 `main`、`origin/main` 和远程 `main`；GitHub Actions Validate run `32597166241` PASS |
| 测试 | `astro check` 55 文件 0 问题；middleware 独立 TypeScript 检查 PASS；Vitest 116/116 PASS；6 页构建 PASS；Playwright 31 PASS / 3 个条件跳过；全部资源预算 PASS |
| staging | Vercel preview 已验证 HTML/Markdown、q-values、406、404、`Vary`、`llms.txt`、Organization 和所有公开静态资源 |
| production | 部署 `dpl_yZia8yeyjTYZ4ofxjZmPhKBk5v2E` Ready；正式域名、`www` 和稳定别名均指向该 Git 部署；所有公开端点线上 PASS |
| 真人验收 | 新 404 已做 1280 x 900 与 390 x 844 截图检查且无横向溢出；真实物理手机仍为 SKIPPED，不冒充真人验收 |
| 下次复查 | 搜索索引有传播时间；复查 exact-brand 与 `site:` 查询，并在用户提供真实公开地址/电话后再补 Organization address/telephone |

## 当前唯一下一步

等待搜索引擎重新抓取后复查 `"Undertale Soul Quiz"` 和 `site:undertalesoulquiz.com`；不要用虚假外链、地址或电话换扫描器分数。

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

**下一步（已被后续调查取代）：**当时认为需要解决内容来源路线和 66/68 题口径；后续镜像核对已经解决技术口径。

## 2026-08-16 原站镜像复核与技术结论更新

**问题：**初步调查只看到页面显示 66 题，无法解释 SPEC 中的 68 次完整流程，也没有确认精确评分和特殊触发。

**证据：**

- 用户提供 SiteSucker 镜像目录；
- 镜像 `app.js`、`questions.js`、`intro.js`、`style.css` 与线上文件 SHA-256 一致；
- 线上浏览器运行时实际返回 68 个流程问题、66 个计分问题、2 个不计分 Gaster 问题；
- 线上运行时生成一条固定混合答案参考向量。

**本轮边界：**只更新调查与计划文档；不复制原站题库、程序代码、结果长文或美术到项目，不创建业务源码，不部署。

**确认结果：**

- 题量口径是 66 道计分题 + 2 道不计分特殊问题 = 68 次完整回答；
- 确认 payout、负权重反转、MAXP、curve、显示舍入和当前完全并列顺序；
- 确认四类完成型特殊结果；
- 确认 Room/Egg 的 57/58 边界和每次 2% 概率；
- 确认 Flowery、黑屏清档和 Ball Game 键盘彩蛋；
- 确认本地镜像缺少 10 个按需音频，因此不是完整离线副本；
- 确认原站特殊结果没有分享能力，支持页和 sitemap URL 返回 404。

**修改：**更新 `AGENTS.md`、技术调查、数据契约、Golden Test 计划、实施计划和本迭代状态。

**验证：**文档中的 66/68、评分公式、MAXP、特殊规则、参考向量和当前 Git 状态均与本轮证据一致。

**测试状态：**只有参考向量，没有本项目测试代码，不能标记 PASS。

**未解决：**原题、结果长文和 42 组 Pairing 的使用权限。

**下一步：**Phase 1a 工程骨架、数据校验和评分纯函数。

## 2026-08-16 Phase 1a 工程骨架与评分内核

**问题：**项目此前只有调查和计划文档，已确认的 66+2 规则尚未成为可运行、可测试的独立实现。

**本轮边界：**只建立 Astro/TypeScript/Vitest 骨架、数据契约、validator、评分纯函数和特殊规则；测试只用合成 fixture，不导入原题、原结果长文、Pairing 文案、原站程序代码或美术，不部署。

**修改：**

- 初始化 Astro `7.2.2`、TypeScript `6.0.3`、Vitest `4.1.10` 和静态首页骨架；
- 建立单一 68 题数据源，派生 66 道计分题和 2 道不计分题；
- validator 检查题量、顺序、ID、五档标签、七维有限权重、payout、curve、Room 规则、完成型特殊规则、normalisation 和 provenance；
- 实现负权重反转、非对称 payout、clamp、curve、显示舍入、固定并列顺序和完成结果解析；
- 实现四类完成型特殊结果、Room 57/58 边界与可注入随机数、通用 typed-secret buffer；
- 新增明确标记为 `synthetic-test`、禁止用于 Production 的 fixture。

**验证：**

- `npm run check`：15 个文件，0 errors、0 warnings、0 hints；
- `npm test`：3 个测试文件、25/25 PASS；
- 将 payout 的 `-1.2` 临时改成 `-1.1` 后，2 条评分测试按预期 FAIL；恢复后 25/25 PASS；
- `npm run build`：静态构建 PASS，生成 `dist/index.html`；
- `npm install` audit：0 vulnerabilities。

**本地状态：**Phase 1a 已实现；首页仍是禁用 Start 的工程占位，不是完整 Quiz。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；本轮代码、测试、依赖锁定和文档修改尚未提交。

**staging / production / 真人验收：**均未建立或未开始，不能标记 PASS。

**未做：**未实现 reducer/state machine、LocalStorage、完整 UI、Playwright、正式 dataset、正式 Golden vectors、分享卡或部署。

**下一步：**Phase 1b 状态机和带版本校验的本地恢复。

## 2026-08-17 Phase 1b 状态机与版本化恢复

**问题：**Phase 1a 已验证评分规则，但答题进度仍没有统一状态模型，也无法在刷新后安全恢复。

**本轮边界：**只实现无 DOM reducer、持久化适配器和单元测试；不接 UI、不导入正式内容、不增加浏览器依赖、不部署。

**修改：**

- 新增 `src/quiz/state-machine.ts`，实现 Landing、进行中、完成三种阶段，以及 Start、Answer、Back、Grant Egg、Reset、Retake；
- Answer 必须匹配当前题 ID，并按计分题五档、不计分题两档分别校验；
- Back 支持返回修改，完成后可退回最后一题并重新完成；
- 新增 `src/quiz/persistence.ts`，使用项目专属 key 保存 schema、dataset version、阶段、位置、答案、Egg 和更新时间；
- 恢复时校验 schema、dataset version、连续答案前缀、题目 ID、答案范围、阶段/位置组合和时间；无效数据只清除本项目 key；
- 存储读取、写入或清理失败时返回显式状态，Quiz 内存状态仍可继续使用。

**验证：**

- `npm run check`：19 个文件，0 errors、0 warnings、0 hints；
- `npm test`：5 个测试文件、47/47 PASS，其中 Phase 1b 新增 22 条；
- 将导航从下一题临时改成跳过一题后，22 条相关测试中 11 条按预期 FAIL；恢复后 47/47 PASS；
- `npm run build`：静态构建 PASS，生成 1 个页面。

**本地状态：**Phase 1b 模块完成；现有首页仍是禁用 Start 的工程占位，尚未把浏览器 `localStorage` 和 UI 接上。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；Phase 1a、Phase 1b 和文档修改尚未提交。

**staging / production / 真人验收：**均未建立或未开始，不能标记 PASS。

**未做：**未实现真实 Quiz UI、Playwright、正式 dataset、正式 Golden vectors、分享卡或部署。

**下一步：**Phase 2a Quiz UI 接入。

## 2026-08-17 Phase 2a 开发版 Quiz UI

**问题：**状态机和持久化只有纯逻辑测试，尚未证明它们能在真实浏览器事件中组合工作。

**本轮边界：**只接入 Start、答题、Back、进度、恢复、Reset、Retake 和完成状态；使用清晰标注、禁止用于 Production 的合成数据，不导入原题、结果长文、Pairing、原站代码或美术，不部署。

**修改：**

- 新增 `src/data/development-dataset.ts`，作为测试与浏览器开发共用的 66+2 合成数据源；
- 新增 `src/quiz/browser-app.ts`，把 UI 动作统一交给 reducer，并在每次进度变化后持久化；
- 首页实现五档自动前进、数字键选择、Back 修改、66 题进度、2 道 Final Check、Reset 确认框、完成后返回和 Start Over；
- 恢复、无效进度清理和浏览器存储不可用都有可见状态，不静默失败；
- 新增自有 favicon 和响应式复古视觉；按钮保持至少 48px，支持清晰焦点和 reduced motion；
- 页面显式标记 `DEVELOPMENT DATA`，加入 `noindex, nofollow`，避免合成开发内容被误当正式页面。

**验证：**

- `npm run validate`：21 个文件 0 errors、0 warnings、0 hints；Vitest 47/47 PASS；静态构建 PASS；
- Chromium：Start、自动前进、Back 修改、刷新恢复、Reset、损坏 JSON 清理、66+2 完整流程和完成后返回均实际通过；
- WebKit 移动环境：Start、Answer、刷新恢复实际通过，console 0 errors；
- 静态构建预览：Start、Answer、刷新恢复实际通过，console 0 errors；
- 1440x900、390x844 和 320x740 已截图检查；320px 视口下 `scrollWidth === innerWidth`，没有水平溢出；
- 恢复提示已从浮层改为正常文档流，避免遮挡进度和题目。

**本地状态：**开发版答题流程可在 `http://127.0.0.1:4321/` 操作；题目均为合成占位，完成后只显示流程完成，不显示正式结果。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；Phase 1a、Phase 1b、Phase 2a 和文档修改尚未提交。

**staging / production / 真人验收：**均未建立或未开始，不能标记 PASS。浏览器验证只属于本地开发验收。

**未做：**未实现 ResultViewModel、正式结果页、Canvas 分享卡、正式内容、自动化 Playwright 测试文件或部署。

**下一步：**Phase 3a 共享 ResultViewModel 和开发结果页。

## 2026-08-17 恢复冻结首页结构

**问题：**Phase 2a 为验证答题状态机，把首页临时收缩成了单屏技术演示，导致真实页面没有按已冻结的网站结构呈现。

**本轮边界：**只恢复已冻结的首页信息结构和响应式视觉，并保留现有 Quiz 状态机；不导入原站题库、结果长文、Pairing、程序代码或专属美术，不创建支持页，不部署。

**修改：**

- 首页恢复 `Hero -> Quiz -> How It Works -> 7 Souls -> Result Explanation -> Sharing -> FAQ -> Footer` 顺序；
- 保留单一 H1，并加入冻结主题对应的 H2/H3、页内导航、七 Soul 概览、结果说明、分享预览和 FAQ；
- Quiz 仍位于首屏附近，Start 后在同一位置进入答题，不改变既有 DOM 接口和状态机；
- 所有新增说明均为本项目的简短原创开发文案；未来结果能力明确标为 future/development preview；
- 继续显示 `DEVELOPMENT DATA`、合成题目提示和 `noindex, nofollow`，没有把开发内容冒充 Production。

**验证：**

- `npm run check`：21 个文件，0 errors、0 warnings、0 hints；
- `npm test`：5 个测试文件、47/47 PASS；
- `npm run build`：静态构建 PASS；
- Chromium：Start、Answer、刷新恢复、Reset 清理实际通过，console 0 errors；
- 1440x900 和 390x844 页面已截图检查；320x740 下 `scrollWidth === innerWidth`，页面只有一个 H1；
- WebKit iPhone 15：页面、Start 和无水平溢出检查通过，console 0 errors；
- 构建产物预览：标题、H1、冻结分区和 `noindex, nofollow` 实际存在，console 0 errors。

**本地状态：**冻结首页结构已恢复；`http://127.0.0.1:4321/` 正在运行。答题数据仍是开发用合成占位，结果和分享区只展示结构，不冒充已实现功能。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；全部开发修改仍未提交。

**staging / production / 真人验收：**均未建立或未开始，不能标记 PASS；本轮只完成本地浏览器验收。

**未做：**未实现 ResultViewModel、正式结果页、Canvas 分享、支持页、正式内容或部署。

**下一步：**Phase 3a 共享 ResultViewModel 和开发结果页。

## 2026-08-17 Phase 3a 共享结果模型与开发结果页

**问题：**完成 68 次回答后只能看到流程完成状态，页面没有结果；如果页面和后续分享卡各自计算，Primary、Secondary 和七维百分比可能不一致。

**本轮边界：**只建立共享 `ResultViewModel` 并接入普通/特殊开发结果页；不实现 Canvas、保存、Web Share 或 Copy，不编写或导入原站结果长文与 42 组 Pairing 文案，不部署。

**修改：**

- 新增 `src/quiz/result-view-model.ts`，内部唯一调用 `resolveQuizResult()`，输出页面与未来分享卡共用的展示数据；
- 普通结果包含 Primary、Secondary、按精确结果排序的七维显示百分比、颜色、分享文本和站点 URL；
- Shadow 与 Pairing 只显示 `content-pending`，明确等待授权数据或本站原创内容路线；
- 四类完成型特殊结果使用独立联合分支，不混入普通结果字段；`all-switch` 展示已确认的 PAT 50 / DET 50；
- 完成页接入结果 Hero、Primary/Secondary、七维条形分布、内容占位、Back 和 Start Over；恢复已完成进度时重新由同一模型渲染。

**验证：**

- `npm run check`：23 个文件，0 errors、0 warnings、0 hints；
- `npm test`：6 个测试文件、54/54 PASS，其中 ResultViewModel 新增 7 条；
- Chromium：完成混合答案后生成 standard 结果、7 项 spread、Back/Retake 所需状态；全 Neutral 生成 `all-neutral` 特殊结果；刷新后完成结果恢复；console 0 errors；
- 1440x900 与 390x844 结果页已截图检查，移动端无横向溢出；
- WebKit iPhone 15：完整 68 次混合回答后生成 standard 结果，7 项 spread，`scrollWidth === innerWidth`，console 0 errors；
- 静态构建预览：完整 68 次混合回答后生成与开发服务器一致的 standard 结果和 7 项 spread，`noindex, nofollow` 保持不变，console 0 errors。

**本地状态：**Phase 3a 已完成，开发结果页可在 `http://127.0.0.1:4321/` 操作；所有题目和结果摘要仍明确标记为合成开发内容。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；全部开发修改仍未提交。

**staging / production / 真人验收：**均未建立或未开始，不能标记 PASS；本轮只完成本地浏览器验收。

**未做：**未实现 Canvas 分享卡、保存图片、Web Share、Copy、正式结果长文、正式题库、支持页或部署。

**下一步：**Phase 3b Canvas 分享卡与分享控制。

## 2026-08-17 Phase 3b Canvas 分享卡与分享控制

**问题：**Phase 3a 已有页面结果，但用户还不能保存或分享；如果 Canvas 自己重新评分，图片可能与页面不一致。

**本轮边界：**只实现消费现有 `ResultViewModel` 的 Canvas、PNG 保存、Web Share、Copy 和 fallback；不新增评分路径、不导入正式内容、不编写原站结果长文、不部署。

**修改：**

- 新增 `src/quiz/share-card.ts`，以 2 倍像素生成 920 x 1150 PNG；普通卡包含 Primary、Secondary 和七维 spread，特殊卡使用独立布局；
- 新增 `src/quiz/share-actions.ts`，支持文件型 Web Share、文本型 Web Share、复制 fallback 和取消结果；
- 开发结果页加入实际 Canvas 预览、Save Image、Share 和 Copy Result；三个动作都使用 Phase 3a 的同一个 `ResultViewModel`；
- 保存文件使用稳定的结果类型文件名；分享取消只提示，不清理进度、不改变结果；
- 首页 Sharing 说明从 future 状态更新为当前可下载开发能力，继续明确标注 Development Preview。

**验证：**

- `npm run check`：27 个文件，0 errors、0 warnings、0 hints；
- `npm test`：8 个测试文件、63/63 PASS；覆盖标准/特殊卡、PNG 编码失败、文件分享、文本分享、复制 fallback 和取消；
- Chromium：标准结果 Canvas 为 920 x 1150 且 1,058,000 个像素均非透明；PNG 下载成功并由系统识别为 920 x 1150 RGBA PNG；Copy 成功；原生 Share 取消后结果仍处于 complete；
- Chromium 特殊结果：`all-neutral` 使用独立特殊卡并成功下载 `undertale-soul-all-neutral-development.png`；
- 390 x 844 结果页截图检查通过，按钮、Canvas 和正文无水平溢出；
- WebKit iPhone 15：标准结果 Canvas 920 x 1150、三个动作按钮存在、`scrollWidth === innerWidth`、PNG 下载成功、console 0 errors；
- 静态构建预览：完整答题后 Canvas 尺寸和 PNG 下载正确，`noindex, nofollow` 保持不变，console 0 errors。

**本地状态：**Phase 3b 已完成；`http://127.0.0.1:4321/` 可生成、保存、分享或复制开发结果。内容仍是合成数据，不能作为 Production 结果。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；全部开发修改仍未提交。

**staging / production / 真人验收：**均未建立或未开始，不能标记 PASS；本轮只完成本地和静态预览验收。

**未做：**未创建支持页、robots.txt、sitemap、正式题库、正式结果长文、analytics 或部署。

**下一步：**Phase 4a 支持页、共享页面外壳与技术 SEO 文件。

## 2026-08-17 Phase 4a 支持页与技术 SEO 外壳

**问题：**首页仍单独维护完整 HTML 外壳，冻结的四个支持 URL、canonical/OG、robots.txt 和 sitemap 都不存在，不能形成完整静态站点结构。

**本轮边界：**只抽取共享布局、创建支持页和技术 SEO 文件；不移除开发 `noindex`、不添加 Analytics/Search Console、不虚构可用邮箱、不导入正式内容、不部署。

**修改：**

- 新增 `src/layouts/SiteLayout.astro`，统一 head、header、footer、跳转主内容链接、canonical、基础 OG/Twitter 和 Development 状态；
- 首页迁移到共享布局，Quiz DOM ID、状态机、Canvas 和分享流程保持不变；
- 新增 `/credits`，记录 Jaden 原站出处、Undertale/Toby Fox 归属、独立实现和 Attribution 不等于 Permission；
- 新增 `/privacy`，说明浏览器本地计算、LocalStorage、Reset、Canvas/系统分享，以及当前无 Analytics/Cookie/Search Console；
- 新增 `/terms`，说明娱乐用途、非诊断、非官方、开发可用性和知识产权边界；
- 新增 `/contact`，列出 Feedback/Bug/Rights Inquiry 范围，并如实说明当前没有已配置的公开邮箱、表单或工单系统；
- 新增 `robots.txt` 和包含 5 个冻结 URL 的 `sitemap.xml`。robots 允许抓取页面以读取 meta robots，但所有页面继续输出 `noindex, nofollow`，因此开发内容仍不应进入索引。

**验证：**

- `npm run check`：32 个文件，0 errors、0 warnings、0 hints；
- `npm test`：8 个测试文件、63/63 PASS；
- `npm run build`：`/`、`/credits`、`/privacy`、`/terms`、`/contact` 共 5 个静态页面 PASS，同时复制 robots.txt 和 sitemap.xml；
- sitemap 通过 XML 解析并恰好包含 5 个 URL；
- Chromium：首页共享布局迁移后 Start 仍进入第一题；首页 canonical、OG URL 和 `noindex, nofollow` 正确；
- 四个支持页逐页确认单一 H1、独立 title/canonical/OG URL、footer 当前页和 `noindex, nofollow`；console 0 errors；
- Credits 1440 x 900、Contact 390 x 844 已截图检查；移动端无横向溢出；
- WebKit iPhone 15：Privacy canonical 正确、`scrollWidth === innerWidth`，首页 Start 回归通过，console 0 errors；
- 静态构建预览：5 个 HTML、robots.txt 和 sitemap.xml 均返回 200；支持页无业务脚本，首页 Quiz 仍可启动，console 0 errors。

**本地状态：**Phase 4a 已完成；开发服务器仍在 `http://127.0.0.1:4321/`。所有页面明确保持 Development/noindex，不能标记为 Production SEO 就绪。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；全部开发修改仍未提交。

**staging / production / 真人验收：**均未建立或未开始，不能标记 PASS；本轮只有本地和静态预览验收。

**未做：**未添加真实联系人、Analytics、Search Console、OG 位图、正式题库/结果文案、可索引 robots 或部署。

**下一步：**Phase 5a 自动化浏览器回归与无障碍/性能检查。

## 2026-08-17 Phase 5a 自动化浏览器回归、无障碍与性能预算

**问题：**此前的浏览器验收主要依赖临时手动操作，没有仓库内可重复运行的键盘全流程、支持页无障碍、200% reflow、Canvas 重叠和资源预算门槛。

**本轮边界：**只固化本地静态构建的浏览器与性能回归，并修复检查中发现的焦点问题；继续使用合成数据，不导入原题或结果长文，不移除 `noindex`，不部署。

**修改：**

- 引入固定版本的 `@playwright/test` 和 `@axe-core/playwright`，建立 Chromium desktop 与 WebKit iPhone 15 两个项目；
- 新增静态构建测试服务器和仓库内 E2E，覆盖五个冻结 URL、运行时错误、键盘完整 68 次回答、完成后 Back/重答/Start Over、焦点回到当前上下文；
- 为五页主内容加入可聚焦 skip-link 目标，为答案集合补充 `role="group"`；
- 修复 Start Over 后焦点遗留在已隐藏按钮的问题，现在会回到 Start Quiz；
- 新增 640 CSS px 的 200% 有效视口回归，检查水平溢出、Canvas/正文/完成计数重叠及 Canvas 非空像素；
- 新增构建资源预算：JS 40 KiB、CSS 24 KiB、HTML 36 KiB、图片 100 KiB、字体 100 KiB、总量 120 KiB；
- `npm run validate` 现在包含类型检查、63 条单元测试、构建、资源预算和 Playwright 回归。

**验证：**

- `npm run check`：37 个文件，0 errors、0 warnings、0 hints；Vitest 8 个文件、63/63 PASS；5 页静态构建 PASS；
- Playwright：14 PASS、2 个有意跳过。移动 WebKit 跳过桌面 Tab 专项，WebKit 跳过仅 Chromium 提供一致数据的 Navigation Timing 专项；其余移动布局、完整结果和 Axe 检查均执行；
- Chromium 与 WebKit 对 `/`、`/credits`、`/privacy`、`/terms`、`/contact` 共 10 次 Axe WCAG A/AA 扫描，0 violations；
- Chromium 键盘全流程完成 68 次回答，Back、重新完成和 Start Over 后焦点均正确；
- Chromium 与 WebKit 的 640 x 450 有效视口均无水平溢出，Canvas 与正文/计数不重叠，Canvas 像素非空；
- 本次构建实际资源：JS 26.4 KiB、CSS 16.5 KiB、HTML 27.4 KiB、图片 0.2 KiB、字体 0 KiB、总量 70.9 KiB，全部低于门槛；
- Chromium 本地 Navigation Timing 小于 5 秒、传输量不超过 120 KiB、CLS 不超过 0.1；640 x 450 首页和结果截图已完成视觉检查，console 0 errors。

**本地状态：**Phase 5a 已完成；开发服务器继续运行在 `http://127.0.0.1:4321/`。开发题目、结果和分享卡仍是合成数据。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；Phase 1a 至 Phase 5a 的全部开发修改仍未提交。

**staging / production / 真人验收：**均未建立或未开始，不能标记 PASS。自动化浏览器和截图检查只属于本地验收。

**未做：**未选择正式内容路线，未导入正式 dataset/Golden vectors/结果长文/Pairing，未配置真实联系人、Analytics、Search Console 或 OG 位图，未移除 `noindex`，未部署。

**下一步：**用户在“获授权数据集”和“独立原创内容”之间选择一条正式内容路线；没有这个决定时不进入 Phase 6 发布。

## 2026-08-17 独立原创路线与 Calibration v1

**问题：**搜索需求要求长测试和深结果体验，但未授权复刻题库、完整权重矩阵和结果长文不可作为可持续 Production 内容；直接批量写 66+2 又可能放大尚未校准的维度边界和语气问题。

**用户决定：**在重新阅读 MVP SPEC v1.3 与关键词汇总后，选择“体验兼容的独立原创路线”：保留产品结构和已实现技术规则，题目、完整权重矩阵、结果、Shadow、Pairing 和特殊文案全部重新创作。

**本轮边界：**只建立内容蓝图和 Calibration v1，不生成完整 66+2，不替换当前浏览器合成数据，不移除 `noindex`，不部署。

**修改：**

- 新增 `docs/ORIGINAL_CONTENT_BLUEPRINT.md`，定义七个维度、相邻维度边界、题目/权重规则、结果语言和内容验收问题；
- 新增隔离的 `src/data/original-content-calibration.ts`，包含每个维度 1 direct + 1 reverse，共 14 道原创题；
- 样本主维度权重为正/负 3，并使用一个正/负 1 的相邻维度；七维绝对权重和均为 8；
- 样本包含 7 个 Primary 摘要与 Shadow、3 个有方向 Pairing、1 个 `all-neutral` 原创特殊结果；
- provenance 使用 `original-authored` / `not-required-original`，但样本明确标记 `calibration-only` / `productionEligible: false`；
- Credits 和结果占位文字更新为“原创路线已选择，但完整内容仍待审阅”，没有把样本接入当前页面；
- 新增 5 条校准测试，覆盖隔离状态、14 题/七维 direct-reverse、权重平衡、内容清单和非官方/非诊断边界。

**验证：**`npm run validate` 全套 PASS：39 个文件 0 errors、0 warnings、0 hints；Vitest 9 个文件、68/68 PASS；5 页静态构建 PASS；资源总量 71.0 KiB / 120 KiB；Playwright 14 PASS / 2 个有意跳过，Chromium/WebKit 五页 Axe 与布局回归继续通过。

**本地状态：**Calibration v1 已进入仓库工作区但未进入 Quiz；`http://127.0.0.1:4321/` 仍显示合成开发数据。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；Phase 1a 至本轮的全部修改仍未提交。

**staging / production / 真人验收：**staging 和 production 未建立；Calibration v1 真人内容验收未开始，不能标记 PASS。

**未做：**未扩写完整 66+2、42 个 Pairing、四类完整特殊结果或正式 Golden vectors；未替换开发 dataset、移除 `noindex` 或部署。

**下一步：**真人审阅 Calibration v1，确认维度边界、题目语气和结果语言后，再决定是否扩写完整原创数据集。

## 2026-08-17 对手对照与 Calibration v2

**问题：**对照当前参考站后，Calibration v1 的原创边界合格，但题目全部为双维、没有正负混合或情境标签，结果和 Pairing 也明显短于目标体验，整体更像整齐的健康建议，而不是可以承载长测试的完整内容系统。

**证据：**2026-08-17 再次读取线上参考站和同版本本地镜像，确认 `questions.js` 与 `app.js` 仍对应 `docs/TECHNICAL_INVESTIGATION.md` 中记录的哈希。只比较结构和统计特征，不把参考题目、权重矩阵或结果文案导入本站。

**本轮边界：**只升级隔离的原创校准样本和内容规则，不扩写完整 66+2，不接入当前 Quiz，不移除 `noindex`，不提交或部署。

**修改：**

- Calibration 样本版本升至 v2，仍为每维 1 direct + 1 reverse，共 14 道；
- 题型调整为 3 道单维、8 道双维、3 道三维，含 5 道正负混合权重题和 2 套情境回答标签；
- 七维绝对权重和均从 8 调整为 9，继续保持归一化平衡；
- 7 个 Primary 扩展到 80-110 词，Shadow 扩展到 60-90 词，并新增 7 个 50-80 词的 `confusedWith` 维度边界解释；
- 3 个有方向 Pairing 扩展到 65-95 词，分别包含 Primary 驱动力、Secondary 修正和两者张力；
- `all-neutral` 特殊结果增加独立游戏叙事，并把回答模式解释单独放入 `interpretationNote`；
- 更新数据契约、内容蓝图、实施计划和校准测试，不改变运行中页面的数据源。

**原创复核：**将 Calibration v2 中 48 个不少于 5 词的字符串，与同版本镜像的 `questions.js`、`app.js` 和 `index.html` 做标准化连续词序列对照；没有发现 5 词或以上的完全相同连续片段。该自动检查用于发现明显复用，不代替真人版权和内容审阅。

**验证：**`npm run validate` 全套 PASS：39 个文件 0 errors、0 warnings、0 hints；Vitest 9 个文件、68/68 PASS；5 页静态构建 PASS；资源总量 71.0 KiB / 120 KiB；Playwright 14 PASS / 2 个有意跳过，Chromium/WebKit 回归继续通过。

**本地状态：**Calibration v2 已进入仓库工作区但未接入 Quiz；`http://127.0.0.1:4321/` 仍显示合成开发数据。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；Phase 1a 至本轮的全部修改仍未提交。

**staging / production / 真人验收：**staging 和 production 未建立；Calibration v2 真人内容验收未开始，不能标记 PASS。

**未做：**未扩写完整 66+2、42 个 Pairing、四类完整特殊结果或正式 Golden vectors；未替换开发 dataset、移除 `noindex` 或部署。

**下一步：**真人审阅 Calibration v2，确认题目取舍是否自然、七个维度边界是否清楚、深结果是否有足够产品感；通过后再扩写完整原创数据集。

## 2026-08-17 Calibration v2 本地审阅页

**问题：**Calibration v2 已有机器可读内容和结构测试，但直接阅读 TypeScript 不适合逐项真人验收，也无法稳定记录哪些内容通过、哪些内容需要修改。

**本轮边界：**只建立本地内容审阅工具，不修改校准文案、权重或运行中 Quiz，不扩写完整 66+2，不提交或部署。

**修改：**

- 新增 `/content-review`，完整展示 14 道题、7 套 Primary/Shadow/边界解释、3 个 Pairing 和 1 个特殊结果，共 25 个审阅项；
- 页面提供 Questions、Results、Pairings 和 Special 筛选，并展示题目方向、非零权重、五档答案和情境标签；
- 每项可选择 PASS 或 REVISE 并填写备注，结果以带 schema 与样本版本的 LocalStorage 保存；
- 顶部实时显示已审数量和总门槛状态；存在 REVISE 时显示修订数量，25 项全部 PASS 时才显示 `CALIBRATION V2 PASS`；
- 可复制包含全部决定和备注的纯文本审阅报告，也可通过确认对话框只清除此审阅页的本地状态；
- 页面保持 `noindex, nofollow`，不从公开导航或页脚进入；性能预算排除该内部审阅页 HTML，但仍检查其共享 CSS、JavaScript 和单文件超限。

**验证：**`npm run validate` 全套 PASS：43 个文件 0 errors、0 warnings、0 hints；Vitest 9 个文件、68/68 PASS；6 页静态构建 PASS；公开页面资源总量 77.1 KiB / 120 KiB；Playwright 17 PASS / 3 个有意跳过。Chromium 与移动 WebKit 均验证 25 项渲染、筛选、决定和备注持久化、清除、Axe WCAG A/AA 与无运行时错误；Chromium 另验证报告复制内容。桌面 1280 x 900 与移动 390 x 844 截图已人工检查，无横向溢出或内容重叠。

**本地状态：**审阅页可在 `http://127.0.0.1:4321/content-review` 使用；首页仍显示合成开发数据，Calibration v2 未接入 Quiz。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；Phase 1a 至本轮的全部修改仍未提交。

**staging / production / 真人验收：**staging 和 production 未建立；工具已就绪，但用户尚未在页面完成 25 项审阅，因此真人验收仍为 UNKNOWN。

**未做：**未把审阅页决定写回内容源码；未扩写完整 66+2、42 个 Pairing、四类完整特殊结果或正式 Golden vectors；未替换开发 dataset、移除 `noindex` 或部署。

**下一步：**用户在本地审阅页完成 25 项判断并复制审阅报告；根据报告修订或进入完整原创数据集写作。

## 2026-08-17 多 Agent 复核与 Calibration v3

**问题：**Calibration v2 的结构测试和原创连续词检查均通过，但用户要求由相关 Agent 独立验收内容质量，确认权重不是为凑题型而添加、结果文案也没有模板化或维度重叠。

**首轮独立验收：**

- 问题 Agent 给出 `REVISE`：14 题中 3 PASS / 11 REVISE，主要问题是部分次权重缺少直接文字证据、道德正确答案明显、假冲突和双重问题；
- 结果 Agent 给出 `REVISE`：7 套中 4 PASS / 3 REVISE，阻塞项是 DET/PER Shadow 重叠、JUS 过于抽象、INT 略带指责感，以及 Shadow 句式模板化；
- 体验 Agent 对 3 个 Pairing、`all-neutral` 和审阅工具给出 PASS，并记录筛选后非目标分类标题仍显示的非阻塞问题；
- 以上均属于 AI 编辑验收，不是用户真人验收。

**本轮边界：**只关闭上述 Calibration 阻塞项并升级为 v3，不扩写完整 66+2，不接入当前 Quiz，不移除 `noindex`，不提交或部署。

**修改：**

- 重写 11 道未通过题，并在首次 v3 复验后继续修正 Q1、Q6、Q12；最终 14 题全部使用单一、可解释的行为轴；
- 删除缺少语义依据的次权重和强制三维/正负混合规则；v3 使用 7 道单维、7 道双维，双维次权重绝对值均为 2，七维绝对权重和均为 8；
- 两套情境标签保留，但去掉 `always`，并继续与回答 payout 方向一致；
- DET Shadow 改为受阻后急于恢复控制，沉没成本完整留给 PER；JUS 增加普通协作场景；INT 移除 `costume` 和篡改记录式措辞；
- 七套 Shadow 不再重复 `Mature [virtue]` 模板；Primary、Shadow、边界解释的既定词数范围保持不变；
- 样本 provenance、审阅页标题、LocalStorage key、门槛文字和报告头统一升级为 `original-calibration-v3`；v2 浏览器记录不会误用于 v3；
- 审阅页筛选现在同时隐藏非目标分类标题和内容，并增加浏览器回归断言。

**Agent 最终复验：**问题 14/14 PASS；结果 7/7 PASS；三个 Pairing、特殊结果、25 项审阅工具和版本一致性全部 PASS。v2 的所有阻塞项均已关闭，可以标记为“独立 AI 编辑复验通过”，但真人验收仍为 UNKNOWN。

**原创复核：**将 v3 中 48 个不少于 5 词的字符串与同版本参考镜像的 `questions.js`、`app.js` 和 `index.html` 对照，没有发现连续 5 词或以上的完全相同片段。自动检查不等于法律结论。

**验证：**`npm run validate` 全套 PASS：43 个文件 0 errors、0 warnings、0 hints；Vitest 9 个文件、68/68 PASS；6 页静态构建 PASS；公开页面资源总量 77.1 KiB / 120 KiB；Playwright 17 PASS / 3 个有意跳过。Chromium 与移动 WebKit 的审阅状态、筛选、持久化、清除和 Axe 回归继续通过；Chromium 报告复制通过。桌面筛选到 Special 的最终页面已截图检查，无溢出或重叠。

**本地状态：**Calibration v3 和审阅页已就绪；`http://127.0.0.1:4321/content-review` 显示 v3，首页仍使用合成开发数据。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；Phase 1a 至本轮的全部修改仍未提交。

**staging / production / 真人验收：**staging 和 production 未建立；独立 AI 编辑复验 PASS，真人验收 UNKNOWN。

**未做：**未扩写完整 66+2、42 个 Pairing、四类完整特殊结果或正式 Golden vectors；未替换开发 dataset、移除 `noindex` 或部署。

**下一步：**用户在 v3 审阅页完成 25 项真人判断并复制报告；真人通过后才进入完整原创数据集写作。

## 2026-08-17 用户委托 Codex 代验收 Calibration v3

**用户决定：**用户明确要求“你帮我验收”，将 Calibration v3 的最终内容判断委托给 Codex；本次不属于用户本人逐项人工审阅。

**验收依据：**问题 Agent 最终 14/14 PASS；结果 Agent 最终 7/7 PASS；体验 Agent 对 3 个 Pairing、1 个特殊结果、审阅工具和版本一致性全部给出 PASS。根 Agent 同时核对了数据定义、权重平衡、原创连续词检查、自动化测试和最终页面状态。

**验收结果：**在用户本地 `/content-review` 页面将 25 个审阅项全部标记为 PASS，页面显示 `25 / 25 reviewed` 和 `CALIBRATION V3 PASS`。本轮状态记为 `DELEGATED_CODEX_ACCEPTANCE_PASS`，不得写成用户本人 `HUMAN_REVIEW_PASS`。

**修改：**本轮未改动 Calibration v3 内容源码；只写入当前浏览器的本地审阅状态，并同步项目状态文档。

**验证：**本轮前紧邻的 v3 最终版本已经通过 `npm run validate`：Astro/TypeScript 43 个文件无问题、Vitest 68/68 PASS、6 页构建 PASS、Playwright 17 PASS / 3 个有意跳过；本轮浏览器再次确认 25/25 与最终 PASS 门槛。

**本地状态：**Calibration v3 委托验收 PASS，但仍是 `calibration-only`，未接入首页 Quiz；首页继续使用合成开发数据。

**Git 状态：**`main` 与 `origin/main` 基线均为 `8dd066c`；全部项目修改仍未提交。

**staging / production / 真人验收：**staging 和 production 未建立；用户本人逐项人工验收未执行。用户已明确委托 Codex 完成这一阶段的验收，因此可以进入完整原创数据集写作，但不能把该结论外推为 Production PASS。

**未做：**未扩写完整 66+2、42 个 Pairing、四类完整特殊结果或正式 Golden vectors；未替换开发 dataset、移除 `noindex`、提交或部署。

**下一步：**按已通过的 v3 内容规则制作完整原创 Production dataset，并对完整数据重新进行内容、结构、Golden tests 和浏览器全流程验收。

## 2026-08-17 完整原创 Production dataset 与本地验收

**问题：**Calibration v3 只证明内容方向可行，首页仍加载合成题目，缺少完整 66+2、42 组 Pairing、四类原创特殊结果和可以锁住正式权重矩阵的 Golden vectors。

**本轮边界：**建立并接入完整独立原创数据，关闭内容和接入阻塞并完成本地验收；继续保持 `noindex, nofollow`，不配置真实联系人、OG 位图、staging 或 production，不提交或部署。

**修改：**

- 新增 `original-production-v1`：66 道计分题、2 道不计分问题、完整 original-authored provenance 和 production validator 接入；
- 七维主目标题量相差不超过 1，每维至少 4 道 direct 和 4 道 reverse；归一化最大值范围通过 10% 平衡门槛；
- 题目显示顺序改为固定不规则混排，direct/reverse 最长连续为 2，方向切换率约 64.6%；
- 新增七套 Primary/Shadow、42 个逐项独立编写的 65-95 词有方向 Pairing 和四类特殊结果；
- 首页、ResultViewModel、Canvas 文件名、分享文字、Credits、Terms 和可见状态从 synthetic development 切换为 prelaunch original；
- 建立 7 个普通固定向量、四类特殊结果正反例、不计分题隔离、完全并列和权重变异检测；Production 页面与四类分享卡都有回归保护；
- 因完整原创内容进入浏览器包，将明确资源预算从 JS 40 KiB / 总量 120 KiB 调整为 JS 80 KiB / 总量 136 KiB，最终实际值仍低于新门槛。

**独立验收：**题目 Agent、结果 Agent 和体验 Agent 首轮均发现阻塞；修正题序规律、重复题、次权重、Pairing 模板化、特殊结果意图推断和旧开发文案后，三项最终复验全部 PASS。该结论属于独立 AI 内容与体验验收，不是用户本人真人验收。

**原创复核：**将 Production 文件中 131 个不少于 5 词的字符串与本地参考镜像 5 个 JS/HTML 文件对照，没有发现连续 5 词或以上的完全相同片段。该检查用于发现明显复用，不是法律结论。

**验证：**最终 `npm run validate` 全套 PASS：Astro/TypeScript 47 个文件无问题；Vitest 11 个文件、97/97 PASS；6 页静态构建 PASS；JS 75.4 KiB / 80 KiB、总量 126.2 KiB / 136 KiB；Playwright 17 PASS / 3 个有意跳过，Chromium/WebKit 完整流程、Axe 与布局回归通过。

**本地浏览器验收：**真实运行 `http://127.0.0.1:4321/` 完成 68 次回答，得到 Justice Primary、Integrity Secondary、七维 spread、完整 Justice Shadow 和 `Justice + Integrity` Pairing；页面显示 `68 / 68 RESPONSES`，截图未见首屏重叠或旧 Development 标识。

**本地状态：**首页已使用完整原创数据，旧 synthetic 进度因 dataset version 变化会安全丢弃。Calibration v3 与 `/content-review` 继续作为校准证据保留，不是 Production 数据源。

**Git 状态：**`main` 与 `origin/main` 基线仍为 `8dd066c`；全部项目修改尚未提交。

**staging / production / 真人验收：**staging 和 production 未建立；用户本人完整内容审阅与真实手机验收均为 UNKNOWN，不能标记 Production PASS。

**未做：**未配置真实联系人、OG 位图、Analytics、Search Console、可索引 robots、staging 或 production；未提交或部署。

**下一步：**用户抽查完整内容并在真实手机完成全流程；通过后进入真实联系人、OG 位图和 staging 准备。

## 2026-08-17 公开 staging 部署与验收

**目标：**把已通过本地验证的完整原创版本发布到与正式域名隔离的公开预览环境，验证真实 HTTPS、静态路由、完整测验、结果恢复和移动端布局；本轮不发布 `undertalesoulquiz.com` 正式站。

**部署：**建立独立 Vercel 项目 `undertalesoulquiz-staging`，稳定地址为 `https://undertalesoulquiz-staging.vercel.app`。最终部署 ID 为 `dpl_3EqP6ESNGfS8qe2teyQpnWbm9tKA`，状态 Ready。该项目没有连接 Git，不会因仓库提交自动发布。Vercel 内部把稳定别名部署标记为 `target: production`，但它属于名称和域名均隔离的 staging 项目，不代表正式网站 production 已发布。

**修正：**首次公开检查发现页脚仍显示 `Prelaunch local build`，已改为 `Prelaunch preview` 并重新部署。误建的 `undertalesoulquiz.com` Vercel 项目及其部署已全部删除，正式域名未绑定、未发布。

**自动验证：**最终代码再次运行 `npm run validate` 全套 PASS：Astro/TypeScript 47 个文件无问题；Vitest 97/97 PASS；6 页构建 PASS；资源预算全部通过；Playwright 17 PASS / 3 个有意跳过。staging 的 `/`、`/credits`、`/privacy`、`/terms`、`/contact`、`/content-review`、`/robots.txt`、`/sitemap.xml` 和 `/favicon.svg` 均返回 HTTP 200。

**浏览器验收：**在公开 staging 完成 66 道计分题和 2 道最终检查，确认 `all-agree` 特殊结果；随后从结果页连续回退到第 66 题、修改答案并重新完成，得到 Determination 63% / Perseverance 62% 的普通结果、完整七维 spread、Shadow 和 Pairing。刷新后仍恢复 `68 / 68 RESPONSES` 与相同结果，浏览器 console 无 warning/error。390 x 844 视口截图未见重叠，页面宽度未超过视口。

**索引边界：**六个 HTML 页面继续输出 `noindex, nofollow`；canonical、robots 和 sitemap 仍指向正式域名，正式发布前不会解除 `noindex`。

**状态：**staging 验收 PASS；本地验证 PASS；Git 仍在 `main` / `8dd066c` 基线上且全部修改未提交。production 未部署，状态 UNKNOWN；真实物理手机验收未执行，状态 UNKNOWN。

**下一步：**使用真实手机打开 staging，完成首屏、68 题、结果页、返回修改、刷新恢复和分享/保存能力验收；通过后再处理真实联系人、OG 位图与正式域名发布准备。

## 2026-08-17 OG 社交分享图与 staging 验收

**目标：**为首页和支持页提供可被 Open Graph 与 Twitter/X 抓取的正式位图预览，同时保持独立原创、不复刻参考站 Logo 或专属美术。

**视觉资产：**使用内置图片生成能力制作黑底像素风原创画面，包含红色像素心、七色灵魂标记、薄荷绿边框和三个准确英文文本层；最终保存为 `public/og-undertale-soul-quiz.jpg`。成品为 1200 x 630、JPEG、78,802 bytes，人工检查文字完整、边界未裁切、无参考站 Logo、角色或水印。

**接入：**共享布局新增 `og:image`、类型、宽高、alt，以及 `twitter:card=summary_large_image`、`twitter:image` 和 alt。正式构建默认使用 `https://undertalesoulquiz.com/og-undertale-soul-quiz.jpg`；staging 项目通过 `PUBLIC_SOCIAL_IMAGE_BASE_URL` 指向自身稳定 HTTPS 地址，避免正式域名尚未上线时抓图失败。

**预算：**性能脚本把不会由普通页面加载的 OG 图单列为 `social` 预算，不放宽 JavaScript、CSS、HTML、运行时图片或运行时总量门槛。最终运行时总量 129.0 KiB / 136.0 KiB，social 77.0 KiB / 100.0 KiB，均 PASS。

**测试：**新增 Chromium 与移动 WebKit 元数据测试，逐页检查 `/`、`/credits`、`/privacy`、`/terms` 和 `/contact` 的 OG/Twitter 标签，并真实加载图片核对 naturalWidth 1200、naturalHeight 630。最终 `npm run validate` PASS：Astro/TypeScript 48 个文件无问题；Vitest 97/97；6 页构建；Playwright 19 PASS / 3 个有意跳过。

**staging：**最终部署 ID `dpl_soUg4eJgkRT8AywEGh7jcVFbu8KJ`，状态 Ready。稳定页面输出 staging 自身的绝对 `og:image`/`twitter:image` 地址；图片请求 HTTP 200、`image/jpeg`、TLS 校验成功、长度 78,802 bytes。浏览器打开最终公开文件后确认显示正确。

**状态：**OG 资产、本地接入、自动化和 staging 验收 PASS；正式域名 production 仍未部署并继续 `noindex, nofollow`。真实物理手机验收按用户决定记为 SKIPPED，不冒充 PASS。

**下一步：**配置一个经过确认的真实公开联系渠道，并替换 Contact 页的 prelaunch 占位内容。

## 2026-08-17 公开联系邮箱接入与 staging 验收

**目标：**用用户提供并确认公开使用的邮箱替换 Contact 页占位状态，让反馈、故障、无障碍和权利人请求在正式发布前有真实入口。

**修改：**新增单一联系人配置，公开邮箱为 `2296744453m@gmail.com`；Contact 页提供两个可点击的 `mailto:` 入口并删除“尚未配置”占位文案。Credits 和 Terms 增加权利人联系入口；Privacy 说明网站不会自动收集邮箱或提交表单，只有用户主动发信时才由双方邮件服务商处理地址、邮件头、正文和附件。Privacy 的范围说明同步从仅本地更新为当前源码与公开 staging。

**测试：**新增 Chromium 与移动 WebKit 联系渠道一致性测试，验证 Contact 两个入口、Credits/Privacy/Terms 各一个入口、全部 href 正确且旧占位文案消失。最终 `npm run validate` PASS：Astro/TypeScript 50 个文件无问题；Vitest 97/97；6 页构建；Playwright 21 PASS / 3 个有意跳过；运行时 129.5 KiB / 136 KiB、social 77.0 KiB / 100 KiB。

**staging：**部署 ID `dpl_ERx4KhLjf5RvSrLhvgnsLqLNZUJT`，状态 Ready。`/contact`、`/credits`、`/privacy`、`/terms` 均返回 HTTP 200，公开 HTML 中的邮箱和 `mailto:` 数量与预期一致。390 x 844 浏览器截图无横向溢出或重叠，console 无 warning/error。

**状态：**真实公开联系渠道、源码、自动化和 staging 验收 PASS；未发送测试邮件，因此“邮箱真实送达能力”仍未单独验证。production 仍未部署并继续 `noindex, nofollow`；Git 修改未提交。

**下一步：**执行正式发布前 GO/NO-GO 审计，明确尚未完成的发布阻塞项，再决定是否建立 production 项目和解除 `noindex`。

## 2026-08-17 Production GO/NO-GO 审计

**范围：**只读核对当前 DNS、正式 HTTPS、Vercel 项目/域名/环境、Git 远程基线、构建产物、发布文案、robots/sitemap/OG、公开联系渠道、测试与验收状态。本轮未建立 production、未修改 DNS、未解除 `noindex`、未提交或推送。

**结论：`NO-GO`。**公开 staging 状态 Ready 且此前完整流程、OG、联系页和自动化均 PASS，但正式发布链条尚未建立，不能用 staging 代替 production。

**发布阻塞项：**

1. **正式域名不可访问。**`undertalesoulquiz.com` 已委派到 Cloudflare nameserver，但根域名和 `www` 均无 A、AAAA 或 CNAME；HTTPS 请求在 12 秒内无法建立站点连接。
2. **没有 production Vercel 目标。**当前账号只有 `undertalesoulquiz-staging` 项目；Vercel 域名列表没有 `undertalesoulquiz.com`，本地 `.vercel` 也只链接 staging。直接运行 `vercel --prod` 仍会发布到 staging 项目。
3. **没有可复现的 Git 发布基线。**本地 HEAD、`origin/main` 和实时远程 `main` 同为 `8dd066c`，但远程只包含 7 个文档/规则文件；当前工作区有 6 个已跟踪文件修改和 59 个未跟踪实现文件。没有 `.github` CI 配置，无法满足计划中的 scoped commit -> push -> CI 顺序。
4. **当前构建明确禁止索引并仍是 prelaunch。**六个 HTML 页面全部硬编码 `noindex, nofollow`；首页/支持页仍显示 `PRELAUNCH` / `Prelaunch preview`，Terms 和 Privacy 也明确描述未验证的 prelaunch/staging 状态。这些文字不能原样进入正式发布。
5. **内部审阅工具会进入 production 构建。**`/content-review` 当前作为第六个静态页面生成并在 staging 公开可访问，包含 `LOCAL REVIEW`、Calibration v3 样本和浏览器审阅工具；它不属于冻结的正式产品路由，应在 production 构建中排除或明确隔离。
6. **发布验收仍有未关闭项。**用户本人没有逐项审阅完整 Production 内容；真实物理手机验收已由用户决定 SKIPPED；公开邮箱已接入但尚未发送测试邮件验证真实送达。前两项可以由用户明确接受残余风险，邮箱送达应在发布前验证。

**已通过项：**完整原创 dataset、Golden vectors、状态恢复、特殊结果、分享卡一致性、本地 Chromium/WebKit、Axe、性能预算、staging 全流程、OG 图片与元数据、支持页和公开联系入口均有当前 PASS 证据。`.env.local` 与 `.vercel/` 均被 Git 忽略，文件名级敏感配置扫描没有发现拟提交的密钥文件。

**SEO/发布状态：**canonical、robots.txt、sitemap 和本地默认 OG URL 均使用正式域名，结构方向正确；但域名和 production 不存在，因此当前只能记为“源码准备”，不能记为线上 PASS。Search Console 属于 production 发布后的步骤，不是本轮可验证事实。

**下一步：**先建立 Git/CI 发布基线：逐项审阅当前 65 个待纳入改动，补充运行 `npm run validate` 的 CI，形成 scoped commit 并推送。之后再单独关闭 production 构建开关、内部审阅路由、DNS/Vercel 绑定和邮箱送达阻塞。

## 2026-08-17 首页 SEO 标题与描述长度调整

**目标：**依据既定关键词边界和首页真实结果能力，把首页 SEO Title 控制在 55–60 个字符、Meta Description 控制在 150–160 个字符。

**修改：**首页 Title 更新为 `Undertale Soul Quiz: Find Your Primary & Secondary Virtues`，共 58 个字符；Description 更新为 `Take this Undertale Soul Test to find your primary and secondary virtues, see all seven soul traits, explore your shadow and pairing, and share your result.`，共 156 个字符。第一核心词 `undertale soul quiz` 保持在标题开头，第二核心词 `undertale soul test` 自然出现在描述中。

**验证：**Vitest 97/97 PASS；Astro 静态构建 5 页 PASS；资源预算 PASS；社交元数据 Playwright 在 Chromium desktop 与 WebKit mobile 共 2/2 PASS。使用 HTML 解析器核对 `dist/index.html`：title、`og:title` 和 `twitter:title` 解码后均为 58 个字符，description、`og:description` 和 `twitter:description` 均为 156 个字符且内容一致。`git diff --check` PASS。

**检查缺口：**`npm run check` 未通过，现有未跟踪文件 `playwright.config.ts:9` 使用 `process.env.CI`，但当前 TypeScript 配置没有 Node 类型声明，报 `ts(2591) Cannot find name 'process'`。该问题不由本轮 SEO 文案修改引起，本轮未扩大范围修改依赖或 TypeScript 配置。

**状态边界：**本轮只修改本地源码和迭代记录，不部署 staging 或 production，不改变当前索引与发布状态。

## 2026-08-17 首页正文深度与核心词自然优化

**目标：**在不堆砌关键词、不新增隐藏文本和不改变页面结构的前提下，为首页正文增加有实际用途的解释，让 AITDK 统计词数超过 800，并自然提高 `undertale soul quiz` 与 `undertale soul test` 的主题信号。

**修改：**在现有 How It Works、Seven Virtues 和 Results 三个分区补充测验题量与进度恢复、七维共同比较、精确分数与结果解释方式。未新增 H2/H3，未修改已经通过长度验收的 Title 和 Description，也未强制让单个 `undertale` 超过 `soul`。

**验证：**构建后首页正文按逐文本节点统计为 901 个英文词；`undertale soul quiz` 共 10 次、密度 1.11%，`undertale soul test` 共 2 次。Title 仍为 58 个字符，Description 仍为 156 个字符。新增 Playwright 回归保护正文不少于 800 词、核心短语密度 1.0%–1.5%、元数据长度和 OG/Twitter 一致性。最终 `npm run validate` 全套 PASS：Astro/TypeScript 49 个文件 0 问题；Vitest 97/97；5 页静态构建；资源预算 PASS；Playwright 22 PASS / 2 个有意跳过。桌面与 390px 移动端人工截图未见溢出或重叠。

**工具边界：**已在 Chrome 中刷新真实本地页面，但自动化接口不能读取 AITDK 扩展侧栏本身；901 词和 1.11% 来自构建页面正文的可复现 DOM 文本节点统计，不能冒充 AITDK 插件的最终显示值。

**状态边界：**本轮只修改本地首页正文和迭代记录，不部署 staging 或 production，不把本地密度工具结果冒充 Google 排名结果。

## 2026-08-17 前端 UI/UX 审评问题修正

**问题：**当前页面基础可用，但只读审评确认了五个高影响体验问题：结果页在移动端先显示长文、核心结果和分享入口过深；`START OVER` 会无确认清除 68 个回答；首屏未说明长测验和自动保存；移动端隐藏全部页内导航；两道 Final Check 期间进度条提前显示 100%。部分结果长文仅约 12px，也增加了移动阅读负担。

**本轮边界：**只修正上述 UI/UX 问题并补回归；不改题目、权重、结果内容、评分、持久化 schema、支持页业务内容、staging 或 production。

**修改：**

- 结果页先展示 Primary、Secondary、保存/分享/复制和编辑入口，再展示长摘要、七维 spread、Shadow、Pairing 与分享卡预览；移动端核心结果和操作进入首屏范围；
- `START OVER` 改为先打开确认对话框，明确会移除 68 个回答和结果；取消后结果与进度保持不变；
- 首屏 CTA 下增加 68 次回答、自动保存和可编辑说明；
- 移动端增加原生 `details` 菜单，保留 How It Works、7 Souls、Results 和 FAQ 页内入口；桌面导航同步增加 Results；
- Final Check 使用独立 1/2、2/2 进度语义和 50%/100% 视觉进度，不再复用 66/66 满进度；
- Shadow、Pairing、分享说明和次要结果文字提高到约 14px，并保持既有对比度、触控尺寸和响应式结构；
- Playwright 增加 Final Check 进度、移动菜单和重新测试取消/确认回归；同时用无额外依赖的类型写法修复 `playwright.config.ts` 中当前 `process` 全局类型错误。

**验证：**合并当前工作区同期首页正文更新后，最终 `npm run validate` PASS：Astro/TypeScript 49 个文件 0 错误；Vitest 11 个文件、97/97 PASS；5 个静态页面构建 PASS；Playwright 20 PASS / 2 个有意跳过，包含 Chromium 键盘完整流程、移动菜单、重新测试确认、Chromium/WebKit Axe A/AA 与 200% reflow。预算 PASS：JS 75.7 KiB / 80 KiB、CSS 23.9 KiB / 24 KiB、HTML 33.8 KiB / 36 KiB、运行时总量 134.1 KiB / 136 KiB。

**本地浏览器验收：**390 x 844 完成 68 次回答；Final Check 1/2 为 50%、2/2 为 100%；结果首屏可见 Primary、Secondary 和分享入口；移动菜单展开正常；`START OVER` 显示确认框且取消后保留结果；console 无 warning/error，未见横向溢出或内容重叠。

**状态边界：**本地源码、自动化和本地浏览器验收 PASS；Git 仍在 `main` / `8dd066c` 且工作区原有大批未提交/未跟踪实现文件继续保留。本轮未提交、推送或部署；staging 和 production 没有更新，不能把本地 PASS 外推为线上 PASS；真实物理手机验收仍未执行。

## 2026-08-17 How It Works 标题组居中与文案舒展

**目标：**修正超宽桌面下 How It Works 标题和新增长文案集中在左侧的问题，让分区视觉重心居中，同时避免一整段文字堆在单一窄列。

**修改：**将 kicker、H2 和说明文案组成独立居中标题组；说明文案拆成两个语义完整的段落，桌面双列横向展开，720px 以下自动恢复为单列。四步流程继续左对齐，保留信息层级和扫读效率。未改变正文词义、关键词次数、Title 或 Description。

**验证：**最终 `npm run validate` 全套 PASS：Astro/TypeScript 49 个文件 0 问题；Vitest 97/97；5 页静态构建；资源预算 PASS；Playwright 22 PASS / 2 个有意跳过。1920px 桌面截图确认标题组水平居中、两段说明以 462px 双列展开；390px 移动端自动变为 354px 单列，页面 `scrollWidth === innerWidth`，未见文字裁切、横向溢出或内容重叠。首次实现使 CSS 超出预算约 0.2 KiB，随后在不放宽预算的情况下改用自适应内联布局，最终 CSS 23.9 KiB / 24 KiB、总量 134.4 KiB / 136 KiB。

**状态边界：**仅修改本地页面结构、CSS 和迭代记录，不部署 staging 或 production。

## 2026-08-17 How It Works 结构回退

**问题：**用户复核后确认，前一版新增的标题组容器和双列说明虽然不是独立 Astro 组件，但视觉上形成了新的内容组件，偏离了“只让现有标题和文案居中”的要求。

**修改：**移除 `how-intro`、`how-summary` 两层布局容器和双列拆分，恢复 kicker、H2、单段说明和四步流程的扁平结构；只给原有 kicker、标题和单段说明设置居中，并将说明放宽到 `92ch`，不改变文案、关键词、Title 或 Description。

**验证：**最终 `npm run validate` 全套 PASS：Astro/TypeScript 49 个文件 0 问题；Vitest 97/97；5 页静态构建；资源预算 PASS；Playwright 22 PASS / 2 个有意跳过。1920px 与 390px 本地页面均确认只剩一个说明段落、没有 `how-intro` 或 `how-summary` 容器，且 `scrollWidth === clientWidth`，未见横向溢出或文字裁切。

**状态边界：**本轮仅修正本地首页结构和迭代记录，未提交、推送或部署；staging 与 production 状态未变化。

## 2026-08-17 删除 How It Works 组件

**问题：**上一轮只移除了组件内部的临时布局容器，仍保留完整的 `How It Works / THE FULL TEST` 内容区块，未满足用户要求。

**修改：**彻底删除 `#how-it-works` 区块、四步流程标记及其全部专用 CSS，并移除桌面和移动导航中的 `How It Works` 链接。为保留已确认的 SEO 正文深度，把题量、保存、排名和结果说明分散补入现有 Seven Virtues、Results、Sharing 和 FAQ 内容，不新建替代组件。

**验证：**最终 `npm run validate` 全套 PASS：Astro/TypeScript 49 个文件 0 问题；Vitest 97/97；5 页静态构建；资源预算 PASS；Playwright 22 PASS / 2 个有意跳过。本地 1920px 与 390px 页面均确认 `#how-it-works` 和对应导航链接数量为 0、无横向溢出。首页正文为 864 词，`undertale soul quiz` 出现 11 次、密度 1.27%，继续满足 800 词与 1.0%–1.5% 回归门槛。

**状态边界：**仅修改本地源码和迭代记录；未提交、推送或部署，staging 与 production 未更新。

## 2026-08-17 Seven Virtues 与 Results 网格补齐

**目标：**解决 Seven Virtues 桌面四列只有 7 张卡、Results 两列只有 5 张说明导致的空位，同时修正标题组靠左和长文集中问题，不恢复已删除的 How It Works 区块。

**事实核对：**`src/quiz/scoring.ts` 确认 Primary 和 Secondary 按 `percentageExact` 排序，`percentageDisplay` 才使用整数取整，因此新增 `Exact Score Ranking` 文案与当前评分实现一致。

**修改：**Seven Virtues 的 kicker、H2 和简短介绍改为居中；保留 7 张带 `data-virtue` 的真实灵魂卡，并增加 1 张使用七色标记的 `Complete Soul Spread` 综合说明卡，明确不创造第八种灵魂。Results 标题组改为居中，说明网格增加 `Exact Score Ranking`，形成 2 x 3。原本集中的题量、保存和免责声明内容分散到现有 FAQ；未新增独立内容区块。Playwright 新增结构与布局回归，检查 7 张真实灵魂卡、1 张综合卡、6 张结果卡、桌面 4 x 2 / 2 x 3、标题居中和无横向溢出。

**验证：**最终 `npm run validate` 全套 PASS：Astro/TypeScript 49 个文件 0 问题；Vitest 11 个文件、97/97 PASS；5 页静态构建 PASS；Playwright 23 PASS / 3 个有意跳过。预算 PASS：JS 75.7 KiB / 80 KiB、CSS 23.8 KiB / 24 KiB、HTML 33.1 KiB / 36 KiB、总量 133.3 KiB / 136 KiB。

**SEO 核对：**本地真实 DOM 正文为 841 词；`undertale soul quiz` 10 次、密度 1.19%；Title 58 字符、Description 156 字符，继续满足既定回归门槛。

**视觉验收：**1920px 桌面下 Seven Virtues 为两行各 4 张、8 张均为 176px 高；Results 为三行各 2 张。390px 移动端均恢复单列，标题和摘要居中，卡片内部左对齐；两种视口均无横向溢出、文字裁切或页面元素重叠。

**状态边界：**本轮仅修改本地首页、样式、浏览器测试和迭代记录；未提交、推送或部署，staging 与 production 未更新，真实物理手机未验收。

## 2026-08-17 完成结果返回首页流程修正

**问题：**完成 68 次回答后，完整结果会保存到 LocalStorage。用户刷新 `/` 或点击站名时，应用直接恢复 `complete` 状态，因此看起来始终停留在结果页；原界面只有会清空结果的 `START OVER`，没有“保留结果并返回首页”的路径。

**修改：**结果操作区新增 `BACK TO HOME`。该操作只切换回 Landing，不修改已完成答案；Landing 随后显示 `VIEW SAVED RESULT` 和 `START NEW QUIZ`。重新打开或刷新 `/` 时，已完成结果默认停留在 Landing，不再自动占据首页；用户可查看保存结果，或通过原确认对话框清空 68 次回答后开始新测验。进行中的未完成测验仍按原逻辑自动恢复。

**回归：**扩展完整键盘流程，覆盖完成结果 -> 返回首页 -> LocalStorage 仍存在 -> 刷新仍显示 Landing -> 查看保存结果 -> 编辑答案 -> 再次完成 -> 确认重新测试 -> LocalStorage 清空。390px 下三个结果导航按钮使用 2 + 1 网格，`BACK TO HOME` 独占第二行，实测宽度 358px 且无溢出。

**验证：**最终 `npm run validate` 全套 PASS：Astro/TypeScript 49 个文件 0 问题；Vitest 97/97；5 页静态构建；Playwright 23 PASS / 3 个有意跳过。预算 PASS：JS 76.3 KiB / 80 KiB、CSS 23.9 KiB / 24 KiB、HTML 33.3 KiB / 36 KiB、总量 134.1 KiB / 136 KiB。桌面 1440px 与移动 390px 真实本地浏览器均确认返回首页前后结果仍可查看，刷新后不会自动打开结果，且无横向溢出。

**SEO 核对：**新增按钮后正文节点统计为 847 词；`undertale soul quiz` 10 次、密度 1.18%；Title 58 字符、Description 156 字符，既定 SEO 回归继续 PASS。

**状态边界：**本轮仅修改本地交互、页面按钮、移动布局、浏览器测试和迭代记录；未提交、推送或部署，staging 与 production 未更新。

## 2026-08-17 Seven Virtues 标题真实居中修正

**问题：**`The 7 Undertale Human Souls and Their Virtues` 虽然应用了 `text-align: center`，但通用的 `.content-band h2` 规则以更高选择器优先级把左右外边距固定为 `0`，导致标题文字只在一个靠左的限宽盒子内居中，标题块本身没有位于页面中央。

**修改：**提高现有标题居中规则的选择器优先级，让标题限宽盒子的左右外边距正确使用 `auto`；没有新增组件、卡片或文案。浏览器回归不再只检查 `text-align`，同时比较标题、摘要与内容容器的实际几何中心。

**验证：**超宽 3800px 视口实测标题中心与内容容器中心均为 1900px，偏差为 0。最终 `npm run validate` 全套 PASS：Astro/TypeScript 49 个文件 0 问题；Vitest 97/97；5 页静态构建；资源预算 PASS（CSS 23.9 KiB / 24 KiB、总量 134.2 KiB / 136 KiB）；Playwright 23 PASS / 3 个有意跳过。

**状态边界：**仅修改本地 CSS、布局回归测试和迭代记录；未提交、推送或部署。

## 2026-08-17 Git 发布基线与正式构建准备

**问题：**此前远程 `main` 只有规则和调查文档，完整站点仍停留在本地未提交工作区；构建使用 `noindex, nofollow`，内部 `/content-review` 也会生成公开页面，仓库没有可复现的 CI，不能交给用户直接部署。

**检查：**在不覆盖现有改动的前提下逐项核对首页、测验交互、样式、支持页、数据、测试与发布配置。当前版本的 66+2 流程、结果返回首页、SEO 正文、桌面栅格和 200% reflow 改动彼此一致；文件名级敏感配置扫描未发现拟提交密钥，`.env*.local`、`.vercel`、构建产物和浏览器测试输出均保持 Git 忽略。

**修改：**五个公开页面切换为 `index, follow`，移除 prelaunch 展示语；内部内容审阅页移动到非路由目录，构建只生成 `/`、`/credits`、`/privacy`、`/terms`、`/contact`。新增正式发布回归，验证五页可访问且可索引、无 prelaunch 文案，并确认 `/content-review` 返回 404。新增 GitHub Actions，在 Node.js 24 上安装锁定依赖与 Chromium/WebKit 后运行完整 `npm run validate`。

**本地状态：**完整站点源码已形成可部署静态构建；没有执行 production 部署、DNS 修改或域名绑定。

**Git 状态：**当前完整实现将作为一个 scoped commit 推送到 `origin/main`；实际 commit、push 和远程 CI 结果以本轮交付记录为准。

**测试状态：**当前最终版本 `npm run validate` PASS：Astro/TypeScript 50 个文件 0 问题；Vitest 97/97；只生成 5 个冻结静态页面；资源预算全部 PASS（JS 76.3 KiB / 80 KiB、CSS 23.9 KiB / 24 KiB、HTML 33.3 KiB / 36 KiB、运行时总量 134.2 KiB / 136 KiB、社交图 77.0 KiB / 100 KiB）；Playwright 在 Chromium desktop 与 WebKit mobile 为 25 PASS / 3 个按项目条件跳过。构建产物逐页确认 `index, follow`，没有 prelaunch/noindex 文案，`dist/content-review/index.html` 不存在。桌面 1280 x 900 与移动 iPhone 15 全页视觉抽查未见横向溢出、文字裁切或不连贯重叠。

**staging 状态：**此前公开 staging 全流程、支持页、OG 与联系入口 PASS；本轮不重新部署 staging。

**production 状态：**PENDING。源码可部署不等于线上 PASS；用户部署后仍需核对正式 HTTPS、五个 URL、完整 68 次回答、刷新恢复、结果和分享图、robots.txt、sitemap.xml、canonical 与 OG。

**真人验收：**用户未逐项审阅完整内容；真实物理手机验收由用户明确选择 SKIPPED。两者都不冒充 PASS。

## 2026-08-17 Vercel Git 部署配置修正

**问题：**GitHub 仓库已连接到 `undertalesoulquiz-staging`，但 Vercel 项目仍使用 `Other` Framework Preset；因为仓库存在 `public/`，该配置会把 `public` 当作输出目录。部署列表因此仍停留在旧提交 `8dd066c`，不能证明完整 Astro 站点已发布。

**修改：**新增版本化的 `vercel.json`，明确使用 `astro`、`npm run build` 和 `dist` 输出目录，使 Git 自动部署与本地构建使用同一正式产物边界。

**状态边界：**本轮会推送配置提交并触发 Vercel production 部署；只有新提交构建成功且部署 URL 通过真实 HTTP 和页面检查，才能把这次 Vercel 部署记为 PASS。正式域名和 DNS 不在本轮自动修改范围内。

**执行结果：**配置提交 `8f8d2e6` 已推送到 `origin/main`，GitHub Actions `Validate` PASS。Vercel production 部署 `dpl_EEwUpqGNcdneQ34GSKqi8LqRMnoU` 状态 Ready，稳定别名为 `https://undertalesoulquiz-staging.vercel.app`。清除 production 环境中遗留的 `PUBLIC_SOCIAL_IMAGE_BASE_URL` staging 覆盖值并重新部署后，首页 `og:image`、canonical、robots 和 sitemap 均指向 `https://undertalesoulquiz.com`。

**线上验收：**稳定别名下 `/`、`/credits`、`/privacy`、`/terms`、`/contact`、`/robots.txt`、`/sitemap.xml` 均返回 200，`/content-review` 返回 404。Chromium desktop 与 iPhone 15 WebKit 各完成一次真实线上 68 次回答：七维结果完整、Canvas 非空、LocalStorage 完成状态存在、无横向溢出、无 console/page error。Vercel production target 记为 PASS；正式域名尚未绑定，因此 `https://undertalesoulquiz.com` 仍为 PENDING，不能把 Vercel 别名 PASS 冒充自定义域名 production PASS。

## 2026-08-17 首页 SEO 解释内容与结构化数据优化

**目标：**落实页面体检中值得处理的细节，同时避免为了扫描器分数机械堆词或恢复已删除的 `How It Works` 卡片区块。

**修改：**保留已经合格的 Title 与 H1；Meta Description 改为完整、自然地包含 `Undertale Soul Quiz`。在 Seven Virtues 与 Results 之间新增一个无卡片、无步骤装饰的语义化计分说明区，解释 66 道计分题、2 道不计分 final checks、七维共同计分、精确值排序与显示取整，以及非科学诊断边界。同步压缩和修正 Seven Virtues、Results、Sharing 与 FAQ 的重复说明，新增题量口径、恢复答案和接近分数三条 FAQ。首页只声明与真实页面类型一致的 `WebSite + WebPage` JSON-LD，不使用 `Article`、`Product`、`QAPage` 或不可保证富媒体资格的类型。

**SEO 核对：**本地真实 DOM 正文为 1001 词，完整词组 `undertale soul quiz` 出现 5 次，词频约 0.50%；相比上一版 10 次，明显降低重复，同时保留 Title、Description、H1、正文开头和 FAQ 的自然覆盖。未机械扩写到通用报告建议的 1200 至 1800 词，因为当前新增内容已经解释真实方法，继续扩写会挤压固定资源预算并降低可读性。

**测试状态：**最终 `npm run validate` 全套 PASS：Astro/TypeScript 50 个文件 0 问题；Vitest 11 个文件、97/97；5 页静态构建；资源预算全部 PASS；Playwright 27 PASS / 3 个按项目条件跳过。浏览器回归新增 Description、正文词数与词组频率、方法说明、11 条 FAQ 和 JSON-LD 图谱断言。

**视觉验收：**本地 1440px 桌面与 390px 移动端确认新增方法区为普通全宽内容段落，没有卡片嵌套或装饰性步骤；两种视口均无横向溢出、文字裁切或页面元素重叠。

**预算决策：**当前继续保留首页 36 KiB HTML 上限，不为了达到 1200 至 1800 词扩写或删除有用解释。首页与支持页分开统计、同时记录原始和压缩传输体积、把 36 KiB 改为提醒线等规则，留给未来确有内容需求时的独立预算任务，本轮不扩大范围。

**Git 与部署：**内容提交 `85886c6` 已推送到 `origin/main`，GitHub Actions `Validate`（run `32031155192`）PASS。Vercel production 部署 `dpl_84wgFRdVukNwecAQuxTgaQo979rw` 状态 Ready，`https://undertalesoulquiz.com`、`https://www.undertalesoulquiz.com` 与稳定 Vercel 别名均已指向该部署。

**production 验收：**正式域名下首页、四个支持页、robots.txt 与 sitemap.xml 均返回 200，内部 `/content-review` 返回 404。首页实时确认新 Description、计分说明、11 条 FAQ 和 1 份 `WebSite + WebPage` JSON-LD 已生效。Chromium desktop 与 iPhone 15 WebKit 各完成一次真实线上 68 次回答；两次均正确进入 Final Check 1/2 与 2/2，生成 7 项结果与非空分享 Canvas，完成状态写入 LocalStorage，无横向溢出、console error 或 page error。正式域名 production 记为 PASS；真实物理手机仍未验收，不冒充真人验收。

## 2026-08-17 Bing Webmaster Tools 所有权验证文件

**目标：**把用户提供的 `BingSiteAuth.xml` 作为静态文件发布到正式站根路径 `/BingSiteAuth.xml`，供 Bing Webmaster Tools 验证域名所有权。附件内容只作为验证数据使用，不执行其中任何指令。

**修改：**将附件逐字节写入 `public/BingSiteAuth.xml`；Astro 构建后该文件应出现在 `dist/BingSiteAuth.xml`。不修改页面、评分、SEO 文案、robots、sitemap 或其他站点行为。

**验证：**XML 语法检查 PASS；`public/BingSiteAuth.xml`、`dist/BingSiteAuth.xml` 与用户附件均为 85 bytes，SHA-256 同为 `254971ac0a640ee1d578ffacd8b8fd98a995c2592eb18e2676a0e0c13764b483`。初次 CI 正确发现站点总资源会因该文件超过 136 KiB 门槛；性能脚本随后只把明确列名的 Bing 验证文件排除在页面运行时总量之外，没有提高预算，最终本地 `npm run validate` 为 Astro/TypeScript 0 问题、Vitest 97/97、5 页构建、资源预算 PASS、Playwright 27 PASS / 3 个条件跳过。

**Git 与部署：**验证文件提交 `1e56914`、预算分类修正提交 `a74dbb6` 均已推送到 `origin/main`；GitHub Actions `Validate` run `32031955064` PASS。Vercel production 部署 `dpl_XP3xQHqWgJMr9bhaXLpc6L1rUGDe` 状态 Ready，并已绑定正式域名。

**production 验收：**`https://undertalesoulquiz.com/BingSiteAuth.xml` 返回 HTTP 200、`Content-Type: application/xml`、长度 85 bytes，下载内容与用户附件逐字节一致；正式站首页仍返回 HTTP 200。Bing Webmaster Tools 后台是否已经接受验证尚未由本轮操作直接确认，不能把文件可访问冒充后台验证 PASS。

## 2026-08-17 计分说明区居中与留白修正

**问题：**新增加的计分说明区复用了 FAQ 的限宽容器，却没有延续 Seven Virtues 已确认的标题组居中规则。通用 H2 和正文样式因此让标题、kicker 与三段文案贴在容器左侧；段落间距也与普通单段摘要相同，在宽屏上显得拥挤。

**修改：**计分说明区直接复用现有的居中标题容器和摘要宽度；kicker、H2 与三段正文统一按同一视觉中心对齐，标题限宽盒子使用自动左右外边距，正文共享舒展但受控的阅读宽度。没有新增布局组件，也没有修改文案、题量、评分、SEO 元数据或其他区块。

**回归：**扩展现有桌面布局测试，同时校验计分说明区 kicker、H2 和所有正文的 `text-align` 以及实际几何中心，防止以后新增或调整通用标题样式时再次出现“文字居中但盒子仍靠左”的假居中。

**验证：**最终 `npm run validate` 全套 PASS：Astro/TypeScript 50 个文件 0 问题；Vitest 97/97；5 页静态构建；资源预算 PASS（CSS 23.9 KiB / 24 KiB、HTML 35.1 KiB / 36 KiB、总量 136.0 KiB / 136 KiB）；Playwright 27 PASS / 3 个按项目条件跳过。1920 x 1080 与 390 x 844 本地截图确认标题和三段正文共享同一水平中心，段落之间保留清晰留白，没有横向溢出、文字裁切或不连贯重叠。

**Git 与部署：**修正提交 `c39d234` 已推送到 `origin/main`；GitHub Actions `Validate` run `32034934077` PASS。Vercel production 部署 `dpl_HYcysN6AqzjpkuzBSsJcfkw2Pvj1` 状态 Ready，正式域名、`www`、稳定 Vercel 别名和 Git main 别名均已指向该部署。

**production 验收：**`https://undertalesoulquiz.com/` 返回 HTTP 200，实时 HTML 已包含新的居中容器结构。隔离 Chromium 在 1920px 桌面和 390 x 844 移动视口分别检查 kicker、H2 与三段正文，五个元素的文本对齐均为 center，几何中心偏差均为 0；两种视口均无横向溢出、console error 或 warning。正式域名 production 记为 PASS；真实物理手机仍未验收，不冒充真人验收。

## 2026-08-23 Agent readiness 协议修复与 production 验收

**问题：**Ora / Is Agentic 证据显示 agent-friendly 404 只有部分分、`Accept: text/markdown` 内容协商失败、品牌名搜索未出现正式域名、缺少明确的 when-to-use 指引，且首页 JSON-LD 没有 Organization。

**事实核对：**修改前正式域名五个页面都返回 HTML 且没有 `Vary: Accept`；不存在路径已经是 HTTP 404，但使用 Vercel 的通用短文本；`/llms.txt` 返回 404；首页只有 WebSite + WebPage。实时搜索再次确认 exact-brand 和 `site:` 结果仍未出现正式域名。

**修改：**新增 Vercel Routing Middleware，严格解析 `Accept` 的 q-value、specificity、显式 `q=0` 与客户端顺序；五个正式页面在同一 canonical URL 上返回 UTF-8 Markdown，HTML 保持原样，不可满足时返回 406，并统一输出 `Vary: Accept, Accept-Encoding`。新增带首页、`llms.txt` 和 sitemap 恢复入口的自定义 404；Markdown 请求的缺失路径同样返回带恢复地图的 HTTP 404。新增符合 llmstxt.org 顺序的根目录 `llms.txt`，明确 when-to-use、when-not-to-use、调用方式和绝对链接。首页 JSON-LD 增加 Organization、统一品牌名/域名别名和带真实公开邮箱的 ContactPoint。没有编造 PostalAddress 或电话。

**平台修正：**预览验证发现 Vercel Routing Middleware 直接响应 HEAD 时会去掉 `Content-Type`。`vercel.json` 因此为五个公开页面的精确 `Accept: text/markdown` HEAD 请求补回 `text/markdown; charset=utf-8`，而 q-value 组合仍由 middleware 选择，避免把 HTML 优先请求误标为 Markdown。

**测试：**最终 `npm run validate` PASS：Astro 55 文件 0 问题；middleware NodeNext TypeScript 检查 PASS；Vitest 13 文件、116/116 PASS；6 页构建 PASS；Playwright 31 PASS / 3 个条件跳过。预算 PASS：JS 76.3 KiB / 80 KiB、CSS 23.9 KiB / 24 KiB、HTML 35.3 KiB / 36 KiB、agent 6.4 KiB / 12 KiB、运行时总量 135.7 KiB / 136 KiB。GitHub Actions Validate run `32597166241` PASS。

**视觉验收：**自定义 404 在 1280 x 900 和 390 x 844 下截图检查通过；两种视口 `scrollWidth === innerWidth`，三条恢复链接可见，没有裁切、重叠或横向溢出。

**Git 与部署：**实现提交 `41d2f5c` 已推送到 `origin/main`。Vercel Git production 部署 `dpl_yZia8yeyjTYZ4ofxjZmPhKBk5v2E` Ready，正式域名、`www`、稳定别名和 Git main 别名均指向该部署。

**production 协议验收：**`/`、`/credits`、`/privacy`、`/terms`、`/contact` 的 HTML 与 Markdown 请求均为 200；Markdown 为 `text/markdown; charset=utf-8` 且 `Vary` 同时含 Accept 和 Accept-Encoding。Markdown 优先、HTML 优先和 Markdown `q=0` 三组选择正确；`application/pdf` 返回 406。普通与 Markdown 缺失路径均返回 404；`llms.txt`、robots、sitemap、Bing 验证文件和 OG 图片均返回 200 且媒体类型正确。项目推荐的 HEAD 检查和 404 status-only curl 均通过。

**剩余边界：**品牌搜索属于索引和站外信号，刚发布的结构化信号不能让搜索结果即时变化；当前仍为 FAIL，不冒充修复完成。Organization 已从“完全缺失”修到真实 name/url/contactPoint，但完整 PostalAddress/telephone 仍 UNKNOWN，需要用户提供可公开事实。未创建虚假 NAP、新闻稿、目录页或外链。

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
