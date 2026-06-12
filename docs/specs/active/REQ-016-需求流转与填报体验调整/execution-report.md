# 需求流转与填报体验调整执行报告

## 执行结论

- 状态：执行完成
- 分支：feature/req-016-demand-flow-ux
- commit：本分支提交记录为准

## 修改摘要

| 路径 | 修改说明 |
|---|---|
| `src/settings.js`、`src/store/modules/settings.js` | 固定白色左侧菜单布局，忽略历史布局缓存中的非目标布局。 |
| `src/layout/index.vue`、`src/layout/components/Navbar.vue`、`src/layout/components/index.js` | 移除用户可见布局设置入口。 |
| `src/layout/components/Sidebar/Logo.vue`、`src/assets/logo/reqflow-logo.svg` | 新增 ReqFlow 品牌 logo 和左侧菜单品牌展示。 |
| `src/plugins/tab.js` | 隐藏页签关闭时优先回退到 `parentPath`、`backPath` 或 `meta.activeMenu` 父菜单。 |
| `src/views/requirement/demand/status.js` | 新增需求状态文案、标签、主流程按钮、角色和按钮权限过滤、返修按钮和编辑权限判断；`submitted` 流转到需求分析完成，`plan_pending` 流转到需求设计完成。 |
| `src/views/requirement/demand/status.js` | 本轮追加 `supplement_required`、`rejected` 状态和分析/设计结论选择动作，开发人员通过弹窗选择继续、补充说明或无法实现。 |
| `src/views/requirement/demand/index.vue` | 列表操作列移除 Agent 资料入口，补充来源展示、管理员删除按钮、按角色和权限过滤的统一流程状态按钮和父页签打开参数。 |
| `src/views/requirement/demand/index.vue`、`detail.vue` | 本轮将分析/设计阶段流程按钮调整为结论选择弹窗；详情页在待补充说明状态为需求人展示补充说明输入区。 |
| `src/views/requirement/demand/detail.vue` | 本轮追加 `plan_ready` 阶段“补充调整说明”输入区，需求人可提交调整说明回到待生成需求设计，支持多轮迭代。 |
| `src/views/index.vue` | 首页快捷入口按当前用户 `permissions` 过滤，无 MCP 管理权限时不展示 MCP 管理；需求入口按 `req:demand:add` 区分“提交需求”和“查看需求”，开发人员首页不展示提交需求语义。 |
| `src/views/requirement/demand/maintain.vue` | 新增不展示创建人 ID/需求编号，增加需求来源文本输入、业务背景普通文本框和附件上传，粘贴图片或文件时追加到附件，保存时剔除系统字段。 |
| `src/views/requirement/demand/detail.vue` | 详情页头部展示流程确认按钮，工具区按状态展示生成需求分析、需求设计、执行任务和返修任务指令，展示来源、纯文本背景和附件，内嵌当前需求 Agent 交接资料包和历史版本。 |
| `src/components/FileUpload/index.vue` | 支持需求专用上传接口、大小写扩展名识别和 2MB 文件大小边界。 |
| `src/views/requirement/package/index.vue` | `demandId` 上下文下进入只读聚焦模式，只展示当前需求标题和各项文档内容。 |
| `src/views/requirement/demand/artifacts.js`、`src/views/requirement/package/index.vue` | 本轮统一 Agent 交接资料业务标签，移除上下文清单、分支简报、执行提示词和 Review 提示词等页面标签，并按需求阶段默认打开对应文档。 |
| `src/views/requirement/demand/markdown.js`、`src/views/requirement/demand/detail.vue`、`src/views/requirement/package/index.vue`、`scripts/test-demand-ui-helpers.js` | 本轮新增只读 Markdown 安全渲染 helper，详情页和 `demandId` 聚焦资料包页以 Markdown 阅读态展示 Agent 资料，不再显示原始文本。 |
| `src/views/requirement/demand/artifacts.js`、`src/views/requirement/demand/detail.vue`、`src/views/requirement/package/index.vue` | 本轮移除“补充说明”一级资料标签，将需求人补充记录折叠展示在需求可行性评估标签内，将需求设计调整记录折叠展示在需求设计标签内，并取消资料正文高度限制。 |
| `src/api/requirement/demand.js` | 增加需求 MCP 评估与设计指令、执行开发指令和需求补充说明接口封装。 |
| `docs/ai-harness/modules/requirement-platform.md`、`docs/ai-harness/contracts/requirement-platform-ui.md` | 同步模块和 UI 契约。 |

