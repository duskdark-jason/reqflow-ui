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
  !component.includes("label=\"明文Key\""),
  "MCP Key 页面不得单独展示明文 Key 字段。"
)
assert(
  !component.includes("label=\"Key前缀\""),
  "MCP Key 页面不得展示 Key 前缀字段。"
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
assert(
  !component.includes("历史 Key 可粘贴") && !component.includes("请粘贴明文Key"),
  "MCP Key 页面不应再把历史 Key 当作需要用户手工粘贴明文的场景。"
)

console.log("mcp install dialog unified tests passed")
