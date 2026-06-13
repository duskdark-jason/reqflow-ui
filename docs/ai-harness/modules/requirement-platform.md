# 需求管理平台前端模块 Harness

## 模块范围

本模块覆盖 `reqflow-ui/src/api/requirement/**` 和 `reqflow-ui/src/views/requirement/**`。页面基于 RuoYi-Vue、Vue 2 和 Element UI 实现，不引入新依赖。

## 菜单与功能入口

| 菜单目录 | 子菜单/页面 | 功能说明 | 前端文件 | API 封装 | 后端接口与权限 | 后端核心文件 |
|---|---|---|---|---|---|---|
| 需求管理 | 项目管理 | 项目列表、项目维护入口和初始化状态 | `src/views/requirement/project/index.vue`、`maintain.vue` | `src/api/requirement/project.js`、`projectInit.js` | `/requirement/project/**`，`req:project:*`；`/requirement/project/init/**`，`req:project:*` | `ReqProjectController`、`ReqProjectInitController`、`ReqProjectInitServiceImpl` |
| 需求管理 | 分支知识库详情页签 | 按项目分支查看模块知识、索引批次和初始化指令 | `src/views/requirement/project/knowledge.vue` | `src/api/requirement/index.js`、`project.js` | `/requirement/index/module/tree`，`req:index:list`；`/requirement/index/batch/list`，`req:index:list` | `ReqIndexController`、`ReqRepositoryIndexServiceImpl` |
| 需求管理 | 需求列表 | 需求新增维护页签、编辑维护页签、查询、管理员删除、状态按钮、详情资料展示、返修版本记录、按阶段生成需求分析、需求设计、执行任务、返修任务和合并归档指令复制 | `src/views/requirement/demand/index.vue`、`maintain.vue`、`detail.vue`、`status.js` | `src/api/requirement/demand.js`、`index.js` | `/requirement/demand/**`，`req:demand:*`；删除使用 `req:demand:remove`；`/requirement/index/impact/suggest` 可由需求权限读取 | `ReqDemandController`、`ReqDemandServiceImpl`、`ReqIndexController` |
| 需求管理 | Agent 交接资料 | 查看和保存需求可行性评估、需求设计、执行计划、执行报告、Review 报告等 artifact；详情页内嵌读取使用需求详情权限 | `src/views/requirement/package/index.vue`、`src/views/requirement/demand/detail.vue` | `src/api/requirement/package.js` | `/requirement/package/**`，读取为 `req:package:list` 或 `req:demand:query`，保存为 `req:package:save` | `ReqPackageController`、`ReqPackageServiceImpl` |
| 需求管理 | MCP 管理 | 管理人员 MCP Key 和管理员 MCP 请求地址配置；普通用户新增默认绑定自己，管理员可指定用户；后端返回明文 Key 只用于渲染统一安装命令，列表和弹窗不单独展示明文 Key 或 Key 前缀；统一命令执行后选择 Codex、Claude Code、Trae、Qoder、CodeBuddy、OpenCode 或全部工具 | `src/views/requirement/mcpKey/index.vue` | `src/api/requirement/mcpKey.js` | `/requirement/mcp/key/**`，`/requirement/codex/install.*`，`req:mcp:key:*`；`/requirement/mcp` | `ReqMcpKeyController`、`ReqCodexInstallController`、`ReqMcpController`、`McpService` |
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
| Harness 导航 | `docs/ai-harness/search-map.md`、`docs/process/local-harness-workflow.md` | 初次接触模型的关键词索引，以及未接入 MCP 时的本地闭环流程。 |

## 不变量

