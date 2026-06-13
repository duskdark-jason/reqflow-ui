# MCP多客户端安装支持需求说明

## 背景

后端 MCP Key 创建响应扩展为多客户端安装包后，前端需要从单一 Codex 命令展示升级为统一安装指令展示。普通弹窗不再按 Codex、Claude Code、Trae、Qoder、CodeBuddy、OpenCode 分组展示，具体客户端材料只保留在高级 JSON 中。

## 目标

- MCP Key 结果弹窗展示明文 Key。
- 按 `codexSetupPackage.installCommands` 展示一组统一安装指令。
- 不在普通弹窗中展示客户端分组、MCP 配置片段或全局 skill 单独安装命令。
- 复制包含 `${REQFLOW_MCP_KEY}` 的统一安装脚本时要求明文 Key。
- 完整 `codexSetupPackage` 仅作为高级配置/调试信息保留。

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

- AC-001：弹窗只渲染 `installCommands` 统一安装指令。
- AC-002：弹窗不按客户端分组展示普通安装内容。
- AC-003：复制统一安装脚本时替换 `${REQFLOW_MCP_KEY}`，没有明文 Key 时提示用户填写。
- AC-004：完整安装包仍可在高级配置/调试信息中复制。
- AC-005：前端静态测试覆盖统一安装指令结构。
- AC-006：前端 harness 文档同步统一指令展示规则。

## Companion 关联

- companion spec：`../reqflow-be/docs/specs/done/REQ-020-MCP多客户端安装支持`
- 关联分支：`../reqflow-be` 使用 `feature/req-020-mcp-multi-client-setup`

## 客户与分支

- 目标客户：通用
- 基线分支：main
- 任务分支：feature/req-020-mcp-multi-client-setup
