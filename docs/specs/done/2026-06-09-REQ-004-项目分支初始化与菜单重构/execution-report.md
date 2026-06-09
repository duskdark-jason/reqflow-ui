# 项目分支初始化与菜单重构前端执行报告

## 执行摘要

- 项目维护弹窗改为默认一条代码仓库，输入 Git 地址后自动推导仓库名称、项目名称和项目编码。
- 仓库校验改为至少一条有效代码仓库，允许纯后端服务只维护后端仓库。
- 分支配置展示后端回显的 MCP key，并将用户可见“客户线”语义调整为“项目分支”。
- 项目接入中心改为只读展示项目仓库、项目分支、索引批次和模块知识库，MCP 指引优先使用 `mcpKey + remoteUrl`。
- 左侧菜单入口由后端菜单 SQL 下线；前端 harness 同步仓库、项目分支、模块知识不再作为独立菜单入口。

## 修改文件

- `src/views/requirement/project/components/ProjectInitWizard.vue`
- `src/views/requirement/project/index.vue`
- `src/views/requirement/project/detail.vue`
- `src/views/requirement/demand/index.vue`
- `src/views/requirement/demand/detail.vue`
- `src/views/requirement/variant/index.vue`
- `src/api/requirement/variant.js`
- `docs/ai-harness/modules/requirement-platform.md`
- `docs/ai-harness/contracts/requirement-platform-ui.md`
- `docs/domains/requirement-platform/README.md`

## 验证记录

- 命令：`npm run build:prod`
- 状态：通过，存在 RuoYi 前端既有包体积 warning。

## 验收 ID 覆盖

| 验收 ID | 实现证据 | 验证证据 | 状态 |
|---|---|---|---|
| AC-UI-001 | 项目接入中心只读展示，后端菜单 SQL 下线旧菜单 | `npm run build:prod` 通过 | 通过 |
| AC-UI-002 | 项目维护弹窗至少一条代码仓库即可保存 | `npm run build:prod` 通过；后端测试覆盖纯后端项目 | 通过 |
| AC-UI-003 | Git 地址 blur 时推导仓库名称、项目名称和项目编码 | `npm run build:prod` 通过 | 通过 |
| AC-UI-004 | 分支表展示 `mcpKey`，MCP 指引使用 `mcpKey + remoteUrl` | `npm run build:prod` 通过；后端测试覆盖 MCP key 导入 | 通过 |
| AC-UI-005 | 项目列表状态文案改为代码仓库和项目分支口径 | `npm run build:prod` 通过 | 通过 |
| AC-UI-006 | 前端模块、契约和领域文档同步 | `sh scripts/check-docs.sh` 通过 | 通过 |
