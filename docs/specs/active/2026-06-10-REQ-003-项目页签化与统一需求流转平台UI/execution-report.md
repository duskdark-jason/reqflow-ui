# 项目页签化与统一需求流转平台UI 前端执行报告

## 执行摘要

已将项目维护从 dialog 改为 TagsView 页签，新增分支知识库详情页签，并把分支主展示字段从裸 `MCP Key` 调整为后端 `initInstruction.content` 初始化指令复制入口。登录页、后台首页、导航可见入口和构建标题已调整为“统一需求流转平台”的浅色需求管理风格。

本次补充将需求新增/编辑表单的项目分支选择收束到已初始化完成的分支：表单按项目读取初始化上下文，只展示 `totalModules > 0`、`indexedRepositoryCount > 0` 且 `unindexedRepositoryCount = 0` 的分支；查询筛选仍保留全部分支，便于查历史需求。

- 分支：`feature/REQ-20260610-003-project-tabs-ui`
- 提交：`d555249`（feat: 项目维护页签化与平台视觉改造）、`967ec04`（fix: 移除项目接入中心残留维护弹窗）、`5134cd0`（feat: 收束需求表单分支选择）
- Review 阶段：未授权，未写 Review 报告，未将 spec 切换为 complete

## 修改内容

- `src/router/index.js`：新增 `/requirement/project/maintain` 和 `/requirement/project/knowledge` 隐藏路由。
- `src/views/requirement/project/index.vue`：新增和维护动作改为打开项目维护页签，移除 `ProjectInitWizard` dialog 状态。
- `src/views/requirement/project/maintain.vue`：新增项目维护页签，承载项目、仓库、分支、初始化摘要、保存和保存后进入接入中心。
- `src/views/requirement/project/knowledge.vue`：新增分支知识库详情页签，按 `projectId + variantId` 展示模块知识、索引批次和初始化指令。
- `src/views/requirement/project/detail.vue`：移除分支表格展开详情，增加“知识库”页签入口和初始化指令复制按钮。
- `src/views/login.vue`、`src/assets/images/login-reqflow-bg.jpg`：重做登录页背景图和右侧登录框。
- `src/views/index.vue`：重写后台首页为需求流转看板。
- `src/views/requirement/demand/index.vue`：新增/编辑需求的项目分支下拉改为从项目初始化上下文读取，只展示已初始化完成的分支，并在无可用分支时提示先完成初始化。
- `.env.*`、`vue.config.js`、`package.json`、`src/settings.js`、`src/layout/components/Navbar.vue` 等：清理用户可见若依入口和系统标题。
- `docs/ai-harness/**`、`docs/domains/**`：同步页签化、初始化指令、知识库详情、需求提交分支收束和品牌契约。

## 验收覆盖

| 验收项 | 结果 |
|---|---|
| AC-UI-001 | 通过。项目新增和维护入口改为 `$tab.openPage` 打开项目维护页签，不再挂载项目维护 dialog。 |
| AC-UI-002 | 通过。项目维护页签保留项目基础信息、代码仓库、项目分支、初始化摘要、保存和保存后进入接入中心能力。 |
| AC-UI-003 | 通过。项目维护页和项目接入中心使用 `initInstruction.content` 作为初始化指令复制内容，旧 `mcpKey` 仅兼容降级。 |
| AC-UI-004 | 通过。新增分支知识库详情页签，项目接入中心分支表不再使用展开行展示知识库详情。 |
| AC-UI-005 | 通过。整体 UI 改为浅色需求管理工作台风格，登录页使用业务背景图，桌面端登录框右移。 |
| AC-UI-006 | 通过。用户可见系统名、页脚、导航外链和模板说明已替换为统一需求流转平台语义；底层 `ruoyi` 工具文件名保留兼容。 |
| AC-UI-007 | 通过。后台首页改为需求流转看板，复用统计接口展示总览、项目排行、活跃用户和快捷入口。 |
| AC-UI-008 | 通过。前端 harness 和领域文档已同步本次页面、契约和验证路径变化。 |
| AC-UI-009 | 通过。需求表单只展示已初始化完成的分支；无可用分支时显示先完成分支初始化提示。 |

## 验证记录

| 层级 | 命令或检查 | 结果 |
|---|---|---|
| L0 | `git diff --check` | 通过；仅有 CRLF/LF 换行提示，无空白错误。 |
| L0 | `sh scripts/check-docs.sh` | 通过。 |
| L0 | `sh scripts/check-harness.sh init` | 通过。 |
| L2 | `npm run build:prod` | 通过；保留模板项目已有 asset/entrypoint size warning。 |
| L3 | Playwright CLI 打开 `http://localhost:8081/login` | 通过；页面标题为“统一需求流转平台”，console 仅 HMR/Vue Devtools 提示。 |
| L3 | Playwright CSS/布局断言 | 通过；桌面端背景图命中 `login-reqflow-bg`，登录框右侧偏移约 128px；390px 移动端表单左右各 24px。 |

## 运行态证据

- 执行目录：前端仓库根目录
- 启动命令：`npm run dev -- --port 8081`
- 连通性检查命令：`playwright_cli.sh -s=reqflow-ui open http://localhost:8081/login`
- 浏览器或 Playwright 命令：`playwright_cli.sh -s=reqflow-ui snapshot`、`playwright_cli.sh -s=reqflow-ui run-code "..."`
- console/network 错误摘要：无业务错误；dev server 仅输出 HMR 等开发提示。
- 当前执行 agent 环境：本机前端 dev server；未接入登录态后端数据，本轮未宣称项目维护、接入中心和知识库详情的后端联调完成。

## 后续风险

- 项目维护保存、知识库过滤和初始化指令复制仍建议在具备登录态和测试数据的环境补做跨端联调。
- 本次没有做 Review 阶段；如要进入 complete，需要用户授权 Review Agent 产出 `review-report.md` 后再运行完成态 harness。
