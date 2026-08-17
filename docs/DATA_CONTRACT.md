# Quiz Data Contract

状态：结构、评分和主要特殊规则已确认；独立原创 `original-production-v1` 已包含完整 66+2、七套结果/Shadow、42 组有方向 Pairing 和四类特殊结果，并已通过 production validator、独立 Agent 复验与正式 Golden vectors。下面不包含原站题目或程序代码。

## 1. 设计原则

- 内容数据、评分逻辑、浏览器状态和页面渲染分离。
- 数据文件必须可做 schema 校验，不能靠运行时猜缺失字段。
- 所有外部来源字段必须记录 provenance，意思是“来源和版本证据”。
- 页面结果与分享卡从同一结果对象渲染。
- 特殊规则集中管理并有显式优先级。

## 2. 核心类型

```ts
type VirtueCode = 'DET' | 'BRV' | 'JUS' | 'KND' | 'PAT' | 'INT' | 'PER';
type AnswerValue = 0 | 1 | 2 | 3 | 4;

type WeightVector = Record<VirtueCode, number>;

interface Provenance {
  sourceKind: 'authorized-export' | 'original-authored' | 'manual-reference' | 'synthetic-test';
  sourceId: string;
  sourceVersion: string;
  obtainedAt: string;
  permissionStatus: 'confirmed' | 'unknown' | 'not-required-original' | 'not-for-production';
}

interface ScoredQuestion {
  kind: 'scored';
  id: string;
  order: number;
  prompt: string;
  weights: WeightVector;
  provenance: Provenance;
}

interface UnscoredQuestion {
  kind: 'unscored';
  id: string;
  order: number;
  prompt: string;
  options: Array<{ id: string; label: string }>;
  followUps?: Array<{ when: 'yes' | 'no' | 'always'; text: string }>;
  provenance: Provenance;
}

type QuizQuestion = ScoredQuestion | UnscoredQuestion;

type CompletionSpecialRule =
  | { id: 'all-disagree'; pattern: 'all'; answer: 0 }
  | { id: 'all-neutral'; pattern: 'all'; answer: 2 }
  | { id: 'all-agree'; pattern: 'all'; answer: 4 }
  | { id: 'all-switch'; pattern: 'halves'; first: 0; second: 4 };

interface RoomRule {
  id: 'room-between';
  boundary: readonly [57, 58];
  probabilityPerCrossing: 0.02;
  reward: 'egg';
}

interface QuizDataset {
  schemaVersion: 1;
  datasetVersion: string;
  questions: QuizQuestion[];
  completionSpecialRules: CompletionSpecialRule[];
  roomRule: RoomRule;
  answerPayout: readonly [-1.2, -0.72, 0, 0.6, 1];
  curveExponent: 0.6;
  normalisationMax: Record<VirtueCode, number>;
}
```

正式数据要求 `questions.length === 68`，并由 `questions` 唯一派生出 66 道 `scored` 和 2 道 `unscored`，避免维护三份可能不一致的数组。两道 `unscored` 问题进入流程和持久化，但不得进入评分或完成型特殊结果判断。

运行时校验分 `test` 和 `production` 模式。`synthetic-test` 只允许用于测试；Production 必须是已确认授权或本站原创内容。

### 2.1 原创内容校准样本

`src/data/original-content-calibration.ts` 是与运行中 Quiz 隔离的 Calibration v3，包含 14 道原创题、7 个结果/Shadow/易混淆维度样本、3 个 Pairing 和 1 个特殊结果。题目按语义采用 7 道单维和 7 道双维，不再为满足题型数量强加三维或正负混合权重；七维绝对权重和均为 8。它使用 `original-authored` / `not-required-original` provenance，但同时明确标记：

```ts
status: 'calibration-only'
productionEligible: false
contentRoute: 'experience-compatible-independent-original'
```

这份样本用于校准维度边界、题目语气和权重方法，不满足 66+2 题量，也不得被 Production validator 或当前页面直接加载。结构测试通过不等于内容真人验收通过。

### 2.2 原创 Production 数据

`src/data/original-production-dataset.ts` 是当前首页唯一加载的数据集，版本为 `original-production-v1`。它包含 66 道计分题和 2 道不计分问题，全部使用 `original-authored` / `not-required-original` provenance。题目显示顺序使用固定、不规则的 direct/reverse 混排，最长同向连续为 2，避免成块或机械交替泄露计分方向。

`src/data/original-result-content.ts` 包含七套 Primary/Shadow、42 个逐项独立编写的有方向 Pairing 和四类特殊结果。Pairing 正文为 65-95 词；反向组合使用不同的行为起点、修正作用和张力。

## 3. 评分纯函数

候选接口：

```ts
interface ScoreInput {
  dataset: QuizDataset;
  answers: Record<string, AnswerValue>;
}

interface VirtueScore {
  code: VirtueCode;
  raw: number;
  normalized: number;
  curved: number;
  percentageExact: number;
  percentageDisplay: number;
}

interface StandardResult {
  kind: 'standard';
  primary: VirtueCode;
  secondary: VirtueCode;
  spread: VirtueScore[];
}

interface SpecialResult {
  kind: 'special';
  specialId: string;
  spread?: VirtueScore[];
}
```

已确认计算流程：

