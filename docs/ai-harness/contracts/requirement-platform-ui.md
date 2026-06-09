# 需求管理平台前端接口调用契约

## 后端依赖

后端 companion 契约：`../../../../reqflow-be/docs/ai-harness/contracts/requirement-platform-api.md`。

## API 文件映射

| API 文件 | 后端路径 | 说明 |
|---|---|---|
| `project.js` | `/requirement/project` | 项目 CRUD |
| `repository.js` | `/requirement/repository` | 仓库 CRUD 和初始化指令入口 |
| `variant.js` | `/requirement/variant` | 客户定制线 CRUD |
| `module.js` | `/requirement/module` | 模块功能点 CRUD |
| `demand.js` | `/requirement/demand` | 需求列表、详情、保存和状态流转 |
| `package.js` | `/requirement/package` | 执行包列表、最新版本、保存新版本和生成草稿包 |
| `statistics.js` | `/requirement/statistics` | 使用统计 |

## 权限标识

| 页面 | 主要权限 |
|---|---|
| 项目管理 | `req:project:list`、`req:project:add`、`req:project:edit`、`req:project:remove` |
| 仓库管理 | `req:repo:list`、`req:repo:add`、`req:repo:edit`、`req:repo:remove` |
| 客户定制线 | `req:variant:list`、`req:variant:add`、`req:variant:edit`、`req:variant:remove` |
| 模块功能点 | `req:module:list`、`req:module:add`、`req:module:edit`、`req:module:remove` |
| 需求列表 | `req:demand:list`、`req:demand:add`、`req:demand:edit` |
| 需求执行包 | `req:package:list`、`req:package:save` |
| 使用统计 | `req:stats:view` |

## 执行包 Artifact 类型

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

生成草稿执行包接口使用 `POST /requirement/package/generate/{demandId}`。保存 artifact 仍使用 `POST /requirement/package/{demandId}/{artifactType}`，保存行为必须追加新版本。

## 数据粒度

- 基础管理列表一行对应一个后端实体。
- 需求列表一行对应一个需求。
- 执行包页面当前 tab 展示一个 artifact type 的最新版本，保存时追加新版本。
- 统计总览展示全平台聚合数据，项目排行一行对应一个项目，用户使用一行对应一个用户。
