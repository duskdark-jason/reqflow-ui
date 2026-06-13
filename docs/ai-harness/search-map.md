# Harness 功能导航

本文件是初次进入 `reqflow-ui` 时的第一层搜索索引。先用关键词定位页面、API、契约、流程或 companion 后端入口，再进入代码搜索。新增、拆分或重命名模块文档、契约文档、菜单、页面、路由、API 封装、权限或核心交互时，必须同步维护本文件。

## 使用顺序

1. 先读 `docs/ai-harness/harness-index.json`，确认本仓库角色和 companion 后端仓库。
2. 再按下方关键词索引定位长期文档和代码入口。
3. 如果关键词没有命中，先读 `docs/ai-harness/README.md` 和 `docs/ai-harness/change-checklist.md`，再补充本文件。

## 关键词索引

| 关键词 | 功能/场景 | 入口文档 | 代码入口 |
|---|---|---|---|
| 需求管理 | 项目、需求、执行包、MCP、统计的前端总入口 | `docs/ai-harness/modules/requirement-platform.md` | `src/views/requirement/`、`src/api/requirement/` |
| 项目管理 | 项目列表、项目维护页签、初始化状态 | `docs/ai-harness/modules/requirement-platform.md` | `src/views/requirement/project/index.vue`、`maintain.vue` |
| 分支知识库 | 项目分支模块树、索引批次、初始化指令 | `docs/ai-harness/modules/requirement-platform.md` | `src/views/requirement/project/knowledge.vue`、`src/api/requirement/index.js` |
| 需求列表 | 需求新增、编辑、状态按钮、详情和指令复制 | `docs/ai-harness/modules/requirement-platform.md` | `src/views/requirement/demand/index.vue`、`maintain.vue`、`detail.vue` |
| 需求设计确认 | `plan_ready` 多轮补充调整、确认需求设计、回到待生成需求设计 | `docs/ai-harness/modules/requirement-platform.md` | `src/views/requirement/demand/detail.vue`、`status.js` |
| Agent 交接资料 | 需求草稿、可行性评估、需求设计、执行计划、执行报告、Review 报告展示 | `docs/ai-harness/contracts/requirement-platform-ui.md` | `src/views/requirement/package/index.vue`、`src/views/requirement/demand/detail.vue` |
| MCP 管理 | 人员 MCP Key、明文 Key 渲染安装命令、多客户端交互安装命令和 MCP 请求地址配置 | `docs/ai-harness/modules/requirement-platform.md` | `src/views/requirement/mcpKey/index.vue`、`src/api/requirement/mcpKey.js` |
| 项目接入初始化 | 复制初始化指令、actionToken、初始化状态展示 | `docs/process/platform-key-workflow.md` | `src/api/requirement/projectInit.js`、项目维护页签 |
| 本地 Harness 模式 | 未接入 MCP 或无 Key 时的本地需求、执行、Review、返修闭环 | `docs/process/local-harness-workflow.md` | `docs/specs/active/`、`scripts/check-harness.sh` |
| MCP 接入模式 | 已接入需求平台后的需求设计、开发、回写和合并归档 | `docs/process/platform-key-workflow.md` | 后端 `McpService`、前端指令复制页面 |
| search-map | 面向模型的关键词导航和拆分触发 | `docs/ai-harness/search-map.md` | `scripts/check-harness.sh` |
| 检查脚本 | 文档占位符、harness 初始化、Review、完成态门禁 | `docs/process/agent-workflow.md` | `scripts/check-docs.sh`、`scripts/check-harness.sh` |
| 权限与菜单 | RuoYi 菜单、按钮权限、首页快捷入口过滤 | `docs/ai-harness/modules/requirement-platform.md` | `src/router/index.js`、`src/store/modules/permission.js`、`src/views/index.vue`、`scripts/test-dashboard-quick-actions.js` |
| 生产路径 | `/reqflow/` 静态访问、`/reqflow-api` API 前缀、开发 `/dev-api` 代理 | `docs/ai-harness/contracts/requirement-platform-ui.md` | `.env.production`、`.env.development`、`vue.config.js` |

## 维护触发

- 新增或重命名 `docs/ai-harness/modules/*.md`、`contracts/*.md`、`decisions/*.md`。
- 新增或调整需求管理菜单、页面、路由、API 封装、权限标识、状态按钮或核心交互。
- 调整项目初始化、需求设计确认、多轮补充、MCP 管理、合并归档或 Agent 交接资料展示。
- 单个模块文档超过 300 行，或一个文档同时覆盖多个菜单目录时，拆分文档后必须迁移关键词。

## 拆分建议

- 需求管理前端模块继续变大时，优先按“项目管理/分支知识库”“需求列表/详情状态机”“MCP 管理”“Agent 交接资料”拆出独立模块文档。
- 接口字段、错误语义、UI 状态或角色权限复杂时，抽到 `docs/ai-harness/contracts/`。
- 长期交互边界、权限策略或发布路径变化时，抽到 `docs/ai-harness/decisions/`。
