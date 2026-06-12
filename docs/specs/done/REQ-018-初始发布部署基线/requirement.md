# 初始发布部署基线前端需求说明

## 背景

需求管理平台已基本成型，前端发布配置仍按域名根路径构建，生产 API 仍使用模板默认 `/prod-api`。初始发布前需要加入访问项目名，并清理历史过程 spec，使构建产物适合部署到同域子路径。

## 目标

- 清理前端历史 spec，仅保留当前发布基线记录和占位文件。
- 生产环境静态资源以 `/reqflow/` 作为访问项目名。
- 生产 API 前缀对齐后端 `/reqflow-api`。
- 开发代理保留 `/dev-api`，但代理目标增加后端 context-path。
- 同步长期 harness 和运行说明。

## 可行性评估

- 评估结论：可继续设计。
- 主要风险：子路径部署必须同时调整 `publicPath` 和生产 API 前缀；后端 context-path 变化后开发代理 pathRewrite 需要补 `/reqflow-api`；前端项目名不得参与外部 MCP endpoint 拼接。
- 需需求人补充或调整：无。本次默认前端访问项目名为 `/reqflow/`，后端访问前缀为 `/reqflow-api`。
- 是否允许继续生成需求设计：是，用户已明确要求清理并调整为初始发布部署状态。

## 范围

本次包含：

- 删除 `docs/specs/active` 与 `docs/specs/done` 中历史需求目录，保留 `.gitkeep` 和当前发布基线记录。
- 修改 `.env.production` 的 `VUE_APP_BASE_API` 为 `/reqflow-api`。
- 新增 `VUE_APP_PUBLIC_PATH`，生产构建使用 `/reqflow/`。
- 修改 `vue.config.js`，让 `publicPath` 读取环境变量，开发代理转发到后端 `/reqflow-api`。
- 明确 MCP endpoint 由后端安装指令生成，前端不使用静态访问项目名拼接 MCP 地址。
- 更新运行说明和模块文档中的发布路径。

本次不包含：

- 不修改页面业务交互、路由表、权限判断或 API 封装字段。
- 不新增前端依赖。
- 不合并、不推送、不删除远端分支。

## 影响范围

- 接口/API：是，生产请求根路径从 `/prod-api` 改为 `/reqflow-api`。
- 数据库/SQL：否。
- 权限/菜单：否。
- 页面/交互：是，生产访问入口变为 `/reqflow/`，页面内容不变。
- 导出/异步/任务：否。

## 契约与数据口径

- 接口路径和方法：前端 axios baseURL 为 `/reqflow-api`，接口相对路径不变。
- 请求参数：不变。
- 响应字段：不变。
- 数据粒度：不变；本次只调整部署路径。

## 验收标准

- AC-001：生产构建静态资源使用 `/reqflow/` 作为 `publicPath`。
- AC-002：生产 API 前缀为 `/reqflow-api`，开发代理仍以 `/dev-api` 对外但转发到后端 `/reqflow-api`。
- AC-003：历史 spec 目录已清理，`docs/specs/active` 不再残留历史未办结需求。
- AC-004：运行说明和模块文档同步记录前端访问路径和后端 API 前缀。
- AC-005：前端生产构建和 harness 文档检查通过。
- AC-006：前端项目名前缀 `/reqflow/` 不影响 MCP 外部调用；MCP endpoint 仍由后端返回 `/reqflow-api/requirement/mcp`。

## Companion 关联

- companion spec：`../reqflow-be/docs/specs/active/REQ-018-初始发布部署基线`
- 关联分支：`chore/req-018-release-baseline`

## 客户与分支

- 目标客户：通用
- 基线分支：main
- 任务分支：chore/req-018-release-baseline

## 约束与假设

- 初始发布默认前端部署到同域 `/reqflow/` 子路径。
- 后端默认部署到同域 `/reqflow-api` context-path；MCP 客户端调用后端 `/reqflow-api/requirement/mcp`，不经过前端静态项目名前缀。
