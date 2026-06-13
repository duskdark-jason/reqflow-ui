# MCP Key明文持久与交互安装执行计划

## 计划

1. 调整静态检查，要求 MCP 管理页不展示明文 Key 和 Key 前缀字段。覆盖 AC-001、AC-002、AC-005。
2. 修改 `mcpKey/index.vue`，移除列表和弹窗中的 Key 字段展示，保留命令渲染逻辑，并兼容顶层 `plainKey` 与 `key.plainKey`。覆盖 AC-001、AC-002、AC-003、AC-004、AC-007。
3. 增加管理员 MCP 请求地址配置弹窗和 API 封装，普通开发人员不展示入口。覆盖 AC-008。
4. 移除“重新打开安装命令”按钮及对应状态和方法，保留行内“使用指令”入口。覆盖 AC-009。
5. 同步前端模块文档、UI 契约和搜索索引。覆盖 AC-005、AC-007、AC-008、AC-009。
6. Harness 门禁修正：补充 `--spec` 只能指向 `docs/specs/active/` 的脚本约束、流程说明和测试。覆盖 AC-006。
7. 运行静态检查、生产构建、harness 校验和 diff 检查。覆盖 AC-001、AC-002、AC-003、AC-004、AC-005、AC-006、AC-007、AC-008、AC-009。

## 分层验证

| 层级 | 覆盖验收 | 命令或方式 |
|---|---|---|
| L2 | AC-001、AC-002、AC-003、AC-004、AC-005、AC-007、AC-008、AC-009 | `node scripts/test-mcp-install-dialog-unified.js` |
| L2 | AC-006 | `sh scripts/test-check-harness.sh` |
| L1 | AC-001、AC-002、AC-003、AC-004 | `npm run build:prod` |
| L0 | AC-005、AC-006、AC-007、AC-008、AC-009 | `sh scripts/check-docs.sh && sh scripts/check-harness.sh complete --spec docs/specs/active/REQ-022-MCP-Key明文持久与交互安装` |

## 风险与处理

- 隐藏明文 Key 后用户仍需可复制有效命令：保留 `plainKey` 状态值，只用于替换命令占位符。
- 旧数据缺少明文时命令无法渲染：页面复制命令前提示重新生成 Key。
- MCP 请求地址误填完整 URL：前端先行校验只允许 host/port，后端仍做最终拒绝。
