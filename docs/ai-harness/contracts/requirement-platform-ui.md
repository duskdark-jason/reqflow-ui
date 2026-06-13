# 需求管理平台前端接口调用契约

## 后端依赖

后端 companion 契约：`../../../../reqflow-be/docs/ai-harness/contracts/requirement-platform-api.md`。

## API 文件映射

| API 文件 | 后端路径 | 说明 |
|---|---|---|
| `project.js` | `/requirement/project` | 项目 CRUD |
| `projectInit.js` | `/requirement/project/init` | 项目初始化聚合查询、新增和更新 |
| `repository.js` | `/requirement/repository` | 项目仓库内部兼容查询 |
| `variant.js` | `/requirement/variant` | 项目分支内部兼容查询 |
| `module.js` | `/requirement/module` | 人工模块兼容接口，左侧菜单不再暴露 |
| `index.js` | `/requirement/index` | 仓库索引批次、模块知识和影响面推荐 |
| `demand.js` | `/requirement/demand` | 需求列表、开发人员候选、维护页签、详情、保存、状态流转、需求补充说明、生成需求分析、需求设计、执行任务、返修任务、合并归档指令和归档验证结果 |
| `package.js` | `/requirement/package` | Agent 交接资料列表、最新版本、保存新版本和生成草稿资料；需求详情内嵌读取可用需求查询权限 |
| `statistics.js` | `/requirement/statistics` | 使用统计 |
| `harness.js` | `/requirement/project/*/harness-*` | 项目接入 harness 模板包查询和初始化结果登记 |
| `mcpKey.js` | `/requirement/mcp/key` | MCP 人员 Key 列表、创建、删除、使用指令、用户选择和管理员请求地址配置 |

生产发布时，前端静态访问项目名为 `/reqflow/`，生产 API baseURL 为 `/reqflow-api`；开发环境仍以 `/dev-api` 访问代理，由 `vue.config.js` 转发到后端 `/reqflow-api` context-path。前端 API 文件继续维护 `/requirement/**` 相对业务路径，不把发布项目前缀写入业务 API 封装。

## 权限标识

| 页面 | 主要权限 |
|---|---|
| 项目管理 | `req:project:list`、`req:project:add`、`req:project:edit`、`req:project:remove`、`req:project:query` |
| 项目索引 | `req:index:list`、`req:index:import` |
| 需求列表 | `req:demand:list`、`req:demand:query`、`req:demand:add`、`req:demand:edit`；删除按钮使用 `req:demand:remove` |
| Agent 交接资料 | 独立菜单使用 `req:package:list`、`req:package:save`；需求详情内嵌读取使用 `req:demand:query` |
| MCP管理 | `req:mcp:key:list`、`req:mcp:key:query`、`req:mcp:key:add`、`req:mcp:key:remove` |
| 使用统计 | `req:stats:view` |

## 项目初始化契约

- 项目管理菜单是项目初始化主入口；新增和修改项目均打开 `/requirement/project/maintain` 项目维护页签，不再弹出项目维护 dialog。
- 项目维护页签调用 `/requirement/project/init/**`，一次维护项目基础信息、代码仓库、项目分支和初始化状态。
- 仓库分区默认提供一条空后端仓库行；仓库数据只提交仓库名称、仓库类型、团队共享 Git 远端、默认分支、状态和索引状态字段；允许纯后端服务只维护一条仓库，不得提交个人本机绝对路径。
- 输入 Git 地址后，前端可自动推导仓库名称、项目名称和项目编码，用户可继续手工调整。
- 分支分区维护 `branchLabel`、`baselineBranch` 和后端回显的 `initInstruction`：`branchLabel` 是需求人员可见中文标签，`baselineBranch` 是真实 Git 分支名，`initInstruction.content` 用于复制给 MCP 执行项目分支初始化；前端可继续兼容 `variantName`、`variantCode`、`customerName`、`mcpKey` 等历史字段。
- `initInstruction` 至少包含 `actionType`、`targetMethod`、`token`、`tokenPrefix`、`prompt`、`content`、`copyLabel` 和 `expireTime`。复制内容必须直接使用 `content`，不得把人员 MCP Key、Web 登录 token 或本机路径拼入指令；明文 actionToken 由后端生成，项目初始化 token 按一次性动作消费，过期或已使用后用户需要重新生成初始化指令。
- 分支分区必须展示该分支的独立初始化状态，包括 `totalModules`、`manualModules`、`indexedModules`、`indexedRepositoryCount`、`unindexedRepositoryCount`、`latestIndexedAt` 和 `latestCommit`；知识库详细内容通过 `/requirement/project/knowledge?projectId=...&variantId=...` 新页签展示，不在表格展开行内展示。
- 项目列表会按项目调用 `/requirement/project/init/{projectId}` 派生初始化状态，状态口径来自 `initChecklist`：项目信息、仓库、分支配置、模块知识和索引。
- 保存成功后刷新项目列表或当前维护页状态；项目列表操作列不再提供独立状态页入口。

