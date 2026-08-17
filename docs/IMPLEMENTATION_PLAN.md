# Implementation Plan

状态：技术调查、Phase 1a 至 Phase 5a 和完整原创内容生产已完成。`original-production-v1` 已接入首页并通过三项独立 Agent 复验、正式 Golden vectors、本地浏览器全流程和公开 staging 验收。正式构建已切换为可索引元数据、只生成五个冻结公开路由，并加入 GitHub CI；production 仍待用户部署后单独验收。

## 1. 技术选择

### 建议栈

- Astro：生成 `/` 和四个支持页的静态 HTML；
- TypeScript：实现 Quiz 状态机、评分、持久化和 Canvas；
- Vitest：测试纯逻辑与数据契约；
- Playwright：测试构建后的真实浏览器流程；
- CSS：项目自己的像素/复古视觉系统，不复制原站品牌包装。

### 为什么不用服务端

- 答案只在浏览器处理；
- 不需要账号、数据库、API 或跨设备同步；
- SEO 正文可以在构建时直接输出；
- 静态站更容易部署、缓存和保持低成本。

### 为什么不用 React

Quiz 是单一路径状态机，原生 TypeScript 足够。少一个 UI runtime 可以减少 bundle、依赖和 hydration 风险。Astro 负责页面结构，浏览器脚本只接管 Quiz 区域。

## 2. 目标目录

```txt
src/
  components/
  data/
    quiz.dataset.json
    quiz.dataset.schema.json
  layouts/
  pages/
    index.astro
    credits.astro
    privacy.astro
    terms.astro
    contact.astro
  quiz/
    types.ts
    dataset.ts
    scoring.ts
    special-rules.ts
    state-machine.ts
    persistence.ts
    result-view-model.ts
    share-card.ts
  styles/
public/
  robots.txt
tests/
  fixtures/
  unit/
  e2e/
```

这是计划结构，不代表这些文件已经实现。

## 3. 分阶段执行

### Phase 0：参考规则与内容路线

已完成：

- 统一题量口径：66 道计分题 + 2 道不计分特殊问题 = 68 次回答；
- 确认 payout、负权重方向、MAXP、curve、显示舍入和当前并列行为；
- 确认四类完成型特殊结果；
- 确认 Room/Egg、Flowery、黑屏清档和 Ball Game 彩蛋；
- 取得一条线上普通评分参考向量；
- 记录线上/镜像文件哈希。

路线决定已完成：

- 选择体验兼容的独立原创路线；
- 建立七维编辑定义、题目/权重规则和 Calibration v3；
- 产出 14 道多维题、7 个结果/Shadow/易混淆维度解释、3 个 Pairing 和 1 个特殊结果样本，并通过结构测试、三项独立 Agent 复验和用户委托的 Codex 代验收。

已完成：

- 扩写并复核完整原创 66+2、七套结果/Shadow、42 组 Pairing 和四类特殊结果；
- 形成并接入 `original-production-v1`；
- 建立 7 个普通固定向量、四类特殊结果正反例、unscored 隔离和权重变异检测。

内容门槛退出条件：权限路线明确，正式 dataset 通过 schema 和 Golden Tests。这个门槛不阻止先创建与内容无关的工程骨架和纯函数接口。

### Phase 1：工程骨架和评分内核

Phase 1a 已完成：

- 初始化 Astro、TypeScript 和 Vitest；
- 建立 dataset schema 和 validator；
- 实现纯评分函数、排序和特殊规则引擎；
- 用明确标注、禁止用于 Production 的合成 fixture 建立 25 条单元测试；
- 人为改错 payout 后，评分测试按预期失败；恢复正确值后的 typecheck、25 条测试和静态构建全部通过。

Phase 1b 已完成：

- 实现 reducer/state machine；
- 实现 schema-versioned LocalStorage 与安全恢复；
- 覆盖开始、顺序前进、返回修改、完成后返回、Reset、Retake、损坏数据、未知 schema、版本不匹配、存储不可用和只清理项目 key；
- 对导航步长做变异检查，22 条相关测试中有 11 条按预期失败；恢复后全套 47/47 PASS。

正式原创 dataset 和本站 Golden vectors 已接入；真实手机与线上发布验收仍待后续阶段完成。

验证：

- typecheck；
- dataset validation；
- 全部评分与状态单元测试；
- 人为改错 payout 后 Golden Test 必须失败。

### Phase 2：Quiz 与本地恢复

Phase 2a 已完成：

- Landing 上的 Start；
- 五档自动前进、66 题可见进度和 2 道 Final Check；
- 返回修改；
- schema-versioned LocalStorage；
- Refresh Recovery、Reset、Retake；
- 数字键、键盘焦点和触屏尺寸；
- 合成数据标识与 `noindex, nofollow`，防止开发内容被误当 Production。

已验证：

- Chromium 完整 68 次回答、Back、刷新恢复、Reset、损坏存储清理和完成状态；
- WebKit 移动环境 Start、Answer、刷新恢复与 0 console errors；
- 1440px、390px 和 320px 视口；320px 下页面 `scrollWidth === innerWidth`；
- 静态构建预览执行 Start、Answer、刷新恢复，0 console errors。

