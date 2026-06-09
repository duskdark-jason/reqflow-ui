# 需求管理平台前端模块 Harness

## 模块范围

本模块覆盖 `reqflow-ui/src/api/requirement/**` 和 `reqflow-ui/src/views/requirement/**`。页面基于 RuoYi-Vue、Vue 2 和 Element UI 实现，不引入新依赖。

## 入口文件

| 功能点 | 代码路径 |
|---|---|
| 项目管理 | `src/views/requirement/project/index.vue` |
| 仓库管理 | `src/views/requirement/repository/index.vue` |
| 客户定制线 | `src/views/requirement/variant/index.vue` |
| 模块功能点 | `src/views/requirement/module/index.vue` |
| 需求列表与提交 | `src/views/requirement/demand/index.vue`、`src/views/requirement/demand/detail.vue` |
| 需求执行包 | `src/views/requirement/package/index.vue` |
| 使用统计 | `src/views/requirement/statistics/index.vue` |
| API 封装 | `src/api/requirement/*.js` |

## 不变量

- API 路径必须与后端 `/requirement/**` 保持一致。
- 按钮权限必须使用后端菜单脚本和 Controller 中的 `req:*` 权限标识。
- 列表页使用 RuoYi `pagination` 和 `right-toolbar` 模式。
- 表单弹窗使用 Element UI `el-dialog` 和 `el-form`，提交成功后刷新列表。
- 执行包内容使用 textarea，不引入 Markdown 编辑器依赖。

## 风险点

- 后端接口未运行时，页面只能通过构建验证，不能宣称完成联调。
- 需求执行包存在多个 artifact type，前端 tab 的 key 必须使用后端支持的类型值。
- 统计表格返回字段是聚合字段，不能按基础实体字段假设。

## 验证建议

- 最低验证：`npm run build:prod`。
- 页面冒烟：启动前端后打开项目管理、需求列表、执行包和统计页面，检查 console 无本次变更相关错误。
- 跨端联调：后端启动后验证列表查询、需求新增、执行包保存和统计接口。
