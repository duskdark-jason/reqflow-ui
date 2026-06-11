# 需求管理平台前端模块 Harness

## 模块范围

本模块覆盖 `reqflow-ui/src/api/requirement/**` 和 `reqflow-ui/src/views/requirement/**`。页面基于 RuoYi-Vue、Vue 2 和 Element UI 实现，不引入新依赖。

## 菜单与功能入口

| 菜单目录 | 子菜单/页面 | 功能说明 | 前端文件 | API 封装 | 后端接口与权限 | 后端核心文件 |
|---|---|---|---|---|---|---|
| 需求管理 | 项目管理 | 项目列表、项目维护入口、初始化状态和接入状态入口 | `src/views/requirement/project/index.vue`、`maintain.vue` | `src/api/requirement/project.js`、`projectInit.js` | `/requirement/project/**`，`req:project:*`；`/requirement/project/init/**`，`req:project:*` | `ReqProjectController`、`ReqProjectInitController`、`ReqProjectInitServiceImpl` |
| 需求管理 | 项目接入中心 | 只读展示仓库索引状态、项目分支完成度、待处理项、索引批次和模块知识库 | `src/views/requirement/project/detail.vue` | `src/api/requirement/project.js`、`index.js` | `/requirement/project/init/{projectId}`，`req:project:query`；`/requirement/index/**`，`req:index:*` | `ReqProjectInitController`、`ReqIndexController`、`ReqRepositoryIndexServiceImpl` |
| 需求管理 | 分支知识库详情页签 | 按项目分支查看模块知识、索引批次和初始化指令 | `src/views/requirement/project/knowledge.vue` | `src/api/requirement/index.js`、`project.js` | `/requirement/index/module/tree`，`req:index:list`；`/requirement/index/batch/list`，`req:index:list` | `ReqIndexController`、`ReqRepositoryIndexServiceImpl` |
| 需求管理 | 需求列表 | 需求新增、编辑、查询、分支初始化校验和影响面推荐 | `src/views/requirement/demand/index.vue`、`detail.vue` | `src/api/requirement/demand.js`、`index.js` | `/requirement/demand/**`，`req:demand:*`；`/requirement/index/impact/suggest`，`req:index:list` | `ReqDemandController`、`ReqDemandServiceImpl`、`ReqIndexController` |
| 需求管理 | Agent 交接资料 | 查看和保存需求、计划、执行报告、Review 报告等 artifact | `src/views/requirement/package/index.vue` | `src/api/requirement/package.js` | `/requirement/package/**`，`req:package:*` | `ReqPackageController`、`ReqPackageServiceImpl` |
| 需求管理 | MCP 管理 | 管理人员 MCP Key，创建或重置后复制一次性 Key 和多平台 Codex 安装命令 | `src/views/requirement/mcpKey/index.vue` | `src/api/requirement/mcpKey.js` | `/requirement/mcp/key/**`，`/requirement/codex/install.*`，`req:mcp:key:*`；`/requirement/mcp` | `ReqMcpKeyController`、`ReqCodexInstallController`、`ReqMcpController`、`McpService` |
| 需求管理 | 使用统计 | 展示需求、项目、用户和状态统计 | `src/views/requirement/statistics/index.vue` | `src/api/requirement/statistics.js` | `/requirement/statistics/**`，`req:stats:view` | `ReqStatisticsController`、`ReqStatisticsService` |
| 需求管理 | 隐藏兼容能力 | 仓库、项目分支、人工模块兼容 CRUD，不作为左侧菜单独立入口 | `src/views/requirement/repository/index.vue`、`variant/index.vue`、`module/index.vue` | `src/api/requirement/repository.js`、`variant.js`、`module.js` | `/requirement/repository/**`、`/requirement/variant/**`、`/requirement/module/**` | `ReqRepositoryController`、`ReqVariantController`、`ReqModuleController` |

## 模块文件索引

| 类型 | 优先查看文件 | 说明 |
|---|---|---|
| 路由入口 | `src/router/index.js` | 需求管理隐藏页签和页面路由。 |
| 项目页面 | `src/views/requirement/project/*.vue` | 项目列表、维护页签、接入中心和分支知识库详情。 |
| 需求页面 | `src/views/requirement/demand/*.vue` | 需求列表、新增、编辑和详情。 |
| 交接资料 | `src/views/requirement/package/index.vue` | Agent artifact 保存和展示。 |
| MCP 管理 | `src/views/requirement/mcpKey/index.vue` | 人员 MCP Key 管理。 |
| 使用统计 | `src/views/requirement/statistics/index.vue` | 看板统计。 |
| API 封装 | `src/api/requirement/*.js` | 与后端 `/requirement/**` 契约保持一致。 |
| 后端契约 | `docs/ai-harness/contracts/requirement-platform-ui.md` | 前端请求、响应和 UI 状态约束。 |

## 不变量