- API 路径必须与后端 `/requirement/**` 保持一致。
- 发布默认前端静态访问项目名为 `/reqflow/`，生产 API 前缀为 `/reqflow-api`；开发环境对外仍使用 `/dev-api`，代理到后端 `/reqflow-api` context-path。
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
- MCP 管理创建 Key 或打开使用指令后，结果弹窗必须优先展示 `codexSetupPackage.installCommands` 的统一安装指令；前端不得按 Codex、Claude Code、Trae、Qoder、CodeBuddy、OpenCode 分组展示普通安装内容，也不得单独展示明文 Key、Key 前缀或哈希字段。前端用后端返回的顶层 `plainKey` 或 `key.plainKey` 渲染统一安装命令，确保下次打开使用指令仍能复制真实明文 Key；统一命令执行后由脚本提示用户选择安装工具；完整 JSON 安装包只作为高级配置/调试信息，里面可以保留 `clientInstructions` 供手工配置、自动化指定 `--client`/`-Client` 或排障。
- 模块和知识库必须同时关联项目与项目分支。需求维护页签选择模块时按 `projectId + variantId` 过滤，优先读取知识库模块；前后端 companion 项目存在前端页面知识模块时，只向需求人员展示前端菜单/页面模块，没有前端页面模块时才兼容人工模块和其他索引模块；分支知识库页签的索引批次和模块知识库也按选中分支展示。
- 新增和编辑需求的项目分支下拉只能展示已初始化完成的分支，数据来自项目初始化上下文的分支行级 `indexedRepositoryCount` 和 `unindexedRepositoryCount`。新功能提需允许当前分支暂时没有既有模块知识；需求列表查询筛选可以继续展示全部分支，避免历史需求不可检索。
- 需求维护页签允许填写新功能名称并通过需求备注提交；列表和详情在没有模块标识时展示该新功能名称。
- 影响范围不在需求维护页签和详情页展示；保存时按知识库推荐自动写入后端影响字段，没有推荐内容时提交空值。
- Agent 交接资料在需求详情和 `demandId` 聚焦模式下使用只读 Markdown 阅读态展示，必须先转义 HTML 再渲染标题、列表、引用、代码块等常见 Markdown；独立管理模式可保留 textarea 保存能力，不引入 Markdown 编辑器依赖。
- Harness 初始化模板由需求平台存储和下发给 Codex；前端不直接写文件，后端不直接执行 Git 或文件系统写入。执行初始化的本地 agent 必须先拉取默认基线最新代码，初始化校验通过后提交并推送 harness 文件，再登记初始化结果。
- 前端 harness 必须和后端模板保持一致：包含 `docs/ai-harness/search-map.md`、`docs/process/local-harness-workflow.md`，并在 `harness-index.json` 登记 `searchMap` 和 `localHarnessWorkflow` 入口。
- 本地 Harness 模式和 MCP 接入模式必须共享需求设计确认点：`planning` 阶段只允许迭代 `meta.md` 和 `requirement.md`；`plan.md`、`execution-report.md`、`review-report.md` 必须等明确执行授权后由 Execution Agent/Review Agent 按阶段生成。
- MCP 管理页面管理绑定到人员的访问 Key，并在管理员角色下展示“配置请求地址”入口。普通用户新增 Key 默认绑定自己且不可修改绑定用户，管理员才可指定用户；页面不得提供修改、重置 Key 或“重新打开安装命令”工具栏入口，需要再次查看命令时从对应 Key 行点击“使用指令”。管理员点击入口后弹窗调用 `/requirement/mcp/key/config` 读取和保存 `publicHost`，只允许填写域名/IP和端口，不填写协议或路径；普通开发人员不展示该入口。页面不得常驻展示 `X-MCP-Key` 请求头、客户端配置、全局 Skill 包或安装包；创建和使用指令弹窗只展示统一安装命令和高级配置，列表不得展示明文 Key、Key 前缀或哈希。
- MCP 管理菜单和按钮必须使用 `req:mcp:key:*` 权限，需求人员角色默认不分配这些权限；开发人员角色可见 MCP 管理菜单。
- 人员 MCP Key 不能替代项目分支动作 token：页面负责人员认证 Key，项目接入和索引指引中的 `actionToken` 是项目分支和目标动作识别 token。
- 前端不得自行拼接 MCP endpoint；MCP 安装包中的远程地址由后端 `codexSetupPackage` 返回，管理员配置弹窗只保存 host/port 并展示后端返回的完整地址。发布默认应为 `/reqflow-api/requirement/mcp`，不得使用静态访问项目名作为 MCP 前缀。
- 用户可见系统名称统一为“统一需求流转平台”，登录页、首页、导航入口和页脚不得保留若依官网、若依文档或默认更新日志入口。
- 后台布局固定为浅色左侧菜单，用户可见入口不得再提供布局设置抽屉；历史本地 `layout-setting` 中的 `sideTheme` 和 `navType` 不应覆盖目标布局。
- 隐藏页签从父菜单打开时必须携带 `parentPath` 或依赖路由 `meta.activeMenu`；关闭/返回时优先回父菜单，不得跳到最后打开的无关标签。
- 新增需求维护页签不得展示需求编号和创建人 ID；保存 payload 不提交 `demandNo`、`creatorId` 和状态字段，编号、创建人和默认状态由后端生成。
- 新增和修改需求维护页签必须选择指定开发人员，选项来自 `/requirement/demand/developer-options`，不调用系统用户列表；该开发人员同时负责需求设计和执行开发，不再拆分两段人员。
- 修改需求维护页签中需求编号只能用文本展示，不允许使用 input 样式；非 `draft` 需求进入维护页签时前端应只读，后端仍负责最终拦截。
- 新增和修改需求维护页签必须填写需求来源，来源是自由文本输入项；业务背景使用普通多行文本框，只保存文本内容；在业务背景框内粘贴图片或文件时，前端自动调用 `/requirement/demand/upload` 并追加到需求附件。需求附件位于预期结果上一行，仅支持 Word、Excel、PDF、TXT、PPT 和常见图片格式，前端单文件限制 2MB。
- 需求列表操作列不展示 Agent 交接资料入口；需求详情页直接内嵌当前需求的 Agent 交接资料包，以当前需求标题为区块标题，一级标签只展示需求草稿、需求可行性评估、需求设计、执行计划、执行报告和 Review 报告等业务文档标签，并按状态默认切换到当前阶段相关标签；补充说明不单独显示标签，需求人补充记录折叠展示在需求可行性评估标签内，需求设计调整记录折叠展示在需求设计标签内，标签正文不限制高度；不再额外重复展示一组独立的需求设计/执行计划预览；详情页不展示协作工具栏和指令内容预览，只在标题状态区按当前阶段展示一个独立生成按钮。
- 需求删除按钮只使用 `req:demand:remove` 展示，预期仅管理员可见；需求人员和开发人员不可见删除入口。
- 以 `demandId` 上下文打开 Agent 交接资料页时，页面必须以当前需求为上下文，只展示需求标题和各类文档内容；不得展示需求 ID 查询、手动生成资料、加载最新或保存新版本等管理动作。
- 需求详情页必须区分流程推进按钮和生成指令按钮：流程推进按钮是实心胶囊确认按钮；生成按钮是白底描边按钮，和流程确认按钮同处标题状态区但视觉上明显区分。前端只复制后端返回指令，不在页面展开展示指令内容。`confirmed` 待执行开发阶段不展示生成执行指令，指定开发人员点击开始开发进入 `developing` 后才展示生成执行指令。`plan_ready` 需求设计待确认状态下，需求创建人除了确认需求设计，还必须能打开“补充调整说明”输入区；输入区展开后隐藏确认需求设计按钮，提交后回到 `plan_pending`，由指定开发人员按新说明重新生成需求设计，支持多轮迭代。
- 需求状态文案以 `src/views/requirement/demand/status.js` 为准：新主流程为未提交、待需求分析、待补充说明、待生成需求设计、需求设计待确认、待执行开发、开发中、待验收、返修中、待合并归档、已完成、需求无法实现；`已归档` 仅作为归档状态展示。流程按钮中 `submitted` 和 `plan_pending` 不直接提交固定状态，而是打开结论选择弹窗，开发人员可选择“可继续设计/设计完成”“需要补充说明”或“需求无法实现”，由后端状态机更新到 `plan_pending`、`plan_ready`、`supplement_required` 或 `rejected`。
- 流程按钮由 `status.js` 统一定义，并同时按角色、`req:demand:edit` 按钮权限和当前行参与人过滤：需求创建人可提交需求、提交补充说明、确认需求设计、提交返修和确认验收；指定开发人员可提交需求分析结论、需求设计结论、开始开发、提交验收、提交返修验收和确认归档完成；管理员角色可见全部流程按钮。
- 需求详情在 `supplement_required` 状态且当前用户为需求创建人或管理员时展示补充说明输入区，提交后调用 `/requirement/demand/{demandId}/supplement` 并回到待生成需求设计阶段；在 `plan_ready` 状态且当前用户为需求创建人或管理员时，默认展示确认需求设计和补充调整说明入口，点击补充调整说明后才展示输入区并隐藏确认按钮，同一接口追加 `requirement_supplement` 版本并回到 `plan_pending`。
- 需求列表和详情必须展示指定开发人员；非管理员只能看到后端返回的参与人范围内需求，前端按钮也必须避免让其他开发人员看到不属于自己的流转入口。
- 待验收状态必须同时提供“提交返修”和“确认验收”；返修中状态提交后回到待验收；确认验收后进入待合并归档，详情页应通过 `/requirement/package/{demandId}` 展示需求可行性评估、需求设计、执行计划、执行报告和 Review 报告等产物的历史版本，用于判断返修轮次。
- 初始化指令、需求分析指令、需求生成指令、执行任务指令、返修任务指令和合并归档指令中的 actionToken 均为后端生成，前端只展示和复制后端返回内容，不得写入本地存储；过期、已使用或需求流转到下一阶段后用户需要重新生成指令。需求分析指令只包含 `upload_requirement_assessment` 和一个需求分析 token；需求生成指令只包含 `save_requirement_package` 和一个需求生成 token；执行任务指令包含执行计划、执行报告和 Review 报告三个回写工具共用的开发阶段 token；返修任务指令只包含执行报告和 Review 报告两个回写工具共用的返修阶段 token；合并归档指令包含 squash merge、push、`publish_repository_index`、平台验证和删除本地开发分支步骤，前端仅复制后端内容。
- 角色菜单预期：管理员可见全部功能；需求人员只可见首页、需求列表和使用统计，仍可在需求详情内查看自己创建的需求资料；开发人员可见首页、需求列表、MCP 管理和使用统计，但只能处理已提交后指定给自己的需求。
- 首页快捷入口必须按 Vuex `permissions` 过滤：没有 `req:mcp:key:list` 时不展示 MCP 管理，没有 `req:project:list` 时不展示项目管理；有 `req:demand:add` 时需求入口展示“提交需求”，仅有需求查看/处理权限的开发人员展示“查看需求”；需求人员首页不得出现 MCP 管理快捷入口。快捷入口的 `path` 必须使用后端菜单脚本中的路由 path 组合，不得使用组件路径；MCP 管理入口为 `/requirement/mcp-key`。

