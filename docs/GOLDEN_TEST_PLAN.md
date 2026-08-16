# Golden Test Plan

状态：测试设计已完成；由于真实题库、权重和预期结果尚未交付，目前不能标记 Golden Tests PASS。

## 1. Golden Test 是什么

Golden Test 使用固定输入和经过独立确认的固定输出，防止评分、排序、特殊结果或分享卡在重构后悄悄变化。

它不同于 Mock：

- Mock 可以验证程序分层是否正确；
- Golden Test 必须来自授权数据集或参考产品的人工验收结果；
- 用本项目自己的算法生成预期值，再拿它测试自己，不算 Golden Test。

## 2. 参考向量格式

```ts
interface GoldenVector {
  id: string;
  datasetVersion: string;
  answers: Record<string, 0 | 1 | 2 | 3 | 4>;
  navigationEvents?: Array<{ action: 'back' | 'next'; questionId: string }>;
  expected:
    | {
        kind: 'standard';
        primary: string;
        secondary: string;
        percentageExact?: Record<string, number>;
        percentageDisplay: Record<string, number>;
      }
    | {
        kind: 'special';
        specialId: string;
      };
  evidence: {
    kind: 'authorized-fixture' | 'manual-reference-run';
    capturedAt: string;
    note: string;
  };
}
```

证据文件不得包含账号凭据、Cookie 或私密信息。

## 3. 必须建立的参考样例

### 普通评分

1. 一组能产生明确七维排序的混合答案；
2. 第二组不同 Primary/Secondary 的混合答案；
3. 单题改变前后的结果，用于发现权重方向或 payout 错误；
4. 接近 50% 的结果，用于验证曲线与舍入；
5. 接近并列的结果，用于验证稳定排序；
6. 含负 raw score 的结果，用于验证 sign curve；
7. 命中 Clamp 上下界的结果。

### 特殊结果

- 每个已确认特殊结果至少一个正例；
- 每个特殊结果至少一个只差一步的反例；
- 两个条件可能同时命中时的优先级样例；
- 所有已确认导航型彩蛋的最短复现序列；
- 普通评分不能误触发特殊结果。

### 状态与恢复

- 未作答不能越过当前题；
- 返回修改后只使用新答案；
- 修改答案后刷新仍保留新答案；
- 正常刷新与关闭重开恢复到准确题号；
- schema 损坏时安全重置并提示；
- dataset version 改变时不使用旧答案算新结果；
- Reset、Retake 只清理本站进度。

### 分享一致性

- 页面 Primary、Secondary 与分享卡一致；
- 七个百分比和值的排序完全一致；
- 特殊结果卡不混入普通结果字段；
- PNG 在高 DPR、普通 DPR 和窄屏上不裁字；
- `navigator.share` 不可用或拒绝时出现可用 fallback；
- Copy Result 的文本与页面结果一致。

## 4. 测试分层

### Vitest

- dataset schema；
- payout、raw、normalization、curve、mapping；
- rounding 和 tie-break；
- special rule priority；
- reducer/state machine；
- persistence parse/migration；
- ResultViewModel 一致性。

### Playwright

- 首页静态内容和单一 H1；
- 开始、作答、Back、修改、完成；
- 刷新和重新打开恢复；
- Reset 和 Retake；
- 标准与特殊结果；
- Save、Share、Copy fallback；
- 手机和桌面无溢出；
- 键盘操作与 focus 可见；
- 构建后的支持页面、canonical、robots 和 sitemap。

## 5. 浏览器矩阵

- Chromium desktop；
- WebKit desktop；
- Chromium mobile emulation；
- WebKit mobile viewport；
- 至少一个真实 iPhone 或 Android 的真人验收，状态单独记录。

模拟移动端不等于真实手机验收。

## 6. 当前缺口

| 缺口 | 影响 |
|---|---|
| 66/68 题未统一 | 无法冻结 dataset length |
| 精确权重缺失 | 无法生成普通评分 Golden vectors |
| 舍入和并列未知 | Primary/Secondary 边界无法验收 |
| 特殊触发未确认 | 无法写特殊结果正反例 |
| 内容权限未确认 | 无法把原题和结果文案作为仓库 fixture |

因此当前状态是 **PLAN COMPLETE / GOLDEN DATA BLOCKED**，不是测试通过。

## 7. Golden Gate

评分实现进入 UI 集成前，必须满足：

- 至少 7 个普通结果参考向量通过；
- 所有已确认特殊结果正反例通过；
- back/edit/restore 通过；
- 页面和分享卡共享结果对象的测试通过；
- 人为破坏 payout、某题权重或 tie-break 时，至少一个 Golden Test 会失败。
