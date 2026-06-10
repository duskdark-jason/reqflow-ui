# Codex 安装指令包前端执行计划

## 输入文件

- 页面：`src/views/requirement/mcpKey/index.vue`
- API：`src/api/requirement/mcpKey.js`
- 模块 harness：`docs/ai-harness/modules/requirement-platform.md`
- 接口契约：`docs/ai-harness/contracts/requirement-platform-ui.md`

## 实施步骤

1. 更新 MCP 管理页面数据结构，保留 `codexSetupPackage`。
2. 增加或复用 JSON 格式化方法，把安装指令包对象格式化为 JSON 字符串。
3. 在配置区增加 Codex 安装包展示和复制按钮。
4. 在创建/重置结果弹窗增加 Codex 安装包展示和复制按钮。
5. 同步模块 harness 和接口契约。
6. 运行前端构建、文档检查和 harness init。

## 验证计划

- L1 构建：`npm run build:prod`
- L0 文档：`sh scripts/check-docs.sh`
- Harness 当前阶段：`sh scripts/check-harness.sh init --spec docs/specs/active/2026-06-10-REQ-009-Codex安装指令包`
- 空白检查：`git diff --check`

## 验收 ID 覆盖

| 验收 ID | 验证方式 |
|---|---|
| AC-FE-001 | 页面代码检查 + 构建 |
| AC-FE-002 | 页面代码检查 + 构建 |
| AC-FE-003 | 空值兜底格式化 |
| AC-FE-004 | 构建、文档和 harness 检查 |