- API 路径必须与后端 `/requirement/**` 保持一致。
- 按钮权限必须使用后端菜单脚本和 Controller 中的 `req:*` 权限标识。
- 列表页使用 RuoYi `pagination` 和 `right-toolbar` 模式。
- 普通增删改表单可使用 Element UI `el-dialog` 和 `el-form`；项目维护属于重型流程，必须使用独立页签承载。
- 项目管理新增和修改入口必须打开项目维护页签，页签单页展示项目信息、代码仓库、分支配置和模块初始化状态，不再使用弹窗或分步向导。
- 分支配置是项目管理里的深层级栏目：每个分支行必须能展示自己的初始化指令复制入口、真实分支、模块总数、手工模块数、索引模块数、索引仓库数和最近索引状态。
- 项目列表的初始化状态必须来自后端 `initChecklist`，不得只按前端本地行状态臆测；进入项目接入中心的操作文案必须体现状态查看语义，不能只写“接入”造成点击即执行的误解。
- 项目接入中心必须收敛为只读状态面板，展示项目接入完成度、待处理项、仓库索引状态、项目分支完成度、索引批次和模块知识库；配置、保存和初始化指令主复制入口属于项目维护页签。
- 仓库、项目分支和模块知识不再作为独立左侧菜单入口；项目维护页签是仓库和项目分支的主维护入口，项目接入中心只读展示仓库、分支、索引批次和模块知识库，并提供返回维护页的辅助入口。
- 仓库维护只保存团队共享 Git 远端、仓库类型和默认分支，允许纯后端服务只登记一条后端仓库，不保存个人本机绝对路径。
- 项目分支维护中文标签、真实分支名和后端生成的初始化指令；指令复制内容必须来自 `initInstruction.content`，包含简短提示词和 `actionToken`，旧 `mcpKey` 只作为兼容降级展示。接入中心不得再把初始化指令作为分支表格主列。
- 分支知识库详情必须通过新页签展示，项目接入中心的分支表不再使用展开行承载知识库详情。
- MCP 索引用 `actionToken + remoteUrl` 识别项目、分支和代码仓库；旧 `mcpKey + remoteUrl` 仅作为兼容路径。
- MCP 管理创建或重置 Key 后，结果弹窗必须优先展示 `codexSetupPackage.installCommands` 的多平台代码块命令；前端只在当前页面会话内把一次性 `plainKey` 填入命令并允许重复打开复制，刷新后不得恢复明文 Key。完整 JSON 安装包只作为高级配置/调试信息。
- 模块和知识库必须同时关联项目与项目分支。需求表单选择模块时按 `projectId + variantId` 过滤，项目接入中心的索引批次和模块知识库也按选中分支展示。
- 新增和编辑需求的项目分支下拉只能展示已初始化完成的分支，数据来自项目初始化上下文的分支行级 `totalModules`、`indexedRepositoryCount` 和 `unindexedRepositoryCount`。需求列表查询筛选可以继续展示全部分支，避免历史需求不可检索。
- 需求表单的影响面推荐只追加候选内容，不强制覆盖人工输入。
- Agent 交接资料内容使用 textarea，不引入 Markdown 编辑器依赖。
- Harness 初始化模板由需求平台存储和下发给 Codex；前端不直接写文件，后端不直接执行 Git 或文件系统写入。
- MCP 管理页面只管理绑定到人员的访问 Key。页面不得常驻展示 MCP 地址、`X-MCP-Key` 请求头、Codex 配置、全局 Skill 包或 Codex 安装包；创建或重置后只在结果弹窗展示一次明文 Key 和 Codex 安装包，列表不得展示明文或哈希。
- MCP 管理菜单和按钮必须使用 `req:mcp:key:*` 权限，提需求人员角色默认不分配这些权限。
- 人员 MCP Key 不能替代项目分支动作 token：页面负责人员认证 Key，项目接入和索引指引中的 `actionToken` 是项目分支和目标动作识别 token。
- 用户可见系统名称统一为“统一需求流转平台”，登录页、首页、导航入口和页脚不得保留若依官网、若依文档或默认更新日志入口。

## 风险点

- 后端接口未运行时，页面只能通过构建验证，不能宣称完成联调。
- MCP 管理页面依赖后端 `/requirement/mcp/key/**` 和系统用户列表接口；只有前端构建通过时，不能宣称 Key 创建、权限隔离或 Codex 调用已经完成运行态联调。
- 项目列表会对当前页项目逐个读取初始化上下文；后续如项目数明显增加，可考虑后端增加批量初始化状态接口。
- 初始化指令中的明文 `actionToken` 只用于复制给 MCP 调用，前端不得持久化到本地存储、查询条件或日志；缺少 `initInstruction` 时只能展示兼容降级提示。
- Agent 交接资料存在多个 artifact type，前端 tab 的 key 必须使用后端支持的类型值。
- Harness 初始化失败时，必须区分平台模板生成失败、Codex 本地写入失败、仓库远端不匹配和校验脚本失败，不能统一显示为“初始化失败”。
- 索引推荐依赖后端 `/requirement/index/**` 接口，且必须让后端按项目分支 `variantId` 解析真实分支并限定最新索引批次；接口缺失时需求表单只能保留人工填写影响范围。
- 旧数据如果存在 `variantId` 为空的项目级模块，不能在分支知识库里默认混入；需要由团队迁移或重新初始化到对应项目分支。
- 统计表格返回字段是聚合字段，不能按基础实体字段假设。

## 验证建议

- 最低验证：`npm run build:prod`。
- 页面冒烟：启动前端后打开登录页、首页看板、项目管理、项目维护页签、项目接入中心、分支知识库详情页签、需求列表、Agent 交接资料、MCP 管理和统计页面，检查 console 无本次变更相关错误。
- 跨端联调：后端启动后验证项目初始化新增、编辑回显、初始化指令复制、actionToken 索引导入、列表状态刷新、索引批次展示、影响面推荐、需求新增、Agent 交接资料保存、MCP Key 用户选择、创建/重置/停用和统计接口。