### Phase 3：结果与分享

Phase 3a 已完成：

- Primary、Secondary、Full Spread、Shadow、Pairing；
- 已确认特殊结果；
- 一个共享的 ResultViewModel；
- 普通结果页与四类完成型特殊结果页；
- Shadow 和 Pairing 在权限路线关闭前只显示 `content-pending`，不使用原站长文。

Phase 3b 已完成：

- Canvas 高清 PNG；
- Save Image、Web Share、Copy Result 和 fallback；
- 普通与特殊结果卡都只消费 Phase 3a 的 `ResultViewModel`；
- 分享取消和分享失败不丢失当前结果。

验证：

- 页面和 PNG 数值逐项一致；
- Canvas 像素非空、无裁字；
- 分享取消或不支持时不丢结果。

### Phase 4：SEO 与支持页面

Phase 4a 已完成：

- `/` 的静态 Hero、How It Works、7 Souls、Result Explanation、Sharing、FAQ；
- 单一 H1、冻结 H2/H3 主题、非官方声明与原站出处链接；
- `/credits`、`/privacy`、`/terms`、`/contact`；
- 共享 SiteLayout、独立 title/description/canonical、基础 OG/Twitter 元数据；
- `robots.txt` 与包含 5 个冻结 URL 的 `sitemap.xml`；
- SEO 核心正文直接存在于构建后的 HTML，不依赖 JavaScript 生成；
- 正式构建的五个公开页面使用 `index, follow`，内部 `/content-review` 不进入静态构建。

源码发布门槛已完成：可索引 robots、完整社交预览图、正式 canonical 和五个冻结 URL 均有构建后回归。线上 canonical、robots、分享预览与真实流程仍须在用户部署 production 后重新验收。

关键词边界：

- H1：`Undertale Soul Quiz`；
- `undertale soul test` 作为第二核心词自然出现在副标题或正文；
- Extractor/Trait 变体自然解释，不机械重复；
- 不建立同意图重复 URL；
- 不把 Jaden 放进品牌名或 H1。

### Phase 5：视觉、性能和无障碍

Phase 5a 已完成：

- 自有像素/复古视觉；
- Soul 颜色系统和清晰 focus；
- reduced motion；
- 稳定尺寸，避免答题时布局跳动；
- 图片、字体和脚本预算；
- Chromium desktop 与 WebKit mobile 的仓库内 Playwright 回归；
- 五页 Axe WCAG A/AA 扫描；
- 键盘完整流程、200% 有效视口、Canvas/正文重叠和本地性能门槛。

已验证：

- 桌面和移动截图；
- 键盘全流程；
- 200% zoom；
- Canvas 和正文不重叠；
- 本地 Navigation Timing、传输量和 CLS 门槛；
- 构建运行时资源总量 134.2 KiB，低于当前 136 KiB 门槛；社交分享图单独为 77.0 KiB，低于 100 KiB 门槛。

Production Core Web Vitals 仍需在真实部署后用 field/lab 数据验收，不能由本地预览代替。

### Phase 6：发布与验收

交付顺序：

1. scoped commit；
2. push；
3. GitHub CI 全通过；
4. 用户部署 production 并绑定域名；
5. production 页面、流程、分享图、robots 和 sitemap 验收；
6. Search Console 提交与后续数据观察。

公开 staging 浏览器验收已完成；它保留为部署前证据，不代替 production 验收。

HTTP 200、构建成功或 staging 通过都不能单独冒充 Production PASS。

## 4. 第一版分析事件

事件只记录产品动作，不上传题目答案：

- `quiz_start`：首次提交第一题答案；
- `quiz_progress`：按固定里程碑，例如 10/25/50/75%；
- `quiz_complete`；
- `result_render_success` / `result_render_failure`；
- `share_image_save`；
- `share_native_attempt` / `share_native_success`；
- `copy_result`；
- `retake`。

同一恢复会话不能重复计算 Valid Quiz Start。Analytics 是否启用必须与 Privacy 页面一致。

## 5. 主要风险

| 风险 | 处理 |
|---|---|
| 题库和长文权限 | 已选择独立原创；Calibration 与完整 Production dataset 分离 |
| 原站继续变化 | datasetVersion + 来源日期 + Golden vectors |
| 评分看似正确但边界错误 | 纯函数、参考向量、变异检查 |
| 特殊规则散落 | 单独规则引擎和优先级 |
| 分享卡与页面不一致 | 共享 ResultViewModel |
| LocalStorage 损坏 | schema 校验和安全恢复 |
| 关键词扩张造成蚕食 | MVP 只用 `/` 承接同意图词 |

## 6. 当前可执行的下一张开发卡

当前进入发布前真人与线上准备：

> 用户逐项抽查完整原创内容并在真实手机完成全流程；随后配置真实联系人、OG 位图和部署目标，再单独执行 staging 验收。

当前首页已经使用完整原创数据，但继续保持 `noindex, nofollow` 和未部署状态。三项 Agent 复验与本地自动化 PASS 不能代替用户本人、真实手机、staging 或 production 验收。
