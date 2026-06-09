# 需求管理平台 MVP-lite 前端执行计划

## 输入文件

- 需求说明：`requirement.md`
- 相关契约：实现过程中同步补充 `docs/ai-harness/contracts/`
- 相关模块文档：`docs/domains/requirement-platform/README.md`
- 目标客户与基线分支：通用 / main

## 实施步骤

1. API 封装：新增 `src/api/requirement/*.js`，覆盖 AC-UI-001。
2. 管理页面：新增 project、repository、variant、module 页面，覆盖 AC-UI-002。
3. 需求页面：新增 demand 列表和详情/表单，覆盖 AC-UI-003。
4. 执行包页面：新增 package 页面和 artifact tabs，覆盖 AC-UI-003。
5. 统计页面：新增 statistics 页面，覆盖 AC-UI-004。
6. 验证与报告：执行前端生产构建和 harness 检查，更新 `execution-report.md`。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 新增 | `src/api/requirement/**` | 需求平台接口封装 |
| 新增 | `src/views/requirement/**` | 需求平台前端页面 |
| 新增 | `docs/specs/active/2026-06-09-REQ-PLATFORM-MVP-lite/**` | active spec 执行追踪 |

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh` 和 `sh scripts/check-harness.sh init`
- L1 编译/构建：`npm run build:prod`
- L2 单元/契约：当前项目无独立单测脚本，先以 `npm run build:prod` 作为最低契约检查。
- L3 运行态冒烟：本地 `npm run dev` 后打开需求管理页面，检查 console 和基础交互。
- L4 跨端/端到端：后端 companion spec 完成后联调需求新增、执行包保存和统计展示。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | API 封装 | 文件检查和生产构建 |
| AC-UI-002 | 管理页面 | 生产构建和页面冒烟 |
| AC-UI-003 | 需求与执行包页面 | 生产构建和页面冒烟 |
| AC-UI-004 | 统计页面 | 生产构建和页面冒烟 |
| AC-UI-005 | 构建验证 | `npm run build:prod` |

## 执行约束

- Execution Agent 必须按本计划执行，不得自行扩大范围。
- 不新增前端依赖。
- 不修改与需求平台无关的既有页面。
- 后端接口若变更，先同步 companion spec 再调整前端调用。
