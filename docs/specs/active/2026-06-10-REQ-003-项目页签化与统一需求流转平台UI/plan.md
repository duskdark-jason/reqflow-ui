# 项目页签化与统一需求流转平台UI 前端执行计划

## 输入文件

- 需求说明：`requirement.md`
- 前端契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 前端模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 前端领域说明：`docs/domains/requirement-platform/README.md`
- 后端 companion：`../reqflow-be/docs/specs/active/2026-06-10-REQ-003-项目页签化与统一需求流转平台UI`
- 目标客户与基线分支：通用 / main

## 设计方向

前端视觉采用浅色需求管理工作台风格：以白色和低饱和冷灰为主体，使用清晰蓝绿作为主操作与状态色，减少模板化大面积深色侧栏的压迫感。页面布局强调“列表进入、页签承载、详情分区、可复制指令”，让项目维护和知识库查看都能在 TagsView 中保留上下文。

## 实施步骤

1. 路由与入口：在 `src/router/index.js` 增加项目维护和知识库详情隐藏路由，覆盖 AC-UI-001、AC-UI-004。
2. 项目列表入口：修改 `src/views/requirement/project/index.vue`，移除 `ProjectInitWizard` dialog 挂载逻辑，把新增、维护动作改为 `$tab.openPage` 或 `$router.push` 打开页签，覆盖 AC-UI-001。
3. 项目维护页签：将 `src/views/requirement/project/components/ProjectInitWizard.vue` 的主体能力迁移或重命名为页签页面，例如 `src/views/requirement/project/maintain.vue`，保留原保存、校验、Git 地址推导和初始化摘要，覆盖 AC-UI-002。
4. 初始化指令展示：在项目维护页和项目接入中心中把分支 `MCP Key` 列调整为“初始化指令”，展示复制按钮、token 前缀、安全提示和后端返回的指令内容，覆盖 AC-UI-003。
5. 知识库详情页签：新增 `src/views/requirement/project/knowledge.vue`，按 `projectId + variantId` 加载项目初始化上下文、索引批次和模块知识，提供模块、页面、接口、表、权限、文档分区，覆盖 AC-UI-004。
6. 项目接入中心整理：修改 `src/views/requirement/project/detail.vue`，取消项目分支表格 expand 详情，把知识库入口改为“查看知识库”页签按钮，并同步 MCP 索引指引文案，覆盖 AC-UI-003、AC-UI-004。
7. 登录页视觉：修改 `src/views/login.vue` 和必要图片资源，制作浅色需求流转背景图或 CSS 背景，桌面端登录框右移，移动端居中，覆盖 AC-UI-005。
8. 首页看板：重写 `src/views/index.vue`，复用 `src/api/requirement/statistics.js` 展示需求总览、执行资料状态、项目排行和活跃用户，覆盖 AC-UI-007。
9. 品牌清理：修改 `.env.development`、`.env.production`、`.env.staging`、`vue.config.js`、`package.json`、`src/settings.js`、`src/layout/components/Navbar.vue`、`src/layout/components/Sidebar/Logo.vue` 等用户可见品牌信息，移除若依源码和文档入口，覆盖 AC-UI-006。
10. Harness 更新：同步 `docs/ai-harness/contracts/requirement-platform-ui.md`、`docs/ai-harness/modules/requirement-platform.md` 和 `docs/domains/requirement-platform/README.md`，覆盖 AC-UI-008。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 修改 | `src/router/index.js` | 增加项目维护和知识库详情隐藏路由 |
| 修改 | `src/views/requirement/project/index.vue` | 项目新增和维护改为打开页签 |
| 新增或重构 | `src/views/requirement/project/maintain.vue` | 项目维护页签，承载原弹窗主体能力 |
| 新增 | `src/views/requirement/project/knowledge.vue` | 分支知识库详情页签 |
| 修改 | `src/views/requirement/project/detail.vue` | 移除表格展开详情，增加知识库页签入口和指令展示 |
| 修改 | `src/views/login.vue` | 登录页浅色背景图和右移登录框 |
| 修改 | `src/views/index.vue` | 后台首页改造为需求流转看板 |
| 修改 | `.env.development`、`.env.production`、`.env.staging`、`vue.config.js`、`package.json`、`src/settings.js` | 系统名称和品牌信息 |
| 修改 | `src/layout/components/Navbar.vue`、`src/layout/components/Sidebar/Logo.vue` | 移除若依入口，展示统一需求流转平台 |
| 修改 | `docs/ai-harness/contracts/requirement-platform-ui.md` | 同步前端契约 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 同步模块不变量 |
| 修改 | `docs/domains/requirement-platform/README.md` | 同步领域说明 |

## 任务级执行清单

