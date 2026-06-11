# 需求列表页签化与知识库提需执行计划

## 输入文件

- 需求说明：`requirement.md`
- 相关契约：`docs/ai-harness/contracts/requirement-platform-ui.md`
- 相关模块文档：`docs/ai-harness/modules/requirement-platform.md`
- 目标客户与基线分支：通用/main
- 影响模块：需求管理/需求列表、需求管理/需求详情、需求管理/Agent 交接资料
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`

## 实施步骤

1. 页签路由：新增 `/requirement/demand/maintain` 隐藏路由，列表新增和修改入口跳转页签，覆盖 AC-UI-001。
2. 表单迁移：创建需求维护页签，保留基础信息、项目分支校验、验收标准和保存逻辑，覆盖 AC-UI-001、AC-UI-002。
3. 知识库模块：维护页签通过 `listIndexModule` 读取模块知识，按项目和分支过滤，并支持新功能名称输入，覆盖 AC-UI-003、AC-UI-004。
4. 自动影响面：移除页面可见影响范围区块，保存前调用影响面推荐并映射到后端字段，覆盖 AC-UI-005。
5. 展示兼容：列表和详情展示知识库模块名称或新功能名称，覆盖 AC-UI-006。
6. 文档同步：更新前端契约和模块 harness，覆盖 AC-UI-007。

## 文件改动范围

| 类型 | 路径 | 说明 |
|---|---|---|
| 修改 | `src/router/index.js` | 增加需求维护隐藏页签路由。 |
| 修改 | `src/views/requirement/demand/index.vue` | 移除弹窗编辑逻辑，改为跳转页签。 |
| 新增 | `src/views/requirement/demand/maintain.vue` | 承载新增和修改需求表单。 |
| 修改 | `src/views/requirement/demand/detail.vue` | 展示知识库模块或新功能名称。 |
| 修改 | `docs/ai-harness/contracts/requirement-platform-ui.md` | 同步页面和字段契约。 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 同步菜单和不变量。 |

## 模块知识库计划

- 更新 `docs/ai-harness/modules/requirement-platform.md`，记录需求维护隐藏页签、知识库模块选择、新功能输入和影响面自动关联。

## 代码注释计划

- 对保存前自动关联影响面的分支添加短注释，说明该字段对提需求人隐藏但仍供后端执行包使用。

## 验证计划

- L0 文档/规范：`sh scripts/check-docs.sh`，`sh scripts/check-harness.sh complete --spec docs/specs/active/REQ-001-需求列表页签化与知识库提需`
- L1 编译/构建：`npm run build:prod`
- L2 单元/契约：前端暂无独立单测脚本，使用生产构建覆盖基础契约。
- L3 运行态冒烟：若当前环境可启动，打开需求列表和维护页签检查路由、空态、表单校验和 console。
- L4 跨端/端到端（可选）：本次不默认执行，保存链路由后端服务测试和构建验证覆盖，跨端联调可在具备登录态环境补验。

## 验收 ID 覆盖

| 验收 ID | 计划阶段 | 验证方式 |
|---|---|---|
| AC-UI-001 | 页签路由 | 构建和运行态冒烟 |
| AC-UI-002 | 表单迁移 | 构建和运行态冒烟 |
| AC-UI-003 | 知识库模块 | 构建和运行态冒烟 |
| AC-UI-004 | 知识库模块 | 构建和运行态冒烟 |
| AC-UI-005 | 自动影响面 | 构建和运行态冒烟 |
| AC-UI-006 | 展示兼容 | 构建和运行态冒烟 |
| AC-UI-007 | 文档同步 | L0 和 L1 命令 |
