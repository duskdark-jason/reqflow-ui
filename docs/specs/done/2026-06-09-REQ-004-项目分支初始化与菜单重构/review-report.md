# 项目分支初始化与菜单重构前端 Review 报告

## Review 结论

- 结论：通过
- Review Agent：Codex Review Agent
- Review 时间：2026-06-09

## 问题清单

未发现阻断或重要问题。

## 验收 ID 覆盖矩阵

| 验收 ID | 需求描述 | 实现证据 | 验证证据 | Review 结论 |
|---|---|---|---|---|
| AC-UI-001 | 左侧菜单不再显示旧入口 | 后端菜单 SQL 不再创建旧菜单并禁用已有菜单；前端接入中心只读 | 构建通过，后端打包通过 | 通过 |
| AC-UI-002 | 纯后端服务可保存 | 前端放宽仓库校验，后端放宽初始化校验 | 前端构建通过，后端纯后端测试通过 | 通过 |
| AC-UI-003 | Git 地址推导名称 | `ProjectInitWizard.vue` 的 `handleRepositoryUrlChange` | 前端构建通过 | 通过 |
| AC-UI-004 | 展示 MCP key | `ProjectInitWizard.vue` 和 `project/detail.vue` 展示 `mcpKey` | 前端构建通过，后端 MCP key 测试通过 | 通过 |
| AC-UI-005 | 初始化状态新口径 | `project/index.vue` 文案改为代码仓库和项目分支 | 前端构建通过，后端 checklist 测试通过 | 通过 |
| AC-UI-006 | harness 文档同步 | UI 契约、模块文档、领域文档 | `sh scripts/check-docs.sh` 通过 | 通过 |

## 剩余风险

- 当前未执行登录态浏览器冒烟；需在具备账号和数据库迁移后的环境补验纯后端项目保存与 MCP key 回显。
