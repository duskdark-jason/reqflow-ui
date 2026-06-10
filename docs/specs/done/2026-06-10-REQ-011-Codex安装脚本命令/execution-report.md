# Codex 安装脚本命令前端执行报告

## 执行结论

已完成前端 companion 展示：

- 创建或重置 Key 后，结果弹窗优先以代码块形式展示 `codexSetupPackage.installCommands`。
- 每个平台命令都有独立复制按钮，复制时用当次 `plainKey` 替换 `${REQFLOW_MCP_KEY}`。
- 工具栏新增“重新打开安装命令”，当前页面会话内可重复打开最近一次创建/重置结果复制命令。
- 完整 JSON 安装包降级到“高级配置/调试信息”折叠区。

提交：`337e36f feat: 展示Codex安装脚本命令`。

## 修改文件

| 文件 | 修改说明 |
|---|---|
| `src/views/requirement/mcpKey/index.vue` | 展示多平台安装命令、复制命令、会话内重复打开入口和高级配置折叠区。 |
| `docs/ai-harness/contracts/requirement-platform-ui.md` | 同步 MCP 管理页面安装命令展示契约。 |
| `docs/ai-harness/modules/requirement-platform.md` | 同步模块知识库不变量。 |

## 验收覆盖

| 验收 ID | 覆盖结果 |
|---|---|
| AC-FE-001 | 通过，结果弹窗按平台展示安装命令代码块。 |
| AC-FE-002 | 通过，复制命令时替换 `${REQFLOW_MCP_KEY}`。 |
| AC-FE-003 | 通过，`lastInstallResult` 支持当前页面会话内重复打开。 |
| AC-FE-004 | 通过，完整安装包移入高级配置/调试信息折叠区。 |
| AC-FE-005 | 已通过构建、文档检查、harness 检查和空白检查覆盖。 |

## 接口、权限和页面影响

- 接口/API：前端消费后端新增的 `codexSetupPackage.installCommands`。
- 权限：否。
- 数据库/SQL：否。
- 页面：是，MCP 管理创建/重置结果弹窗和工具栏。

## 验证结果

| 命令 | 结果 |
|---|---|
| `rg "install-command-card|copyInstallCommand|reopenInstallCommands|advanced-install-package" src/views/requirement/mcpKey/index.vue` | Red 阶段无输出失败；Green 后通过。 |
| `npm run build:prod` | 通过；存在既有 asset size / entrypoint size 警告。 |
| `sh scripts/check-docs.sh` | 通过，文档检查通过。 |
| `sh scripts/check-harness.sh init --spec docs/specs/active/2026-06-10-REQ-011-Codex安装脚本命令` | 通过，Harness 检查通过（init 模式）。 |
| `git diff --check` | 通过。 |

## Review 返修记录

- 未进入 Review。
