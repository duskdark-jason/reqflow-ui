# MCP人员Key管理需求说明

## 背景

当前前端在项目接入中心展示项目分支级 MCP Key，用于 `publish_repository_index` 识别项目分支。用户需要一个独立的 MCP 管理菜单，为具体人员创建 MCP 访问 Key，并在同一页面展示 MCP 地址和 Codex 配置所需信息。

## 目标

- 新增“需求管理 / MCP 管理”菜单，只有分配 `req:mcp:key:*` 权限的角色可见；需求人员不分配该权限。
- 页面展示 MCP 地址、Header 名称和 Codex 配置提示。
- 页面支持查询、创建、停用/启用、重新生成和删除人员 MCP Key。
- 创建或重新生成成功后弹出一次性明文 Key 和配置片段，便于用户复制到 Codex。
- 列表不展示完整明文 Key，只展示前缀、绑定用户、状态、创建时间和最近使用时间。

## 范围

本次包含：

- 新增 API 封装 `src/api/requirement/mcpKey.js`。
- 新增页面 `src/views/requirement/mcpKey/index.vue`。
- 更新前端模块和接口契约 harness。
- 配合后端菜单 SQL 新增 `req:mcp:key:*` 权限点。

本次不包含：

- 不新增前端独立密钥存储或浏览器本地持久化。
- 不在页面展示完整历史明文 Key。
- 不改变项目接入中心已有项目分支 MCP Key 展示。

## 影响范围

- 接口/API：是，调用后端 `/requirement/mcp/key/**`。
- 数据库/SQL：否，数据库变更在后端 companion。
- 权限/菜单：是，页面依赖 `req:mcp:key:*`。
- 页面/交互：是，新增 MCP 管理页面和一次性 Key 弹窗。
- 导出/异步/任务：否。

## 契约与数据口径

### API 文件

`src/api/requirement/mcpKey.js`：

- `listMcpKey(query)` -> `GET /requirement/mcp/key/list`
- `getMcpKey(keyId)` -> `GET /requirement/mcp/key/{keyId}`
- `addMcpKey(data)` -> `POST /requirement/mcp/key`
- `updateMcpKey(data)` -> `PUT /requirement/mcp/key`
- `delMcpKey(keyIds)` -> `DELETE /requirement/mcp/key/{keyIds}`
- `regenerateMcpKey(keyId)` -> `POST /requirement/mcp/key/{keyId}/regenerate`
- `getMcpKeyConfig()` -> `GET /requirement/mcp/key/config`

### 页面数据

MCP Key 列表一行代表一个人员 Key 管理记录：

- 用户：`userId`、`userName`、`nickName`。
- Key：`keyId`、`keyName`、`keyPrefix`、`status`。
- 使用记录：`lastUsedTime`、`lastUsedIp`。
- 审计：`createBy`、`createTime`、`updateBy`、`updateTime`、`remark`。

一次性明文响应字段：

- `plainKey`：创建或重新生成时返回一次。
- `mcpAddress`：页面展示的 MCP 地址。
- `headerName`：固定为 `X-MCP-Key`。

## 验收标准

- AC-UI-001：拥有 `req:mcp:key:list` 的用户可以看到 MCP 管理菜单，未分配该权限的需求人员看不到菜单。
- AC-UI-002：页面顶部展示 MCP 地址、Header 名称和 Codex 配置提示，支持复制地址和配置片段。
- AC-UI-003：用户创建 Key 时必须选择人员和填写 Key 名称；创建成功后弹窗展示一次性明文 Key。
- AC-UI-004：列表只展示 Key 前缀和状态，不展示完整明文。
- AC-UI-005：停用/启用、重新生成和删除按钮按 `req:mcp:key:edit/remove` 权限显示，并在成功后刷新列表。
- AC-UI-006：前端契约和模块 harness 已同步记录新增页面和接口。

## Companion 关联

- companion spec：`../reqflow-be/docs/specs/active/2026-06-10-REQ-002-MCP人员Key管理`
- 关联分支：`feature/REQ-20260610-002-branch-module-depth`

## 客户与分支

- 目标客户：通用
- 基线分支：`feature/REQ-20260610-002-branch-module-depth`
- 任务分支：未创建，本次计划阶段沿用当前分支记录。

## 约束与假设

- 页面使用现有 RuoYi-Vue、Vue 2 和 Element UI，不引入新依赖。
- MCP 地址优先使用后端 `/requirement/mcp/key/config` 返回值；如果后端只返回相对路径，前端按当前访问源和 `VUE_APP_BASE_API` 组合展示。
- 系统用户选择可复用现有 `/system/user/list` 接口和权限；如执行阶段发现权限不足，应在计划内补充只读用户选择接口或调整为输入用户 ID。
