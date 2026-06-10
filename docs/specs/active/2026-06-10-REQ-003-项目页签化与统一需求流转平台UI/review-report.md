# 项目页签化与统一需求流转平台UI 前端 Review 报告

## Review 结论

结论：通过

当前实现满足前端验收要求，未发现阻断或有条件通过问题。按用户授权，Review 通过后允许合并到 `main`。

## 审查范围

- 分支：`feature/REQ-20260610-003-project-tabs-ui`
- 对比基线：`main..86c47d9`
- 项目维护页签：`src/views/requirement/project/index.vue`、`src/views/requirement/project/maintain.vue`
- 项目接入中心与知识库页签：`src/views/requirement/project/detail.vue`、`src/views/requirement/project/knowledge.vue`
- 需求表单分支收束：`src/views/requirement/demand/index.vue`
- 路由与入口：`src/router/index.js`、`src/layout/components/Navbar.vue`
- 品牌与看板：`src/views/login.vue`、`src/assets/images/login-reqflow-bg.jpg`、`src/views/index.vue`、`.env.*`、`src/settings.js`、`vue.config.js`
- 文档：前端 UI 契约、模块文档、领域文档和 spec 文档

## 问题清单

未发现阻断或重要问题。

剩余风险：

- 当前未执行带登录态的跨端浏览器联调，项目维护保存、知识库过滤、初始化指令复制和需求弹窗真实数据流建议在具备后端和测试账号的环境补验。
- 需求表单通过初始化上下文字段判断分支可提交，最终提交仍以后端 `ReqDemandServiceImpl` 的硬校验为准。
- 构建保留模板项目已有 asset/entrypoint size warning，本次未扩大为性能专项优化。

## 验收 ID 覆盖矩阵

| 验收 ID | 需求描述 | 实现证据 | 验证证据 | Review 结论 |
|---|---|---|---|---|
| AC-UI-001 | 项目新增和维护入口改为 TagsView 页签，不再使用维护 dialog | `project/index.vue` 使用 `$tab.openPage` 打开维护页 | `npm run build:prod`、执行报告 L3 登录页冒烟 | 通过 |
| AC-UI-002 | 项目维护页签保留项目、仓库、分支、初始化摘要和保存能力 | `project/maintain.vue` 聚合项目维护表单和初始化摘要 | `npm run build:prod` | 通过 |
| AC-UI-003 | 项目维护和接入中心使用初始化指令复制，旧 `mcpKey` 仅兼容降级 | `instructionContent` 优先读取 `initInstruction.content` | `npm run build:prod`、后端 token 测试 | 通过 |
| AC-UI-004 | 分支知识库独立页签，不再使用接入中心展开行承载详情 | `project/knowledge.vue`、`project/detail.vue.openKnowledge` | `npm run build:prod` | 通过 |
| AC-UI-005 | UI 改为浅色需求管理工作台风格 | 登录页、首页和项目维护页样式调整 | Playwright 登录页冒烟、`npm run build:prod` | 通过 |
| AC-UI-006 | 用户可见系统名、导航外链和模板说明替换为统一需求流转平台语义 | `.env.*`、`settings.js`、`Navbar.vue`、相关页面 | `npm run build:prod`、文案审查 | 通过 |
| AC-UI-007 | 后台首页改为需求流转看板 | `src/views/index.vue` 复用统计接口展示看板 | `npm run build:prod` | 通过 |
| AC-UI-008 | 前端 harness 和领域文档同步变化 | `docs/ai-harness/contracts/requirement-platform-ui.md`、`docs/ai-harness/modules/requirement-platform.md`、领域文档 | `sh scripts/check-docs.sh`、`sh scripts/check-harness.sh init` | 通过 |
| AC-UI-009 | 新增或编辑需求只能选择已初始化完成的项目分支 | `demand/index.vue` 读取 `getProjectInit`，仅展示 `totalModules > 0`、`indexedRepositoryCount > 0`、`unindexedRepositoryCount = 0` 的分支，提交前二次提示 | `npm run build:prod`、后端 `ReqDemandServiceImplTest` | 通过 |

## 验证评估

执行阶段已有验证覆盖构建、文档和登录页视觉冒烟：

- `npm run build:prod`：通过；保留已有 asset/entrypoint size warning。
- `git diff --check`：通过；仅有 CRLF/LF 换行提示，无空白错误。
- `sh scripts/check-docs.sh`：通过。
- `sh scripts/check-harness.sh init`：通过。
- Playwright 打开 `http://localhost:8081/login`：通过；标题为“统一需求流转平台”，console 仅 HMR/Vue Devtools 提示。

Review 后仍需重新执行 `check-harness.sh review` 和合并前后验证。

## 返修交接清单

无。

## 是否允许合并

允许。当前 Review 无阻断项和返修项。
