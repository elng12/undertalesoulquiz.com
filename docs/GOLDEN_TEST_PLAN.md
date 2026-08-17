# Golden Test Plan

状态：`original-production-v1` 已接入；7 个普通原创参考向量、四类特殊结果正反例、不计分题隔离、权重变异检测、状态恢复和分享一致性均已进入自动化测试。本站独立原创路线的 Golden Gate 为 PASS；原站线上向量只保留为技术调查证据，不用于声称内容一致。

## 1. Golden Test 是什么

Golden Test 使用固定输入和经过独立确认的固定输出，防止评分、排序、特殊结果或分享卡在重构后悄悄变化。

它不同于 Mock：

- Mock 可以验证程序分层是否正确；
- 授权一致性路线的 Golden Test 必须来自授权数据集或参考产品的人工验收结果；独立原创路线必须使用已批准 dataset 和独立计算/复核的预期向量；
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
    kind: 'authorized-fixture' | 'independent-original-review' | 'manual-reference-run' | 'live-runtime-reference';
    capturedAt: string;
    note: string;
  };
}
```

证据文件不得包含账号凭据、Cookie 或私密信息。

### 已取得的线上参考向量

2026-08-16 在隔离浏览器中调用与镜像哈希一致的线上运行时：前 66 题循环输入 `0,1,2,3,4`，后两道不计分题输入 `1,1`。

| 维度 | raw | 精确百分比 | 页面显示 |
|---|---:|---:|---:|
| PAT | 13.12 | 77.75169275865976 | 78% |
| INT | 8.16 | 65.57611647843527 | 66% |
| KND | -1.2 | 44.6654627832068 | 45% |
| JUS | -9.28 | 27.645663801029123 | 28% |
| PER | -11.56 | 25.121529875982663 | 25% |
| DET | -10.52 | 24.81910951073224 | 25% |
| BRV | -16.04 | 23.074417067802656 | 23% |

预期排序：`PAT, INT, KND, JUS, PER, DET, BRV`。

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

- `all-disagree`：66 题全部为 0；
- `all-neutral`：66 题全部为 2；
- `all-agree`：66 题全部为 4；
- `all-switch`：前 33 题为 0，后 33 题为 4；
- 两道不计分题改变答案后，上述结果与普通分数都不得变化；
- 每个特殊结果至少一个只差一步的反例；
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
- 真实 iPhone 或 Android 的真人验收状态单独记录；当前由用户明确选择跳过，不得记为 PASS。

模拟移动端不等于真实手机验收。

## 6. 当前缺口

| 缺口 | 影响 |
|---|---|
| 用户本人未逐项审阅完整内容 | Agent 内容复验 PASS 不能冒充用户本人真人验收 |
| 真实手机验收由用户选择跳过 | Chromium/WebKit 模拟视口不能替代真实 iPhone 或 Android，状态保持 SKIPPED |
| production 尚未部署 | 本地与 staging PASS 不能外推为 production PASS |
| Room 未接入浏览器导航 | 纯函数有可注入 RNG 测试，但页面尚未展示该彩蛋 |

因此当前状态是 **ORIGINAL PRODUCTION DATASET READY / GOLDEN GATE PASS / STAGING PASS / PRODUCTION ACCEPTANCE PENDING**。

## 7. Golden Gate

当前门槛结果：

- 7 个普通结果参考向量：PASS；
- 四类特殊结果正反例与 unscored 隔离：PASS；
- back/edit/restore：PASS；
- 页面和分享卡共享结果对象：PASS；
- 权重变异与完全并列排序检测：PASS。
