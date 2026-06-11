# 项目接入中心职责收敛 执行计划

## 输入文件

- 需求说明：`requirement.md`
- 前端契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 前端模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 前端领域说明：`docs/domains/requirement-platform/README.md`
- 目标客户与基线分支：通用 / main
- 影响模块：需求管理/项目管理、需求管理/项目接入中心、需求管理/分支知识库详情
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`

## 实施步骤

1. 入口语义调整：修改 `src/views/requirement/project/index.vue`，将项目列表操作中的“接入”调整为“接入状态”或“接入中心”，并检查初始化状态列文案，覆盖 AC-UI-001。
2. 接入中心信息架构调整：修改 `src/views/requirement/project/detail.vue`，把首屏改为状态总览、仓库索引状态、分支完成度和待处理项，弱化复制初始化指令，覆盖 AC-UI-002、AC-UI-003、AC-UI-005。
3. 状态计算与空态处理：基于 `variants` 行级 `totalModules`、`indexedRepositoryCount`、`unindexedRepositoryCount` 和 `indexBatches` 计算完成、待初始化、待索引、缺知识库等状态，避免空表误判，覆盖 AC-UI-004、AC-UI-005。
4. 知识库入口保留：检查 `src/views/requirement/project/knowledge.vue` 与接入中心跳转参数，确保继续按 `projectId + variantId` 过滤，并保留索引批次和模块知识查看路径，覆盖 AC-UI-004。
5. 文档同步：更新 `docs/ai-harness/modules/requirement-platform.md`、`docs/ai-harness/contracts/requirement-platform-ui.md` 和 `docs/domains/requirement-platform/README.md`，明确维护页与接入中心职责边界，覆盖 AC-UI-006。
6. 契约复核：执行阶段检查后端 companion 契约中是否已有 harness 初始化结果、失败原因或回写状态字段。如果缺口影响 AC-UI-002 或 AC-UI-005，停止前端实现扩展，先补充后端 companion 需求。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 修改 | `src/views/requirement/project/index.vue` | 调整项目列表入口文案和接入状态语义 |
| 修改 | `src/views/requirement/project/detail.vue` | 将项目接入中心收敛为只读状态和知识观察页面 |
| 可能修改 | `src/views/requirement/project/knowledge.vue` | 如跳转参数或分支过滤需要修正，则同步调整 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 同步页面职责和不变量 |
| 修改 | `docs/ai-harness/contracts/requirement-platform-ui.md` | 同步前端契约和状态口径 |
| 修改 | `docs/domains/requirement-platform/README.md` | 同步领域入口说明 |

## 模块知识库计划

- 本需求改变项目管理和项目接入中心的长期页面职责，必须更新 `docs/ai-harness/modules/requirement-platform.md`。
- 同时更新 `docs/ai-harness/contracts/requirement-platform-ui.md`，明确 `initInstruction` 主复制入口属于项目维护页，接入中心主职责是状态观察和知识库。
- 更新 `docs/domains/requirement-platform/README.md`，避免后续产品说明继续把两个页面描述成重复入口。

## 代码注释计划

- 如新增接入完成度计算函数，应在复杂条件前补充简短注释，说明完成口径来自模块知识和仓库索引，不是单个状态字段。
- 如仅调整模板结构和文案，不新增复杂逻辑，则不需要新增注释。

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`；计划阶段运行 `sh scripts/check-harness.sh init --spec docs/specs/active/2026-06-11-REQ-001-项目接入中心职责收敛` 验证 spec 基础结构。
- L1 编译/构建：执行阶段运行 `npm run build:prod`。
- L2 单元/契约：当前前端无专门单元测试脚本；执行阶段通过构建和页面状态逻辑检查覆盖。
- L3 运行态冒烟：执行阶段启动前端，覆盖项目列表、项目维护页、项目接入中心、分支知识库详情；检查 console 和 network 无本次变更相关错误。
- L4 跨端/端到端（可选）：后端启动并具备测试数据时，验证已初始化分支、未初始化分支、无索引数据和空模块知识库四类状态。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | 入口语义调整 | 页面文案检查、项目列表冒烟 |
| AC-UI-002 | 接入中心信息架构调整 | 接入中心冒烟、状态总览检查 |
| AC-UI-003 | 接入中心信息架构调整 | 项目维护页与接入中心入口对比检查 |
| AC-UI-004 | 知识库入口保留 | 分支筛选、知识库详情跳转检查 |
| AC-UI-005 | 状态计算与空态处理 | 空数据、未索引和已完成样例检查 |
| AC-UI-006 | 文档同步 | `sh scripts/check-docs.sh`、文档内容审查 |
| AC-UI-007 | 验证收口 | `npm run build:prod`、运行态冒烟 |

## 执行约束

- 本计划完成后仍只代表计划阶段完成；开始实现必须另有明确执行授权。
- Execution Agent 必须从 `main` 创建 ASCII 任务分支，建议 `feature/REQ-20260611-001-access-center-status`，不得直接在 `main` 实现。
- 本需求默认不改后端接口；如果执行阶段需要后端新增字段或接口，必须先补 companion spec 和计划。
- 不得删除项目接入中心路由，不得把配置型表单搬回接入中心。
- 不得把人员 MCP Key、登录 token 或个人本机路径拼入初始化指令。
- Execution Agent 不得自我 Review；执行完成后默认进入独立 Review，发现 `RF-*` 后返修并复审。
