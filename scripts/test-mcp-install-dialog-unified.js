const fs = require("fs")
const path = require("path")

const componentPath = path.join(__dirname, "..", "src", "views", "requirement", "mcpKey", "index.vue")
const component = fs.readFileSync(componentPath, "utf8")

function assert(condition, message) {
  if (!condition) {
    console.error(message)
    process.exit(1)
  }
}

assert(
  component.includes("<span class=\"config-label\">统一安装指令</span>"),
  "MCP Key 结果弹窗应展示统一安装指令标题。"
)
assert(
  component.includes("v-for=\"command in renderedInstallCommands\""),
  "MCP Key 结果弹窗应只遍历顶层 installCommands。"
)
assert(
  !component.includes("v-for=\"section in clientSetupSections\""),
  "MCP Key 结果弹窗不得按客户端分组渲染安装指令。"
)
assert(
  !component.includes("clientSetupSections()"),
  "MCP Key 页面不应再保留客户端分组 computed。"
)
assert(
  !component.includes("clientSectionsFor(result)"),
  "MCP Key 页面不应再把 clientInstructions 转成页面分组。"
)

console.log("mcp install dialog unified tests passed")
