# Codex 安装脚本命令前端需求说明

## 背景

当前 MCP 管理页只在创建或重置结果弹窗里展示长 JSON 格式的 `codexSetupPackage`。用户希望展示不同平台可复制安装命令，形式接近 markdown 代码块，并允许关闭弹窗后在当前页面会话内重复打开复制。

## 目标

- 创建或重置 Key 后，结果弹窗优先展示多平台安装命令。
- 每个平台命令以代码块样式展示，并提供单独复制按钮。
- 命令中的 Key 使用当次响应的 `plainKey` 填充，但不写入列表、本地存储或 URL。
- 关闭弹窗后，工具栏提供“重新打开安装命令”按钮，当前页面会话内可重复打开复制。
- 长 JSON 安装包保留为高级配置/调试信息，不作为主展示。

## 范围

本次包含：

- 调整 `src/views/requirement/mcpKey/index.vue` 的结果弹窗展示。
- 新增当前会话内最近安装结果的重新打开入口。
- 同步 UI 契约和模块 harness。

本次不包含：

- 页面顶部常驻展示 MCP 配置。
- 持久化保存明文 Key。
- 实际运行安装脚本或调用 MCP tool。

## 影响范围

- 接口/API：前端消费后端 `codexSetupPackage.installCommands`。
- 数据库/SQL：否。
- 权限/菜单：否。
- 页面/交互：是，MCP 管理结果弹窗和工具栏。
- 导出/异步/任务：否。

## 验收标准

- AC-FE-001：创建/重置结果弹窗展示 `codexSetupPackage.installCommands`，每个平台一块代码区域，显示平台名称和语言标识。
- AC-FE-002：每个平台命令可单独复制，复制内容用 `plainKey` 替换 `${REQFLOW_MCP_KEY}` 占位符。
- AC-FE-003：关闭结果弹窗后，只要当前页面会话仍保留最近结果，工具栏可重新打开安装命令；刷新页面后不保留明文 Key。
- AC-FE-004：长 JSON 安装包降级为高级配置/调试区域，不再是主复制入口。
- AC-FE-005：构建、文档检查、harness 检查和空白检查通过。

## Companion 关联

- companion spec：`reqflow-be docs/specs/active/2026-06-10-REQ-011-Codex安装脚本命令`
- 关联分支：`feature/REQ-20260610-011-codex-install-scripts`

## 客户与分支

- 目标客户：通用
- 基线分支：main
- 任务分支：feature/REQ-20260610-011-codex-install-scripts

## 约束与假设

- 明文 Key 只来自创建或重置响应；列表和详情接口不会返回明文 Key。
- 当前页面会话内可重复打开复制，页面刷新后需要重新创建或重置 Key 才能拿到明文。
