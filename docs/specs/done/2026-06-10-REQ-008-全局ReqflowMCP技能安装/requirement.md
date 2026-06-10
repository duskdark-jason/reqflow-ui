# 全局 Reqflow MCP 技能安装前端需求说明

## 背景

后端 REQ-008 返回 `codexGlobalSkillPackage`，用于让 Codex 按自身全局 skill 规范安装 `reqflow-mcp`。当前 MCP 管理页面只展示 MCP 地址、请求头和 Codex MCP server 配置，用户复制配置时无法拿到全局 skill 包。

## 目标

- MCP 管理配置区展示后端返回的全局 Skill 包。
- 新增或重置 MCP Key 后的结果弹窗展示同一份全局 Skill 包。
- 复制内容使用格式化 JSON，便于 Codex 读取并按全局 skill 规范安装。

## 验收标准

- AC-FE-001：配置区展示 `codexGlobalSkillPackage` 格式化内容，并提供复制按钮。
- AC-FE-002：创建/重置结果弹窗展示 `codexGlobalSkillPackage` 格式化内容，并提供复制按钮。
- AC-FE-003：缺少该字段时页面稳定显示空文本，不影响原 MCP 地址、请求头和 Codex 配置复制。
- AC-FE-004：构建和 harness 检查通过。