## Harness 初始化下发契约

- 项目维护页签是项目配置、保存、初始化指令复制和初始化状态查看的主入口。
- 用户触发 harness 初始化时，前端读取后端模板包；实际写入目标 workspace 的动作由 Codex 通过需求平台 MCP 或接口获取模板后完成，前端不直接操作用户本机文件系统。初始化指令必须引导本地 agent 先拉取默认基线最新代码，初始化校验通过后提交并推送初始化文件，再登记 commit、push 结果和失败原因。
- 多仓项目必须同时展示 workspace 根目录入口 `AGENTS.md` 和各子仓库 `AGENTS.md` 的下发状态；workspace 入口只做分流，业务规则仍写入子仓库。
- 初始化完成口径必须包含模块知识库落地：目标子仓库不能只保留 `docs/ai-harness/modules/.gitkeep`，至少要生成一个按菜单目录、子菜单、功能接口、权限标识和涉及文件建立索引的 `docs/ai-harness/modules/*.md`。
- 初始化结果必须展示 Codex 回写的写入文件清单、校验命令、校验结果、commit、push 结果和失败原因；失败时保留“复制错误信息”和“重新生成初始化指引”入口。
- 前端不得把个人本机绝对路径保存到项目配置；本地路径只允许作为用户当前初始化会话中的临时提示。

## 项目索引契约

- 分支知识库页签读取 `/requirement/project/init/{projectId}`、`/requirement/index/batch/list`、`/requirement/index/module/tree` 只读展示指定项目分支的索引批次和模块知识库；新增、编辑和初始化指令复制主路径属于项目维护页签。
- 分支知识库页签必须支持按项目分支筛选索引批次和模块知识库。模块知识库展示行必须有 `variantId`，分支为空的数据只能作为待迁移旧数据处理，不应默认混入选中分支。
- 当后端 companion 因部分迁移库缺少可选索引表而返回空索引批次或空模块知识库时，项目维护和分支知识库页签必须继续展示项目、仓库和项目分支，把索引内容视为“暂无数据”，不能误判为初始化完成。
- MCP 索引指引优先使用 `actionToken + remoteUrl` 调用 `publish_repository_index`，兼容旧的 `mcpKey + remoteUrl` 和 `projectId + repoId + branchName` 调用方式。
- 新建或编辑需求时，列表页只打开 `/requirement/demand/maintain` 隐藏页签，不在列表页弹出维护 dialog。新增页签不展示需求编号和创建人 ID；修改页签用文本展示后端已生成的编号，不使用 input 只读框。
- 需求维护页签选择项目、项目分支和模块后调用 `/requirement/index/impact/suggest`，模块下拉必须按 `projectId + variantId` 过滤，优先读取 `/requirement/index/module/tree` 的知识库模块；如果该分支存在 `repoScope=FRONTEND`、`moduleType=PAGE_FUNCTION` 或前端页面路径识别出的模块，则只展示这些前端菜单/页面模块，不混入后端技术能力或人工后台模块。没有前端页面模块时，才兼容人工模块和其他索引模块兜底。请求携带 `projectId`、`variantId`、`moduleId`、`moduleCode`；后端按所选项目分支和最新索引批次返回 `pages`、`apis`、`tables`、`permissions`、`documents` 五类候选影响面。
- 新建或编辑需求时，项目分支下拉必须读取 `/requirement/project/init/{projectId}` 的分支初始化上下文，只展示已初始化完成的项目分支。前端已初始化口径与后端兜底一致：分支 `indexedRepositoryCount > 0` 且 `unindexedRepositoryCount = 0`；新功能提需允许当前分支暂时没有既有模块知识，查询筛选可以保留历史分支用于查老需求，但提交表单不能选择未初始化分支。
- 需求维护页签允许不选择既有模块，改为填写新功能名称；新功能名称通过需求备注兼容提交，用于列表、详情和执行包上下文展示，不写入项目分支知识库。
- 需求维护页签保存 payload 必须删除 `demandNo`、`creatorId` 和 `status`，避免客户端伪造编号、创建人或绕过状态机。后端新增默认 `draft`，普通编辑只允许创建人修改 `draft` 需求。
- 需求维护页签必须选择 `developerUserId`。开发人员候选来自 `/requirement/demand/developer-options`，只展示启用的 `requirement_developer` 用户，不依赖 `/system/user/list` 或 MCP 管理权限；该开发人员就是后续需求设计、执行开发和返修的同一个人。
- 影响范围字段不在需求维护页签和需求详情页展示。保存前由前端按知识库推荐自动填充后端影响字段；没有推荐内容时提交空值，不阻断需求保存。
- 前端不得向后端提交个人本机绝对路径；本地仓库目录只允许作为用户本次操作中的临时输入。

