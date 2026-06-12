export const demandStatusOptions = [
  { value: "draft", label: "未提交", type: "info" },
  { value: "submitted", label: "待需求分析", type: "warning" },
  { value: "supplement_required", label: "待补充说明", type: "danger" },
  { value: "plan_pending", label: "待生成需求设计", type: "warning" },
  { value: "plan_ready", label: "需求设计待确认", type: "warning" },
  { value: "confirmed", label: "待执行开发", type: "success" },
  { value: "developing", label: "开发中", type: "primary" },
  { value: "review", label: "待验收", type: "warning" },
  { value: "repairing", label: "返修中", type: "danger" },
  { value: "closeout_pending", label: "待合并归档", type: "warning" },
  { value: "completed", label: "已完成", type: "success" },
  { value: "rejected", label: "需求无法实现", type: "info" },
  { value: "archived", label: "已归档", type: "info" }
]

export const ROLE_REQUIREMENT_USER = "requirement_user"
export const ROLE_REQUIREMENT_DEVELOPER = "requirement_developer"

const requirementUserRoles = [ROLE_REQUIREMENT_USER]
const developerRoles = [ROLE_REQUIREMENT_DEVELOPER]

export const demandStatusActions = {
  draft: [
    { value: "submitted", label: "提交需求", tone: "submit", icon: "el-icon-upload2", roles: requirementUserRoles, confirm: "提交后将进入需求分析阶段。" }
  ],
  submitted: [
    {
      value: "analysis_feedback",
      label: "反馈分析结论",
      tone: "confirm",
      icon: "el-icon-document-checked",
      roles: developerRoles,
      dialogTitle: "选择需求分析结论",
      feedbackOptions: [
        { value: "plan_pending", label: "可继续设计", description: "需求可实现，进入详细需求设计生成阶段。", confirm: "确认需求分析结论为可继续设计？" },
        { value: "supplement_required", label: "需要补充说明", description: "退回需求人补充背景、范围或验收口径。", confirm: "确认退回需求人补充说明？" },
        { value: "rejected", label: "需求无法实现", description: "记录当前结论并结束本轮需求设计流程。", confirm: "确认该需求当前无法实现？" }
      ]
    }
  ],
  plan_pending: [
    {
      value: "design_feedback",
      label: "提交需求设计结论",
      tone: "confirm",
      icon: "el-icon-document-checked",
      roles: developerRoles,
      dialogTitle: "选择需求设计结论",
      feedbackOptions: [
        { value: "plan_ready", label: "设计完成", description: "详细需求设计已回写，提交需求人确认。", confirm: "确认提交需求设计给需求人确认？" },
        { value: "supplement_required", label: "需要补充说明", description: "退回需求人补充缺失信息后再生成设计。", confirm: "确认退回需求人补充说明？" },
        { value: "rejected", label: "需求无法实现", description: "记录当前结论并结束本轮需求设计流程。", confirm: "确认该需求当前无法实现？" }
      ]
    }
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
    { value: "closeout_pending", label: "确认验收通过", tone: "complete", icon: "el-icon-check", roles: requirementUserRoles, confirm: "确认验收通过，并交由研发人员完成合并归档？" }
  ],
  repairing: [
    { value: "review", label: "提交返修验收", tone: "confirm", icon: "el-icon-finished", roles: developerRoles, confirm: "确认返修版本已完成并重新提交验收？" }
  ],
  closeout_pending: [
    { value: "completed", label: "确认归档完成", tone: "complete", icon: "el-icon-circle-check", roles: developerRoles, confirm: "确认已按归档指令完成压缩合并、推送、知识库发布和本地开发分支删除？平台验证通过后才会结束任务。" }
  ]
}

const FLOW_ACTION_PERMISSION = "req:demand:edit"

export function optionLabel(options, value) {
  const option = options.find(item => item.value === String(value))
  return option ? option.label : value || "-"
}

export function demandStatusTagType(value) {
  const option = demandStatusOptions.find(item => item.value === String(value))
  return option ? option.type : ""
}

export function primaryStatusAction(status, roles, permissions, row, currentUserId) {
  return statusActions(status, roles, permissions, row, currentUserId)[0] || null
}

export function statusActions(status, roles, permissions, row, currentUserId) {
  const actions = demandStatusActions[String(status)] || []
  return filterActionsByParticipant(filterActionsByPermissions(filterActionsByRoles(actions, roles), permissions), row, currentUserId, roles, permissions)
}

export function nextStatusOptions(status, roles, permissions, row, currentUserId) {
  return statusActions(status, roles, permissions, row, currentUserId)
}

export function canUseDeveloperInstruction(roles, row, currentUserId, permissions) {
  if (!hasAnyRole(roles, developerRoles)) {
    return false
  }
  if (isAdmin(roles, permissions)) {
    return true
  }
  if (!row || String(row.status) === "draft") {
    return false
  }
  return sameUser(row.developerUserId, currentUserId)
}

export function canUsePlanInstruction(roles, row, currentUserId, permissions) {
  return canUseDeveloperInstruction(roles, row, currentUserId, permissions) &&
    ["submitted", "plan_pending", "plan_ready"].includes(String(row && row.status))
}

export function canUseDevelopInstruction(roles, row, currentUserId, permissions) {
  return canUseDeveloperInstruction(roles, row, currentUserId, permissions) &&
    ["developing", "repairing", "closeout_pending"].includes(String(row && row.status))
}

function filterActionsByRoles(actions, roles) {
  if (!Array.isArray(roles) || !roles.length) {
    return []
  }
  return actions.filter(action => !action.roles || hasAnyRole(roles, action.roles))
}

function filterActionsByPermissions(actions, permissions) {
  if (!Array.isArray(permissions) || !permissions.length) {
    return []
  }
  if (permissions.includes("*:*:*")) {
    return actions
  }
  return permissions.includes(FLOW_ACTION_PERMISSION) ? actions : []
}

function filterActionsByParticipant(actions, row, currentUserId, roles, permissions) {
  if (!row || isAdmin(roles, permissions)) {
    return actions
  }
  return actions.filter(action => {
    if (action.roles && hasAnyRole(action.roles, requirementUserRoles)) {
      return sameUser(row.creatorId, currentUserId)
    }
    if (action.roles && hasAnyRole(action.roles, developerRoles)) {
      return String(row.status) !== "draft" && sameUser(row.developerUserId, currentUserId)
    }
    return true
  })
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

function isAdmin(roles, permissions) {
  return (Array.isArray(roles) && roles.includes("admin")) || (Array.isArray(permissions) && permissions.includes("*:*:*"))
}

function sameUser(left, right) {
  return left !== undefined && left !== null && right !== undefined && right !== null && String(left) === String(right)
}

export function canEditDemand(row, currentUserId, roles, permissions) {
  if (!row || String(row.status) !== "draft") {
    return false
  }
  if (isAdmin(roles, permissions)) {
    return true
  }
  if (!row.creatorId) {
    return true
  }
  return sameUser(row.creatorId, currentUserId)
}
