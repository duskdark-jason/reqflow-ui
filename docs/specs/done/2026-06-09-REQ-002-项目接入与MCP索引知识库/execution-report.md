# 项目接入与 MCP 索引知识库前端执行报告

## 执行结论

- 状态：已完成
- 分支：feature/REQ-002-project-index-mcp
- commit：无，普通模式未提交

## 版本关闭说明

- 关闭时间：2026-06-09
- 用户接受：结束当前版本。
- 当前版本完成范围：项目接入中心基础页面、仓库/客户基线维护入口、MCP 索引指引、需求表单影响面推荐入口、Agent 交接资料文案调整。
- 未完成原始设想：后台项目管理菜单仍未形成“新增项目时一体化维护项目名称、前后端仓库、统一客户基线/分支、模块功能点初始化”的完整管理员工作流。当前实现是项目接入中心内的维护入口，不是项目管理菜单内的一体化初始化向导。
- 后续建议：另起需求专门建设“项目管理初始化向导/菜单重构”，把新增项目、前后端仓库、客户基线、模块功能点提取、索引初始化状态做成连续可用的后台菜单流程。

## 修改摘要

| 路径 | 修改说明 |
|---|---|
| `src/api/requirement/index.js` | 新增索引批次、模块知识、影响面推荐和备用导入 API |
| `src/router/index.js` | 新增项目接入中心和需求详情隐藏路由 |
| `src/views/requirement/project/index.vue` | 项目列表增加“接入”入口 |
| `src/views/requirement/project/detail.vue` | 新增项目接入中心，展示基础信息、维护仓库和客户基线、展示 MCP 索引指引、索引批次和模块知识库 |
| `src/views/requirement/demand/index.vue` | 新增影响面推荐加载、展示和追加能力 |
| `src/views/requirement/demand/detail.vue` | 将执行包入口文案调整为 Agent 交接资料 |
| `src/views/requirement/package/index.vue` | 将页面文案调整为 Agent 交接资料 |
| `docs/ai-harness/contracts/requirement-platform-ui.md` | 同步索引接口、权限和数据粒度 |
| `docs/ai-harness/modules/requirement-platform.md` | 同步项目接入中心、影响面推荐和 Agent 交接资料语义 |

## 验证结果

| 层级 | 验收 ID | 命令或方式 | 结果 |
|---|---|---|---|
| L0 | AC-UI-006 | `sh scripts/check-docs.sh` | 通过 |
| L0 | AC-UI-006 | `sh scripts/check-harness.sh complete --spec docs/specs/active/2026-06-09-REQ-002-项目接入与MCP索引知识库` | 通过 |
| L1 | AC-UI-001, AC-UI-002, AC-UI-003, AC-UI-004, AC-UI-005 | `npm run build:prod` | 通过；存在构建产物体积 warning |
| L2 | AC-UI-003, AC-UI-004 | API 封装和构建检查 | 通过；当前项目无独立单元测试脚本 |
| L3 | AC-UI-001, AC-UI-003, AC-UI-005 | `npm run dev -- --port 18081`；`curl -I -s http://localhost:18081/`；`playwright-cli open http://localhost:18081/`；`playwright-cli snapshot`；`playwright-cli console`；`playwright-cli requests` | dev server 启动成功；根页面 200；浏览器进入登录页；console 0 error/0 warning；`captchaImage` 请求 200 |
| L4（可选） | AC-UI-003, AC-UI-004 | 前后端联调影响面推荐和需求保存 | 未执行；当前执行 agent 未持有可使用的登录态账号/token，且本机 8080 已有既有 Java 进程监听，未对其执行状态性登录/保存操作 |

## 运行态证据

- 执行目录：`reqflow-ui` 仓库根目录
- 启动命令：`npm run dev -- --port 18081`
- profile/env/mode：Vue CLI dev server，临时端口 `18081`
- 检查命令：`npm run build:prod`、`curl -I -s http://localhost:18081/`、`playwright-cli open http://localhost:18081/`、`playwright-cli snapshot`、`playwright-cli console`、`playwright-cli requests`
- 原始错误摘要：生产构建存在既有体积 warning；dev server 编译启动成功；无登录态下页面重定向到 `/login?redirect=%2Findex`；console 无错误；登录后项目接入中心和需求表单业务交互需测试账号/token 补验。
- screenshot/trace 路径：`.playwright-cli/page-2026-06-09T13-53-52-760Z.yml`、`.playwright-cli/console-2026-06-09T13-53-52-440Z.log`
- 是否代表用户环境：否，仅代表当前执行 agent 环境
- 后续补验环境：具备测试账号/token 的本地或测试环境，继续做项目接入中心维护、影响面推荐和需求保存联调

## 计划偏差

- L3 已完成前端启动、登录页、console 和基础 network 冒烟；登录态页面业务操作和 L4 跨端联调因当前执行 agent 未持有可使用的测试账号/token 未执行。

## Review 返修记录

| 修复 ID | 处理结果 | 说明 | 验证证据 |
|---|---|---|---|
| RF-001 | 已修复 | 前端推荐请求继续传 `projectId`、`variantId`、`moduleId`、`moduleCode`，并同步后端客户基线和最新批次契约。 | `npm run build:prod` 通过；后端 `ReqRepositoryIndexServiceImplTest` 覆盖客户基线推荐 |
| RF-002 | 已修复 | 项目接入中心新增仓库和客户基线新增/编辑入口，明确只保存共享 Git 远端和基线分支，不保存本机目录。 | `npm run build:prod` 通过；Playwright 登录页冒烟 console 0 error |
| RF-003 | 已处理 | 补充前端 dev server 和浏览器冒烟；登录态页面业务操作需在具备测试账号/token 的环境补验。 | `npm run dev -- --port 18081` 启动成功；`playwright-cli snapshot/console/requests` 完成 |

## 风险与后续

- 项目接入中心依赖后端 `/requirement/index/**` 接口和菜单权限落库，未执行真实登录态联调前不能确认菜单权限和接口响应完全可用。
- 影响面推荐只追加到现有文本字段，后续如需结构化保存影响面，需要扩展需求表字段或新增关联表。
