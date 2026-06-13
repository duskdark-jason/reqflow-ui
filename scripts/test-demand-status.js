const fs = require("fs")
const path = require("path")
const vm = require("vm")
const assert = require("assert")

const sourcePath = path.join(__dirname, "../src/views/requirement/demand/status.js")
const source = fs.readFileSync(sourcePath, "utf8")
  .replace(/export const /g, "const ")
  .replace(/export function /g, "function ")

const sandbox = {}
vm.createContext(sandbox)
vm.runInContext(source + "\nthis.canUsePlanInstruction = canUsePlanInstruction;", sandbox)

const developerRoles = ["requirement_developer"]
const permissions = ["req:demand:edit"]
const developerId = 101

function demand(status) {
  return {
    status,
    developerUserId: developerId
  }
}

assert.strictEqual(
  sandbox.canUsePlanInstruction(developerRoles, demand("submitted"), developerId, permissions),
  true,
  "submitted demand should allow generating an assessment instruction"
)

assert.strictEqual(
  sandbox.canUsePlanInstruction(developerRoles, demand("plan_pending"), developerId, permissions),
  true,
  "plan_pending demand should allow generating a requirement design instruction"
)

assert.strictEqual(
  sandbox.canUsePlanInstruction(developerRoles, demand("plan_ready"), developerId, permissions),
  false,
  "plan_ready demand is waiting for requester confirmation and should not show a design instruction"
)

console.log("demand status behavior tests passed")