1. 新增隐藏路由 `/requirement/project/maintain` 和 `/requirement/project/knowledge`，路由名分别使用 `RequirementProjectMaintain`、`RequirementProjectKnowledge`，权限沿用 `req:project:query`，维护页新增态按钮权限仍在页面内区分。
2. 修改项目列表，删除 `<project-init-wizard>` 挂载和 `initOpen` 状态；`handleAdd` 使用 `$tab.openPage("新增项目", "/requirement/project/maintain")`；`handleUpdate` 使用项目名生成页签标题并传 `projectId`。
3. 新建 `src/views/requirement/project/maintain.vue`，从 `ProjectInitWizard` 迁移表单、仓库、分支、摘要、校验和保存逻辑；页面根节点使用 `app-container project-maintain-page`，不再包含 `el-dialog`。
4. 在维护页顶部加入页签式页面头、初始化进度条和操作区；底部按钮改为页面内固定操作条或右上操作按钮，避免弹窗 footer 依赖。
5. 在分支表中把 `MCP Key` 列改为“初始化指令”：展示后端 `initInstruction.content` 的复制按钮、token 前缀和安全提示；缺少后端字段时用 `mcpKey` 构造只读降级提示，但完成态必须以后端字段为准。
6. 新建 `src/views/requirement/project/knowledge.vue`，根据 query 加载 `getProjectInit`、`listIndexBatch`、`listIndexModule`，顶部展示项目和分支摘要，下方用 `el-tabs` 展示模块知识、索引批次、页面、接口、数据表、权限、文档。
7. 修改项目接入中心，移除项目分支表格 expand 列，增加“查看知识库”和“复制初始化指令”按钮；模块知识库 tab 保留列表能力但不再作为唯一详情入口。
8. 重写登录页视觉：浅色背景图可以先用 CSS 多层线性渐变和流程节点图案实现，桌面端 `.login` 使用 `justify-content: flex-end`，登录框右侧留白，移动端居中。
9. 重写首页看板：复用统计 API，增加需求总览卡、执行资料漏斗、项目排行表、活跃用户表和近期行动入口；移除若依说明、外链和更新日志。
10. 品牌清理：把 `VUE_APP_TITLE`、构建标题、页脚、包描述、导航右侧若依源码和文档入口替换为统一需求流转平台相关信息；不改底层 `src/utils/ruoyi.js` 文件名。
11. 更新前端 harness 和领域文档，说明项目维护页签、指令字段、知识库详情页和品牌边界。
12. 运行构建、文档检查和页面冒烟；页面冒烟至少覆盖桌面登录页、移动登录页、首页、项目管理、维护页、接入中心和知识库详情页。

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`；完成态使用 `sh scripts/check-harness.sh complete --spec docs/specs/active/2026-06-10-REQ-003-项目页签化与统一需求流转平台UI`。
- L1 编译/构建：`npm run build:prod`。
- L2 单元/契约：当前前端无独立单元测试脚本，以生产构建覆盖静态契约；指令字段通过后端 companion 测试和页面冒烟验证。
- L3 运行态冒烟：启动前端后打开登录页、首页、项目管理、项目维护页签、项目接入中心、分支知识库详情页签，检查 console 和 network 无本次变更相关错误。
- L4 跨端/端到端：后端启动并具备测试数据后，验证项目保存、指令复制、知识库详情过滤和统计看板真实数据；如果当前环境无法联调，在执行报告记录启动命令、错误摘要和后续补验方式。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | 路由与入口、项目列表入口 | 页面冒烟、TagsView 检查 |
| AC-UI-002 | 项目维护页签 | 页面冒烟、保存联调 |
| AC-UI-003 | 初始化指令展示 | 页面冒烟、复制内容检查、后端契约测试 |
| AC-UI-004 | 知识库详情页签、项目接入中心整理 | 页面冒烟、按分支过滤检查 |
| AC-UI-005 | 登录页视觉 | 桌面和移动 viewport 截图检查 |
| AC-UI-006 | 品牌清理 | 文案搜索、页面冒烟 |
| AC-UI-007 | 首页看板 | 页面冒烟、统计接口联调 |
| AC-UI-008 | Harness 更新 | `sh scripts/check-docs.sh` 和 harness 完成态检查 |

## 执行约束

- 本计划获认可后仍只代表计划阶段完成；开始实现必须另有明确执行授权。
- Execution Agent 必须从 `main` 创建 ASCII 任务分支，建议 `feature/REQ-20260610-003-project-tabs-ui`，不得直接在 `main` 实现。
- 前端不得新增依赖或升级 Element UI、Vue、ECharts。
- 初始化指令复制内容不得把人员访问 Key、登录 token 或本机路径混入项目分支定位 token。
- 若后端 companion 尚未提供指令字段，前端应先用兼容字段降级展示，但完成态必须回到后端契约一致。
- Execution Agent 不得自我 Review；进入 Review 必须有明确 Review 授权或独立 Review 请求。
