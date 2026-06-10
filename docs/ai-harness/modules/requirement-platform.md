# 需求管理平台前端模块 Harness

## 模块范围

本模块覆盖 `reqflow-ui/src/api/requirement/**` 和 `reqflow-ui/src/views/requirement/**`。页面基于 RuoYi-Vue、Vue 2 和 Element UI 实现，不引入新依赖。

## 入口文件

| 功能点 | 代码路径 |
|---|---|
| 项目管理 | `src/views/requirement/project/index.vue` |
| 项目维护弹窗 | `src/views/requirement/project/components/ProjectInitWizard.vue` |
| 项目接入中心 | `src/views/requirement/project/detail.vue` |
| 需求列表与提交 | `src/views/requirement/demand/index.vue`、`src/views/requirement/demand/detail.vue` |
| Agent 交接资料 | `src/views/requirement/package/index.vue` |
| MCP管理 | `src/views/requirement/mcpKey/index.vue` |
| 使用统计 | `src/views/requirement/statistics/index.vue` |
| API 封装 | `src/api/requirement/*.js` |

## 不变量

- API 路径必须与后端 `/requirement/**` 保持一致。
- 按钮权限必须使用后端菜单脚本和 Controller 中的 `req:*` 权限标识。
- 列表页使用 RuoYi `pagination` 和 `right-toolbar` 模式。
- 表单弹窗使用 Element UI `el-dialog` 和 `el-form`，提交成功后刷新列表。
- 项目管理新增和修改入口必须打开项目维护弹窗；弹窗单页展示项目信息、代码仓库、分支配置和模块初始化状态，不再使用分步向导。
- 分支配置是项目管理里的深层级栏目：每个分支行必须能展示自己的 MCP key、真实分支、模块总数、手工模块数、索引模块数、索引仓库数和最近索引状态。
- 项目列表的初始化状态必须来自后端 `initChecklist`，不得只按前端本地行状态臆测。
- 项目接入中心必须把 harness 初始化作为项目接入能力的一部分展示，包括平台内置模板版本、workspace 入口 `AGENTS.md` 下发状态、子仓库 harness 状态和 Codex 回写的校验结果。
- 仓库、项目分支和模块知识不再作为独立左侧菜单入口；项目维护弹窗是仓库和项目分支的主维护入口，项目接入中心只读展示仓库、分支、索引批次和模块知识库。
- 仓库维护只保存团队共享 Git 远端、仓库类型和默认分支，允许纯后端服务只登记一条后端仓库，不保存个人本机绝对路径。
- 项目分支维护中文标签、真实分支名和后端生成的 `mcpKey`；MCP 索引用 `mcpKey + remoteUrl` 识别项目、分支和代码仓库。
- 模块和知识库必须同时关联项目与项目分支。需求表单选择模块时按 `projectId + variantId` 过滤，项目接入中心的索引批次和模块知识库也按选中分支展示。
- 需求表单的影响面推荐只追加候选内容，不强制覆盖人工输入。
- Agent 交接资料内容使用 textarea，不引入 Markdown 编辑器依赖。
- Harness 初始化模板由需求平台存储和下发给 Codex；前端不直接写文件，后端不直接执行 Git 或文件系统写入。
- MCP 管理页面只管理绑定到人员的访问 Key。页面必须展示 MCP 地址和 `X-MCP-Key` 请求头，创建或重置后只在结果弹窗展示一次明文 Key 和 Codex 配置；列表不得展示明文或哈希。
- MCP 管理菜单和按钮必须使用 `req:mcp:key:*` 权限，提需求人员角色默认不分配这些权限。
- 人员 MCP Key 不能替代项目分支 `mcpKey`：页面负责人员认证 Key，项目接入和索引指引中的 `mcpKey` 仍是项目分支识别 Key。

## 风险点

- 后端接口未运行时，页面只能通过构建验证，不能宣称完成联调。
- MCP 管理页面依赖后端 `/requirement/mcp/key/**` 和系统用户列表接口；只有前端构建通过时，不能宣称 Key 创建、权限隔离或 Codex 调用已经完成运行态联调。
- 项目列表会对当前页项目逐个读取初始化上下文；后续如项目数明显增加，可考虑后端增加批量初始化状态接口。
- Agent 交接资料存在多个 artifact type，前端 tab 的 key 必须使用后端支持的类型值。
- Harness 初始化失败时，必须区分平台模板生成失败、Codex 本地写入失败、仓库远端不匹配和校验脚本失败，不能统一显示为“初始化失败”。
- 索引推荐依赖后端 `/requirement/index/**` 接口，且必须让后端按项目分支 `variantId` 解析真实分支并限定最新索引批次；接口缺失时需求表单只能保留人工填写影响范围。
- 旧数据如果存在 `variantId` 为空的项目级模块，不能在分支知识库里默认混入；需要由团队迁移或重新初始化到对应项目分支。
- 统计表格返回字段是聚合字段，不能按基础实体字段假设。

## 验证建议

- 最低验证：`npm run build:prod`。
- 页面冒烟：启动前端后打开登录页、项目管理、项目维护弹窗、项目接入中心、需求列表、Agent 交接资料、MCP 管理和统计页面，检查 console 无本次变更相关错误。
- 跨端联调：后端启动后验证项目初始化新增、编辑回显、列表状态刷新、索引批次展示、影响面推荐、需求新增、Agent 交接资料保存、MCP Key 用户选择、创建/重置/停用和统计接口。
