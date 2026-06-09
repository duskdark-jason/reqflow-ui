# 项目管理页面功能报错修复前端执行计划

## 输入文件

- 需求说明：`docs/specs/active/2026-06-10-REQ-001-项目管理页面功能报错修复/requirement.md`
- 后端 companion：`../../../../../reqflow-be/docs/specs/active/2026-06-10-REQ-001-项目管理页面功能报错修复`
- 相关契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 相关模块文档：`docs/ai-harness/modules/requirement-platform.md`、`docs/domains/requirement-platform/README.md`
- 目标客户与基线分支：通用 / `main`

## 实施步骤

1. 运行态复现：在任务分支或 worktree 中启动前端，登录后打开项目管理，记录列表加载、初始化状态、弹窗、保存、接入跳转和删除流程的 console、page error、request failed、HTTP 状态与截图证据，覆盖 AC-UI-001 至 AC-UI-006。
2. 列表页修复：检查 `src/views/requirement/project/index.vue` 中 `listProject` 响应归一、初始化状态逐项读取、选择状态、删除参数和接入跳转，修复会导致页面报错或状态错误的逻辑，覆盖 AC-UI-001、AC-UI-002、AC-UI-006。
3. 维护弹窗修复：检查 `src/views/requirement/project/components/ProjectInitWizard.vue` 中弹窗打开/关闭、编辑回显、仓库行、分支行、字段校验、payload 构造、保存 loading 复位和保存成功事件，修复新增和编辑流程中的报错，覆盖 AC-UI-003、AC-UI-004、AC-UI-005。
4. 接口封装核对：检查 `src/api/requirement/project.js` 与 `src/api/requirement/projectInit.js` 是否与后端 companion 契约一致；如后端返回结构需要兼容处理，仅在本页面局部做显式归一，不改变全局 request 工具，覆盖 AC-UI-001、AC-UI-005、AC-UI-006。
5. 文档同步：如修复改变接口字段、权限口径、验收路径或风险点，同步更新 `docs/ai-harness/contracts/requirement-platform-ui.md`、`docs/ai-harness/modules/requirement-platform.md` 或 `docs/domains/requirement-platform/README.md`，覆盖 AC-UI-007。
6. 验证收尾：运行前端构建、文档/harness 检查和页面冒烟；将错误清单、修改文件、验证命令和残余风险写入执行报告，覆盖 AC-UI-001 至 AC-UI-007。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 修改 | `src/views/requirement/project/index.vue` | 修复项目列表、初始化状态、选择、删除和接入跳转报错 |
| 修改 | `src/views/requirement/project/components/ProjectInitWizard.vue` | 修复项目维护弹窗新增、编辑、行维护、校验、保存和事件回传报错 |
| 修改 | `src/views/requirement/project/detail.vue` | 仅在从项目管理跳转后首屏读取存在报错时修改 |
| 修改 | `src/api/requirement/project.js` | 仅在项目 CRUD 调用路径或参数与后端契约不一致时修改 |
| 修改 | `src/api/requirement/projectInit.js` | 仅在初始化聚合接口调用路径或参数与后端契约不一致时修改 |
| 修改 | `docs/ai-harness/contracts/requirement-platform-ui.md` | 同步接口字段、权限或验收路径变化 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 同步项目管理页面不变量、风险点或验证建议 |
| 修改 | `docs/domains/requirement-platform/README.md` | 仅在业务形态或项目初始化口径发生长期变化时修改 |

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`；`sh scripts/check-harness.sh review --spec docs/specs/active/2026-06-10-REQ-001-项目管理页面功能报错修复`
- L1 编译/构建：`npm run build:prod`
- L2 单元/契约：当前前端未配置独立单元测试；以 API 封装核对、后端 companion 测试和生产构建作为最低契约检查。
- L3 运行态冒烟：启动前端后用浏览器打开登录页、项目管理、项目维护弹窗、项目接入中心；记录 console error、page error、request failed、HTTP 4xx/5xx、关键截图和操作结果。
- L4 跨端/端到端：后端 companion 启动后，使用真实登录态验证新增项目、编辑回显、仓库行删除、分支行删除、保存并进入接入中心、删除项目；如认证态或数据库不满足条件，执行报告必须记录启动命令、执行目录、检查命令、错误摘要和补验环境。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | 运行态复现、列表页修复、接口封装核对、验证收尾 | 页面冒烟、console/network 检查、构建 |
| AC-UI-002 | 列表页修复、验证收尾 | 搜索/重置/分页/选择手工冒烟、构建 |
| AC-UI-003 | 维护弹窗修复、验证收尾 | 新增弹窗表单冒烟、字段校验冒烟、构建 |
| AC-UI-004 | 维护弹窗修复、验证收尾 | 编辑回显、仓库行/分支行增删冒烟、构建 |
| AC-UI-005 | 维护弹窗修复、接口封装核对、验证收尾 | 保存、保存并进入接入中心跨端冒烟 |
| AC-UI-006 | 列表页修复、接口封装核对、验证收尾 | 删除确认、取消删除、批量删除冒烟 |
| AC-UI-007 | 文档同步、验证收尾 | L0 文档和 harness 检查 |

## 执行约束

- 本计划完成后仍只代表计划阶段完成；开始实现必须另有明确执行授权。
- 当前分支为 `main`，Execution Agent 必须先获得任务分支/worktree 授权，或获得明确主分支修改授权并写入 `meta.md`。
- Execution Agent 必须先复现并记录错误清单，再修复；不得仅凭静态阅读宣称页面报错已解决。
- Execution Agent 必须与后端 companion 对齐接口、权限和数据结构；发现后端契约缺陷时，先更新后端 companion 执行报告或回到计划阶段补齐。
- Execution Agent 不得自行扩大到需求列表、执行包、统计或 MCP 索引上传修复。
- Execution Agent 不得自我 Review；进入 Review 必须有明确 Review 授权或独立 Review 请求。
