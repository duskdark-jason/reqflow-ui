const assert = require("assert")
const fs = require("fs")
const path = require("path")
const vm = require("vm")

function loadEsModule(relativePath) {
  const filePath = path.resolve(__dirname, "..", relativePath)
  const exportedFunctions = []
  let source = fs.readFileSync(filePath, "utf8")
    .replace(/export const (\w+)\s*=/g, "const $1 = exports.$1 =")
    .replace(/export function (\w+)\s*\(/g, (_, name) => {
      exportedFunctions.push(name)
      return "function " + name + "("
    })
  source += exportedFunctions.map(name => "\nexports." + name + " = " + name).join("")
  const sandbox = { exports: {} }
  vm.runInNewContext(source, sandbox, { filename: filePath })
  return sandbox.exports
}

const artifacts = loadEsModule("src/views/requirement/demand/artifacts.js")
const markdown = loadEsModule("src/views/requirement/demand/markdown.js")

assert.strictEqual(artifacts.defaultArtifactByStatus("plan_pending"), "requirement_assessment")
assert.strictEqual(artifacts.defaultArtifactByStatus("plan_ready"), "requirement")
assert.strictEqual(artifacts.defaultArtifactByStatus("supplement_required"), "requirement_assessment")
assert(!artifacts.handoffArtifactTypes.some(item => item.value === "requirement_supplement"))
assert.deepStrictEqual(artifacts.supplementVersionsForArtifact([
  { artifactType: "requirement_supplement", versionNo: 1, versionNote: "需求人补充说明" },
  { artifactType: "requirement_supplement", versionNo: 2, versionNote: "需求设计调整说明" },
  { artifactType: "requirement", versionNo: 1 }
], "requirement_assessment").map(item => item.versionNo), [1])
assert.deepStrictEqual(artifacts.supplementVersionsForArtifact([
  { artifactType: "requirement_supplement", versionNo: 1, versionNote: "需求人补充说明" },
  { artifactType: "requirement_supplement", versionNo: 2, versionNote: "需求设计调整说明" },
  { artifactType: "requirement", versionNo: 1 }
], "requirement").map(item => item.versionNo), [2])

const html = markdown.renderMarkdown(`# 需求设计

- 保留多轮迭代
- 默认展示当前阶段

\`\`\`js
const ok = 1 < 2
\`\`\`

<script>alert(1)</script>`)

assert(html.includes("<h1>需求设计</h1>"))
assert(html.includes("<ul>"))
assert(html.includes("<li>保留多轮迭代</li>"))
assert(html.includes("<pre><code"))
assert(html.includes("const ok = 1 &lt; 2"))
assert(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"))
assert(!html.includes("<script>"))

console.log("demand ui helper tests passed")
