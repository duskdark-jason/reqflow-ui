# 项目分支初始化与菜单重构前端执行计划

## 影响文件

- `src/views/requirement/project/components/ProjectInitWizard.vue`：调整仓库行默认值、Git 地址推导、纯后端校验、分支 MCP key 展示和提示文案。
- `src/views/requirement/project/index.vue`：调整初始化状态文案，不再写死前后端仓库。
- `docs/ai-harness/modules/requirement-platform.md`：同步模块入口和不变量。
- `docs/ai-harness/contracts/requirement-platform-ui.md`：同步初始化契约、权限和 MCP key。
- `docs/domains/requirement-platform/README.md`：同步领域说明。

## 执行步骤

1. 根据后端契约更新项目维护弹窗：默认一个仓库空行，选择类型，输入 Git 地址后推导仓库名称，覆盖 AC-UI-002、AC-UI-003。
2. 放宽前端仓库校验：至少一条有效仓库即可，纯后端项目允许保存，覆盖 AC-UI-002、AC-UI-005。
3. 在分支配置表展示 `mcpKey`，保存前不要求用户填写，由后端生成后回显，覆盖 AC-UI-004。
4. 调整项目列表初始化状态文案，使用“缺代码仓库”“缺项目分支”等新语义，覆盖 AC-UI-005。
5. 调整项目接入中心为项目仓库、项目分支、索引批次和模块知识只读展示，覆盖 AC-UI-001、AC-UI-004。
6. 更新前端 harness 和领域文档，覆盖 AC-UI-006。
7. 运行 `npm run build:prod`，如能启动本地服务则做页面冒烟，覆盖 AC-UI-001 至 AC-UI-006。

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`、`sh scripts/check-harness.sh complete --spec docs/specs/done/2026-06-09-REQ-004-项目分支初始化与菜单重构`
- L1 编译/构建：`npm run build:prod`
- L2 单元/契约：当前前端无独立单元测试脚本，以生产构建和后端契约测试作为最低契约检查。
- L3 运行态冒烟：打开项目管理、项目维护弹窗、项目接入中心、需求列表，检查新文案和 console/network。
- L4 跨端/端到端：具备登录态和数据库迁移后，联调纯后端项目保存、MCP key 回显和索引导入。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | 项目接入中心只读展示、后端菜单下线 | 构建、菜单 SQL 检查 |
| AC-UI-002 | 仓库默认行和校验放宽 | 构建、跨端联调 |
| AC-UI-003 | Git 地址推导仓库和项目字段 | 构建、页面冒烟 |
| AC-UI-004 | MCP key 展示和 MCP 指引 | 构建、后端契约测试 |
| AC-UI-005 | 初始化状态新口径 | 构建、后端契约测试 |
| AC-UI-006 | harness 文档同步 | L0 文档和 harness 检查 |
