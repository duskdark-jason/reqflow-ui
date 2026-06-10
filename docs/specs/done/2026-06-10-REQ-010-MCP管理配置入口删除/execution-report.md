# MCP管理配置入口删除前端执行报告

## 执行结论

- 状态：已完成
- 分支：feature/REQ-20260610-010-mcp-key-config-cleanup
- commit：a620583d1276fe97b658c584b02812a828898cb2（主体实现提交；闭环文档回填见本分支最新提交）

## 修改摘要

| 路径 | 修改说明 |
|---|---|
| `src/views/requirement/mcpKey/index.vue` | 删除顶部 MCP 配置展示区；结果弹窗只展示明文 Key 与 Codex 安装包；删除旧配置和全局 Skill 包复制按钮 |
| `src/api/requirement/mcpKey.js` | 删除 `getMcpKeyConfig` API 封装 |
| `src/views/index.vue` | 首页快捷入口文案从“MCP 配置”改为“MCP 管理” |
| `docs/ai-harness/modules/requirement-platform.md` | 更新 MCP 管理模块说明和不变量 |
| `docs/ai-harness/contracts/requirement-platform-ui.md` | 更新 MCP 管理页面契约，声明不再读取配置接口 |
| `docs/specs/active/2026-06-10-REQ-010-MCP管理配置入口删除/*` | 新增本次需求、计划、执行和 Review 交接文件 |

## 模块知识库沉淀

- 影响模块：需求管理、MCP 管理
- 模块知识库动作：更新
- 模块知识库文档：`docs/ai-harness/modules/requirement-platform.md`
- 无需更新原因：不适用

## 数据库变更沉淀

- 数据库影响：无
- SQL 脚本路径：无
- 数据库文档路径：无
- 数据库变更说明：无
- 无需更新原因：本次只删除前端配置展示和后端配置接口，不涉及表结构、SQL、join、分页或统计口径。

## 验证结果

| 层级 | 验收 ID | 命令或方式 | 结果 |
|---|---|---|---|
| Red | AC-UI-001, AC-UI-002 | `if rg -q "getMcpKeyConfig|MCP地址|请求头|Codex配置|全局Skill包|复制配置|复制Skill包|mcpConfig|codexConfig|codexGlobalSkillPackage" src/views/requirement/mcpKey/index.vue src/api/requirement/mcpKey.js; then echo "旧 MCP 配置入口仍存在"; exit 1; fi` | 预期失败：旧入口存在 |
| Green | AC-UI-001, AC-UI-002 | 同上 | 通过：旧入口关键词不再命中 |
| L0 | AC-UI-004 | `sh scripts/check-docs.sh` | 通过：文档检查通过 |
| L1/L2 | AC-UI-001, AC-UI-002, AC-UI-003 | `npm run build:prod` | 通过：构建完成；存在既有 asset/entrypoint size warnings |
| L3 | AC-UI-001, AC-UI-003 | `npm run dev -- --port 8081` 后浏览器打开 `http://localhost:8081/` 和 `/requirement/mcpKey` | 通过：登录页正常渲染，MCP 路由未登录时跳转登录页，console error 为空 |
| L4（可选） | 全部 | 不执行 | 本次未改保存、导出、异步或跨端核心流程；真实创建/重置弹窗需测试账号和后端登录态后补验 |

## 运行态证据

- 执行目录：当前 `reqflow-ui` 子仓库根目录
- 启动命令：`npm run dev -- --port 8081`
- profile/env/mode：Vue dev server，API 代理默认指向 `http://localhost:8080`
- 检查命令：Browser 打开 `http://localhost:8081/` 和 `http://localhost:8081/requirement/mcpKey`
- 原始错误摘要：无前端 console error；未登录时路由守卫跳转 `/login?redirect=%2Frequirement%2FmcpKey`
- screenshot/trace 路径：无
- 是否代表用户环境：否，仅代表当前执行 agent 环境
- 后续补验环境：具备后端登录态和测试账号的本地或测试环境

## 计划偏差

- 额外修改 `src/views/index.vue`：首页快捷入口仍写“MCP 配置”，与本次产品语义冲突，已收敛为“MCP 管理”。

## Review 返修记录

无。

## 风险与后续

- 当前未验证登录后的真实创建/重置弹窗内容；后续在有测试账号和后端联调环境时补验。
