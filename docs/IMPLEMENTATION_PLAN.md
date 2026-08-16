# Implementation Plan

状态：可执行计划已完成；Phase 1 受内容数据路线阻塞。

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

### Phase 0：内容数据门槛

交付：

- 决定授权一致性或独立原创路线；
- 统一 66/68 题口径；
- 获得 schema 可校验的题目、权重和特殊规则；
- 确认 rounding、tie-break 和 special priority；
- 建立 Golden reference vectors。

退出条件：`docs/GOLDEN_TEST_PLAN.md` 中的缺口全部关闭。

### Phase 1：工程骨架和评分内核

交付：

- 初始化 Git、Astro、TypeScript、Vitest 和 Playwright；
- 建立 dataset schema 和 validator；
- 实现纯评分函数、排序和特殊规则引擎；
- 实现 reducer/state machine；
- 写入 Golden Tests。

验证：

- typecheck；
- dataset validation；
- 全部评分与状态单元测试；
- 人为改错 payout 后 Golden Test 必须失败。

### Phase 2：Quiz 与本地恢复

交付：

- Landing 上的 Start；
- 五档回答、进度、Back、Next 或确认后的最终交互；
- 返回修改；
- schema-versioned LocalStorage；
- Refresh Recovery、Reset、Retake；
- 键盘与触屏操作。

验证：

- 正常、错误、损坏存储和版本变化路径；
- Chromium 与 WebKit；
- 手机窄屏无溢出。

### Phase 3：结果与分享

交付：

- Primary、Secondary、Full Spread、Shadow、Pairing；
- 已确认特殊结果；
- 一个共享的 ResultViewModel；
- Canvas 高清 PNG；
- Save Image、Web Share、Copy Result 和 fallback。

验证：

- 页面和 PNG 数值逐项一致；
- Canvas 像素非空、无裁字；
- 分享取消或不支持时不丢结果。

### Phase 4：SEO 与支持页面

交付：

- `/` 的静态 Hero、How It Works、7 Souls、Result Explanation、Sharing、FAQ；
- `/credits`、`/privacy`、`/terms`、`/contact`；
- title、description、canonical、OG、robots 和 sitemap；
- 非官方、娱乐用途与 attribution 声明。

关键词边界：

- H1：`Undertale Soul Quiz`；
- `undertale soul test` 作为第二核心词自然出现在副标题或正文；
- Extractor/Trait 变体自然解释，不机械重复；
- 不建立同意图重复 URL；
- 不把 Jaden 放进品牌名或 H1。

### Phase 5：视觉、性能和无障碍

交付：

- 自有像素/复古视觉；
- Soul 颜色系统和清晰 focus；
- reduced motion；
- 稳定尺寸，避免答题时布局跳动；
- 图片、字体和脚本预算。

验证：

- 桌面和移动截图；
- 键盘全流程；
- 200% zoom；
- Canvas 和正文不重叠；
- Core Web Vitals 实验室检查。

### Phase 6：发布与验收

交付顺序：

1. scoped commit；
2. push；
3. CI 全通过；
4. staging 浏览器验收；
5. production 发布；
6. production 页面、流程、分享图、robots 和 sitemap 验收；
7. Search Console 提交与后续数据观察。

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
| 66/68 题冲突 | Phase 0 阻塞，不猜 |
| 题库和长文权限 | 授权数据或独立原创二选一 |
| 原站继续变化 | datasetVersion + 来源日期 + Golden vectors |
| 评分看似正确但边界错误 | 纯函数、参考向量、变异检查 |
| 特殊规则散落 | 单独规则引擎和优先级 |
| 分享卡与页面不一致 | 共享 ResultViewModel |
| LocalStorage 损坏 | schema 校验和安全恢复 |
| 关键词扩张造成蚕食 | MVP 只用 `/` 承接同意图词 |

## 6. 当前可执行的下一张开发卡

只有 Phase 0 数据门槛关闭后，才执行：

> 初始化 Astro + TypeScript 工程，先实现 dataset validator、纯评分引擎和 Golden Tests；在这些测试通过前不做完整 UI。

这能让最重要的“评分准确”先成为可验证事实，而不是等页面做漂亮以后再补规则。
