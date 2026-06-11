# 项目文档与目录清理执行计划

## 执行步骤

1. 基于最新 `main` 创建 `chore/REQ-20260611-001-workspace-cleanup` 任务分支。
2. 重写前端 README。
3. 同步 `docs/ai-harness`、`docs/process` 和 `docs/templates` 中的 SQL 路径说明。
4. 将已 complete 但仍位于 active 的历史 spec 归档到 done。
5. 运行文档和 harness 验证。

## 验收覆盖

| 验收 ID | 执行步骤 | 分层验证 |
|---|---|---|
| AC-001 | 重写前端 README 并扫描若依默认启动说明。 | L0 |
| AC-002 | 同步前端文档模板数据库脚本路径。 | L0 |
| AC-003 | 运行文档和 harness 验证。 | L0 |

## 分层验证计划

- `sh scripts/check-docs.sh`
- `sh scripts/check-harness.sh complete --spec docs/specs/done/REQ-002-项目文档与目录清理`
- `sh scripts/test-check-harness.sh`
