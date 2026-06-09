# 需求管理平台 MVP-lite 前端 Review 报告

- 结论：通过
- Review Agent：frontend reviewer subagent
- Review 时间：2026-06-09

## Review 范围

- API 封装路径、方法和参数是否匹配后端 companion spec。
- 页面是否使用 RuoYi 既有列表、分页、弹窗、权限指令和消息模式。
- 需求和执行包页面是否覆盖计划中的核心操作。
- 统计页面是否正确展示后端返回的数据粒度。
- 构建是否通过，是否引入不必要依赖。

## 发现问题

- Critical：正常编辑表单可绕过状态流转。已移除表单状态编辑，状态菜单只展示合法下一状态。
- Important：客户线可为空。已改为必填。
- Important：执行包加载不同需求时可能残留旧内容。已在加载和生成前清空 artifact。
- Important：统计百分比二次乘 100。已改为直接展示后端百分数。
- Important：统计总览遗漏执行报告和 Review 报告。已补充卡片。
- Important：仓库 harness 状态值大小写不匹配。已改为后端小写值。
- Minor：active spec 状态过期。已更新为 reviewed。

## 验收覆盖

| 验收 ID | 需求来源 | 证据 | 命令 | 结果 |
|---|---|---|---|---|
| AC-UI-001 | requirement.md | 文档检查和 harness 检查通过 | `sh scripts/check-docs.sh`、`sh scripts/check-harness.sh init` | 通过 |
| AC-UI-002 | requirement.md | dev server 页面 HTML、`/dev-api` 代理、登录链路和 4 个需求页面浏览器冒烟已通过 | HTTP/dev proxy 冒烟、Playwright Core 浏览器冒烟 | 通过 |
| AC-UI-003 | requirement.md | 执行包页面通过构建验证 | `npm run build:prod` | 通过 |
| AC-UI-004 | requirement.md | 统计页面通过构建验证 | `npm run build:prod` | 通过 |
| AC-UI-005 | requirement.md | 生产构建完成，有模板体积 warning | `npm run build:prod` | 通过 |
