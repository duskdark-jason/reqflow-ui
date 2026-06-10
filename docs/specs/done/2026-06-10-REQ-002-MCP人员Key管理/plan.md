# MCP人员Key管理执行计划

## 输入文件

- 需求说明：`docs/specs/active/2026-06-10-REQ-002-MCP人员Key管理/requirement.md`
- 前端模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 前端契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 后端 companion spec：`../reqflow-be/docs/specs/active/2026-06-10-REQ-002-MCP人员Key管理`
- 现有页面模式：`src/views/requirement/statistics/index.vue`、`src/views/requirement/project/index.vue`

## 实施步骤

1. API 封装：新增 `src/api/requirement/mcpKey.js`，封装列表、详情、新增、修改、删除、重置和配置查询接口，覆盖 AC-UI-003、AC-UI-005。
2. 页面骨架：新增 `src/views/requirement/mcpKey/index.vue`，使用 RuoYi 查询表单、表格、分页和 `right-toolbar` 模式，覆盖 AC-UI-004。
3. 地址与配置提示：页面顶部展示 MCP 地址、`X-MCP-Key` Header 和 Codex 配置片段，支持复制，覆盖 AC-UI-002。
4. 创建与重置弹窗：新增 Key 表单和一次性明文弹窗，创建成功和重新生成成功后只在弹窗中显示完整 Key，覆盖 AC-UI-003、AC-UI-004。
5. 权限控制：页面按钮使用 `v-hasPermi` 控制，菜单由后端 SQL 下发，覆盖 AC-UI-001、AC-UI-005。
6. Harness 更新：更新前端模块与接口契约，记录 MCP 管理页面、API 文件和权限点，覆盖 AC-UI-006。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 新增 | `src/api/requirement/mcpKey.js` | MCP Key 管理接口封装 |
| 新增 | `src/views/requirement/mcpKey/index.vue` | MCP 管理页面 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 新增页面入口和不变量 |
| 修改 | `docs/ai-harness/contracts/requirement-platform-ui.md` | 新增 API 映射、权限和页面契约 |

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`
- L1 编译/构建：`npm run build:prod`
- L2 单元/契约：当前项目无独立单元测试脚本，使用 `npm run build:prod` 覆盖静态契约检查。
- L3 运行态冒烟：`npm run dev` 后打开 MCP 管理菜单；验证列表、创建弹窗、一次性 Key 弹窗、复制配置、权限按钮显示和 console 无本次变更相关错误。
- L4 跨端/端到端：后端启动后完整验证创建 Key、复制地址、携带 `X-MCP-Key` 调 `/requirement/mcp`；如当前环境无法联调，在执行报告记录启动命令、错误摘要和后续补验方式。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | 权限控制 | 路由菜单和按钮权限冒烟 |
| AC-UI-002 | 地址与配置提示 | 页面冒烟和复制按钮检查 |
| AC-UI-003 | 创建与重置弹窗 | 页面冒烟和后端联调 |
| AC-UI-004 | 页面骨架 | 构建和页面列表检查 |
| AC-UI-005 | 权限控制 | 按钮权限和接口成功后刷新 |
| AC-UI-006 | Harness 更新 | `sh scripts/check-docs.sh` 和人工检查契约段落 |

## 执行约束

- 当前工作区已有未提交改动，执行阶段不得覆盖或回退既有改动。
- 开始实现前必须获得明确执行授权；如用户要求隔离开发，应先按 Git 工作流创建同名 ASCII 任务分支或 worktree。
- 页面不得把完整明文 Key 存入 localStorage、sessionStorage 或长期可见表格列。
- 不改造项目接入中心已有项目分支 MCP Key 展示；本页只管理人员访问 Key。
- Execution Agent 不得自我 Review；实现完成后等待明确 Review 授权。
