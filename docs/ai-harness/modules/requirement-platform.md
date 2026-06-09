# 需求管理平台前端模块 Harness

## 模块范围

本模块覆盖 `reqflow-ui/src/api/requirement/**` 和 `reqflow-ui/src/views/requirement/**`。页面基于 RuoYi-Vue、Vue 2 和 Element UI 实现，不引入新依赖。

## 入口文件

| 功能点 | 代码路径 |
|---|---|
| 项目管理 | `src/views/requirement/project/index.vue` |
| 项目接入中心 | `src/views/requirement/project/detail.vue` |
| 仓库管理 | `src/views/requirement/repository/index.vue` |
| 客户定制线 | `src/views/requirement/variant/index.vue` |
| 模块功能点 | `src/views/requirement/module/index.vue` |
| 需求列表与提交 | `src/views/requirement/demand/index.vue`、`src/views/requirement/demand/detail.vue` |
| Agent 交接资料 | `src/views/requirement/package/index.vue` |
| 使用统计 | `src/views/requirement/statistics/index.vue` |
| API 封装 | `src/api/requirement/*.js` |

## 不变量

- API 路径必须与后端 `/requirement/**` 保持一致。
- 按钮权限必须使用后端菜单脚本和 Controller 中的 `req:*` 权限标识。
- 列表页使用 RuoYi `pagination` 和 `right-toolbar` 模式。
- 表单弹窗使用 Element UI `el-dialog` 和 `el-form`，提交成功后刷新列表。
- 项目接入中心展示并维护仓库公共身份、客户基线、索引批次和模块知识库；仓库维护只保存团队共享 Git 远端、仓库类型和默认分支，客户基线维护统一基线分支，不保存个人本机绝对路径。
- 需求表单的影响面推荐只追加候选内容，不强制覆盖人工输入。
- Agent 交接资料内容使用 textarea，不引入 Markdown 编辑器依赖。

## 风险点

- 后端接口未运行时，页面只能通过构建验证，不能宣称完成联调。
- Agent 交接资料存在多个 artifact type，前端 tab 的 key 必须使用后端支持的类型值。
- 索引推荐依赖后端 `/requirement/index/**` 接口，且必须让后端按 `variantId` 解析客户基线分支并限定最新索引批次；接口缺失时需求表单只能保留人工填写影响范围。
- 统计表格返回字段是聚合字段，不能按基础实体字段假设。

## 验证建议

- 最低验证：`npm run build:prod`。
- 页面冒烟：启动前端后打开项目管理、项目接入中心、需求列表、Agent 交接资料和统计页面，检查 console 无本次变更相关错误。
- 跨端联调：后端启动后验证索引批次展示、影响面推荐、需求新增、Agent 交接资料保存和统计接口。
