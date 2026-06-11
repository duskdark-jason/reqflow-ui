# ReqFlow 前端

ReqFlow 前端是统一需求管理平台的 Web 控制台，基于 RuoYi 前后端分离前端改造，并由 ChatGPT 最新模型辅助自动开发、维护和迭代。

本仓库保留 RuoYi Vue2、Vue Router、Vuex、Element UI、Axios 和权限指令基础能力，在此基础上聚焦 ReqFlow 的项目接入、需求管理、执行资料、MCP Key 和统计页面。

## 主要页面

- 项目管理与项目接入初始化。
- 需求维护、需求详情和 Agent 交接资料。
- 执行包查看和版本资料展示。
- MCP Key 创建、重置和复制材料。
- 平台统计和 RuoYi 基础系统管理页面。

## 技术栈

| 层面 | 技术 |
|---|---|
| 框架 | Vue 2、Vue Router、Vuex |
| UI | Element UI |
| 请求 | Axios、RuoYi request 封装 |
| 构建 | Vue CLI |
| 权限 | RuoYi 路由、菜单和按钮权限模型 |

## 目录说明

| 路径 | 说明 |
|---|---|
| `src/views/requirement` | ReqFlow 需求平台页面。 |
| `src/api/requirement` | ReqFlow 后端接口封装。 |
| `src/router` | 路由和菜单加载。 |
| `docs/ai-harness` | 面向 agent 的长期前端知识。 |
| `docs/specs` | 单次需求的需求、计划、执行和 Review 记录。 |
| `scripts` | 文档和 harness 校验脚本。 |

## 常用命令

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 生产构建
npm run build:prod

# 文档检查
sh scripts/check-docs.sh

# harness 初始化检查
sh scripts/check-harness.sh init
```

## 文档入口

- 总入口：`docs/README.md`
- 新需求流程：`docs/process/new-requirement-flow.md`
- Git 工作流：`docs/process/git-workflow.md`
- 验证说明：`docs/ai-harness/verification.md`
