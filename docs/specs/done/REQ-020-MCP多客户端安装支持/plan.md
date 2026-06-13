# MCP多客户端安装支持执行计划

## 输入文件

- 需求说明：`requirement.md`
- 后端 companion spec：`../reqflow-be/docs/specs/done/REQ-020-MCP多客户端安装支持`
- 相关模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 相关 UI 契约：`docs/ai-harness/contracts/requirement-platform-ui.md`

## 实施步骤

1. 读取后端多客户端安装包结构，确认 `clientInstructions` 字段。
2. 调整 MCP Key 结果弹窗，只展示统一安装指令。
3. 补充复制逻辑：MCP 命令/配置需要明文 Key，skill 命令不需要。
4. 保留旧 `installCommands` 回退。
5. 更新前端 harness 文档。
6. 运行生产构建和文档检查。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 修改 | `src/views/requirement/mcpKey/index.vue` | 多客户端安装指令展示 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 前端模块规则 |
| 修改 | `docs/ai-harness/contracts/requirement-platform-ui.md` | UI 契约 |
| 修改 | `docs/ai-harness/search-map.md` | 搜索导航 |

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`。
- L1 构建：`npm run build:prod`。
- L3 运行态冒烟：不执行，未启动后端和前端服务。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-001 | 前端实现 | 代码检查、构建 |
| AC-002 | 前端实现 | 代码检查、构建 |
| AC-003 | 前端实现 | 代码检查、构建 |
| AC-004 | 前端实现 | 代码检查、构建 |
| AC-005 | 前端实现 | 代码检查、构建 |
| AC-006 | 文档同步 | 文档检查 |