## 风险点

- 后端接口未运行时，页面只能通过构建验证，不能宣称完成联调。
- MCP 管理页面依赖后端 `/requirement/mcp/key/**` 和系统用户列表接口；管理员配置弹窗依赖 `/requirement/mcp/key/config`。只有前端构建通过时，不能宣称 Key 创建、权限隔离、请求地址保存或 Codex 调用已经完成运行态联调。
- 子路径发布时需要同时检查 `dist/index.html` 静态资源引用包含 `/reqflow/`，并确认构建产物不再引用模板默认 `/prod-api`。
- 项目列表会对当前页项目逐个读取初始化上下文；后续如项目数明显增加，可考虑后端增加批量初始化状态接口。
- 初始化指令、需求分析指令、需求生成指令、执行任务指令和返修任务指令中的明文 `actionToken` 只用于复制给 MCP 调用，前端不得持久化到本地存储、查询条件或日志；缺少 `initInstruction` 时只能展示兼容降级提示。
- Agent 交接资料存在多个 artifact type，前端 tab 的 key 必须使用后端支持的类型值。
- Harness 初始化失败时，必须区分平台模板生成失败、Codex 本地写入失败、仓库远端不匹配和校验脚本失败，不能统一显示为“初始化失败”。
- Harness 模板或脚本调整时，必须同步后端模板源、当前后端 harness、前端 harness 和 `search-map.md`；确认点门禁不能只写在文档里，必须由 `scripts/check-harness.sh` 测试覆盖。
- 索引推荐依赖后端 `/requirement/index/**` 接口，且必须让后端按项目分支 `variantId` 解析真实分支并限定最新索引批次；接口缺失时需求表单只能保留人工填写影响范围。
- 旧数据如果存在 `variantId` 为空的项目级模块，不能在分支知识库里默认混入；需要由团队迁移或重新初始化到对应项目分支。
- 统计表格返回字段是聚合字段，不能按基础实体字段假设。

## 验证建议

- 最低验证：`npm run build:prod`。
- 页面冒烟：启动前端后打开登录页、首页看板、项目管理、项目维护页签、分支知识库详情页签、需求列表、Agent 交接资料、MCP 管理和统计页面，检查 console 无本次变更相关错误。
- 跨端联调：后端启动后验证项目初始化新增、编辑回显、初始化指令复制、actionToken 索引导入、列表状态刷新、索引批次展示、影响面推荐、需求新增、Agent 交接资料保存、MCP Key 用户选择、创建、使用指令和统计接口。
