# 项目接入与 MCP 索引知识库前端执行计划

## 输入文件

- 需求说明：`requirement.md`
- 相关契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 相关模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 目标客户与基线分支：通用 / main

## 实施步骤

1. API 封装：新增 `src/api/requirement/index.js`，封装索引批次、模块知识树、影响面推荐和 JSON 导入备用接口，覆盖 AC-UI-003、AC-UI-004。
2. 项目接入中心：改造项目管理入口并新增项目详情页，集中展示基础信息、仓库、客户基线、索引状态和模块知识库，覆盖 AC-UI-001、AC-UI-002。
3. 索引推送指引：在项目接入中心展示 MCP tool 名称、项目 ID、仓库 ID、分支和 commit 要求，并说明不保存本机绝对路径，覆盖 AC-UI-002。
4. 需求影响面推荐：在需求表单中监听项目、客户线和模块变化，调用推荐接口展示候选页面、接口、数据表、权限和文档，并支持追加到文本字段，覆盖 AC-UI-003、AC-UI-004。
5. Agent 交接资料入口：调整需求详情和列表中的执行包入口命名，将其作为需求详情内开发资料入口，复用现有 package artifact 页面，覆盖 AC-UI-005。
6. 文档与验证：同步前端接口契约和模块 harness 文档，执行构建和必要页面冒烟，覆盖 AC-UI-006。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 新增 | `src/api/requirement/index.js` | 索引知识库 API 封装 |
| 修改 | `src/views/requirement/project/index.vue` | 项目接入中心入口 |
| 新增 | `src/views/requirement/project/detail.vue` | 项目接入中心详情页 |
| 修改 | `src/views/requirement/demand/index.vue` | 需求表单影响面推荐 |
| 修改 | `src/views/requirement/demand/detail.vue` | Agent 交接资料入口 |
| 修改 | `src/views/requirement/package/index.vue` | 调整页面文案为 Agent 交接资料或执行资料 |
| 修改 | `docs/ai-harness/contracts/requirement-platform-ui.md` | 同步前端 API 契约 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 同步页面入口和业务不变量 |

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh` 和 `sh scripts/check-harness.sh complete --spec docs/specs/active/2026-06-09-REQ-002-项目接入与MCP索引知识库`
- L1 编译/构建：`npm run build:prod`
- L2 单元/契约：当前项目无独立单元测试脚本，以构建和 API 封装检查作为最低契约检查。
- L3 运行态冒烟：启动前端后打开项目接入中心、需求新增弹窗和 Agent 交接资料页面，检查 console 无本次变更相关错误。
- L4 跨端/端到端：后端 companion 完成后，联调索引批次展示、影响面推荐和需求保存。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | 项目接入中心 | 页面冒烟和接口联调 |
| AC-UI-002 | 索引推送指引 | 页面检查和文案检查 |
| AC-UI-003 | 需求影响面推荐 | 页面冒烟和接口联调 |
| AC-UI-004 | 需求影响面推荐 | 表单交互检查 |
| AC-UI-005 | Agent 交接资料入口 | 页面路由和文案检查 |
| AC-UI-006 | 文档与验证 | L0 文档检查和 harness 检查 |

## 执行约束

- Execution Agent 必须按本计划执行，不得自行扩大范围。
- 不新增前端依赖，不引入浏览器本地文件扫描能力。
- 前端不得向后端提交个人本机绝对路径。
- 保留现有人工编辑影响范围字段，推荐结果只能辅助填充，不强制覆盖用户输入。
- 后端 companion 契约未落地前，前端不得硬编码未确认字段为完成态结论。