## 需求状态与详情契约

- 需求新增和修改页必须展示并校验 `demandSource`，该字段为自由文本输入项，列表和详情按后端返回原文展示。
- 业务背景使用普通多行文本框，只保存文本内容；在业务背景框内粘贴图片或文件时，前端调用 `/requirement/demand/upload` 并把返回路径追加到 `attachments`。
- 需求附件使用 `FileUpload`，位于预期结果上一行，上传接口同为 `/requirement/demand/upload`，单文件最大 2MB，最多 5 个；保存值为后端返回文件路径的英文逗号分隔串；支持 Word、Excel、PDF、TXT、PPT 和常见图片格式，不支持压缩包。
- 需求列表和详情复用 `src/views/requirement/demand/status.js` 中的状态定义和按钮定义，避免文案分叉。
- 需求列表和详情必须展示指定开发人员，显示优先级为昵称加账号，其次账号，缺失时显示空占位。
- 新主状态文案为：`draft=未提交`、`submitted=待需求分析`、`supplement_required=待补充说明`、`plan_pending=待生成需求设计`、`plan_ready=需求设计待确认`、`confirmed=待执行开发`、`developing=开发中`、`review=待验收`、`repairing=返修中`、`closeout_pending=待合并归档`、`completed=已完成`、`rejected=需求无法实现`。
- 兼容状态文案为：`archived=已归档`。
- 前端流程按钮必须同时按角色、`req:demand:edit` 按钮权限和当前需求参与人过滤：需求创建人只能看到提需、补充说明、需求设计确认、返修和验收动作；指定开发人员只能看到需求分析结论、需求设计结论、开始开发、提交验收、提交返修验收和确认归档完成动作；`admin` 可见全部动作。前端过滤只控制展示，服务端状态接口仍由 `req:demand:edit`、状态机、角色动作和参与人约束兜底。
- `submitted` 和 `plan_pending` 的流程结论按钮必须打开结论选择弹窗，不得直接提交固定下一状态。需求分析结论可选“可继续设计”“需要补充说明”“需求无法实现”；需求设计结论可选“设计完成”“需要补充说明”“需求无法实现”。列表页不得同时展示同阶段“生成需求分析/需求设计指令”和“反馈分析/设计结论”入口；列表缺少资料包版本明细时优先隐藏反馈结论入口，避免两个相邻步骤同屏。详情页已加载资料包版本，必须按 `requirement_assessment` 或 `requirement` 是否已回写切换：未回写时展示生成指令，已回写后展示反馈结论。结论提交后前端刷新列表或详情，按钮应随新状态自动隐藏。
- `supplement_required` 状态下，需求详情仅在当前用户为需求创建人或管理员时展示补充说明输入区，调用 `/requirement/demand/{demandId}/supplement`；成功后刷新详情和资料包，默认回到待生成需求设计阶段。
- `plan_ready` 状态下，需求详情不能只提供“确认需求设计”，还必须向需求创建人或管理员展示“补充调整说明”入口；点击补充调整说明后才展开输入区，并隐藏确认需求设计按钮。提交后调用同一个补充接口，后端追加 `requirement_supplement` 版本并回到 `plan_pending`，指定开发人员必须根据调整说明重新生成需求设计后才能继续提交需求人确认，形成多轮迭代。
- 非管理员列表数据由后端按参与人过滤：当前用户可见自己创建的需求，以及提交后指定给自己的需求。开发人员不应在前端看到他人未提交草稿，也不应看到非本人需求的流程按钮。
- 列表操作列只保留详情、可编辑草稿的修改按钮、当前状态的下一步按钮和管理员删除按钮，不展示 Agent 资料入口。
- 删除按钮只在拥有 `req:demand:remove` 时展示，需求人员和开发人员默认不可见；删除由后端管理员权限和关联数据清理兜底。
- `review` 状态必须提供“提交返修”和“确认验收”两个流程按钮；点击“提交返修”必须先打开“提交返修问题说明”弹窗，要求需求创建人或管理员填写本次验收发现的问题、位置和期望结果，调用 `/requirement/demand/{demandId}/repair` 成功后才进入 `repairing`，不得直接调用普通状态接口绕过说明内容。`repairing` 状态提供“提交返修验收”并流转回 `review`；确认验收后进入 `closeout_pending`，详情页读取 `/requirement/demand/{demandId}/closeout-verification` 判断平台归档验证结果。
- 详情页不展示协作工具栏，不展示复制出来的指令正文。流程推进按钮位于详情标题区右侧，生成指令按钮也位于标题状态区，但使用白底描边样式与流程确认按钮明显区分。
- 详情页仅在当前用户是指定开发人员或管理员，且状态为 `submitted` 或 `plan_pending` 时，展示 `/requirement/demand/{demandId}/plan-instruction` 的阶段生成按钮；`submitted` 文案为“生成需求分析指令”，复制内容只包含 `reqflow.upload_requirement_assessment` 和一个需求分析 actionToken；`plan_pending` 文案为“生成需求设计指令”，复制内容只包含 `reqflow.save_requirement_package` 和一个需求生成 actionToken。当前状态已有对应回写产物时不再展示同阶段生成指令：`submitted` 以 `requirement_assessment` 为准，`plan_pending` 以 `requirement` 为准，避免与反馈结论按钮同时出现。`plan_ready` 是需求设计待确认阶段，只展示需求人确认或补充调整入口，不展示需求设计生成指令。前端不得拼接 actionToken，也不得把下一阶段工具追加到按钮文案或复制内容中。
- 详情页仅在当前用户是指定开发人员或管理员，且状态为 `developing`、`repairing` 或 `closeout_pending` 时，展示 `/requirement/demand/{demandId}/develop-instruction` 的阶段生成按钮；`confirmed` 待执行开发阶段只展示“开始开发”流程按钮，不展示生成执行指令。`developing` 文案为“生成执行任务指令”，复制内容包含 `reqflow.save_development_plan`、`reqflow.upload_execution_report`、`reqflow.upload_review_report` 和一个开发阶段 actionToken；`repairing` 文案为“生成返修任务指令”，复制内容只包含 `reqflow.upload_execution_report`、`reqflow.upload_review_report` 和一个返修阶段 actionToken，不包含执行计划或需求设计生成要求；`closeout_pending` 文案为“生成合并归档指令”，复制内容包含 squash merge、push、`reqflow.publish_repository_index`、平台验证和删除本地开发分支步骤。前端只复制后端返回内容。
- `developing` 和 `repairing` 阶段的生成任务指令与验收提交按钮必须互斥：`/requirement/package/{demandId}` 尚未同时存在 `execution_report` 和 `review_report` 时，只展示生成执行任务或返修任务指令，不展示“提交验收”或“提交返修验收”；两个产物都已回写后，隐藏生成任务指令并展示对应验收提交按钮。`closeout_pending` 阶段的合并归档指令与“确认归档完成”按钮也必须互斥：归档验证未通过或验证结果读取失败时只展示生成合并归档指令，`closeout-verification.verified=true` 后隐藏生成合并归档指令并展示确认归档完成按钮。
- 详情页读取 `/requirement/package/{demandId}` 内嵌展示当前需求的 Agent 交接资料包，后端允许 `req:demand:query` 读取，并提供刷新按钮以便 MCP 回写后重新拉取需求状态和资料包版本。资料包区块以当前需求标题为标题，一级标签只展示需求草稿、需求可行性评估、需求设计、执行计划、执行报告和 Review 报告等业务文档最新内容；`requirement_supplement` 不单独作为一级标签展示，需求人补充版本折叠展示在需求可行性评估标签内，需求设计调整版本折叠展示在需求设计标签内，需求人返修问题说明折叠展示在 Review 报告标签内。每类产物仍展示最近历史版本，补充与调整记录支持展开和收起，标签正文不设置最大高度，按内容自然撑开；不得再在详情底部额外重复展示一组独立的需求设计/执行计划预览。没有资料时展示空状态，不阻断页面打开。保存 artifact 必须追加版本，返修轮次依赖历史版本链判断。详情页和 `demandId` 聚焦模式必须以只读 Markdown 阅读态展示资料内容，不能用 `<pre>` 或原始 textarea 作为阅读展示；渲染前必须转义 HTML，避免 MCP 回写内容直接执行脚本。
- Agent 交接资料包默认标签必须跟随需求阶段并兼顾已回写产物：`draft` 默认需求草稿；`submitted` 未回写评估时默认需求草稿，已回写 `requirement_assessment` 时默认需求可行性评估；`supplement_required` 默认需求可行性评估；`plan_pending/rejected` 未回写需求设计时默认需求可行性评估，已回写 `requirement` 时默认需求设计；`plan_ready/confirmed` 默认需求设计，`developing` 默认执行计划，`review` 默认执行报告，`repairing/closeout_pending/completed/archived` 默认 Review 报告。
- 打开 `/requirement/package?demandId=...` 时进入当前需求聚焦模式：页面顶部只展示当前需求标题和版本摘要，下方按同一组业务文档 artifact 展示内容，并按当前需求状态选择默认标签；不得展示需求 ID 查询框、加载资料、生成资料、加载最新或保存新版本按钮。直接从菜单进入 `/requirement/package` 时可保留管理模式。

