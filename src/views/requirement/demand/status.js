export const demandStatusOptions = [
  { value: "draft", label: "未提交", type: "info" },
  { value: "submitted", label: "待生成需求设计", type: "warning" },
  { value: "plan_pending", label: "需求设计生成中", type: "warning" },
  { value: "plan_ready", label: "需求设计待确认", type: "warning" },
  { value: "confirmed", label: "待执行开发", type: "success" },
  { value: "developing", label: "开发中", type: "primary" },
  { value: "review", label: "待验收", type: "warning" },
  { value: "repairing", label: "返修中", type: "danger" },
  { value: "completed", label: "已完成", type: "success" },
  { value: "archived", label: "已归档", type: "info" }
]

export const demandSourceOptions = [
  { value: "BUSINESS", label: "业务提报" },
  { value: "CUSTOMER", label: "客户反馈" },
  { value: "OPERATIONS", label: "运营反馈" },
  { value: "COMPLIANCE", label: "合规政策" },
  { value: "INTERNAL", label: "内部优化" },
  { value: "OTHER", label: "其他" }
]

export const ROLE_REQUIREMENT_USER = "requirement_user"
export const ROLE_REQUIREMENT_DEVELOPER = "requirement_developer"

const requirementUserRoles = [ROLE_REQUIREMENT_USER]
const developerRoles = [ROLE_REQUIREMENT_DEVELOPER]

export const demandStatusActions = {
  draft: [
    { value: "submitted", label: "提交需求", tone: "submit", icon: "el-icon-upload2", roles: requirementUserRoles, confirm: "提交后将进入需求设计生成阶段。" }
  ],
  submitted: [
    { value: "plan_ready", label: "提交需求设计", tone: "confirm", icon: "el-icon-document-checked", roles: developerRoles, confirm: "确认开发人员已通过 MCP 回写完整需求设计？" }
  ],
  plan_pending: [
    { value: "plan_ready", label: "提交需求设计", tone: "confirm", icon: "el-icon-document-checked", roles: developerRoles, confirm: "确认开发人员已通过 MCP 回写完整需求设计？" }
  ],
  plan_ready: [
    { value: "confirmed", label: "确认需求设计", tone: "confirm", icon: "el-icon-circle-check", roles: requirementUserRoles, confirm: "确认需求人员已认可需求设计，并提交开发人员进入执行阶段？" }
  ],
  confirmed: [
    { value: "developing", label: "开始开发", tone: "develop", icon: "el-icon-s-claim", roles: developerRoles, confirm: "确认开发人员已生成执行计划并开始开发？" }
  ],
  developing: [
    { value: "review", label: "提交验收", tone: "confirm", icon: "el-icon-finished", roles: developerRoles, confirm: "确认开发已完成并提交需求人员验收？" }
  ],
  review: [
    { value: "repairing", label: "提交返修", tone: "repair", icon: "el-icon-refresh-left", roles: requirementUserRoles, confirm: "确认本次验收需要返修，并进入返修流程？" },
    { value: "completed", label: "确认验收", tone: "complete", icon: "el-icon-check", roles: requirementUserRoles, confirm: "确认需求人员已验收通过并结束任务流？" }
  ],
  repairing: [
    { value: "review", label: "提交返修验收", tone: "confirm", icon: "el-icon-finished", roles: developerRoles, confirm: "确认返修版本已完成并重新提交验收？" }
  ]
}

export function optionLabel(options, value) {
  const option = options.find(item => item.value === String(value))
  return option ? option.label : value || "-"
}

export function demandStatusTagType(value) {
  const option = demandStatusOptions.find(item => item.value === String(value))
  return option ? option.type : ""
}

export function primaryStatusAction(status, roles) {
  return statusActions(status, roles)[0] || null
}

export function statusActions(status, roles) {
  const actions = demandStatusActions[String(status)] || []
  return filterActionsByRoles(actions, roles)
}

export function nextStatusOptions(status, roles) {
  return statusActions(status, roles)
}

export function canUseDeveloperInstruction(roles) {
  return hasAnyRole(roles, developerRoles)
}

function filterActionsByRoles(actions, roles) {
  if (!Array.isArray(roles) || !roles.length) {
    return actions
  }
  return actions.filter(action => !action.roles || hasAnyRole(roles, action.roles))
}

function hasAnyRole(userRoles, expectedRoles) {
  if (!Array.isArray(userRoles) || !userRoles.length) {
    return false
  }
  if (userRoles.includes("admin")) {
    return true
  }
  return expectedRoles.some(role => userRoles.includes(role))
}

export function canEditDemand(row, currentUserId) {
  if (!row || String(row.status) !== "draft") {
    return false
  }
  if (!row.creatorId) {
    return true
  }
  if (!currentUserId) {
    return false
  }
  return String(row.creatorId) === String(currentUserId)
}
