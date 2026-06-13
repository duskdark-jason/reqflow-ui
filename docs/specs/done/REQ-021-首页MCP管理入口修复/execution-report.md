# 首页MCP管理入口修复执行报告

## 执行结论

- 状态：已完成
- 分支：feature/req-020-mcp-multi-client-setup
- commit：待提交
- 流程模式：本地 Harness 模式
- MCP 回写：未接入 MCP，本地文件闭环

## 修改摘要

| 路径 | 修改说明 |
|---|---|
| `src/views/index.vue` | 将首页 MCP 管理快捷入口从 `/requirement/mcpKey` 修正为 `/requirement/mcp-key`。 |
| `scripts/test-dashboard-quick-actions.js` | 新增首页快捷入口静态回归检查。 |
| `docs/ai-harness/modules/requirement-platform.md` | 记录首页快捷入口必须使用后端菜单路由 path。 |
| `docs/ai-harness/contracts/requirement-platform-ui.md` | 记录 MCP 管理组件路径和路由 path 的区别。 |
| `docs/ai-harness/search-map.md` | 增加首页快捷入口检查脚本入口。 |

## 模块知识库沉淀

- 影响模块：首页、MCP 管理页、权限与菜单
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`
- 搜索导航更新：已更新 `docs/ai-harness/search-map.md`

## 数据库变更沉淀

- 数据库影响：无
- SQL 脚本路径：无
- 数据库文档路径：无
- 无需更新原因：本次只修改前端首页快捷入口常量和文档，不涉及持久化结构、SQL、Mapper 或数据口径。

## 代码注释处理

- 注释动作：无需新增
- 注释文件：无
- 处理说明：路径规则已沉淀到 harness 文档和静态检查脚本，不需要在页面代码中新增注释。

## 验证结果

| 层级 | 验收 ID | 命令或方式 | 结果 |
|---|---|---|---|
| L2 | AC-001、AC-002、AC-003 | `node scripts/test-dashboard-quick-actions.js` | 修复前失败，修复后通过 |
| L1 | AC-004 | `npm run build:prod` | 通过，存在历史体积告警 |
| L0 | AC-005 | `sh scripts/check-docs.sh && sh scripts/check-harness.sh complete --spec docs/specs/done/REQ-021-首页MCP管理入口修复` | 通过 |
| L3 | AC-001 | 不适用 | 未启动后端登录态，静态路径检查覆盖本次 404 根因 |

## 运行态证据

- 执行目录：当前前端子仓库根目录
- 启动命令：未启动服务
- profile/env/mode：静态检查和生产构建验证
- 原始错误摘要：新增静态检查在修复前失败，提示首页 MCP 管理快捷入口必须使用 `/requirement/mcp-key`
- screenshot/trace 路径：无
- 是否代表用户环境：否，仅代表当前执行 agent 环境
- 后续补验环境：如需真实运行态，可在已登录开发人员账号下打开首页并点击 MCP 管理。

## 计划偏差

无。

## Review 返修记录

无。
