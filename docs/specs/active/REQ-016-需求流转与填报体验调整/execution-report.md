# 需求流转与填报体验调整执行报告

## 执行结论

- 状态：执行完成
- 分支：feature/req-016-demand-flow-ux
- commit：本分支提交记录为准

## 修改摘要

| 路径 | 修改说明 |
|---|---|
| `src/settings.js`、`src/store/modules/settings.js` | 固定白色左侧菜单布局，忽略历史布局缓存中的非目标布局。 |
| `src/layout/index.vue`、`src/layout/components/Navbar.vue`、`src/layout/components/index.js` | 移除用户可见布局设置入口。 |
| `src/layout/components/Sidebar/Logo.vue`、`src/assets/logo/reqflow-logo.svg` | 新增 ReqFlow 品牌 logo 和左侧菜单品牌展示。 |
| `src/plugins/tab.js` | 隐藏页签关闭时优先回退到 `parentPath`、`backPath` 或 `meta.activeMenu` 父菜单。 |
| `src/views/requirement/demand/status.js` | 新增需求状态文案、标签、主流程按钮和编辑权限判断。 |
| `src/views/requirement/demand/index.vue` | 列表操作列移除 Agent 资料入口，补充状态动作按钮和父页签打开参数。 |
| `src/views/requirement/demand/maintain.vue` | 新增不展示创建人 ID/需求编号，编辑编号文本展示，保存时剔除系统字段。 |
| `src/views/requirement/demand/detail.vue` | 详情页展示 MCP 指令入口、Agent 交接资料入口和需求设计/执行方案摘要。 |
| `src/api/requirement/demand.js` | 增加需求 MCP 编排指令接口封装。 |
| `docs/ai-harness/modules/requirement-platform.md`、`docs/ai-harness/contracts/requirement-platform-ui.md` | 同步模块和 UI 契约。 |

## 模块知识库沉淀

- 影响模块：需求管理/需求列表、需求管理/需求详情、需求管理/需求维护页签、隐藏页签返回、系统布局与品牌
- 模块知识库动作：更新
- 模块知识库文档：docs/ai-harness/modules/requirement-platform.md
- 无需更新原因：不适用

## 数据库变更沉淀

- 数据库影响：无
- SQL 脚本路径：无
- 数据库文档路径：无
- 数据库变更说明：无
- 无需更新原因：前端不修改表结构或 SQL。

## 代码注释处理

- 注释动作：新增必要注释
- 注释文件：`src/plugins/tab.js`
- 处理说明：父页签回退逻辑保留一处简短注释，说明隐藏页签优先返回父菜单，避免多标签场景跳到最近无关标签。

## 验证结果

| 层级 | 验收 ID | 命令或方式 | 结果 |
|---|---|---|---|
| L0 | AC-007 | `sh scripts/check-docs.sh` | 通过 |
| L1 | AC-001~AC-006 | `npm run build:prod` | 通过；仅有包体积提示。 |
| L2 | AC-003、AC-006 | `git diff --check`、代码静态复核 | 通过；保存 payload 剔除 `creatorId`、`demandNo`、`status`，状态枚举集中到 `status.js`。 |
| L3 | AC-001~AC-006 | 浏览器冒烟 | 通过；登录、需求列表、新增页、详情页、详情返回父菜单均无 console error、page error 或 request failure。 |
| L4（可选） | AC-001~AC-006 | 真实新增/状态流转写操作 | 未执行；本次避免改动本地已有业务数据，写入规则由后端 companion 单测覆盖。 |

## 运行态证据

- 执行目录：当前子仓库根目录
- 启动命令：`npm run dev -- --port 8081`
- profile/env/mode：本地开发模式，后端代理到本机 RuoYi 服务。
- 检查命令：`npm run build:prod`、`git diff --check`、浏览器访问 `http://localhost:8081/`
- 原始错误摘要：无页面脚本错误；构建仅报告静态资源体积提示。
- screenshot/trace 路径：`docs/specs/active/REQ-016-需求流转与填报体验调整/artifacts/target-req016-login.png`、`docs/specs/active/REQ-016-需求流转与填报体验调整/artifacts/target-req016-home.png`、`docs/specs/active/REQ-016-需求流转与填报体验调整/artifacts/target-req016-demand.png`、`docs/specs/active/REQ-016-需求流转与填报体验调整/artifacts/target-req016-maintain.png`、`docs/specs/active/REQ-016-需求流转与填报体验调整/artifacts/target-req016-detail.png`
- 是否代表用户环境：否，仅代表当前执行 agent 环境
- 后续补验环境：本地或测试环境

## 验收覆盖

| 验收 ID | 执行结果 | 证据 |
|---|---|---|
| AC-001 | 已完成 | 固定白色左侧布局，首页截图确认无布局设置入口。 |
| AC-002 | 已完成 | 详情页携带 `parentPath` 返回后 URL 为 `/requirement/demand`。 |
| AC-003 | 已完成 | 新增页不展示创建人 ID 和需求编号，保存 payload 删除系统字段。 |
| AC-004 | 已完成 | 编辑态需求编号使用文本容器展示，表单只读保护。 |
| AC-005 | 已完成 | 列表操作列移除 Agent 资料，详情页展示 Agent 交接资料和资料摘要。 |
| AC-006 | 已完成 | 状态枚举和主按钮统一在 `status.js`，列表/详情冒烟通过。 |
| AC-007 | 已完成 | 模块文档和 UI 契约文档已同步，`check-docs` 通过。 |

## 计划偏差

- 额外移除了顶部导航/布局设置相关入口，避免用户从缓存或菜单再次切换出目标左侧布局。
- 详情页增加需求设计与执行方案摘要区，并通过 companion 后端接口复制 MCP 编排指令。

## Review 返修记录

- 无需返修；占位 RF-001 已由真实复核报告替换，不存在遗留返修项。

## 风险与后续

- 历史需求数据仍可能保留旧日期编号；新建编号由后端 companion 覆盖为 `REQ-001` 风格。
- 本次未新增前端自动化 E2E，真实新增和状态推进写操作建议在测试环境补一轮端到端验收。
