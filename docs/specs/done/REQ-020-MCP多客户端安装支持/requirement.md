# MCP多客户端安装支持需求说明

## 背景

后端 MCP Key 创建响应扩展为多客户端安装包后，前端需要从单一 Codex 命令展示升级为客户端分组展示，支持 Codex、Claude Code、Trae、Qoder、CodeBuddy、OpenCode，不增加其他客户端别名。

## 目标

- MCP Key 结果弹窗展示明文 Key。
- 按 `codexSetupPackage.clientInstructions` 分组展示客户端安装指令。
- 每个客户端展示 MCP 命令、MCP 配置片段、全局 skill 安装命令和说明。
- 复制包含 `${REQFLOW_MCP_KEY}` 的 MCP 命令或配置时要求明文 Key；复制 skill 安装命令不要求明文 Key。
- 保留历史 `installCommands` 兼容回退。

## 范围

本次包含：

- 修改 `src/views/requirement/mcpKey/index.vue` 的结果弹窗。
- 更新前端 harness 模块文档、UI 契约和搜索导航。

本次不包含：

- 不新增前端 API 文件。
- 不新增路由或菜单权限。
- 不执行真实客户端安装。

## 影响范围

- 接口/API：否，消费后端新增字段。
- 数据库/SQL：否。
- 权限/菜单：否。
- 页面/交互：是，MCP Key 结果弹窗多客户端展示。
- Harness 文档：是。

## 验收标准

- AC-001：弹窗能基于 `clientInstructions` 渲染 Codex、Claude Code、Trae、Qoder、CodeBuddy、OpenCode。
- AC-002：MCP 命令、MCP 配置片段和全局 skill 安装命令都有单独复制入口。
- AC-003：复制 MCP 命令或配置时替换 `${REQFLOW_MCP_KEY}`，没有明文 Key 时提示用户填写。
- AC-004：复制全局 skill 安装命令不要求明文 Key。
- AC-005：历史旧包没有 `clientInstructions` 时，仍回退展示旧 `installCommands`。
- AC-006：前端 harness 文档同步多客户端展示规则。

## Companion 关联

- companion spec：`../reqflow-be/docs/specs/done/REQ-020-MCP多客户端安装支持`
- 关联分支：`../reqflow-be` 使用 `feature/req-020-mcp-multi-client-setup`

## 客户与分支

- 目标客户：通用
- 基线分支：main
- 任务分支：feature/req-020-mcp-multi-client-setup