## 角色菜单契约

- 管理员角色可见全部功能。
- 需求人员角色只可见首页、需求列表和使用统计；没有 MCP 管理和独立 Agent 交接资料菜单，但可在需求详情中查看自己创建的需求资料。
- 开发人员角色可见首页、需求列表、MCP 管理和使用统计；只能处理提交后指定给自己的需求，MCP 回写资料依赖后端隐藏 `req:package:save` 权限和参与人校验。
- 首页看板快捷入口必须按当前用户 `permissions` 过滤，不能仅依赖静态数组渲染；有 `req:demand:add` 时需求入口展示为“提交需求”，仅有需求查看/处理权限的开发人员展示为“查看需求”；需求人员没有 `req:mcp:key:list` 时不得显示 MCP 管理快捷入口，没有 `req:package:list` 时不得显示独立 Agent 交接资料入口。

## 标签页与布局契约

- 后台布局固定为浅色左侧菜单，`sideTheme=theme-light`、`navType=1`；前端不得在用户菜单中展示布局设置入口。
- `layout-setting` 中历史保存的 `sideTheme` 和 `navType` 不得覆盖固定布局，其余 tagsView、字号、主题色等低风险偏好可继续沿用。
- 隐藏页签通过 `parentPath`、`backPath` 或路由 `meta.activeMenu` 记录父菜单；调用 `$tab.closePage()` 时优先跳回父菜单，再退回最后打开标签。

