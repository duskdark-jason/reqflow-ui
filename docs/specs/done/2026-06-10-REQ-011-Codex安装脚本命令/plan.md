# Codex 安装脚本命令前端执行计划

## 输入文件

- `src/views/requirement/mcpKey/index.vue`
- `docs/ai-harness/contracts/requirement-platform-ui.md`
- `docs/ai-harness/modules/requirement-platform.md`

## 实施步骤

1. Red：用静态检查断言页面必须出现安装命令代码块、平台命令复制入口和重新打开安装命令入口，覆盖 AC-FE-001 到 AC-FE-004。
2. Green：在结果弹窗中把 `installCommands` 渲染为多平台代码块，保留明文 Key 展示。
3. Green：新增命令渲染方法，把 `${REQFLOW_MCP_KEY}` 占位符替换为当次 `plainKey`。
4. Green：新增每个平台单独复制按钮。
5. Green：新增当前页面会话内最近结果缓存和工具栏“重新打开安装命令”按钮。
6. 文档：同步 UI 契约和模块 harness。
7. 验证：运行前端构建、文档检查、harness init 和空白检查，覆盖 AC-FE-005。

## 验证计划

- L0 静态检查：`rg "install-command-card|copyInstallCommand|reopenInstallCommands|advanced-install-package" src/views/requirement/mcpKey/index.vue`
- L1 构建：`npm run build:prod`
- L0 文档：`sh scripts/check-docs.sh`
- Harness 当前阶段：`sh scripts/check-harness.sh init --spec docs/specs/active/2026-06-10-REQ-011-Codex安装脚本命令`
- 空白检查：`git diff --check`

## 验收 ID 覆盖

| 验收 ID | 验证方式 |
|---|---|
| AC-FE-001 | 静态检查 + 构建 |
| AC-FE-002 | 静态检查 + 构建 |
| AC-FE-003 | 静态检查 + 构建 |
| AC-FE-004 | 静态检查 + 构建 |
| AC-FE-005 | 构建、文档和 harness 检查 |
