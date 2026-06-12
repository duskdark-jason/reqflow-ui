# 需求流转与填报体验调整执行计划

## 输入文件

- 需求说明：`requirement.md`
- 相关契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 相关模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 目标客户与基线分支：通用/main
- 影响模块：需求管理/需求列表、需求管理/需求详情、需求管理/需求维护页签、隐藏页签返回、系统布局与品牌、角色菜单权限体验
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`

## 实施步骤

1. 布局与品牌：移除 `Settings` 抽屉入口，固定 `sideTheme=theme-light`、`navType=1`，改造侧边栏 logo 组件和 logo 资产，覆盖 AC-001。
2. 隐藏页签返回：增强 `$tab.closePage` 支持 `activeMenu` 父菜单回退，并修改需求详情/维护返回逻辑，覆盖 AC-002。
3. 需求维护表单：删除创建人 ID 输入；新增不展示编号；修改编号用文本展示；保存 payload 删除 `creatorId`、新增时删除 `demandNo`，覆盖 AC-003、AC-004。
4. 需求列表与详情：列表操作列移除 Agent 资料；详情页内嵌 Agent 交接资料包、按阶段展示需求分析、需求设计、执行任务和返修任务指令入口；复制指令只使用后端返回内容；详情上下文的 Agent 交接资料只读展示当前需求文档，覆盖 AC-005、AC-011、AC-012、AC-013、AC-014。
5. 状态体验：统一前端状态枚举、标签、按钮和流转确认文案，增加待验收返修与返修后提交验收动作，覆盖 AC-006、AC-010。
6. 视觉返修：修正 logo 图文对齐，统一流程按钮状态风格，并将详情流程确认按钮放入头部状态区，覆盖 AC-008、AC-009。
7. 角色菜单与按钮体验：更新前端文档说明需求人员和开发人员菜单可见性，并让列表和详情流程按钮按角色和按钮权限过滤，首页快捷入口按权限过滤，确保详情页资料包读取依赖需求详情而非独立 Agent 资料菜单入口，覆盖 AC-017、AC-019、AC-020。
8. 指令与资料包再调整：将详情页复制按钮文案改为生成需求分析、需求设计、执行任务和返修任务，资料包区块标题使用当前需求标题，按文档分组展示并修复底部重叠，覆盖 AC-015、AC-016。
9. 需求填报附件：维护页增加需求来源文本输入、业务背景普通文本框和附件上传；粘贴图片或文件时作为附件保存；详情页展示来源、纯文本背景和附件，覆盖 AC-018。
10. 文档同步：更新模块文档和契约文档，覆盖 AC-007、AC-017、AC-018、AC-019、AC-020。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 修改 | `src/settings.js` | 固定目标布局默认值。 |
| 修改 | `src/store/modules/settings.js` | 忽略历史布局缓存中的非目标布局。 |
| 修改 | `src/layout/index.vue`、`src/layout/components/Navbar.vue`、`src/layout/components/index.js` | 移除布局设置抽屉入口。 |
| 修改 | `src/layout/components/Sidebar/Logo.vue`、`src/layout/components/Sidebar/index.vue`、`src/assets/styles/sidebar.scss`、`src/assets/styles/variables.scss` | 白色左侧菜单和新 logo 展示。 |
| 新增/修改 | `src/assets/logo/*` | 新 ReqFlow logo 资产。 |
| 修改 | `src/plugins/tab.js` | 隐藏页签返回父菜单。 |
| 修改 | `src/views/requirement/demand/index.vue` | 操作列和状态按钮调整。 |
| 修改 | `src/views/requirement/demand/maintain.vue` | 表单体验和保存 payload 调整。 |
| 修改 | `src/views/requirement/demand/detail.vue` | 详情状态动作、Agent 资料摘要、MCP 指令复制和资料历史版本。 |
| 修改 | `src/api/requirement/demand.js` | 状态 API 封装保持或补充语义方法。 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md`、`docs/ai-harness/contracts/requirement-platform-ui.md` | 长期规则同步。 |

## 模块知识库计划

- 更新 `docs/ai-harness/modules/requirement-platform.md`，记录固定白色左侧布局、新 logo、隐藏页签返回父菜单、需求列表操作列、返修流程、角色菜单预期和资料版本展示。
- 更新 `docs/ai-harness/contracts/requirement-platform-ui.md`，记录需求新增/修改字段、状态文案、按钮分区、MCP 指令、内嵌资料包和角色菜单约束。

## 代码注释计划

- 在 `src/plugins/tab.js` 的父菜单回退逻辑旁补充简短注释，说明隐藏页签使用 `activeMenu` 而非最近 tab 的原因。
- 在需求状态常量附近补充简短注释，说明状态值兼容旧数据但主流程使用新文案。

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`
- L1 编译/构建：`npm run build:prod`
- L2 单元/契约：当前前端无独立单测脚本，以构建和静态搜索验证 payload/状态枚举。
- L3 运行态冒烟：启动前端后用浏览器检查布局、返回、需求列表、维护和详情页面；若后端不可用，则用页面打开和 console 检查记录风险。
- L4 跨端/端到端（可选）：本次不新增 Playwright 测试；真实保存流由后端 companion 单测和后续本地联调补验。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-001 | 布局与品牌 | 浏览器冒烟、`npm run build:prod` |
| AC-002 | 隐藏页签返回 | 浏览器多 tab 冒烟 |
| AC-003 | 需求维护表单 | 代码检查 payload、浏览器表单冒烟 |
| AC-004 | 需求维护表单 | 浏览器编辑页冒烟 |
| AC-005 | 需求列表与详情 | 浏览器列表/详情冒烟 |
| AC-006 | 状态体验 | 代码检查状态枚举、浏览器按钮冒烟 |
| AC-007 | 文档同步 | `sh scripts/check-docs.sh` |
| AC-008 | 视觉返修 | 浏览器截图、`npm run build:prod` |
| AC-009 | 详情动作分区 | 浏览器详情冒烟、代码检查 |
| AC-010 | 返修状态流转 | 代码检查状态枚举、后端 companion 单测 |
| AC-011 | 历史版本和阶段指令入口 | 浏览器详情冒烟、接口冒烟 |
| AC-012 | 阶段指令 token 展示边界 | 浏览器详情冒烟、接口内容检查、代码检查 |
| AC-013 | Agent 交接资料详情聚焦模式 | 浏览器打开 `/requirement/package?demandId=...` 检查按钮和文档展示 |
| AC-014 | 详情内嵌资料包并去重 | 浏览器详情页检查只存在统一资料包区域 |
| AC-015 | 指令和状态文案拆分 | 代码检查状态枚举、详情页冒烟 |
| AC-016 | 资料包嵌入详情且不重叠 | 浏览器详情页桌面/移动截图检查 |
| AC-017 | 角色菜单和按钮体验文档 | 文档复核、权限契约检查、代码静态复核 |
| AC-018 | 需求来源文本、背景文本和附件上传 | `npm run build:prod`、代码静态复核、浏览器新增/详情页冒烟 |
| AC-019 | 首页快捷入口权限过滤 | 构建、代码静态复核 |
| AC-020 | 删除按钮和流程权限隔离 | 构建、后端 companion 单测 |
| AC-021 | 结论选择、补充说明和资料包阶段标签 | `npm run build:prod`、代码静态复核、后端 companion 单测 |

## 执行约束

- 本需求使用任务分支 `feature/req-016-demand-flow-ux`，不在 `main` 直接实现。
- 不新增前端依赖，不改无关菜单和工具页。
- 完成修改和验证后直接 commit；merge、push、rebase 仍需用户确认。
