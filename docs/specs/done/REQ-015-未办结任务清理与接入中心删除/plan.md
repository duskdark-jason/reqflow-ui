# 未办结任务清理与接入中心删除执行计划

## 输入文件

- 需求说明：`requirement.md`
- 相关契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 相关模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 目标客户与基线分支：通用/main
- 影响模块：需求管理、项目管理、项目维护、分支知识库、AI Harness
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`

## 实施步骤

1. TDD Red：改造 `scripts/test-access-center-status.js`，断言接入中心按钮、路由和页面文件不存在，覆盖 AC-UI-001、AC-UI-002、AC-UI-003、AC-UI-004。
2. 页面删减：修改 `src/views/requirement/project/index.vue`，删除接入中心按钮和跳转方法，覆盖 AC-UI-001。
3. 路由删减：修改 `src/router/index.js`，删除 `/requirement/project/detail` 隐藏路由，覆盖 AC-UI-002。
4. 文件删除：删除 `src/views/requirement/project/detail.vue`，保留 `maintain.vue` 和 `knowledge.vue`，覆盖 AC-UI-003、AC-UI-004。
5. 知识库同步：更新 `docs/ai-harness/modules/requirement-platform.md`，删除接入中心独立入口，覆盖 AC-UI-005。
6. 历史任务清理：归档 `REQ-014-harness命名规则移除日期`，并与后端 companion 清理保持一致，覆盖 AC-BE-001。
7. 收口报告：补齐执行报告和 Review 报告，运行文档、harness、静态检查和构建，覆盖 AC-UI-006。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 修改 | `scripts/test-access-center-status.js` | 从接入中心职责检查改为接入中心删除检查。 |
| 修改 | `src/views/requirement/project/index.vue` | 删除接入中心入口和跳转方法。 |
| 修改 | `src/router/index.js` | 删除接入中心隐藏路由。 |
| 删除 | `src/views/requirement/project/detail.vue` | 删除重复页面链路。 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 更新项目管理长期入口。 |
| 移动 | `docs/specs/active/REQ-014-harness命名规则移除日期` | 已完成但未归档，归档到完成区。 |
| 新增 | `docs/specs/active/REQ-015-未办结任务清理与接入中心删除/*` | 记录本次需求、计划和收口报告。 |

## 模块知识库计划

- 更新 `docs/ai-harness/modules/requirement-platform.md`。
- 模块文档删除“项目接入中心”独立入口，保留项目维护和分支知识库长期入口。

## 代码注释计划

- 本次删除重复页面链路，不新增复杂业务逻辑，无需新增代码注释。

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`
- L0 Harness：`sh scripts/check-harness.sh complete --spec docs/specs/done/REQ-015-未办结任务清理与接入中心删除`
- L1 构建：`npm run build:prod`
- L2 静态契约：`node scripts/test-access-center-status.js`
- L3 运行态冒烟：页面链路删除可由构建和静态路由检查覆盖；不启动浏览器。
- L4 跨端/端到端：不适用，本次不改后端接口和跨端数据契约。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | 页面删减 | `node scripts/test-access-center-status.js` |
| AC-UI-002 | 路由删减 | `node scripts/test-access-center-status.js` |
| AC-UI-003 | 文件删除 | `node scripts/test-access-center-status.js` |
| AC-UI-004 | 页面保留 | `node scripts/test-access-center-status.js`、`npm run build:prod` |
| AC-UI-005 | 知识库同步 | `rg "项目接入中心" docs/ai-harness/modules/requirement-platform.md` |
| AC-UI-006 | 收口验证 | 文档、harness、静态检查和构建命令 |
| AC-BE-001 | companion 清理 | 后端 companion 验证结果 |

## 执行约束

- 不删除项目维护页和分支知识库页签。
- 不改后端接口、请求字段、响应字段或权限标识。
- 不直接修改本地平台库需求状态。
- 任务分支模式下完成修改和验证后直接提交；merge、push、rebase 仍需用户确认。
