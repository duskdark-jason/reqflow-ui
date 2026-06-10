# MCP管理配置入口删除前端执行计划

## 输入文件

- 需求说明：`docs/specs/active/2026-06-10-REQ-010-MCP管理配置入口删除/requirement.md`
- 相关契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 相关模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 目标客户与基线分支：通用/main
- 影响模块：需求管理、MCP 管理
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`

## 实施步骤

1. 页面收敛：删除 `src/views/requirement/mcpKey/index.vue` 顶部配置区、`mcpConfig` 状态、`getConfig` 调用和结果弹窗中的 Codex 配置/全局 Skill 包，覆盖 AC-UI-001、AC-UI-003。
2. API 清理：删除 `src/api/requirement/mcpKey.js` 的 `getMcpKeyConfig` 封装，并移除页面导入，覆盖 AC-UI-002。
3. 文档同步：更新模块和 UI 契约，记录页面只在创建/重置弹窗展示一次性 Key 与安装包，覆盖 AC-UI-004。
4. 验证收尾：运行前端构建、文档检查和 harness 完成检查；如无法运行 L3，记录原因和补验方式。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 修改 | `src/views/requirement/mcpKey/index.vue` | 删除常驻配置区，收敛创建/重置结果弹窗 |
| 修改 | `src/api/requirement/mcpKey.js` | 删除配置查询 API 封装 |
| 修改 | `src/views/index.vue` | 首页快捷入口文案从 MCP 配置收敛为 MCP 管理 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 更新 MCP 管理模块说明 |
| 修改 | `docs/ai-harness/contracts/requirement-platform-ui.md` | 更新前端页面契约 |
| 新增 | `docs/specs/active/2026-06-10-REQ-010-MCP管理配置入口删除/*` | 本次需求阶段文档 |

## 模块知识库计划

- 更新 `docs/ai-harness/modules/requirement-platform.md` 的 MCP 管理入口说明和不变量。
- 更新 `docs/ai-harness/contracts/requirement-platform-ui.md` 的 MCP 管理页面契约。

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`
- L1 编译/构建：`npm run build:prod`
- L2 单元/契约：当前前端无独立单测脚本，使用 `npm run build:prod` 覆盖静态契约。
- L3 运行态冒烟：如后端和登录态环境可用，打开 MCP 管理页检查常驻配置区删除、创建/重置弹窗展示；若当前环境无法联调，在执行报告记录后续补验环境。
- L4 跨端/端到端：本次未改保存、导出、异步或跨端核心流程，不默认执行。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | 页面收敛 | 代码审查、构建 |
| AC-UI-002 | API 清理 | `rg getMcpKeyConfig src` 无命中、构建 |
| AC-UI-003 | 页面收敛 | 代码审查、构建 |
| AC-UI-004 | 文档同步 | `sh scripts/check-docs.sh` |

## 执行约束

- 只修改 MCP 管理相关页面、API 封装和 harness 文档。
- 不修改权限、菜单 SQL、数据库或无关需求平台页面。
- Execution Agent 按计划实现后必须提交，并自动进入 Review。
