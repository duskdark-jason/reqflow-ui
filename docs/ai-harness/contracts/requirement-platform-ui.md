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
| `demand.js` | `/requirement/demand` | 需求列表、详情、保存和状态流转 |
| `package.js` | `/requirement/package` | Agent 交接资料列表、最新版本、保存新版本和生成草稿资料 |
| `statistics.js` | `/requirement/statistics` | 使用统计 |
| `harness.js` | `/requirement/project/*/harness-*` | 项目接入 harness 模板包查询和初始化结果登记 |
| `mcpKey.js` | `/requirement/mcp/key` | MCP 人员 Key 列表、创建、修改、重置、删除和配置地址查询 |

## 权限标识

| 页面 | 主要权限 |
|---|---|
| 项目管理与项目接入中心 | `req:project:list`、`req:project:add`、`req:project:edit`、`req:project:remove`、`req:project:query` |
| 项目索引 | `req:index:list`、`req:index:import` |
| 需求列表 | `req:demand:list`、`req:demand:add`、`req:demand:edit` |
| Agent 交接资料 | `req:package:list`、`req:package:save` |
| MCP管理 | `req:mcp:key:list`、`req:mcp:key:query`、`req:mcp:key:add`、`req:mcp:key:edit`、`req:mcp:key:remove` |
| 使用统计 | `req:stats:view` |

## 项目初始化契约

- 项目管理菜单是项目初始化主入口；新增和修改项目均打开 `/requirement/project/maintain` 项目维护页签，不再弹出项目维护 dialog。
- 项目维护页签调用 `/requirement/project/init/**`，一次维护项目基础信息、代码仓库、项目分支和初始化状态。
- 仓库分区默认提供一条空后端仓库行；仓库数据只提交仓库名称、仓库类型、团队共享 Git 远端、默认分支、状态和索引状态字段；允许纯后端服务只维护一条仓库，不得提交个人本机绝对路径。
- 输入 Git 地址后，前端可自动推导仓库名称、项目名称和项目编码，用户可继续手工调整。
- 分支分区维护 `branchLabel`、`baselineBranch` 和后端回显的 `initInstruction`：`branchLabel` 是需求人员可见中文标签，`baselineBranch` 是真实 Git 分支名，`initInstruction.content` 用于复制给 MCP 执行项目分支初始化；前端可继续兼容 `variantName`、`variantCode`、`customerName`、`mcpKey` 等历史字段。
- `initInstruction` 至少包含 `actionType`、`targetMethod`、`token`、`tokenPrefix`、`prompt`、`content`、`copyLabel` 和 `expireTime`。复制内容必须直接使用 `content`，不得把人员 MCP Key、Web 登录 token 或本机路径拼入指令。
- 分支分区必须展示该分支的独立初始化状态，包括 `totalModules`、`manualModules`、`indexedModules`、`indexedRepositoryCount`、`unindexedRepositoryCount`、`latestIndexedAt` 和 `latestCommit`；知识库详细内容通过 `/requirement/project/knowledge?projectId=...&variantId=...` 新页签展示，不在表格展开行内展示。
- 项目列表会按项目调用 `/requirement/project/init/{projectId}` 派生初始化状态，状态口径来自 `initChecklist`：项目信息、仓库、分支配置、模块知识和索引。
- 保存成功后刷新项目列表；用户选择“保存并进入接入中心”时跳转 `src/views/requirement/project/detail.vue`。

## Harness 初始化下发契约

- 项目接入中心展示平台内置 harness 模板版本、目标仓库、默认基线分支、任务分支前缀、workspace `AGENTS.md` 下发状态和子仓库初始化状态。
- 用户触发 harness 初始化时，前端读取后端模板包；实际写入目标 workspace 的动作由 Codex 通过需求平台 MCP 或接口获取模板后完成，前端不直接操作用户本机文件系统。
- 多仓项目必须同时展示 workspace 根目录入口 `AGENTS.md` 和各子仓库 `AGENTS.md` 的下发状态；workspace 入口只做分流，业务规则仍写入子仓库。
- 初始化结果必须展示 Codex 回写的写入文件清单、校验命令、校验结果和失败原因；失败时保留“复制错误信息”和“重新生成初始化指引”入口。
- 前端不得把个人本机绝对路径保存到项目配置；本地路径只允许作为用户当前初始化会话中的临时提示。