## 模块知识库沉淀

- 影响模块：需求管理/需求列表、需求管理/需求详情、需求管理/需求维护页签、隐藏页签返回、系统布局与品牌、需求返修版本记录、需求补充说明、Agent交接资料标签
- 模块知识库动作：更新
- 模块知识库文档：docs/ai-harness/modules/requirement-platform.md
- 无需更新原因：不适用

## 数据库变更沉淀

- 数据库影响：无
- SQL 脚本路径：无
- 数据库文档路径：无
- 数据库变更说明：无
- 无需更新原因：前端不修改表结构或 SQL。

## 代码注释处理

- 注释动作：新增必要注释
- 注释文件：`src/plugins/tab.js`
- 处理说明：父页签回退逻辑保留一处简短注释，说明隐藏页签优先返回父菜单，避免多标签场景跳到最近无关标签。

## 验证结果

| 层级 | 验收 ID | 命令或方式 | 结果 |
|---|---|---|---|
| L0 | AC-007 | `sh scripts/check-docs.sh` | 通过 |
| L1 | AC-001~AC-020 | `npm run build:prod` | 通过；仅有既有包体积提示。 |
| L1 | AC-006、AC-011、AC-013、AC-020 | `npm run build:prod` | 本轮通过；结论弹窗、补充说明入口、资料包默认标签和业务标签构建成功，仅有既有包体积提示。 |
| L2 | AC-021、AC-022 | `node scripts/test-demand-ui-helpers.js` | 本轮通过；覆盖资料包 Markdown 安全渲染、HTML 转义和 `plan_pending` 默认打开需求可行性评估。 |
| L2 | AC-003、AC-006、AC-008~AC-020 | 代码静态复核 | 通过；保存 payload 剔除 `creatorId`、`demandNo`、`status`，状态枚举集中到 `status.js`，流程按钮和开发指令按钮按角色与权限过滤，来源/附件字段保存路径和 2MB 上传边界已复核，首页需求入口按 `req:demand:add` 展示提交或查看语义。 |
| L3 | AC-014、AC-016、AC-018 | 内置浏览器访问新增页和详情页 | 通过；新增页显示需求来源文本输入、业务背景普通文本框、2MB 附件上传提示且无 console error；详情页显示来源和附件区，`packageBeforeActions=true`。 |
| L3 | AC-019 | 内置浏览器使用 `yfr/123456` 登录首页 | 通过；研发人员首页顶部按钮和快捷卡片均显示“查看需求”，快捷说明为“查看并处理分配给我的需求”，控制台无 error。 |
| L3 | AC-021、AC-022 | 内置浏览器使用 `xqr/123456` 打开 `REQ-002` 需求详情 | 通过；Agent 交接资料一级标签只有需求草稿、需求可行性评估、需求设计、执行计划、执行报告和 Review 报告，默认打开需求可行性评估；补充说明不作为 tab，需求人补充记录折叠在需求可行性评估内，需求设计调整记录折叠在需求设计内；正文 `max-height=none`、`overflow-y=visible`，控制台无 error。 |
| L4（可选） | AC-001~AC-020 | 真实新增/状态流转写操作 | 未执行；本次避免改动本地已有业务数据，写入规则由后端 companion 单测覆盖。 |

## 运行态证据

