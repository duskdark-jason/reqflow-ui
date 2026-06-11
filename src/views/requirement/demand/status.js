export const demandStatusOptions = [
  { value: "draft", label: "未提交", type: "info" },
  { value: "submitted", label: "待生成需求说明、执行计划", type: "warning" },
  { value: "plan_pending", label: "资料生成中", type: "warning" },
  { value: "plan_ready", label: "资料待确认", type: "warning" },
  { value: "confirmed", label: "待执行开发", type: "success" },
  { value: "developing", label: "开发中", type: "primary" },
  { value: "review", label: "待验收", type: "warning" },
  { value: "repairing", label: "返修中", type: "danger" },
  { value: "completed", label: "已完成", type: "success" },
  { value: "archived", label: "已归档", type: "info" }
]

export const demandStatusActions = {
  draft: { value: "submitted", label: "提交需求", type: "primary", icon: "el-icon-upload2", confirm: "提交后将进入需求说明和执行计划生成阶段。" },
  submitted: { value: "plan_ready", label: "资料已生成", type: "warning", icon: "el-icon-document-checked", confirm: "确认 MCP 已回写需求设计和执行方案？" },
  plan_pending: { value: "plan_ready", label: "资料已生成", type: "warning", icon: "el-icon-document-checked", confirm: "确认 MCP 已回写需求设计和执行方案？" },
  plan_ready: { value: "confirmed", label: "确认资料", type: "success", icon: "el-icon-circle-check", confirm: "确认需求人员和审批人员已完成资料确认？" },
  confirmed: { value: "developing", label: "接收开发", type: "primary", icon: "el-icon-s-claim", confirm: "确认开发人员接收该需求并开始开发？" },
  developing: { value: "review", label: "提交验收", type: "warning", icon: "el-icon-finished", confirm: "确认开发已完成并提交需求人员验收？" },
  review: { value: "completed", label: "结束任务", type: "success", icon: "el-icon-check", confirm: "确认需求人员已验收通过并结束任务流？" },
  repairing: { value: "review", label: "提交验收", type: "warning", icon: "el-icon-finished", confirm: "确认返修已完成并重新提交验收？" }
}

export function optionLabel(options, value) {
  const option = options.find(item => item.value === String(value))
  return option ? option.label : value || "-"
}

export function demandStatusTagType(value) {
  const option = demandStatusOptions.find(item => item.value === String(value))
  return option ? option.type : ""
}

export function primaryStatusAction(status) {
  return demandStatusActions[String(status)] || null
}

export function nextStatusOptions(status) {
  const action = primaryStatusAction(status)
  return action ? [action] : []
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