## 项目索引契约

- 项目接入中心读取 `/requirement/project/init/{projectId}`、`/requirement/index/batch/list`、`/requirement/index/module/tree` 只读展示团队共享仓库、项目分支、索引批次和模块知识库；新增和编辑回到项目管理维护页签。
- 项目接入中心必须支持按项目分支筛选索引批次和模块知识库。模块知识库展示行必须有 `variantId`，分支为空的数据只能作为待迁移旧数据处理，不应默认混入选中分支。
- 当后端 companion 因部分迁移库缺少可选索引表而返回空索引批次或空模块知识库时，项目接入中心必须继续展示项目、仓库、项目分支和初始化指令，把索引内容视为“暂无数据”。
- MCP 索引指引优先使用 `actionToken + remoteUrl` 调用 `publish_repository_index`，兼容旧的 `mcpKey + remoteUrl` 和 `projectId + repoId + branchName` 调用方式。
- 新建或编辑需求时，选择项目、项目分支和模块后调用 `/requirement/index/impact/suggest`，模块下拉必须按 `projectId + variantId` 过滤，请求携带 `projectId`、`variantId`、`moduleId`、`moduleCode`；后端按所选项目分支和最新索引批次返回 `pages`、`apis`、`tables`、`permissions`、`documents` 五类候选影响面。
- 前端只展示和追加影响面推荐，不覆盖用户已输入内容。
- 前端不得向后端提交个人本机绝对路径；本地仓库目录只允许作为用户本次操作中的临时输入。

## 统一品牌与看板契约

- 用户可见系统名称为“统一需求流转平台”，登录页、浏览器标题、页脚、首页、导航栏和可见链接不得继续出现若依官网、若依文档或默认更新日志。
- 登录页使用浅色需求管理风格背景图，登录框在桌面端靠右展示，移动端居中展示。
- 后台首页是需求流转看板，复用统计接口展示需求总览、项目排行、活跃用户和快捷入口，不展示默认模板说明。

## Agent 交接资料 Artifact 类型

前端 tab key 必须使用以下值：

```text
requirement_draft
requirement
plan
context_manifest
branch_execution_brief
execution_prompt
review_prompt
execution_report
review_report
harness_template
harness_init_result
```

生成草稿资料接口使用 `POST /requirement/package/generate/{demandId}`。保存 artifact 仍使用 `POST /requirement/package/{demandId}/{artifactType}`，保存行为必须追加新版本。

## MCP管理页面契约

- 菜单路径为 `requirement/mcpKey/index`，后端菜单脚本路径为 `mcp-key`，菜单权限为 `req:mcp:key:list`。
- 页面顶部读取 `/requirement/mcp/key/config` 并展示 MCP 地址、请求头名 `X-MCP-Key` 和 Codex 配置模板。
- 列表读取 `/requirement/mcp/key/list`，一行对应一个 `req_mcp_user_key`，只能展示 Key 名称、Key 前缀、绑定用户、状态、最近使用时间和最近 IP。
- 新增时通过 `/requirement/mcp/key/user-options` 查询可绑定用户，不调用 `/system/user/list`，避免要求 MCP 维护人员同时具备系统用户菜单权限。
- 新增时必须选择启用用户并填写 Key 名称；后端返回的 `plainKey` 和 `codexConfig` 只在结果弹窗中展示，前端不得把明文 Key 写入列表、查询参数或本地持久化。
- 修改只用于 Key 名称、状态和备注；前端禁用绑定用户选择，后端也会拒绝换绑；重置使用 `/requirement/mcp/key/{keyId}/regenerate`，重置后旧 Key 立即失效并弹出新的明文 Key。
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
