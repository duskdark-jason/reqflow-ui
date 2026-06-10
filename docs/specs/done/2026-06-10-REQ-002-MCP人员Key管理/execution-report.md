# MCP人员Key管理执行报告

## 执行摘要

已按计划实现前端 MCP 管理页面：

- 新增 `src/api/requirement/mcpKey.js`，封装 `/requirement/mcp/key/**` 接口。
- 新增 `src/views/requirement/mcpKey/index.vue`，展示 MCP 地址、请求头名和 Codex 配置模板。
- 页面支持 MCP Key 查询、新增、修改状态/备注、重置、删除和一次性明文弹窗。
- 新增时通过 `/requirement/mcp/key/user-options` 查询可绑定用户，不再依赖 `/system/user/list`。
- 页面按钮使用 `req:mcp:key:add/edit/remove` 控制，菜单由后端 `req:mcp:key:list` 下发。
- 同步前端接口契约和模块 harness。

已获得用户授权自动 Review 和通过后办结，本报告同步最终返修与验证证据。

## 文件变更

| 类型 | 路径 | 说明 |
|---|---|---|
| 新增 | `src/api/requirement/mcpKey.js` | MCP Key 管理 API 封装 |
| 新增 | `src/views/requirement/mcpKey/index.vue` | MCP 管理页面 |
| 修改 | `docs/ai-harness/contracts/requirement-platform-ui.md` | 新增 API 映射、权限和页面契约 |
| 修改 | `docs/ai-harness/modules/requirement-platform.md` | 新增页面入口、不变量、风险点和验证建议 |

## 验收覆盖

- AC-UI-001：菜单权限由后端 SQL 下发 `req:mcp:key:list`；页面按钮使用 `v-hasPermi` 控制。
- AC-UI-002：页面顶部展示 MCP 地址、`X-MCP-Key` 和 Codex 配置模板，并提供复制按钮。
- AC-UI-003：新增弹窗通过 MCP 管理接口查询可绑定用户，要求选择人员和填写 Key 名称；创建成功后展示一次性明文 Key。
- AC-UI-004：列表展示 `keyPrefix`，不展示完整明文 Key。
- AC-UI-005：修改、重置、删除按钮按 `req:mcp:key:edit/remove` 权限显示，成功后刷新列表。
- AC-UI-006：已更新 `docs/ai-harness/contracts/requirement-platform-ui.md` 和 `docs/ai-harness/modules/requirement-platform.md`。

## 验证命令

| 层级 | 命令 | 结果 |
|---|---|---|
| L1/L2 | `npm run build:prod` | 通过，构建完成；存在既有资源体积 warning |
| L0 | `sh scripts/check-docs.sh` | 通过，输出“文档检查通过” |
| L3 部分 | `npm_config_port=8081 npm run dev -- --host 127.0.0.1` | 沙箱内绑定端口失败：`listen EPERM: operation not permitted 0.0.0.0:8081`；经用户授权后在沙箱外启动成功，输出 `Compiled successfully` 和 `http://127.0.0.1:8081/` |
| L3 部分 | `curl -I http://127.0.0.1:8081/` | 沙箱内连接失败；经用户授权后在沙箱外返回 `HTTP/1.1 200 OK` |

## 提交记录

- 提交：0724df3 `fix: 修复 MCP Key 用户选择权限边界`

## 未执行项

- L3 页面服务只完成前端 dev server 和首页 HTTP 访问检查；未用浏览器打开菜单执行真实接口。本地未发现 Playwright 包或 CLI，未新增依赖做浏览器自动化。
- L3/L4 跨端 HTTP 联调未执行：本轮未启动后端服务，后续可在本地启动后补验菜单可见性、列表、用户选择、创建、重置、复制配置和 `X-MCP-Key` 调 MCP。
- `sh scripts/check-harness.sh complete --spec ...` 将在最终 Review 报告更新后执行。

## Review 返修记录

- 已修复前端依赖 `/system/user/list` 的权限边界：新增用户选择改为调用 `/requirement/mcp/key/user-options`。
- 已同步契约，明确前端不得把明文 Key 写入列表、查询参数或本地持久化。
