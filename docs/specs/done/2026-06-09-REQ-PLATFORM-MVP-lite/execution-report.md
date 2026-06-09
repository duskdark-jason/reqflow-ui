# 需求管理平台 MVP-lite 前端执行报告

- 状态：前端实现、review 返修、dev server/proxy 冒烟和浏览器页面验证已完成
- 分支：feature/REQ-PLATFORM-MVP-lite
- commit：已提交，详见当前分支 git log

## 已完成

- 已在前端仓库创建 active spec。
- 已补齐 `src/api/requirement/**` API 封装。
- 已补齐项目、仓库、客户定制线、模块功能点、需求、执行包和统计页面。
- 已将需求表单字段对齐后端 `ReqDemand` 实体字段。
- 已将需求状态枚举对齐后端小写状态机。
- 已将执行包生成接口对齐为 `/requirement/package/generate/{demandId}`。
- 已补齐 `branch_execution_brief` 执行包 tab，并按后端 `versionNo` 展示版本。
- 已将统计页卡片、项目排行和用户使用字段对齐后端统计接口。
- 已根据 review 修正状态流转入口、客户线必填、执行包旧内容残留、统计百分比显示和仓库 harness 状态值。

## 计划内待完成

- 无。

## 验证记录

| 层级 | 验收 ID | 命令 | 结果 |
|---|---|---|---|
| L0 | AC-UI-001 | `sh scripts/check-docs.sh` | 通过：文档检查通过 |
| L0 | AC-UI-001 | `sh scripts/check-harness.sh init` | 通过：Harness 检查通过（init 模式） |
| L1 | AC-UI-003 | `npm run build:prod` | 通过：执行包页面进入生产构建 |
| L1 | AC-UI-004 | `npm run build:prod` | 通过：统计页面进入生产构建 |
| L1 | AC-UI-005 | `npm run build:prod` | 通过：Build complete；存在模板体积 warning |
| 环境 | AC-UI-005 | `npm install --foreground-scripts` | 通过：安装 1479 个包；Node 24 下存在旧依赖 engine/deprecated warning |
| L3 | AC-UI-002 | `npm run dev -- --port 8081` | 通过：前端 dev server 编译成功，Local 地址 `http://localhost:8081/` |
| L3 | AC-UI-002 | `curl http://127.0.0.1:8081/` | 通过：页面 HTML 返回 HTTP 200 |
| L3 | AC-UI-002 | `curl http://127.0.0.1:8081/dev-api/captchaImage` | 通过：dev proxy 透传后端，返回 `captchaEnabled=false` |
| L3 | AC-UI-002 | `curl -X POST http://127.0.0.1:8081/dev-api/login` | 通过：dev proxy 登录返回 `code=200` |
| L3 | AC-UI-002 | 临时 Playwright Core + 本机 Chrome 执行登录和需求页面冒烟 | 通过：admin 登录成功，项目管理、需求列表、需求执行包、使用统计页面均可访问；console error 0、page error 0、request failed 0、HTTP 4xx/5xx 0 |

## 偏差说明

- 根目录设计和开发计划保留，子仓库 active spec 用于执行追踪。
- 当前前端模板无 lock 文件，依赖安装后生成的 `package-lock.json` 被项目 `.gitignore` 忽略，未纳入提交。

## Review 返修记录

- 正常编辑表单移除状态编辑，状态菜单只展示后端允许的下一状态。
- 客户线改为必填，避免提交后触发数据库非空约束失败。
- 执行包加载和生成前清空旧 artifact，避免跨需求残留内容。
- 统计百分比按后端百分数展示，不再二次乘 100。
- 统计总览补充执行报告和 Review 报告卡片。
- 仓库 harness 状态值改为后端小写值。

## 剩余风险

- 浏览器冒烟中出现 5 条若依模板外链路由 warning：`[vue-router] Non-nested routes must include a leading slash character`，来源为模板外链 `http://ruoyi.vip`，未影响需求页面加载。
- 生产构建存在老若依/Vue2 模板常见的 chunk 体积 warning，未阻塞构建。
