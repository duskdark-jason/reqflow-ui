# 需求管理平台前端接口调用契约

## 后端依赖

后端 companion 契约：`../../../../reqflow-be/docs/ai-harness/contracts/requirement-platform-api.md`。

## API 文件映射

| API 文件 | 后端路径 | 说明 |
|---|---|---|
| `project.js` | `/requirement/project` | 项目 CRUD |
| `projectInit.js` | `/requirement/project/init` | 项目初始化聚合查询、新增和更新 |
| `repository.js` | `/requirement/repository` | 仓库 CRUD 和初始化指令入口 |
| `variant.js` | `/requirement/variant` | 客户定制线 CRUD |
| `module.js` | `/requirement/module` | 模块功能点 CRUD |
| `index.js` | `/requirement/index` | 仓库索引批次、模块知识和影响面推荐 |
| `demand.js` | `/requirement/demand` | 需求列表、详情、保存和状态流转 |
| `package.js` | `/requirement/package` | Agent 交接资料列表、最新版本、保存新版本和生成草稿资料 |
| `statistics.js` | `/requirement/statistics` | 使用统计 |

## 权限标识

| 页面 | 主要权限 |
|---|---|
| 项目管理与项目接入中心 | `req:project:list`、`req:project:add`、`req:project:edit`、`req:project:remove`、`req:project:query`、`req:repo:add`、`req:repo:edit`、`req:variant:add`、`req:variant:edit` |
| 项目索引 | `req:index:list`、`req:index:import` |
| 仓库管理 | `req:repo:list`、`req:repo:add`、`req:repo:edit`、`req:repo:remove` |
| 客户定制线 | `req:variant:list`、`req:variant:add`、`req:variant:edit`、`req:variant:remove` |
| 模块功能点 | `req:module:list`、`req:module:add`、`req:module:edit`、`req:module:remove` |
| 需求列表 | `req:demand:list`、`req:demand:add`、`req:demand:edit` |
| Agent 交接资料 | `req:package:list`、`req:package:save` |
| 使用统计 | `req:stats:view` |

## 项目初始化契约

- 项目管理菜单是项目初始化主入口；新增和修改项目均打开 `ProjectInitWizard` 项目维护弹窗，组件文件名沿用历史命名但交互不再使用分步向导。
- 项目维护弹窗调用 `/requirement/project/init/**`，一次维护项目基础信息、前后端仓库、分支配置和初始化状态。
- 仓库分区默认提供前端仓库和后端仓库两行，仓库数据只提交仓库名称、仓库类型、团队共享 Git 远端、默认分支、状态和索引状态字段；不得提交个人本机绝对路径。
- 分支分区维护 `branchLabel` 和 `baselineBranch`：`branchLabel` 是需求人员可见中文标签，`baselineBranch` 是真实 Git 分支名；前端可继续兼容 `variantName`、`variantCode`、`customerName` 等历史字段。
- 项目列表会按项目调用 `/requirement/project/init/{projectId}` 派生初始化状态，状态口径来自 `initChecklist`：项目信息、仓库、分支配置、模块知识和索引。
- 保存成功后刷新项目列表；用户选择“保存并进入接入中心”时跳转 `src/views/requirement/project/detail.vue`。

## 项目索引契约

- 项目接入中心读取 `/requirement/repository/list`、`/requirement/variant/list`、`/requirement/index/batch/list`、`/requirement/index/module/tree` 展示并维护团队共享仓库、客户基线、索引批次和模块知识库。
- 项目接入中心可以新增和编辑仓库、客户基线；仓库表单只维护团队共享 Git 远端、仓库类型和默认分支，客户基线表单维护客户线编码、客户名称、统一基线分支和分支策略。
- 新建或编辑需求时，选择项目、客户线和模块后调用 `/requirement/index/impact/suggest`，请求携带 `projectId`、`variantId`、`moduleId`、`moduleCode`；后端按所选客户线基线分支和最新索引批次返回 `pages`、`apis`、`tables`、`permissions`、`documents` 五类候选影响面。
- 前端只展示和追加影响面推荐，不覆盖用户已输入内容。
- 前端不得向后端提交个人本机绝对路径；本地仓库目录只允许作为用户本次操作中的临时输入。

## Agent 交接资料 Artifact 类型

前端 tab key 必须使用以下值：

```text
requirement_draft
requirement
plan
context_manifest
branch_execution_brief
execution_prompt
review_prompt
execution_report
review_report
```

生成草稿资料接口使用 `POST /requirement/package/generate/{demandId}`。保存 artifact 仍使用 `POST /requirement/package/{demandId}/{artifactType}`，保存行为必须追加新版本。

## 数据粒度

- 基础管理列表一行对应一个后端实体。
- 需求列表一行对应一个需求。
- 索引批次列表一行对应一次仓库索引上传。
- 模块知识库一行对应一个索引模块或功能点。
- 影响面推荐一行对应一个页面、接口、数据表、权限或相关文档。
- Agent 交接资料页面当前 tab 展示一个 artifact type 的最新版本，保存时追加新版本。
- 统计总览展示全平台聚合数据，项目排行一行对应一个项目，用户使用一行对应一个用户。
