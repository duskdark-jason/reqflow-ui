# 项目管理页面功能报错修复前端需求说明

## 背景

用户反馈当前项目的“项目管理”页面还有较多功能报错。该页面是需求管理平台的项目初始化主入口，承载项目列表、初始化状态、项目维护弹窗、保存后进入接入中心、删除项目和权限按钮等关键流程。若这些功能不稳定，后续项目接入、MCP 索引、需求创建和影响面推荐都会被阻塞。

本需求先作为修复需求进入计划阶段：前端需要基于运行态复现建立错误清单，再按项目管理主流程逐项修复；后端 companion 负责核对 `/requirement/project/**` 与 `/requirement/project/init/**` 接口、权限和数据一致性。

## 目标

- 修复项目管理页面加载、查询、重置、分页、选择、删除、接入跳转和初始化状态展示中的前端报错。
- 修复项目维护弹窗新增、编辑回显、仓库行维护、分支行维护、字段校验、保存和“保存并进入接入中心”中的前端报错。
- 保持项目管理既有产品形态：项目管理是初始化主入口，仓库和项目分支在维护弹窗内维护，项目接入中心只读展示后续接入和索引信息。
- 输出可复现的页面冒烟证据，确保 console、page error、request failed 和 HTTP 4xx/5xx 都被检查并解释。

## 范围

本次包含：

- `src/views/requirement/project/index.vue` 项目列表与操作按钮。
- `src/views/requirement/project/components/ProjectInitWizard.vue` 项目维护弹窗。
- `src/views/requirement/project/detail.vue` 的项目接入跳转链路，只验证从项目管理进入后的首屏可用性。
- `src/api/requirement/project.js`、`src/api/requirement/projectInit.js` 与后端 companion 契约一致性。
- 前端 harness 文档中项目管理页面验收路径和接口契约的必要同步。

本次不包含：

- 不重做项目管理信息架构，不恢复仓库管理、客户定制线、模块功能点独立左侧菜单。
- 不新增第三方依赖，不升级 Vue、Element UI、Axios 或 RuoYi 前端框架。
- 不实现本地仓库扫描、MCP 索引上传或需求影响面推荐修复；这些链路只验证项目管理入口不被本次变更破坏。
- 不把用户未授权的主分支代码修改写入本需求。

## 影响范围

- 接口/API：是，前端需要核对 `/requirement/project/list`、`/requirement/project/{projectId}`、`/requirement/project/init/{projectId}`、`POST /requirement/project/init`、`PUT /requirement/project/init`、`DELETE /requirement/project/{projectIds}` 的调用参数和返回结构。
- 数据库/SQL：否，前端不直接修改数据库；数据库一致性由后端 companion 需求处理。
- 权限/菜单：是，需要确认 `req:project:list`、`req:project:query`、`req:project:add`、`req:project:edit`、`req:project:remove` 下页面按钮和接口调用行为一致。
- 页面/交互：是，项目管理页面、项目维护弹窗和接入中心跳转均为用户可见流程。
- 导出/异步/任务：否，本需求不涉及导出、后台任务或异步进度。

## 契约与数据口径

- 接口路径和方法：
  - `GET /requirement/project/list`：项目列表。
  - `GET /requirement/project/init/{projectId}`：单项目初始化上下文。
  - `POST /requirement/project/init`：新增项目并保存仓库和项目分支。
  - `PUT /requirement/project/init`：更新项目并同步仓库和项目分支。
  - `DELETE /requirement/project/{projectIds}`：删除一个或多个项目。
- 请求参数：
  - 列表查询使用 `pageNum`、`pageSize`、`projectName`、`projectCode`、`status`。
  - 初始化保存 payload 包含 `project`、`repositories`、`variants`、`remark`。
  - 仓库行必须提交 `repoName`、`repoType`、`repoUrl`、`defaultBranch`、`status`，不得提交个人本机绝对路径。
  - 分支行必须提交 `branchLabel`、`baselineBranch`、`status`，`mcpKey` 由后端生成后回显。
- 响应字段：
  - 列表响应使用 RuoYi `rows`、`total`。
  - 初始化上下文响应 `data` 包含 `project`、`repositories`、`variants`、`moduleSummary`、`indexSummary`、`initChecklist`。
- 数据粒度：
  - 项目列表一行对应一个项目。
  - 初始化状态一行对应一个项目的初始化检查项。
  - 维护弹窗仓库表一行对应一个团队共享 Git 远端仓库。
  - 维护弹窗分支表一行对应一个项目分支配置。

## 验收标准

- AC-UI-001：登录后打开项目管理页面，列表可加载，初始化状态可展示；console error、page error、request failed 和本页面相关 HTTP 4xx/5xx 均为 0，或有明确且不影响功能的认证/环境说明。
- AC-UI-002：搜索、重置、分页、勾选单行和批量按钮禁用状态可正常工作，不出现 Vue render、undefined 字段或权限指令报错。
- AC-UI-003：点击新增打开项目维护弹窗，可维护项目基础信息、至少一条代码仓库和至少一条项目分支；前端校验能拦截空必填项和个人本机绝对路径。
- AC-UI-004：编辑已有项目时，项目、仓库、分支、模块摘要、索引摘要和初始化检查项可正确回显；删除仓库行、删除分支行和新增行不会造成表格或保存 payload 报错。
- AC-UI-005：点击保存后项目列表刷新；点击“保存并进入接入中心”后进入 `/requirement/project/detail?projectId=...`，且接入中心首屏能读取项目基础信息。
- AC-UI-006：删除单个或多个项目时确认框、接口调用、成功提示和列表刷新可正常工作；取消删除不触发接口。
- AC-UI-007：前端 harness 文档同步本次修复后的项目管理验收路径、风险点或接口契约变化。

## Companion 关联

- companion spec：`../../../../../reqflow-be/docs/specs/active/2026-06-10-REQ-001-项目管理页面功能报错修复`
- 关联分支：未创建

## 客户与分支

- 目标客户：通用
- 基线分支：main
- 任务分支：未创建

## 约束与假设

- 本需求来源是用户的页面报错反馈，尚未收到逐条错误截图或日志；执行阶段必须先运行页面冒烟并形成错误清单，再开始修复。
- 执行阶段不得把未复现、未验证的问题写成已修复；超出项目管理主流程的问题需要记录为后续需求。
- 当前仓库分支为 `main`，开始实现前必须获得任务分支/worktree 授权，或获得明确主分支修改授权并写入 `meta.md`。
