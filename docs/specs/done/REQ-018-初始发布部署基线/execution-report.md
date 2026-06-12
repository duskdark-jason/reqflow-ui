# 初始发布部署基线前端执行报告

## 执行结论

- 状态：已完成
- 分支：chore/req-018-release-baseline
- commit：self-contained-in-this-commit

## 修改摘要

| 路径 | 修改说明 |
|---|---|
| `.env.production`、`.env.staging` | 将生产和测试 API 前缀改为 `/reqflow-api`，并设置 `VUE_APP_PUBLIC_PATH=/reqflow/`，覆盖 AC-001、AC-002。 |
| `.env.development` | 保留 `/dev-api` 对外开发前缀，增加代理目标 context-path `/reqflow-api`，覆盖 AC-002。 |
| `vue.config.js` | 让 `publicPath` 读取环境变量，开发代理 pathRewrite 转发到后端 context-path，覆盖 AC-001、AC-002。 |
| `docs/specs/active`、`docs/specs/done` | 删除历史过程 spec，仅保留当前发布基线记录和占位文件，覆盖 AC-003。 |
| `docs/ai-harness/modules/requirement-platform.md`、`docs/ai-harness/contracts/requirement-platform-ui.md`、`docs/runbooks/local-run.detected.md` | 同步前端访问项目名、生产 API 前缀、开发代理和 MCP 路径隔离说明，覆盖 AC-004、AC-006。 |

## 模块知识库沉淀

- 影响模块：前端发布配置、需求过程文档
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`
- 无需更新原因：不适用

## 数据库变更沉淀

- 数据库影响：无
- SQL 脚本路径：无
- 数据库文档路径：无
- 数据库变更说明：前端仓库无数据库脚本变更。
- 无需更新原因：本次仅调整前端构建配置、文档和 spec 清理。

## 代码注释处理

- 注释动作：无需新增
- 注释文件：无
- 处理说明：本次只改构建配置和文档，未新增复杂交互、权限边界、MCP 调用逻辑或兼容分支。

## 验证结果

| 层级 | 验收 ID | 命令或方式 | 结果 |
|---|---|---|---|
| L0 | AC-003、AC-004、AC-006 | `find docs/specs -type f -print`、`rg` 引用检查 | 通过；历史 spec 已清理，长期文档记录 `/reqflow/`、`/reqflow-api` 与 MCP 路径隔离。 |
| L1 | AC-001、AC-002、AC-005 | `npm run build:prod` | 通过；构建成功，仅有既有资源体积 warning。 |
| L2 | AC-001、AC-002、AC-006 | `rg '/reqflow/' dist/index.html`、`rg '/prod-api|/stage-api' dist`、`rg '/reqflow-api' dist/static/js/app.*.js dist/static/js/chunk-libs.*.js` | 通过；入口资源使用 `/reqflow/`，旧 API 前缀无命中，构建产物包含 `/reqflow-api`。 |
| L3 | AC-001、AC-006 | 构建产物静态检查和后端 companion MCP 单测 | 通过；本次不启动服务，发布环境部署后补验页面和 MCP lifecycle。 |
| L4（可选） | AC-005 | 本次无保存、导出、异步任务或核心业务流程变更 | 不适用。 |
| L0 | AC-005 | `sh scripts/check-docs.sh`、`sh scripts/check-harness.sh complete --spec docs/specs/active/REQ-018-初始发布部署基线` | 通过；文档检查通过，harness complete 模式通过。 |
| L0 | AC-005 | `git diff --check` | 通过；无 whitespace 问题。 |

## 运行态证据

- 执行目录：当前前端子仓库根目录
- 启动命令：本次未启动服务
- profile/env/mode：production build
- 检查命令：`npm run build:prod`、`rg '/reqflow/' dist/index.html`、`rg '/prod-api|/stage-api' dist`
- 原始错误摘要：无；构建仅输出资源体积 warning
- screenshot/trace 路径：无
- 是否代表用户环境：否，仅代表当前执行 agent 环境
- 后续补验环境：测试环境或发布环境

## 计划偏差

- 无偏差；按计划使用构建产物静态检查替代本地运行态页面冒烟。

## Review 返修记录

Review Agent 未产生返修项：无。

| 修复 ID | 关联验收 ID | 处理结果 | 修改文件 | 验证命令 | 结果 |
|---|---|---|---|---|---|
| 无 | AC-001、AC-002、AC-003、AC-004、AC-005、AC-006 | 无需修复 | 无 | 无 | 通过 |

## 风险与后续

- 发布环境需补验同域反向代理下 `/reqflow/` 页面、`/reqflow-api` API 和 `/reqflow-api/requirement/mcp` MCP lifecycle。
