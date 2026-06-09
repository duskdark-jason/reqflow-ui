# 项目管理初始化向导前端执行计划

## 输入文件

- 需求说明：`requirement.md`
- 相关契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 相关模块文档：`docs/ai-harness/modules/requirement-platform.md`
- Companion：`../../../../reqflow-be/docs/specs/done/2026-06-09-REQ-003-项目管理初始化向导`
- 目标客户与基线分支：通用 / main

## 实施步骤

1. API 封装：新增 `src/api/requirement/projectInit.js`，封装初始化上下文查询、新增和更新接口，覆盖 AC-UI-002、AC-UI-005。
2. 维护弹窗组件调整：在项目管理目录下把初始化组件改成单页弹窗，内部使用 Element UI form、table、descriptions 和 summary 区块，不再使用 steps，覆盖 AC-UI-001、AC-UI-002。
3. 项目列表改造：调整 `project/index.vue` 的新增和编辑操作，打开项目维护弹窗；列表展示初始化状态和“继续维护/接入中心”入口，覆盖 AC-UI-001、AC-UI-004。
4. 仓库分区：默认生成前端仓库和后端仓库行，支持增删仓库、选择仓库类型、填写 Git 地址和默认分支，覆盖 AC-UI-002、AC-UI-003。
5. 分支分区：支持维护中文标签、真实分支名、状态和备注；中文标签用于需求人员展示，真实分支名用于索引和后续开发基准，覆盖 AC-UI-002。
6. 模块初始化状态：展示模块摘要、索引摘要和 MCP 下一步指引，明确不保存本机目录，覆盖 AC-UI-003、AC-UI-004。
7. 编辑回显和保存：打开已有项目时加载初始化上下文，保存成功后刷新列表并可进入项目接入中心，覆盖 AC-UI-005。
8. 文档与验证：更新 UI 契约和模块 harness，执行构建和页面冒烟，覆盖 AC-UI-006。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 新增 | `src/api/requirement/projectInit.js` | 项目初始化聚合 API |
| 修改 | `src/views/requirement/project/index.vue` | 项目管理列表、初始化状态、向导入口 |
| 新增 | `src/views/requirement/project/components/ProjectInitWizard.vue` | 项目初始化维护弹窗，文件名沿用已落地组件 |
| 修改 | `src/views/requirement/project/detail.vue` | 与初始化向导保持入口和状态口径一致 |
| 修改 | `docs/ai-harness/contracts/requirement-platform-ui.md` | 同步项目初始化接口调用契约 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 同步项目管理初始化向导不变量 |

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`、`sh scripts/check-harness.sh complete`
- L1 编译/构建：`npm run build:prod`
- L2 单元/契约：当前项目无独立单元测试脚本，以构建和 API 封装检查作为最低契约检查。
- L3 运行态冒烟：启动前端后打开项目管理，验证新增维护弹窗、编辑回显、仓库分区、分支分区、模块初始化状态和 console/network。
- L4 跨端/端到端：后端 companion 完成后，联调新增项目初始化保存、编辑回显、列表状态刷新和进入项目接入中心。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | 维护弹窗组件调整、项目列表改造 | 页面冒烟和构建 |
| AC-UI-002 | 仓库分区、分支分区 | 页面交互和跨端联调 |
| AC-UI-003 | 仓库分区、模块初始化状态 | 文案检查和页面冒烟 |
| AC-UI-004 | 项目列表改造、模块初始化状态 | 页面冒烟和接口联调 |
| AC-UI-005 | 编辑回显和保存 | 跨端联调 |
| AC-UI-006 | 文档与验证 | L0 文档检查和 harness 检查 |

## 执行约束

- Execution Agent 必须保持 REQ-003 代码和文档在 `feature/REQ-003-project-init-wizard` 分支内执行，不得回写到 REQ-002 分支。
- 不新增前端依赖，不升级 Vue、Element UI 或构建工具。
- 前端不得提交或保存个人本机绝对路径。
- 保留现有项目接入中心详情页，维护弹窗负责项目管理内的新增和编辑主流程，详情页负责后续维护和索引查看。
- 后端 companion 初始化接口未落地前，前端不得把联调状态写成完成。
