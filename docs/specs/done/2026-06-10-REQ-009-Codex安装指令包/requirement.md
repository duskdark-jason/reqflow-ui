# Codex 安装指令包前端需求说明

## 背景

后端 REQ-009 返回 `codexSetupPackage`，用于让 Codex 一次性理解 reqflow MCP 配置、全局 skill 安装和不要自动调用工具的边界。当前 MCP 管理页面已展示 MCP 地址、Codex 配置和全局 Skill 包，但缺少安装指令包的一键复制入口。

## 目标

- MCP 管理配置区展示后端返回的 Codex 安装指令包。
- 新增或重置 MCP Key 后的结果弹窗展示同一份 Codex 安装指令包。
- 复制内容使用格式化 JSON，便于 Codex 读取并按自身规范安装 MCP 配置和全局 skill。
- 保留已有 MCP 地址、Codex 配置和全局 Skill 包展示。

## 验收标准

- AC-FE-001：配置区展示 `codexSetupPackage` 格式化内容，并提供复制按钮。
- AC-FE-002：创建/重置结果弹窗展示 `codexSetupPackage` 格式化内容，并提供复制按钮。
- AC-FE-003：缺少该字段时页面稳定显示空文本，不影响原 MCP 地址、请求头、Codex 配置和全局 Skill 包复制。
- AC-FE-004：构建和 harness 检查通过。
