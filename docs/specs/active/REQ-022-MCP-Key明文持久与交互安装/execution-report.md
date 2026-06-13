# MCP Key明文持久与交互安装执行报告

## 执行结论

- 状态：已完成
- 分支：feature/req-020-mcp-multi-client-setup
- commit：待提交
- 流程模式：本地 Harness 模式
- MCP 回写：未接入 MCP，本地文件闭环

## 修改摘要

| 路径 | 修改说明 |
|---|---|
| `src/api/requirement/mcpKey.js` | 新增管理员 MCP 请求地址配置读写接口封装。 |
| `src/views/requirement/mcpKey/index.vue` | 移除明文 Key、Key 前缀和“重新打开安装命令”按钮，兼容顶层 `plainKey` 和 `key.plainKey` 渲染统一安装命令；新增管理员 MCP 请求地址配置弹窗。 |
| `scripts/test-mcp-install-dialog-unified.js` | 增加不展示明文 Key、Key 前缀字段、复开命令带真实明文 Key、管理员配置弹窗和不保留重新打开按钮的静态检查。 |
| `docs/ai-harness/modules/requirement-platform.md` | 同步 MCP 管理页面展示约束、交互式统一安装命令和管理员请求地址配置弹窗。 |
| `docs/ai-harness/contracts/requirement-platform-ui.md` | 同步列表字段、命令渲染、管理员配置弹窗和高级 JSON 边界。 |
| `docs/ai-harness/search-map.md` | 更新 MCP 管理关键词说明，包含 MCP 请求地址配置。 |
| `docs/process/local-harness-workflow.md` | 明确 `--spec` 只检查 `active/`，完成后再按需归档到 `done/`。 |
| `scripts/check-harness.sh`、`scripts/test-check-harness.sh` | 限制 `--spec` 只能指向 `docs/specs/active/`，并补充 done 目录失败用例。 |
| `src/views/requirement/demand/status.js`、`index.vue`、`detail.vue`、`scripts/test-demand-ui-helpers.js` | 修复需求列表/详情同阶段操作入口互斥，列表页不同时展示生成指令和反馈结论，详情页按资料包回写状态切换。 |

## 模块知识库沉淀

- 影响模块：MCP 管理页、MCP 请求地址配置、多客户端安装指令
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`、`docs/ai-harness/contracts/requirement-platform-ui.md`

## 数据库变更沉淀

- 数据库影响：无
- SQL 脚本路径：无
- 数据库文档路径：无
- 无需更新原因：前端仅调整展示和文档，数据库变更由 companion 后端 spec 记录。

## 代码注释处理

- 注释动作：无需新增
- 注释文件：无
- 处理说明：页面逻辑简单，展示约束已由静态检查和 harness 文档覆盖。

## 验证结果

| 层级 | 验收 ID | 命令或方式 | 结果 |
|---|---|---|---|
| L2 | AC-001、AC-002、AC-003、AC-004、AC-005、AC-007、AC-008、AC-009 | `node scripts/test-mcp-install-dialog-unified.js` | 通过 |
| L2 | AC-010 | `node scripts/test-demand-ui-helpers.js` | 通过，先红于缺少入口互斥 helper，修复后通过 |
| L2 | AC-006 | `sh scripts/test-check-harness.sh` | 通过 |
| L1 | AC-001、AC-002、AC-003、AC-004、AC-010 | `npm run build:prod` | 通过，存在历史体积告警 |
| L0 | AC-005、AC-006、AC-007、AC-008、AC-009 | `sh scripts/check-docs.sh && sh scripts/check-harness.sh complete --spec docs/specs/active/REQ-022-MCP-Key明文持久与交互安装` | 通过 |

## 运行态证据

- 执行目录：当前前端子仓库根目录
- 启动命令：未启动服务
- profile/env/mode：静态检查和构建验证
- 原始错误摘要：静态检查先红于页面仍展示明文 Key 或 Key 前缀字段；本轮补充先红于缺少管理员 MCP 请求地址配置入口和弹窗
- screenshot/trace 路径：无
- 是否代表用户环境：否，仅代表当前执行 agent 环境
- 后续补验环境：如需真实运行态，可在已登录开发人员账号下打开 MCP 管理页创建 Key 并复制统一安装命令。

## 计划偏差

- 用户指出执行中不应写 `docs/specs/done/`，已将当前 spec 移回 `active/`，并收紧 `check-harness.sh --spec` 目标路径。
- 用户补充“下次打开使用指令仍带真实明文 Key”和“MCP 请求地址配置加到 MCP 管理页且仅管理员可配置”，已补页面逻辑、API 封装、静态检查和 harness 文档；后续补充“请求地址改为弹窗配置”，已从顶部表单调整为按钮入口加弹窗。
- 用户补充“页面上不需要重新打开命令的按钮”，已移除工具栏按钮、相关状态和方法，保留行内“使用指令”入口。
- 用户反馈需求列表页“反馈分析结论”和“生成需求分析指令”不应同时出现，已补列表专用状态动作过滤和详情页资料包感知互斥。

## Review 返修记录

无。
