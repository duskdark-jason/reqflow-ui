# harness 命名规则移除日期需求说明

## 背景

前端仓库 harness 仍要求 active spec 使用日期前缀目录，并在流程文档和 agent prompt 中保留了带日期示例。新的流程要求 active spec 和任务分支不再携带日期。

## 目标

- active spec 目录使用 `REQ-001-中文需求标题`，不包含日期前缀。
- 任务分支示例不再使用带日期的需求编号。
- 当前 active spec 目录和 companion 互链迁移为无日期命名。

## 范围

本次包含：

- 前端 harness 校验脚本、测试、流程文档和 prompt。
- 当前 active spec 目录和互链迁移。

本次不包含：

- 修改页面、接口调用、权限或业务交互。

## 影响范围

- 接口/API：否。
- 数据库/SQL：否。
- 权限/菜单：否。
- 页面/交互：否。
- 导出/异步/任务：否。

## 契约与数据口径

- 接口路径和方法：无。
- 请求参数：无。
- 响应字段：无。
- 数据粒度：单个 active spec 目录表示一项需求过程文档。

## 验收标准

- AC-001：`check-harness.sh` 接受 `REQ-001-中文需求标题`，并拒绝 active spec 日期前缀。
- AC-002：流程文档和 agent prompt 示例不再要求日期前缀目录或带日期的任务分支编号。
- AC-003：现有 active spec 目录和互链迁移到无日期目录名。

## Companion 关联

- companion spec：`../reqflow-be/docs/specs/active/REQ-014-harness命名规则移除日期`
- 关联分支：`fix/harness-naming-no-date`

## 客户与分支

- 目标客户：通用
- 基线分支：main
- 任务分支：fix/harness-naming-no-date

## 约束与假设

- 历史 done spec 保持原样，避免改写已归档证据。
