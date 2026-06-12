# harness双轨触发机制前端同步执行计划

## 输入文件

- 需求说明：`requirement.md`
- 相关契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 相关模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 目标客户与基线分支：通用/main
- 影响模块：需求平台前端 harness、需求执行流程、项目接入初始化流程
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`

## 实施步骤

1. 同步脚本：用后端模板门禁同步前端 `scripts/check-harness.sh` 和 `scripts/test-check-harness.sh`。
2. 新增入口：新增 `docs/ai-harness/search-map.md` 和 `docs/process/local-harness-workflow.md`，更新 `harness-index.json`。
3. 流程文档：更新 `AGENTS.md`、`docs/README.md`、`docs/ai-harness/README.md`、`docs/process/**`、`docs/specs/README.md` 和 checklist。
4. 模板文档：同步模块、契约、决策、计划、执行报告、Review 报告和 meta 模板。
5. 模块沉淀：更新 `docs/ai-harness/modules/requirement-platform.md`，记录双轨 harness 和确认点门禁。
6. 验证闭环：运行脚本测试、文档检查和 harness init/complete 检查。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 新增 | `docs/ai-harness/search-map.md` | 前端短索引 |
| 新增 | `docs/process/local-harness-workflow.md` | 前端本地 Harness 流程 |
| 修改 | `AGENTS.md`、`docs/README.md`、`docs/ai-harness/README.md` | 前端入口更新 |
| 修改 | `docs/process/**`、`docs/specs/README.md`、`docs/templates/**` | 流程和模板同步 |
| 修改 | `scripts/check-harness.sh`、`scripts/test-check-harness.sh` | 前端门禁同步 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 模块知识库同步 |

## 模块知识库计划

- 更新 `docs/ai-harness/modules/requirement-platform.md`，记录前端双轨 harness、短索引和确认点门禁。
- 新增 `docs/ai-harness/search-map.md` 作为低 token 导航。

## 代码注释计划

- 本次不改运行态代码；脚本为同步治理规则，无需新增代码注释。

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`、`sh scripts/check-harness.sh init`、`sh scripts/check-harness.sh complete --spec docs/specs/active/REQ-019-harness双轨触发机制`
- L1 编译/构建：不适用，本次不改运行态前端代码。
- L2 单元/契约：`sh scripts/test-check-harness.sh`
- L3 运行态冒烟：不适用，本次不改页面、接口或配置。
- L4 跨端/端到端（可选）：不适用。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-001 | 入口更新 | `test -f docs/ai-harness/search-map.md && test -f docs/process/local-harness-workflow.md` |
| AC-002 | 流程文档 | `rg "本地 Harness 模式|需求设计确认点|伪造 MCP 回写" docs` |
| AC-003 | 脚本测试 | `sh scripts/test-check-harness.sh` |
| AC-004 | 搜索导航 | `rg "需求设计确认|MCP 管理|Agent 交接资料" docs/ai-harness/search-map.md` |

## 执行约束

- 本计划由 Execution Agent 基于最终 `requirement.md` 生成；用户已明确要求前端同步。
- 当前分支为 `docs/req-019-harness-dual-mode`，不得在 `main` 直接实现。
- 完成修改和验证后直接 commit，并在 `execution-report.md` 记录 commit、验证命令和结果。
- Execution Agent 不得自我 Review；执行完成后交给 Review Agent 或等价独立审查角色复核。
