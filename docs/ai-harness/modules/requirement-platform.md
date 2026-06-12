# 需求管理平台前端模块 Harness

## 模块范围

本模块覆盖 `reqflow-ui/src/api/requirement/**` 和 `reqflow-ui/src/views/requirement/**`。页面基于 RuoYi-Vue、Vue 2 和 Element UI 实现，不引入新依赖。

## 菜单与功能入口

| 菜单目录 | 子菜单/页面 | 功能说明 | 前端文件 | API 封装 | 后端接口与权限 | 后端核心文件 |
|---|---|---|---|---|---|---|
| 需求管理 | 项目管理 | 项目列表、项目维护入口和初始化状态 | `src/views/requirement/project/index.vue`、`maintain.vue` | `src/api/requirement/project.js`、`projectInit.js` | `/requirement/project/**`，`req:project:*`；`/requirement/project/init/**`，`req:project:*` | `ReqProjectController`、`ReqProjectInitController`、`ReqProjectInitServiceImpl` |
| 需求管理 | 分支知识库详情页签 | 按项目分支查看模块知识、索引批次和初始化指令 | `src/views/requirement/project/knowledge.vue` | `src/api/requirement/index.js`、`project.js` | `/requirement/index/module/tree`，`req:index:list`；`/requirement/index/batch/list`，`req:index:list` | `ReqIndexController`、`ReqRepositoryIndexServiceImpl` |
| 需求管理 | 需求列表 | 需求新增维护页签、编辑维护页签、查询、管理员删除、状态按钮、详情资料展示、返修版本记录、生成需求设计指令和执行任务指令复制 | `src/views/requirement/demand/index.vue`、`maintain.vue`、`detail.vue`、`status.js` | `src/api/requirement/demand.js`、`index.js` | `/requirement/demand/**`，`req:demand:*`；删除使用 `req:demand:remove`；`/requirement/index/impact/suggest` 可由需求权限读取 | `ReqDemandController`、`ReqDemandServiceImpl`、`ReqIndexController` |
| 需求管理 | Agent 交接资料 | 查看和保存需求设计、执行计划、执行报告、Review 报告等 artifact；详情页内嵌读取使用需求详情权限 | `src/views/requirement/package/index.vue` | `src/api/requirement/package.js` | `/requirement/package/**`，读取为 `req:package:list` 或 `req:demand:query`，保存为 `req:package:save` | `ReqPackageController`、`ReqPackageServiceImpl` |
| 需求管理 | MCP 管理 | 管理人员 MCP Key，创建或重置后复制一次性 Key 和多平台 Codex 安装命令 | `src/views/requirement/mcpKey/index.vue` | `src/api/requirement/mcpKey.js` | `/requirement/mcp/key/**`，`/requirement/codex/install.*`，`req:mcp:key:*`；`/requirement/mcp` | `ReqMcpKeyController`、`ReqCodexInstallController`、`ReqMcpController`、`McpService` |
| 需求管理 | 使用统计 | 展示需求、项目、用户和状态统计 | `src/views/requirement/statistics/index.vue` | `src/api/requirement/statistics.js` | `/requirement/statistics/**`，`req:stats:view` | `ReqStatisticsController`、`ReqStatisticsService` |
| 需求管理 | 隐藏兼容能力 | 仓库、项目分支、人工模块兼容 CRUD，不作为左侧菜单独立入口 | `src/views/requirement/repository/index.vue`、`variant/index.vue`、`module/index.vue` | `src/api/requirement/repository.js`、`variant.js`、`module.js` | `/requirement/repository/**`、`/requirement/variant/**`、`/requirement/module/**` | `ReqRepositoryController`、`ReqVariantController`、`ReqModuleController` |

## 模块文件索引

