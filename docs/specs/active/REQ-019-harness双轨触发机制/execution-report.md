# harness双轨触发机制前端同步执行报告

## 执行结论

- 状态：已完成
- 分支：docs/req-019-harness-dual-mode
- commit：本分支最终提交，见 `git log -1 HEAD`
- 流程模式：平台自身建设模式（按本地 Harness 流程闭环）
- MCP 回写：未接入 MCP，本地文件闭环

## 修改摘要

| 路径 | 修改说明 |
|---|---|
| `AGENTS.md`、`docs/README.md`、`docs/ai-harness/README.md` | 增加本地 Harness 模式和 search-map 入口。 |
| `docs/ai-harness/search-map.md` | 新增前端低 token 搜索导航。 |
| `docs/process/local-harness-workflow.md` | 新增无 MCP 时的同构本地流程和多轮确认点。 |
| `docs/process/**`、`docs/specs/README.md`、`docs/templates/**` | 同步确认点、拆分、回写边界和模板要求。 |
| `scripts/check-harness.sh`、`scripts/test-check-harness.sh` | 同步后端模板门禁与测试。 |
| `docs/ai-harness/modules/requirement-platform.md` | 记录前端 harness 同步和确认点长期规则。 |

## 模块知识库沉淀

- 影响模块：需求平台前端 harness、需求执行流程、项目接入初始化流程
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`
- 搜索导航更新：已更新 `docs/ai-harness/search-map.md`
- 无需更新原因：不适用

## 数据库变更沉淀

- 数据库影响：无
- SQL 脚本路径：无
- 数据库文档路径：无
- 数据库变更说明：无
- 无需更新原因：前端 harness 同步不涉及数据库、SQL、Mapper 或数据口径。

## 代码注释处理

- 注释动作：无需新增
- 注释文件：无
- 处理说明：本次不改运行态前端代码，仅同步文档和脚本治理规则。

## 验证结果

| 层级 | 验收 ID | 命令或方式 | 结果 |
|---|---|---|---|
| L0 | AC-001、AC-002、AC-003、AC-004 | `sh scripts/check-docs.sh && sh scripts/check-harness.sh init` | 通过 |
| L1 | AC-001、AC-002、AC-003、AC-004 | 不适用 | 本次不改运行态前端代码 |
| L2 | AC-003 | `sh scripts/test-check-harness.sh` | 通过 |
| L2 | AC-002、AC-004 | `rg "本地 Harness 模式|需求设计确认点|伪造 MCP 回写|search-map|localHarnessWorkflow|searchMap" docs scripts/check-harness.sh` | 通过 |
| L2 | AC-002、AC-003、AC-004 | 旧术语和降级冲突描述扫描 | 无命中 |
| L0 | AC-001、AC-002、AC-003、AC-004 | `sh scripts/check-docs.sh && sh scripts/check-harness.sh complete --spec docs/specs/active/REQ-019-harness双轨触发机制` | 通过 |
| L3 | AC-001、AC-002、AC-003、AC-004 | 不适用 | 本次不改页面、接口或配置 |
| L4（可选） | AC-001、AC-002、AC-003、AC-004 | 不适用 | 本次无跨端运行态变更 |

## 运行态证据

- 执行目录：当前前端子仓库根目录
- 启动命令：未启动前端
- profile/env/mode：本地文档和脚本治理
- 检查命令：见“验证结果”
- 原始错误摘要：无
- screenshot/trace 路径：无
- 是否代表用户环境：否，仅代表当前执行 agent 环境
- 后续补验环境：不需要，本次无运行态变更

## 计划偏差

- 无偏差。前端同步范围按用户补充要求执行。
- 补充清理 harness 规范冲突：统一使用“MCP 接入模式”命名，普通无 Key/无 MCP 场景固定进入本地 Harness 模式；平台自身建设模式支持需求平台自身、平台类治理能力和明确拷贝平台建设版本的项目本地自举；脚本提示同步为本地 Harness/平台自身建设模式都不得伪造 MCP 回写。

## Review 返修记录

无。

## 风险与后续

- 无剩余阻断风险。
- 后续如果拆分前端需求管理模块，应同步迁移 `search-map.md` 关键词。