1. 只遍历 66 道 `scored` 问题；
2. `lean = answer - 2`；
3. 单题贡献为 `abs(weight) * answerPayout[lean * (weight < 0 ? -1 : 1) + 2]`；
4. 按 Virtue 累加 raw score；
5. 除以该 Virtue 的 `normalisationMax`；
6. Clamp 到 `[-1, 1]`；
7. 应用 `sign(x) * abs(x) ** 0.6`；
8. 映射到 `[0, 100]`；
9. `percentageDisplay = Number(percentageExact.toFixed(0))`；
10. 按精确百分比降序确定 Primary 和 Secondary；完全并列时按 `DET, BRV, JUS, KND, PAT, INT, PER` 顺序。

## 4. 归一化分母

原站对每个维度累加 66 题权重的绝对值：

```ts
normalisationMax[virtue] = sum(abs(question.weights[virtue] ?? 0))
```

固定参考值：

```ts
{
  DET: 33,
  BRV: 45,
  JUS: 35.5,
  KND: 50,
  PAT: 35,
  INT: 57,
  PER: 37,
}
```

## 5. 持久化契约

```ts
interface PersistedQuizStateV1 {
  schemaVersion: 1;
  datasetVersion: string;
  phase: 'in-progress' | 'complete';
  currentQuestionId: string | null;
  answers: Record<string, AnswerValue>;
  specialState: { hasEgg: boolean };
  updatedAt: string;
}
```

规则：

- key 使用项目命名空间，例如 `undertale-soul-quiz:progress:v1`；
- 读取时校验 schema 和 dataset version；
- 损坏、过期或未知版本数据必须安全丢弃并向用户说明，不能静默算错；
- 每次答案变更后写入；返回修改答案时覆盖旧值；
- Reset 和 Retake 清除进度，但不要清除站点无关的 LocalStorage；
- 存储失败时 Quiz 仍可继续，同时明确提示本次无法恢复；
- 不写入 Cookie、数据库或网络接口。

当前实现位于 `src/quiz/persistence.ts`。它通过最小 `StorageLike` 接口接收浏览器 `localStorage` 或测试替身，不在模块加载时直接读取浏览器全局。读取结果会明确区分 `empty`、`restored`、`discarded` 和 `unavailable`，供 UI 向用户说明恢复或存储失败。

## 6. 状态机

```txt
landing
  -> quiz.inProgress
  -> quiz.complete
  -> result.standard | result.special
  -> retake -> landing

quiz.inProgress
  -> back
  -> answer/update
  -> refresh/restore
  -> reset -> landing
```

UI 只能通过状态机动作改变答案和进度，不允许组件直接修改分数缓存。

当前 reducer 位于 `src/quiz/state-machine.ts`，已实现 `start`、`answer`、`back`、`grant-egg`、`reset` 和 `retake`。答案动作携带 `questionId`，旧页面事件若与当前题不一致会被拒绝，避免快速点击或延迟事件写错题目。

## 7. 特殊规则优先级

已确认的结果判定顺序：

```txt
66 道计分题全部完成
-> all-switch
-> all-disagree / all-neutral / all-agree
-> standard scoring
```

Room/Egg 是答题导航状态，不绕过最终结果；Floweryness 是普通结果的附加行；黑屏清档和 Ball Game 是全局键盘彩蛋。它们必须独立建模，不能和 completion special 混成一个含糊的规则数组。

## 8. ResultViewModel

当前实现位于 `src/quiz/result-view-model.ts`。页面和后续分享卡共同消费一个判别联合类型；构建函数内部唯一调用 `resolveQuizResult()`，UI 和 Canvas 不再分别计算分数：

```ts
interface ResultVirtueView {
  code: VirtueCode;
  label: string;
  color: string;
  percentage: number;
}

interface ResultViewModelBase {
  datasetVersion: string;
  color: string;
  eyebrow: string;
  heading: string;
  summary: string;
  spreadHeading: string;
  spread: ResultVirtueView[];
  shareText: string;
  siteUrl: string;
  isDevelopmentPreview: boolean;
}

type ResultViewModel =
  | (ResultViewModelBase & {
      kind: 'standard';
      primary: ResultVirtueView;
      secondary: ResultVirtueView;
      shadow: { heading: string; body: string; status: 'content-pending' | 'production-original' };
      pairing: { heading: string; body: string; status: 'content-pending' | 'production-original' };
    })
  | (ResultViewModelBase & {
      kind: 'special';
      specialId: CompletionSpecialId;
      specialLabel: string;
    });
```

合成测试 dataset 继续生成明确的 Development 标记和 `content-pending` 占位。当前 `original-production-v1` 返回 `production-original` Shadow/Pairing 与原创特殊结果；`all-switch` 使用 PAT 50 / DET 50 展示，其余三类 Null 型特殊结果不混入普通七维字段。

当前 Canvas 实现位于 `src/quiz/share-card.ts`，固定输出 920 x 1150 PNG，并只接收 `ResultViewModel`。保存、Web Share 和 Copy fallback 位于 `src/quiz/share-actions.ts`；原生分享取消只返回 `cancelled`，不得清除或改变结果。

禁止 Canvas 再计算一次分数。Canvas 只负责把 `ResultViewModel` 画出来。

## 9. 数据验收

正式数据文件必须同时通过：

- 题目 ID 唯一、order 连续；
- 题量与已确认口径一致；
- 每道计分题的七维权重补全后均为有限数值；
- 恰好 66 道计分题和 2 道不计分特殊问题；
- answer payout 恰好五档；
- 四类 completion special 的 ID 和模式唯一；
- Room 边界、概率和 RNG 注入接口通过校验；
- provenance 字段完整；
- dataset version 固定；
- Golden reference vectors 全部通过。
