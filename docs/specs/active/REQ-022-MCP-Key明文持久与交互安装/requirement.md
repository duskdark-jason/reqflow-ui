# MCP Key明文持久与交互安装需求说明

## 背景

MCP 管理页已展示统一安装指令。用户补充要求：

- 统一执行命令执行后可供用户选择安装工具。
- MCP 管理页面不用展示明文 Key 和 Key 前缀两个字段。
- 后端返回的明文 Key 仍要用于渲染可复制安装命令。
- 下次打开使用指令时，安装命令仍要带真实明文 Key，不能隐藏或写入缺失占位。
- MCP 请求地址配置直接加到 MCP 管理页中，并且只有管理员可以配置。
- MCP 管理页不需要“重新打开安装命令”工具栏按钮。
- 本地 Harness `--spec` 只能检查 `docs/specs/active/` 中的执行中需求，避免执行过程误写 `docs/specs/done/`。

## 目标

- MCP 管理列表不展示“明文Key”和“Key前缀”列。
- 结果弹窗不单独展示明文 Key 字段，只展示统一安装指令和高级配置。
- 复制统一安装命令时仍使用响应中的 `plainKey` 替换 `${REQFLOW_MCP_KEY}`。
- 使用指令响应兼容顶层 `plainKey` 和 `key.plainKey`，保证再次打开也能渲染真实命令。
- 前端普通区域不按客户端分组展示安装内容，用户通过统一命令脚本交互选择工具。
- 管理员在 MCP 管理页通过“配置请求地址”按钮打开弹窗，读取和保存 MCP 请求地址 `publicHost`；普通开发人员不展示入口。
- 不展示“重新打开安装命令”按钮，需要再次查看命令时从 Key 行点击“使用指令”。
- 文档和静态检查同步防回归。
- 收紧 `check-harness.sh --spec` 目标路径，拒绝 `docs/specs/done/` 并补充自测。

## 非目标

- 不改变后端 Key 权限。
- 不在前端本地持久化明文 Key。
- 不做真实客户端安装联调。

## 验收标准

- AC-001：列表不展示明文 Key、Key 前缀或哈希。
- AC-002：结果弹窗不单独展示明文 Key 字段。
- AC-003：结果弹窗只展示顶层 `installCommands[]`，不按客户端分组展示普通安装内容。
- AC-004：复制命令时仍能用 `plainKey` 渲染 `${REQFLOW_MCP_KEY}`。
- AC-005：静态检查覆盖上述展示约束。
- AC-006：`check-harness.sh complete --spec docs/specs/done/...` 必须失败，并提示使用 `docs/specs/active/`。
- AC-007：下次打开使用指令时，前端可从顶层 `plainKey` 或 `key.plainKey` 渲染真实明文 Key，复制命令不得包含隐藏或缺失提示。
- AC-008：MCP 管理页仅管理员展示“配置请求地址”入口，点击后以弹窗调用 `/requirement/mcp/key/config` 读取和保存配置，普通开发人员不展示入口。
- AC-009：MCP 管理页不展示“重新打开安装命令”按钮，也不保留对应状态或方法。

## 影响范围

- 接口：是，新增调用管理员 `/requirement/mcp/key/config` 读写接口。
- 数据库：否，数据库变更由 companion 后端 spec 处理。
- 权限：是，MCP 请求地址配置仅管理员可见可保存。
- 页面展示：是，MCP 管理页隐藏明文 Key、Key 前缀字段和“重新打开安装命令”按钮，管理员额外通过弹窗配置请求地址。
- 流程门禁：是，`check-harness.sh --spec` 只允许指向 `docs/specs/active/`。
