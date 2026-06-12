# 初始发布部署基线前端执行计划

## 输入文件

- 需求说明：`requirement.md`
- 相关契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 相关模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 目标客户与基线分支：通用/main
- 影响模块：前端发布配置、需求过程文档
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`

## 实施步骤

1. 发布配置：修改 `.env.production`、`.env.development` 和 `vue.config.js`，覆盖 AC-001、AC-002。
2. 过程文档清理：删除历史 `docs/specs/active/*` 与 `docs/specs/done/*` 需求目录，仅保留发布基线记录和占位文件，覆盖 AC-003。
3. MCP 路径隔离：更新模块文档和运行说明，明确前端 `/reqflow/` 不参与 MCP endpoint 拼接，覆盖 AC-006。
4. 长期文档同步：更新模块文档和运行说明中的访问路径，覆盖 AC-004。
5. 验证与提交：执行前端生产构建、文档检查、harness 检查和 diff 检查，覆盖 AC-005。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 修改 | `.env.production` | 生产 API 前缀和访问项目名 |
| 修改 | `.env.development` | 开发代理目标 context-path |
| 修改 | `vue.config.js` | publicPath 环境化和代理 pathRewrite |
| 删除 | `docs/specs/active/*`、`docs/specs/done/*` 历史目录 | 清理历史过程 spec |
| 修改 | `docs/ai-harness/modules/requirement-platform.md`、`docs/runbooks/*.md` | 同步发布路径 |

## 模块知识库计划

- 更新 `docs/ai-harness/modules/requirement-platform.md`，记录初始发布前端访问路径、生产 API 前缀和开发代理口径。

## 代码注释计划

- 本次只改构建配置和文档，不新增复杂交互、权限边界或兼容逻辑，预计无需新增代码注释。

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`、`sh scripts/check-harness.sh complete --spec docs/specs/active/REQ-018-初始发布部署基线`
- L1 编译/构建：`npm run build:prod`
- L2 单元/契约：当前项目无独立测试脚本，使用生产构建覆盖配置契约。
- L3 运行态冒烟：本次不启动服务；通过构建产物静态路径检查验证 publicPath，发布环境部署后补验。
- L4 跨端/端到端：不适用，本次无保存、导出、异步任务或核心业务流程变更。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-001 | 发布配置 | `npm run build:prod` 后检查 `dist/index.html` 静态资源路径 |
| AC-002 | 发布配置 | `rg` 检查 env 与 `vue.config.js` |
| AC-003 | 过程文档清理 | `find docs/specs` 和 harness 指定 spec 检查 |
| AC-004 | 长期文档同步 | `sh scripts/check-docs.sh` 和引用检查 |
| AC-005 | 验证与提交 | 前端构建、harness 检查、`git diff --check` |
| AC-006 | MCP 路径隔离 | 文档引用检查和后端 companion `ReqMcpKeyControllerTest` |

## 执行约束

- 任务分支模式下完成修改和验证后直接 commit；merge、push、rebase 仍需用户确认。
- 不修改业务页面、权限或 API 字段。
- 不新增依赖。
