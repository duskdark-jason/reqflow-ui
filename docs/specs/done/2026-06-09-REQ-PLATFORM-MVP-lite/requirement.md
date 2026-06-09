# 需求管理平台 MVP-lite 前端需求说明

## 背景

当前 workspace 已基于 RuoYi-Vue 拆分为 `reqflow-be` 和 `reqflow-ui` 两个子仓库。前端需要在 RuoYi 管理后台中提供需求管理入口，让管理员、需求人员和开发人员能够维护项目、仓库、客户定制线、模块功能点、提交需求、查看执行包、保存包版本并查看使用统计。

根目录已有设计文档与开发计划，本文件将本次需求落地到前端仓库 active specs，便于 harness 追踪计划、执行、验证和 review 状态。

## 目标

- 新增 `src/api/requirement/**` API 封装，匹配后端 `/requirement/**` 接口。
- 新增项目、仓库、客户定制线、模块功能点管理页面。
- 新增需求列表、需求详情/表单和执行包页面。
- 新增使用统计看板页面。
- 使用 RuoYi 既有 Element UI、权限指令、列表分页和弹窗模式，不引入新依赖。

## 范围

本次包含：

- API 封装：project、repository、variant、module、demand、package、statistics。
- 页面：`views/requirement/project`、`repository`、`variant`、`module`、`demand`、`package`、`statistics`。
- 按后端权限标识添加 `v-hasPermi`。
- 执行包 Markdown 内容用 `el-input` textarea 编辑，支持复制和下载 Markdown。

本次不包含：

- 独立 Markdown 编辑器依赖。
- 复杂可视化图表依赖之外的新组件。
- 生产菜单数据以外的静态路由改造。
- 自动登录、真实端到端测试数据创建。

## 影响范围

- 接口/API：是，新增前端 API 调用 `/requirement/**`。
- 数据库/SQL：否，由后端 companion spec 负责。
- 权限/菜单：是，页面按钮使用 `req:*` 权限标识。
- 页面/交互：是，新增需求管理相关页面。
- 导出/异步/任务：否，仅执行包内容支持浏览器下载 Markdown。

## 契约与数据口径

- 接口路径和方法：按后端 companion spec 的 `/requirement/project`、`repository`、`variant`、`module`、`demand`、`package`、`statistics`。
- 请求参数：列表页 query，详情 path，新增修改 body，执行包保存 body。
- 响应字段：列表使用 RuoYi `rows/total`；详情使用 `data`；保存和生成使用 `data` 或操作成功状态。
- 数据粒度：列表一行代表对应后端实体；执行包 tab 代表一个 artifact type 的最新版本。

## 验收标准

- AC-UI-001：`src/api/requirement/**` 封装覆盖计划中的接口。
- AC-UI-002：项目、仓库、客户定制线、模块功能点页面可编译并具备查询、新增、修改、删除入口。
- AC-UI-003：需求列表、需求详情和执行包页面可编译，执行包支持查看最新、保存新版本、复制、下载。
- AC-UI-004：统计页面可编译，展示总览、项目排行和用户使用表。
- AC-UI-005：`npm run build:prod` 通过。

## Companion 关联

- companion spec：`../../../../reqflow-be/docs/specs/active/2026-06-09-REQ-PLATFORM-MVP-lite`
- 关联分支：`feature/REQ-PLATFORM-MVP-lite`

## 客户与分支

- 目标客户：通用
- 基线分支：main
- 任务分支：feature/REQ-PLATFORM-MVP-lite

## 约束与假设

- 后端接口路径和字段以后端 companion spec 为准。
- 当前前端页面先实现 MVP 可用交互，复杂联动选择器可在接口稳定后增强。
- 根目录设计和开发计划保留为源计划，子仓库 active specs 承接执行追踪。