| 类型 | 优先查看文件 | 说明 |
|---|---|---|
| 路由入口 | `src/router/index.js` | 需求管理隐藏页签和页面路由。 |
| 全局布局 | `src/layout/**`、`src/settings.js`、`src/plugins/tab.js` | 固定左侧浅色布局、标签页返回和品牌入口。 |
| 项目页面 | `src/views/requirement/project/*.vue` | 项目列表、维护页签和分支知识库详情。 |
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
- 普通增删改表单可使用 Element UI `el-dialog` 和 `el-form`；项目维护和需求维护属于重型流程，必须使用独立页签承载。
- 项目管理新增和修改入口必须打开项目维护页签，页签单页展示项目信息、代码仓库、分支配置和模块初始化状态，不再使用弹窗或分步向导。
- 分支配置是项目管理里的深层级栏目：每个分支行必须能展示自己的初始化指令复制入口、真实分支、模块总数、手工模块数、索引模块数、索引仓库数和最近索引状态。
- 项目列表的初始化状态必须来自后端 `initChecklist`，不得只按前端本地行状态臆测；项目列表操作列只保留维护和删除等真实操作，不再提供独立状态页入口。
- 项目维护页签是项目配置、仓库、项目分支、初始化指令和初始化状态的主入口；保存后留在维护页刷新状态，不再跳转到重复的状态页面。
- 仓库、项目分支和模块知识不再作为独立左侧菜单入口；项目维护页签是仓库和项目分支的主维护入口，分支知识库页签承接索引批次和模块知识库查看。
- 仓库维护只保存团队共享 Git 远端、仓库类型和默认分支，允许纯后端服务只登记一条后端仓库，不保存个人本机绝对路径。
- 项目分支维护中文标签、真实分支名和后端生成的初始化指令；指令复制内容必须来自 `initInstruction.content`，包含简短提示词和 `actionToken`，旧 `mcpKey` 只作为兼容降级展示。
- 分支知识库详情必须通过新页签展示，不在项目列表或维护表格中使用展开行承载知识库详情。
- MCP 索引用 `actionToken + remoteUrl` 识别项目、分支和代码仓库；旧 `mcpKey + remoteUrl` 仅作为兼容路径。
- MCP 管理创建或重置 Key 后，结果弹窗必须优先展示 `codexSetupPackage.installCommands` 的多平台代码块命令；前端只在当前页面会话内把一次性 `plainKey` 填入命令并允许重复打开复制，刷新后不得恢复明文 Key。完整 JSON 安装包只作为高级配置/调试信息。
- 模块和知识库必须同时关联项目与项目分支。需求维护页签选择模块时按 `projectId + variantId` 过滤，优先读取知识库模块，并兼容人工模块；分支知识库页签的索引批次和模块知识库也按选中分支展示。
- 新增和编辑需求的项目分支下拉只能展示已初始化完成的分支，数据来自项目初始化上下文的分支行级 `indexedRepositoryCount` 和 `unindexedRepositoryCount`。新功能提需允许当前分支暂时没有既有模块知识；需求列表查询筛选可以继续展示全部分支，避免历史需求不可检索。
- 需求维护页签允许填写新功能名称并通过需求备注提交；列表和详情在没有模块标识时展示该新功能名称。
- 影响范围不在需求维护页签和详情页展示；保存时按知识库推荐自动写入后端影响字段，没有推荐内容时提交空值。
- Agent 交接资料内容使用 textarea，不引入 Markdown 编辑器依赖。
- Harness 初始化模板由需求平台存储和下发给 Codex；前端不直接写文件，后端不直接执行 Git 或文件系统写入。
- MCP 管理页面只管理绑定到人员的访问 Key。页面不得常驻展示 MCP 地址、`X-MCP-Key` 请求头、Codex 配置、全局 Skill 包或 Codex 安装包；创建或重置后只在结果弹窗展示一次明文 Key 和 Codex 安装包，列表不得展示明文或哈希。
- MCP 管理菜单和按钮必须使用 `req:mcp:key:*` 权限，需求人员角色默认不分配这些权限；开发人员角色可见 MCP 管理菜单。
- 人员 MCP Key 不能替代项目分支动作 token：页面负责人员认证 Key，项目接入和索引指引中的 `actionToken` 是项目分支和目标动作识别 token。
- 用户可见系统名称统一为“统一需求流转平台”，登录页、首页、导航入口和页脚不得保留若依官网、若依文档或默认更新日志入口。
- 后台布局固定为浅色左侧菜单，用户可见入口不得再提供布局设置抽屉；历史本地 `layout-setting` 中的 `sideTheme` 和 `navType` 不应覆盖目标布局。
- 隐藏页签从父菜单打开时必须携带 `parentPath` 或依赖路由 `meta.activeMenu`；关闭/返回时优先回父菜单，不得跳到最后打开的无关标签。
- 新增需求维护页签不得展示需求编号和创建人 ID；保存 payload 不提交 `demandNo`、`creatorId` 和状态字段，编号、创建人和默认状态由后端生成。
- 修改需求维护页签中需求编号只能用文本展示，不允许使用 input 样式；非 `draft` 需求进入维护页签时前端应只读，后端仍负责最终拦截。
- 新增和修改需求维护页签必须填写需求来源；业务背景使用富文本编辑器，支持粘贴图片；需求附件通过上传组件保存，图片和附件均走 `/requirement/demand/upload`，前端单文件限制 2MB。
- 需求列表操作列不展示 Agent 交接资料入口；需求详情页直接内嵌当前需求的 Agent 交接资料包，以当前需求标题为区块标题，按文档类型展示最新内容和历史版本，不再额外重复展示一组独立的需求设计/执行计划预览；详情页展示“复制生成需求设计指令”和“复制执行任务指令”按钮。
- 需求删除按钮只使用 `req:demand:remove` 展示，预期仅管理员可见；需求人员和开发人员不可见删除入口。
- 以 `demandId` 上下文打开 Agent 交接资料页时，页面必须以当前需求为上下文，只展示需求标题和各类文档内容；不得展示需求 ID 查询、手动生成资料、加载最新或保存新版本等管理动作。
- 需求详情页必须区分流程推进按钮和跳转/复制类协作工具：流程推进按钮放在详情标题区右侧，协作工具放在详情正文工具区，避免状态决策和页面跳转混在同一按钮组。
- 需求状态文案以 `src/views/requirement/demand/status.js` 为准：新主流程为未提交、待生成需求设计、需求设计待确认、待执行开发、开发中、待验收、返修中、已完成；旧 `需求设计生成中`、`已归档` 仅作为兼容状态展示。
- 流程按钮由 `status.js` 统一定义，并同时按角色和 `req:demand:edit` 按钮权限过滤：需求人员可提交需求、确认需求设计、提交返修和确认验收；开发人员可提交需求设计、开始开发、提交验收和提交返修验收；管理员角色可见全部流程按钮。
- 待验收状态必须同时提供“提交返修”和“确认验收”；返修中状态提交后回到待验收。详情页应通过 `/requirement/package/{demandId}` 展示需求设计、执行计划和执行报告等产物的历史版本，用于判断返修轮次。
- 初始化指令、生成需求设计指令和执行任务指令中的 actionToken 均为后端生成的一次性短时 token，前端只展示和复制后端返回内容，不得写入本地存储；过期或已使用后用户需要重新生成指令。
- 角色菜单预期：管理员可见全部功能；需求人员只可见首页、需求列表和使用统计，仍可在需求详情内查看当前需求资料；开发人员可见首页、需求列表、MCP 管理和使用统计。
- 首页快捷入口必须按 Vuex `permissions` 过滤：没有 `req:mcp:key:list` 时不展示 MCP 管理，没有 `req:project:list` 时不展示项目管理，需求人员首页不得出现 MCP 管理快捷入口。

