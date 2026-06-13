# 首页MCP管理入口修复执行计划

## 目标

修复开发人员从首页点击 MCP 管理进入 404 的问题，并用静态检查防止路径再次写错。

## 执行步骤

1. 对照首页快捷入口、后端菜单 SQL 和 MCP 管理组件路径，定位 404 根因。
2. 新增 `scripts/test-dashboard-quick-actions.js`，断言首页 MCP 管理快捷入口必须为 `/requirement/mcp-key`，且不得保留旧路径 `/requirement/mcpKey`。
3. 先运行新增检查，确认当前实现失败。
4. 修改 `src/views/index.vue` 的 MCP 管理快捷入口路径。
5. 更新 `docs/ai-harness/modules/requirement-platform.md`、`docs/ai-harness/contracts/requirement-platform-ui.md` 和 `docs/ai-harness/search-map.md`。
6. 运行新增静态检查、前端生产构建、文档检查和 harness complete。

## 代码注释计划

- 本次为常量路径修复和静态检查，不新增代码注释。

## 验证计划

- L2 静态回归：`node scripts/test-dashboard-quick-actions.js`
- L1 构建：`npm run build:prod`
- L0 文档/流程：`sh scripts/check-docs.sh && sh scripts/check-harness.sh complete --spec docs/specs/done/REQ-021-首页MCP管理入口修复`
- L3 运行态：当前未启动后端登录态，使用静态路径检查和生产构建覆盖本次 404 根因；真实登录态可在联调环境补验。

## 验收映射

| 验收 ID | 验证方式 |
|---|---|
| AC-001 | `node scripts/test-dashboard-quick-actions.js` |
| AC-002 | `node scripts/test-dashboard-quick-actions.js` |
| AC-003 | `node scripts/test-dashboard-quick-actions.js` |
| AC-004 | `npm run build:prod` |
| AC-005 | `check-docs` 和 harness complete |
