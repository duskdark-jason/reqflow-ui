const fs = require("fs")
const path = require("path")
const vm = require("vm")
const assert = require("assert")

const sourcePath = path.join(__dirname, "../src/views/requirement/demand/artifacts.js")
const source = fs.readFileSync(sourcePath, "utf8")
  .replace(/export const /g, "const ")
  .replace(/export function /g, "function ")

const sandbox = {}
vm.createContext(sandbox)
vm.runInContext(source + "\nthis.defaultArtifactByStatus = defaultArtifactByStatus;", sandbox)

function artifacts(values) {
  return Object.keys(values).reduce((result, key) => {
    result[key] = { content: values[key] }
    return result
  }, {})
}

assert.strictEqual(
  sandbox.defaultArtifactByStatus("submitted", artifacts({ requirement_assessment: "评估报告" })),
  "requirement_assessment",
  "submitted with an assessment should open the assessment tab"
)

assert.strictEqual(
  sandbox.defaultArtifactByStatus("plan_pending", artifacts({ requirement: "需求设计" })),
  "requirement",
  "plan_pending with a requirement design should open the requirement tab"
)

assert.strictEqual(
  sandbox.defaultArtifactByStatus("submitted", artifacts({})),
  "requirement_draft",
  "submitted without an assessment should still open the draft tab"
)

console.log("artifacts behavior tests passed")
