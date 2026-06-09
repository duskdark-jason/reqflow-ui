# 前端本地运行说明初稿

本文件为 Harness 初始化初稿，仅用于记录静态扫描结果。人工确认前不要重命名为 `local-run.md`。

## 技术栈

- RuoYi-Vue 前端
- Vue 2
- Vue Router
- Vuex
- Element UI
- Axios

## 静态扫描结果

- 构建入口：`package.json`
- 开发命令：`npm run dev`
- 生产构建命令：`npm run build:prod`
- 默认开发端口：`80`
- 开发环境 API 前缀：`/dev-api`
- 生产环境 API 前缀：`/prod-api`
- 本地代理配置：`vue.config.js`
- 默认代理目标：`http://localhost:8080`

## 初始化阶段验证

```bash
sh scripts/check-docs.sh
sh scripts/check-harness.sh init
```

## 待人工确认

- Node.js 版本
- npm registry
- 后端代理地址
- 本地端口
- 测试账号

