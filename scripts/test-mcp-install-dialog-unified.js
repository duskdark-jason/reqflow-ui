const fs = require("fs")
const path = require("path")

const componentPath = path.join(__dirname, "..", "src", "views", "requirement", "mcpKey", "index.vue")
const apiPath = path.join(__dirname, "..", "src", "api", "requirement", "mcpKey.js")
const component = fs.readFileSync(componentPath, "utf8")
const api = fs.readFileSync(apiPath, "utf8")

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
assert(
  component.includes("plainKeyForResult(result)"),
  "MCP Key 使用指令应统一从响应中解析明文 Key，支持下次打开时渲染真实安装命令。"
)
assert(
  component.includes("result.plainKey || (result.key && result.key.plainKey)"),
  "MCP Key 使用指令应兼容顶层 plainKey 和 key.plainKey，避免下次打开时明文 Key 被隐藏。"
)
assert(
  !component.includes("明文Key缺失"),
  "MCP Key 统一安装指令不得把缺失提示写进可复制命令，避免用户复制到隐藏/无效 Key。"
)
assert(
  component.includes("label=\"MCP请求地址\"") && component.includes("v-if=\"isAdminUser\""),
  "MCP Key 页面应只向管理员展示 MCP 请求地址配置。"
)
assert(
  component.includes("getMcpConfig()") && component.includes("saveMcpConfig()"),
  "MCP Key 页面应支持读取和保存 MCP 请求地址配置。"
)
assert(
  api.includes("getMcpKeyConfig") && api.includes("updateMcpKeyConfig") &&
    api.includes("url: '/requirement/mcp/key/config'"),
  "MCP Key API 应接入管理员专用配置读写接口。"
)

console.log("mcp install dialog unified tests passed")
