# Quiz Data Contract

状态：设计完成，等待真实内容数据验证。下面是本站独立实现的数据边界，不包含原站题目或程序代码。

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
  sourceKind: 'authorized-export' | 'original-authored' | 'manual-reference';
  sourceId: string;
  sourceVersion: string;
  obtainedAt: string;
  permissionStatus: 'confirmed' | 'unknown' | 'not-required-original';
}

interface ScoredQuestion {
  id: string;
  order: number;
  prompt: string;
  weights: WeightVector;
  provenance: Provenance;
}

interface SpecialRule {
  id: string;
  priority: number;
  event: 'answer' | 'navigation' | 'completion';
  condition: unknown;
  outcome: string;
  provenance: Provenance;
}

interface QuizDataset {
  schemaVersion: 1;
  datasetVersion: string;
  scoredQuestions: ScoredQuestion[];
  specialRules: SpecialRule[];
  answerPayout: readonly [-1.2, -0.72, 0, 0.6, 1];
  curveExponent: 0.6;
}
```

`condition` 在真正实现前必须换成可校验的 tagged union，不能长期保留 `unknown`。当前保留它是为了诚实表示特殊触发尚未调查清楚。

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

候选计算流程：

1. 对每题计算 `weights[virtue] * answerPayout[answer]`；
2. 按 Virtue 累加 raw score；
3. 除以该 Virtue 的最大可能正分；
4. Clamp 到 `[-1, 1]`；
5. 应用 `sign(x) * abs(x) ** 0.6`；
6. 映射到 `[0, 100]`；
7. 按已确认的显示舍入规则生成 `percentageDisplay`；
8. 按已确认的并列规则确定 Primary 和 Secondary。

第 3、7、8 步目前是 `UNKNOWN`，不得在没有参考向量时自行冻结。

## 4. 最大正分的候选定义

如果没有授权实现说明，数学上可测试的候选值是：

```ts
maxPositiveScore[virtue] = sum(
  max(answerPayout.map(p => question.weights[virtue] * p))
)
```

这只是候选公式，不是当前已验证的原站事实。必须通过多个参考结果向量才能转为正式规则。

## 5. 持久化契约

```ts
interface PersistedQuizStateV1 {
  schemaVersion: 1;
  datasetVersion: string;
  currentQuestionId: string;
  answers: Record<string, AnswerValue>;
  specialState: Record<string, unknown>;
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

## 7. 特殊规则优先级

最终需要固定类似以下顺序：

```txt
navigation secret
-> explicit special answer sequence
-> all-same / all-neutral completion rule
-> standard scoring
```

上面的顺序只是结构示例，不是已确认规则。每一条必须有唯一 `priority`，Golden Tests 必须覆盖条件重叠。

## 8. ResultViewModel

页面和分享卡共同消费：

```ts
interface ResultViewModel {
  kind: 'standard' | 'special';
  primary?: VirtueCode;
  secondary?: VirtueCode;
  color: string;
  spread: Array<{ code: VirtueCode; percentage: number }>;
  shareText: string;
  siteUrl: string;
}
```

禁止 Canvas 再计算一次分数。Canvas 只负责把 `ResultViewModel` 画出来。

## 9. 数据验收

正式数据文件必须同时通过：

- 题目 ID 唯一、order 连续；
- 题量与已确认口径一致；
- 每题恰好包含七个有限数值权重；
- answer payout 恰好五档；
- special priority 唯一；
- provenance 字段完整；
- dataset version 固定；
- Golden reference vectors 全部通过。
