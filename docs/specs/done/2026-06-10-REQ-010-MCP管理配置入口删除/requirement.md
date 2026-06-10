# MCP管理配置入口删除前端需求说明

## 背景

MCP 管理页此前为了辅助配置，常驻展示 MCP 地址、请求头、Codex 配置、全局 Skill 包和 Codex 安装包。用户确认该页面不需要这些常驻配置入口，也不需要单独展示全局 Skill 包或 Codex 配置；创建和重置人员 MCP Key 后，只需要提供一次性复制材料，并可在结果弹窗展示 Codex 安装包内容。

## 目标

- 删除 MCP 管理页面顶部配置展示区，不再调用后端配置查询接口。
- 创建和重置结果弹窗保留明文 Key 复制入口，并展示 Codex 安装包内容与复制按钮。
- 弹窗不再单独展示或复制 MCP 地址、请求头、Codex 配置和全局 Skill 包。
- 更新前端 harness 契约，避免后续再把旧配置入口加回。

## 范围

本次包含：

- 调整 `src/views/requirement/mcpKey/index.vue`。
- 删除 `src/api/requirement/mcpKey.js` 中的配置查询 API 封装。
- 更新 `docs/ai-harness/modules/requirement-platform.md` 和 `docs/ai-harness/contracts/requirement-platform-ui.md`。

本次不包含：

- 修改 MCP Key 列表、用户选择、创建、修改、重置、删除的权限和基础流程。
- 修改数据库表、菜单 SQL 或角色授权。
- 做真实跨端联调；若当前环境未启动后端，记录后续补验方式。

## 影响范围

- 接口/API：是，前端不再调用 `/requirement/mcp/key/config`。
- 数据库/SQL：否。
- 权限/菜单：否，继续使用 `req:mcp:key:*`。
- 页面/交互：是，MCP 管理页面删除常驻配置区，创建/重置弹窗收敛展示。
- 导出/异步/任务：否。

## 契约与数据口径

- 列表接口：`GET /requirement/mcp/key/list`，保持不变。
- 用户选择接口：`GET /requirement/mcp/key/user-options`，保持不变。
- 创建接口：`POST /requirement/mcp/key`，返回一次性明文 Key 和 `codexSetupPackage`。
- 重置接口：`POST /requirement/mcp/key/{keyId}/regenerate`，返回一次性明文 Key 和 `codexSetupPackage`。
- 数据粒度：MCP Key 列表一行代表一个人员 Key；创建/重置弹窗代表一次性结果，不持久化明文 Key。

## 验收标准

- AC-UI-001：MCP 管理页不再展示 MCP 地址、请求头、Codex 配置、全局 Skill 包和页面顶部 Codex 安装包。
- AC-UI-002：前端不再导入或调用 `getMcpKeyConfig`，API 封装中不存在配置查询函数。
- AC-UI-003：创建和重置结果弹窗只展示明文 Key 与 Codex 安装包，底部只提供复制 Key、复制安装包和关闭按钮。
- AC-UI-004：前端 harness 文档同步记录新的页面契约。

## Companion 关联

- companion spec：`../reqflow-be/docs/specs/active/2026-06-10-REQ-010-MCP管理配置入口删除`
- 关联分支：`feature/REQ-20260610-010-mcp-key-config-cleanup`

## 客户与分支

- 目标客户：通用
- 基线分支：main
- 任务分支：feature/REQ-20260610-010-mcp-key-config-cleanup

## 约束与假设

- 创建/重置接口仍返回 `codexSetupPackage`，用于弹窗展示和复制。
- 前端不得把明文 Key 写入列表、查询参数或本地持久化。
