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
const modules = loadEsModule("src/views/requirement/demand/modules.js")
const status = loadEsModule("src/views/requirement/demand/status.js")

assert.strictEqual(artifacts.defaultArtifactByStatus("plan_pending"), "requirement_assessment")
assert.strictEqual(artifacts.defaultArtifactByStatus("plan_ready"), "requirement")
assert.strictEqual(artifacts.defaultArtifactByStatus("confirmed"), "requirement")
assert.strictEqual(artifacts.defaultArtifactByStatus("developing"), "plan")
assert.strictEqual(artifacts.defaultArtifactByStatus("closeout_pending"), "review_report")
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

assert.strictEqual(modules.isFrontendKnowledgeModule({
  repoScope: "FRONTEND",
  moduleType: "PAGE_FUNCTION",
  relativePath: "src/views/requirement/demand/index.vue"
}), true)
assert.strictEqual(modules.isFrontendKnowledgeModule({
  repoScope: "BACKEND",
  moduleType: "SERVICE",
  relativePath: "src/main/java/com/ruoyi/DemandService.java"
}), false)
assert.strictEqual(modules.mergeDemandModuleOptions([
  { moduleId: 1, moduleName: "人工后台能力", repoScope: "BACKEND" }
], [
  { indexModuleId: 2, moduleName: "后端任务", repoScope: "BACKEND" },
  { indexModuleId: 3, moduleName: "需求列表", repoScope: "FRONTEND", moduleType: "PAGE_FUNCTION" }
]).map(item => item.moduleName).join(","), "需求列表")
assert.strictEqual(modules.mergeDemandModuleOptions([
  { moduleId: 1, moduleName: "人工后台能力", repoScope: "BACKEND" }
], [
  { indexModuleId: 2, moduleName: "后端任务", repoScope: "BACKEND" }
]).map(item => item.moduleName).join(","), "人工后台能力,后端任务")

const developerRoles = ["requirement_developer"]
const flowPermissions = ["req:demand:edit"]
const assignedDemand = { status: "confirmed", developerUserId: 8, creatorId: 7 }

assert.strictEqual(status.canUsePlanInstruction(developerRoles, {
  status: "plan_pending",
  developerUserId: 8
}, 8, flowPermissions), true)
assert.strictEqual(status.hasFeedbackConclusionAction({
  status: "submitted",
  developerUserId: 8
}, developerRoles, flowPermissions, 8), true)
assert.strictEqual(status.hasFeedbackConclusionAction({
  status: "plan_pending",
  developerUserId: 8
}, developerRoles, flowPermissions, 8), true)
assert.strictEqual(status.canUseListPlanInstruction(developerRoles, {
  status: "submitted",
  developerUserId: 8
}, 8, flowPermissions), true)
assert.strictEqual(status.canUseListPlanInstruction(developerRoles, {
  status: "plan_pending",
  developerUserId: 8
}, 8, flowPermissions), true)
assert.strictEqual(status.canUseListPlanInstruction(developerRoles, {
  status: "plan_ready",
  developerUserId: 8
}, 8, flowPermissions), false)
assert.strictEqual(status.listStatusActions("submitted", developerRoles, flowPermissions, {
  status: "submitted",
  developerUserId: 8
}, 8).map(action => action.value).join(","), "")
assert.strictEqual(status.listStatusActions("plan_pending", developerRoles, flowPermissions, {
  status: "plan_pending",
  developerUserId: 8
}, 8).map(action => action.value).join(","), "")
assert.strictEqual(status.canUseDevelopInstruction(developerRoles, assignedDemand, 8, flowPermissions), false)
assert.strictEqual(status.canUseDevelopInstruction(developerRoles, {
  status: "developing",
  developerUserId: 8
}, 8, flowPermissions), true)
assert.strictEqual(status.canUseDevelopInstruction(developerRoles, {
  status: "repairing",
  developerUserId: 8
}, 8, flowPermissions), true)
assert.strictEqual(status.canUseDevelopInstruction(developerRoles, {
  status: "closeout_pending",
  developerUserId: 8
}, 8, flowPermissions), true)
assert.strictEqual(status.hasDevelopmentResultArtifacts([]), false)
assert.strictEqual(status.hasDevelopmentResultArtifacts([
  { artifactType: "plan", versionNo: 1 },
  { artifactType: "execution_report", versionNo: 1 }
]), false)
assert.strictEqual(status.hasDevelopmentResultArtifacts([
  { artifactType: "execution_report", versionNo: 1 },
  { artifactType: "review_report", versionNo: 1 }
]), true)
assert.strictEqual(status.canShowDevelopInstructionByArtifacts("developing", []), true)
assert.strictEqual(status.canShowDevelopSubmitAction("developing", []), false)
assert.strictEqual(status.canShowDevelopInstructionByArtifacts("developing", [
  { artifactType: "execution_report", versionNo: 1 },
  { artifactType: "review_report", versionNo: 1 }
]), false)
assert.strictEqual(status.canShowDevelopSubmitAction("developing", [
  { artifactType: "execution_report", versionNo: 1 },
  { artifactType: "review_report", versionNo: 1 }
]), true)
assert.strictEqual(status.canShowDevelopSubmitAction("closeout_pending", []), true)
assert.strictEqual(status.statusActions("confirmed", developerRoles, flowPermissions, assignedDemand, 8)[0].value, "developing")
assert.strictEqual(status.statusActions("review", ["requirement_user"], flowPermissions, {
  status: "review",
  developerUserId: 8,
  creatorId: 7
}, 7)[1].value, "closeout_pending")
assert.strictEqual(status.statusActions("closeout_pending", developerRoles, flowPermissions, {
  status: "closeout_pending",
  developerUserId: 8,
  creatorId: 7
}, 8)[0].value, "completed")

console.log("demand ui helper tests passed")
