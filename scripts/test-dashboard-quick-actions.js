const fs = require("fs")
const path = require("path")

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const root = path.resolve(__dirname, "..")
const dashboard = fs.readFileSync(path.join(root, "src/views/index.vue"), "utf8")

assert(
  dashboard.includes('path: "/requirement/mcp-key"'),
  "首页 MCP 管理快捷入口必须使用后端菜单 path 对应的 /requirement/mcp-key。"
)

assert(
  !dashboard.includes('path: "/requirement/mcpKey"'),
  "首页 MCP 管理快捷入口不得使用组件路径 /requirement/mcpKey，否则动态路由不存在会 404。"
)

console.log("dashboard quick action tests passed")
