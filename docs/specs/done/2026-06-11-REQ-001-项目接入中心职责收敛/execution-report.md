# 项目接入中心职责收敛执行报告

## 执行摘要

已按方案一收敛项目接入中心职责：项目维护页继续负责配置和初始化指令主复制入口，项目接入中心改为只读状态面板，展示接入完成度、待处理项、仓库索引状态、项目分支状态、索引批次和模块知识库。

## 修改文件

| 路径 | 说明 |
|---|---|
| `src/views/requirement/project/index.vue` | 项目列表操作入口从“接入”调整为“接入状态”。 |
| `src/views/requirement/project/detail.vue` | 重构项目接入中心为状态总览、指标、待处理项、仓库状态、分支状态、索引批次和模块知识库视图；移除分支表格中的初始化指令主列。 |
| `scripts/test-access-center-status.js` | 新增静态契约检查，覆盖入口文案、状态总览、指令主列移除和维护/知识库入口。 |
| `docs/ai-harness/modules/requirement-platform.md` | 同步“项目维护=配置与指令，接入中心=状态观察”的长期模块规则。 |
| `docs/ai-harness/contracts/requirement-platform-ui.md` | 同步前端契约和空态/待处理项口径。 |
| `docs/domains/requirement-platform/README.md` | 同步领域当前状态说明。 |
| `docs/specs/done/2026-06-11-REQ-001-项目接入中心职责收敛/meta.md` | 记录执行、Review 和完成态收口信息。 |

## TDD 记录

- Red 命令：`node scripts/test-access-center-status.js`
- Red 结果：失败，错误为“项目列表操作入口必须明确为接入状态或接入中心，不能只显示‘接入’。”
- Green 命令：`node scripts/test-access-center-status.js`
- Green 结果：通过，输出“项目接入中心职责收敛静态检查通过”。

## 验收覆盖

| 验收 ID | 执行结果 |
|---|---|
| AC-UI-001 | 通过。项目列表操作入口已改为“接入状态”。 |
| AC-UI-002 | 通过。接入中心首屏展示接入完成度、指标和待处理项。 |
| AC-UI-003 | 通过。接入中心分支表不再展示“初始化指令”主列，提供“维护配置”入口回到维护页。 |
| AC-UI-004 | 通过。接入中心保留项目分支筛选、索引批次、模块知识库和知识库详情入口。 |
| AC-UI-005 | 通过。无仓库、无分支、缺模块知识、待索引和部分索引均进入待处理项。 |
| AC-UI-006 | 通过。模块文档、前端契约和领域说明已同步更新。 |
| AC-UI-007 | 通过。静态检查、文档检查、生产构建、Review harness、完成态 harness 和未登录状态下的本地前端冒烟已完成；真实登录态和后端数据态需要具备测试账号与后端服务后补验。 |

## 代码注释处理

- 注释动作：新增
- 处理说明：在 `src/views/requirement/project/detail.vue` 的接入完成度计算前补充说明，明确完成口径来自模块知识和仓库索引，不是单个状态字段。

## 模块知识库动作

- 动作：更新
- 文档：`docs/ai-harness/modules/requirement-platform.md`
- 同步说明：已同步项目列表入口语义、接入中心只读状态面板、初始化指令主入口归属和维护页/接入中心职责边界。

## 运行态证据

- 执行目录：当前前端子仓库根目录。
- 启动命令：`npm_config_port=8081 npm run dev -- --host 127.0.0.1`
- 检查命令：内置浏览器打开 `http://127.0.0.1:8081/` 和 `http://127.0.0.1:8081/requirement/project/detail?projectId=1`
- console/network 错误摘要：登录页和直接路由检查均未捕获 console error；直接访问接入中心因未登录重定向到 `/login?redirect=%2Frequirement%2Fproject%2Fdetail%3FprojectId%3D1`。
- 当前执行 agent 环境：只验证到前端 dev server、登录重定向和浏览器无 console error；未具备登录态、测试账号和后端数据，因此未宣称项目接入中心真实数据态联调完成。

## 验证命令

| 命令 | 结果 |
|---|---|
| `node scripts/test-access-center-status.js` | Red 阶段按预期失败，Green 阶段通过。 |
| `npm install --no-package-lock` | 通过；用于补齐本 worktree 缺失的 `node_modules`，未生成锁文件。输出包含旧依赖 deprecated 和 Node engine warning。 |
| `npm run build:prod` | 通过；输出 2 个既有资源体积 warning。 |
| `npm_config_port=8081 npm run dev -- --host 127.0.0.1` | 通过；dev server 编译成功并监听 `http://127.0.0.1:8081/`。 |
| `sh scripts/check-docs.sh` | 通过。 |
| `sh scripts/check-harness.sh review --spec docs/specs/active/2026-06-11-REQ-001-项目接入中心职责收敛` | 通过。 |
| `sh scripts/check-harness.sh complete --spec docs/specs/done/2026-06-11-REQ-001-项目接入中心职责收敛` | 通过。 |

## 影响说明

- 接口/API：未改接口路径、请求参数或响应字段。
- 数据库/SQL：未涉及。
- 权限/菜单：未改权限标识；项目列表操作文案有用户可见变化。
- 页面/交互：项目列表入口和项目接入中心页面结构有用户可见变化。
- 后端 companion：本轮未改后端；现有字段足以完成前端状态收敛。真实 harness 初始化结果和失败原因若后续要精细展示，需要另开后端 companion 需求。

## Review 返修记录

- Review 结论：通过。
- 返修项：无。

## 提交记录

- commit：任务分支最终提交；本报告随提交入库，最终提交号以 `git log -1 --oneline` 为准。