- 执行目录：当前子仓库根目录
- 启动命令：`npm run dev -- --host 127.0.0.1`
- profile/env/mode：本地开发模式，前端服务运行在 `http://127.0.0.1:1025/`，后端代理到本机 RuoYi 服务。
- 检查命令：`npm run build:prod`、内置浏览器访问 `http://127.0.0.1:1025/requirement/demand/maintain` 和 `http://127.0.0.1:1025/requirement/demand/detail?demandId=1`；内置浏览器访问 `http://127.0.0.1:1024/` 并使用 `yfr/123456` 验证首页需求入口；内置浏览器使用 `xqr/123456` 打开 `http://127.0.0.1:1024/requirement/demand/detail?demandId=4&parentPath=%2Frequirement%2Fdemand` 验证资料包标签和折叠记录
- 原始错误摘要：无页面脚本错误；构建仅报告静态资源体积提示。
- screenshot/trace 路径：内置浏览器截图已在本次会话输出，未落盘到仓库。
- 是否代表用户环境：否，仅代表当前执行 agent 环境
- 后续补验环境：本地或测试环境

## 验收覆盖

| 验收 ID | 执行结果 | 证据 |
|---|---|---|
| AC-001 | 已完成 | 固定白色左侧布局，首页截图确认无布局设置入口。 |
| AC-002 | 已完成 | 详情页携带 `parentPath` 返回后 URL 为 `/requirement/demand`。 |
| AC-003 | 已完成 | 新增页不展示创建人 ID 和需求编号，保存 payload 删除系统字段。 |
| AC-004 | 已完成 | 编辑态需求编号使用文本容器展示，表单只读保护。 |
| AC-005 | 已完成 | 列表操作列移除 Agent 资料，详情页展示 Agent 交接资料和资料摘要。 |
| AC-006 | 已完成 | 状态枚举和主按钮统一在 `status.js`，并按 `requirement_user`、`requirement_developer`、`admin` 角色过滤；列表/详情构建和代码复核通过。 |
| AC-007 | 已完成 | 模块文档和 UI 契约文档已同步，`check-docs` 通过。 |
| AC-008 | 已完成 | `Logo.vue` 使用固定图文容器对齐，列表/详情流程按钮使用统一 `status-action-button`/`flow-confirm-button` 风格。 |
| AC-009 | 已完成 | 详情头部状态区展示流程确认按钮，并用独立白底描边按钮展示当前阶段生成入口；页面不展示复制内容。 |
| AC-010 | 已完成 | `status.js` 支持 `review -> repairing -> review` 返修路径，按钮文案为提交返修和提交返修验收。 |
| AC-011 | 已完成 | 详情读取 `/requirement/package/{demandId}` 版本列表，展示需求可行性评估、需求设计、执行计划、执行报告和 Review 报告历史版本，开发人员和管理员可按当前状态通过单独按钮生成需求分析、需求设计、执行任务或返修任务指令。 |
| AC-012 | 已完成 | 项目初始化和需求详情指令均直接展示/复制后端返回 `content`，前端不拼接或持久化明文 actionToken；后端 companion 单测确认需求分析、需求生成、开发执行和返修阶段只暴露当前阶段工具并随流程流转失效。 |
| AC-013 | 已完成 | `/requirement/package?demandId=...` 进入当前需求聚焦模式，隐藏查询、生成、加载最新和保存新版本按钮。 |
| AC-014 | 已完成 | 详情底部以单一“Agent 交接资料包”区域展示各项文档和版本，不再保留独立的“需求设计与执行方案”预览块。 |
| AC-015 | 已完成 | 详情文案区分“生成需求分析指令”“生成需求设计指令”“生成执行任务指令”和“生成返修任务指令”，流程确认按钮与生成按钮同在头部状态区但样式明显区分，页面不展示协作工具栏。 |
| AC-016 | 已完成 | 浏览器布局检查显示资料包底部在返回按钮顶部之前，资料包文档内容只在资料包容器内展示。 |
| AC-017 | 已完成 | 文档记录角色菜单和流程按钮可见性，代码中列表与详情均使用 `status.js` 的角色过滤动作。 |
| AC-018 | 已完成 | 新增/修改页需求来源为文本输入且必填，业务背景使用普通文本框，粘贴图片或文件会自动上传到附件；附件使用 `FileUpload` 且单文件 2MB；详情页展示来源、纯文本背景和附件区。 |
| AC-019 | 已完成 | 首页快捷入口按权限过滤，需求人员无 `req:mcp:key:list` 时不展示 MCP 管理；研发人员无 `req:demand:add` 时需求入口展示“查看需求”，不展示“提交需求”。 |
| AC-020 | 已完成 | 删除按钮仅 `req:demand:remove` 可见，流程按钮同时按角色和 `req:demand:edit` 权限过滤。 |
| AC-021 | 已完成 | 本轮补充：分析/设计阶段流程按钮改为结论选择弹窗；待补充说明状态展示需求人补充输入；Agent 交接资料默认标签按阶段切换，页面只展示需求草稿、可行性评估、需求设计、执行计划、执行报告和 Review 报告等一级标签。 |
| AC-022 | 已完成 | 本轮补充：Agent 交接资料在详情页和资料包聚焦模式使用 Markdown 阅读态展示并转义 HTML；`plan_ready` 阶段需求人可提交补充调整说明回到 `plan_pending`，多轮生成需求设计；补充/调整记录内嵌到对应标签内折叠展示，正文不限制高度；前端 helper 测试覆盖 `plan_pending` 默认打开需求可行性评估。 |

