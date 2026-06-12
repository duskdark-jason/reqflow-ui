# harness双轨触发机制前端同步需求说明

## 背景

后端 harness 模板已扩展为 MCP 接入模式和本地 Harness 模式双轨同构流程。前端项目作为 companion 仓库，也必须同步相同触发机制、需求设计确认点、搜索导航和检查脚本，否则跨端需求会出现后端严、前端松的治理差异。

## 目标

- 前端 harness 增加 `search-map.md`，降低初次进入项目前的查找成本。
- 前端 harness 增加 `local-harness-workflow.md`，无 MCP 时也按需求设计、执行、Review、返修和完成闭环推进。
- 前端检查脚本同步后端模板门禁，拦截缺少短索引、本地模式伪造 MCP 回写、需求确认前提前生成执行计划等问题。
- 前端流程文档、模板文档和模块知识库同步后端模板要求，明确本地建设也必须保留多轮需求设计确认点。

## 范围

本次包含：

- 更新前端 `AGENTS.md`、`docs/README.md`、`docs/ai-harness/README.md`、`docs/process/**` 和模板文档。
- 新增前端 `docs/ai-harness/search-map.md` 和 `docs/process/local-harness-workflow.md`。
- 同步前端 `scripts/check-harness.sh` 和 `scripts/test-check-harness.sh`。
- 更新前端模块知识库，记录双轨 harness 和确认点门禁。

本次不包含：

- 不改运行态 Vue 页面、API 封装、路由、权限或构建配置。
- 不改后端接口、数据库或 MCP tool。

## 影响范围

- 接口/API：否。
- 数据库/SQL：否。
- 权限/菜单：否。
- 页面/交互：否，不改运行态页面。
- Harness 文档/脚本：是。

## 验收标准

- AC-001：前端 `harness-index.json` 暴露 `searchMap` 和 `localHarnessWorkflow` 入口，且对应文件存在。
- AC-002：前端本地 Harness 流程明确无 MCP 触发条件、同构阶段、禁止伪造 MCP 回写和多轮需求设计确认点。
- AC-003：前端检查脚本测试覆盖缺少 `search-map.md`、缺少 `searchMap`、模块占位、本地模式伪造 MCP 回写、需求确认前提前生成执行计划等失败场景。
- AC-004：前端模块知识库和搜索导航能把项目管理、需求列表、需求设计确认、Agent 交接资料、MCP 管理、检查脚本导向对应文档与代码入口。

## Companion 关联

- companion spec：`../reqflow-be/docs/specs/done/REQ-019-harness双轨触发机制`
- 关联分支：`../reqflow-be` 使用 `docs/req-019-harness-dual-mode`

## 约束与假设

- 所有落地文档使用中文说明。
- 前端本次只同步 harness，不修改运行态业务页面。
- 本地 Harness 模式不是低配流程，只是不执行 MCP 读写回写。