## 统一品牌与看板契约

- 用户可见系统名称为“统一需求流转平台”，登录页、浏览器标题、页脚、首页、导航栏和可见链接不得继续出现若依官网、若依文档或默认更新日志。
- 登录页使用浅色需求管理风格背景图，登录框在桌面端靠右展示，移动端居中展示。
- 后台首页是需求流转看板，复用统计接口展示需求总览、项目排行、活跃用户和快捷入口，不展示默认模板说明。

## Agent 交接资料 Artifact 类型

业务页面默认文档 tab key 必须使用以下值：

```text
requirement_draft
requirement_assessment
requirement
plan
execution_report
review_report
```

`requirement_supplement` 是后端和 MCP 支持的补充版本类型，但前端默认不作为一级 tab 展示；页面按版本备注将其归入需求可行性评估或需求设计标签内的“补充与调整记录”。

生成草稿资料接口使用 `POST /requirement/package/generate/{demandId}`。保存 artifact 仍使用 `POST /requirement/package/{demandId}/{artifactType}`，保存行为必须追加新版本。

## MCP管理页面契约

- 菜单组件路径为 `requirement/mcpKey/index`，后端菜单脚本路由 path 为 `mcp-key`，菜单权限为 `req:mcp:key:list`；首页快捷入口必须跳转 `/requirement/mcp-key`，不能使用组件路径 `/requirement/mcpKey`。
- 页面只在管理员角色下展示“配置请求地址”入口，点击后读取 `/requirement/mcp/key/config` 并打开 MCP 请求地址配置弹窗；普通开发人员不展示入口，也不调用配置保存接口。弹窗只保存 `publicHost`，格式为域名/IP和端口；不得让用户填写协议、路径、查询串或空白字符。
- 页面不得在列表页顶部常驻展示请求头名 `X-MCP-Key`、客户端配置模板、全局 Skill 包或安装包。
- 页面不得自行拼接 MCP 远程 endpoint。创建或使用指令中的 MCP 地址必须来自后端返回的 `codexSetupPackage.mcpServer.url`，管理员配置弹窗的完整地址也必须展示后端返回的 `mcpAddress`；发布默认路径为 `/reqflow-api/requirement/mcp`，前端静态访问项目名 `/reqflow/` 不参与该地址。
- 列表读取 `/requirement/mcp/key/list`，一行对应一个 `req_mcp_user_key`，只能展示 Key 名称、绑定用户、状态、最近使用时间、最近 IP 和创建时间；不得展示明文 Key、Key 前缀或哈希。
- 新增时通过 `/requirement/mcp/key/user-options` 查询可绑定用户，不调用 `/system/user/list`，避免要求 MCP 维护人员同时具备系统用户菜单权限。
- 新增时必须选择启用用户并填写 Key 名称；后端返回的顶层 `plainKey` 或 `key.plainKey` 只用于渲染统一安装命令，前端下次打开使用指令时也必须替换出真实明文 Key。前端不得单独展示明文 Key 字段，不得写入列表、查询参数或本地持久化。
- 普通用户新增 Key 时绑定当前登录用户且不可修改绑定用户，管理员才展示远程用户选择并可指定绑定用户。
- 后端返回的 `codexSetupPackage.installCommands` 是推荐展示的统一安装指令，只在创建结果或使用指令弹窗中以代码块样式展示。页面只展示一组统一安装命令，不得按 Codex、Claude Code、Trae、Qoder、CodeBuddy、OpenCode 分组展示普通安装内容。复制包含 `${REQFLOW_MCP_KEY}` 的安装脚本时，用当前响应中的明文 Key 替换占位符，但不单独展示明文 Key 字段。统一命令执行后由脚本提示用户选择 Codex、Claude Code、Trae、Qoder、CodeBuddy、OpenCode 或全部工具；高级 JSON 中可保留带 `--client`/`-Client` 的单客户端命令供自动化和排障使用。完整 `codexSetupPackage` 仅作为高级配置/调试信息折叠展示，其中 `clientInstructions` 只供手工配置或排障参考。
- 页面不提供修改、重置 Key 或“重新打开安装命令”工具栏入口；列表操作列只保留“使用指令”和删除，需要再次查看命令时从对应 Key 行点击“使用指令”。
- 提需求人员角色默认不分配 `req:mcp:key:*` 权限，因此看不到菜单，也不能调用页面 API。

## 数据粒度

- 基础管理列表一行对应一个后端实体。
- 需求列表一行对应一个需求。
- 索引批次列表一行对应一次仓库索引上传。
- 模块知识库一行对应一个项目分支下的索引模块或功能点。
- 影响面推荐一行对应一个页面、接口、数据表、权限或相关文档。
- Agent 交接资料页面当前 tab 展示一个 artifact type 的最新版本，保存时追加新版本。
- MCP 管理列表一行对应一个人员 Key，绑定用户是多对一展示字段，不代表用户列表粒度。
- 统计总览展示全平台聚合数据，项目排行一行对应一个项目，用户使用一行对应一个用户。