## 计划偏差

- 额外移除了顶部导航/布局设置相关入口，避免用户从缓存或菜单再次切换出目标左侧布局。
- 详情页将需求可行性评估、需求设计、执行计划和报告统一收敛到内嵌 Agent 交接资料包，并通过 companion 后端接口复制 MCP 指令。
- 根据用户返修反馈，额外调整 logo 对齐、流程按钮风格、详情动作分区、MCP 指令文本和返修版本记录展示。

## Review 返修记录

| 修复 ID | 处理结果 | 说明 | 验证证据 |
|---|---|---|---|
| RF-002 | 已修复 | 已修复 logo 对齐、按钮风格、详情动作分区、MCP 指令入口、返修流程和历史版本记录展示。 | `npm run build:prod` 通过；浏览器详情和列表截图通过；后端 companion 单测通过 |
| RF-003 | 已修复 | 已同步 actionToken 按流程阶段有效、流转后失效的复制边界和文档；前端不拼接或持久化明文 actionToken。 | 接口冒烟确认指令包含阶段有效提示；`npm run build:prod` 通过 |
| RF-004 | 已修复 | 已将需求详情底部收敛为内嵌 Agent 交接资料包，并让 `demandId` 上下文的资料包页进入只读聚焦模式。 | 浏览器详情和资料包聚焦模式截图通过；`npm run build:prod` 通过 |
| RF-005 | 已修复 | 已按当前阶段拆分详情生成按钮和文档：需求分析只复制评估指令，需求设计只复制设计指令，返修只复制执行报告和 Review 报告指令。 | 后端 companion 指令单测通过；`npm run build:prod` 通过 |
| RF-006 | 已修复 | 已将 Agent 交接资料阅读展示改为 Markdown 安全渲染，并在需求设计待确认阶段增加补充调整说明输入区；`plan_pending` 默认标签锁定为需求可行性评估；补充说明不再作为一级标签，改为对应标签内的折叠迭代记录。 | `node scripts/test-demand-ui-helpers.js` 通过；`npm run build:prod` 通过；后端 companion 单测通过 |

## 风险与后续

- 历史需求数据仍可能保留旧日期编号；新建编号由后端 companion 覆盖为 `REQ-001` 风格。
- 前端已按角色过滤流程按钮，服务端状态推进接口仍沿用 `req:demand:edit` 和状态机约束。
- 首页快捷入口已按 Vuex `permissions` 过滤，需求人员无 `req:mcp:key:list` 时不展示 MCP 管理；研发人员首页需求入口展示“查看需求”；需求列表删除按钮仅在 `req:demand:remove` 下展示。
- 本次未新增前端自动化 E2E，真实新增和状态推进写操作建议在测试环境补一轮端到端验收。