## 风险点

- 后端接口未运行时，页面只能通过构建验证，不能宣称完成联调。
- MCP 管理页面依赖后端 `/requirement/mcp/key/**` 和系统用户列表接口；只有前端构建通过时，不能宣称 Key 创建、权限隔离或 Codex 调用已经完成运行态联调。
- 项目列表会对当前页项目逐个读取初始化上下文；后续如项目数明显增加，可考虑后端增加批量初始化状态接口。
- 初始化指令、生成需求设计指令和执行任务指令中的明文 `actionToken` 只用于复制给 MCP 调用，前端不得持久化到本地存储、查询条件或日志；缺少 `initInstruction` 时只能展示兼容降级提示。
- Agent 交接资料存在多个 artifact type，前端 tab 的 key 必须使用后端支持的类型值。
- Harness 初始化失败时，必须区分平台模板生成失败、Codex 本地写入失败、仓库远端不匹配和校验脚本失败，不能统一显示为“初始化失败”。
- 索引推荐依赖后端 `/requirement/index/**` 接口，且必须让后端按项目分支 `variantId` 解析真实分支并限定最新索引批次；接口缺失时需求表单只能保留人工填写影响范围。
- 旧数据如果存在 `variantId` 为空的项目级模块，不能在分支知识库里默认混入；需要由团队迁移或重新初始化到对应项目分支。
- 统计表格返回字段是聚合字段，不能按基础实体字段假设。

## 验证建议

- 最低验证：`npm run build:prod`。
- 页面冒烟：启动前端后打开登录页、首页看板、项目管理、项目维护页签、分支知识库详情页签、需求列表、Agent 交接资料、MCP 管理和统计页面，检查 console 无本次变更相关错误。
- 跨端联调：后端启动后验证项目初始化新增、编辑回显、初始化指令复制、actionToken 索引导入、列表状态刷新、索引批次展示、影响面推荐、需求新增、Agent 交接资料保存、MCP Key 用户选择、创建/重置/停用和统计接口。
