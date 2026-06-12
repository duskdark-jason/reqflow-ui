export const handoffArtifactTypes = [
  { value: "requirement_draft", label: "需求草稿" },
  { value: "requirement_assessment", label: "需求可行性评估" },
  { value: "requirement", label: "需求设计" },
  { value: "plan", label: "执行计划" },
  { value: "execution_report", label: "执行报告" },
  { value: "review_report", label: "Review 报告" }
]

export const SUPPLEMENT_ARTIFACT_TYPE = "requirement_supplement"

export function createEmptyArtifacts() {
  return handoffArtifactTypes.reduce((result, item) => {
    result[item.value] = { content: "", version: undefined, updateTime: undefined }
    return result
  }, {})
}

export function defaultArtifactByStatus(status) {
  switch (String(status || "")) {
    case "draft":
    case "submitted":
      return "requirement_draft"
    case "supplement_required":
      return "requirement_assessment"
    case "plan_pending":
    case "rejected":
      return "requirement_assessment"
    case "plan_ready":
      return "requirement"
    case "confirmed":
    case "developing":
      return "plan"
    case "review":
      return "execution_report"
    case "repairing":
    case "completed":
    case "archived":
      return "review_report"
    default:
      return "requirement_draft"
  }
}

export function supplementVersionsForArtifact(packageVersions, artifactType) {
  return (packageVersions || [])
    .filter(item => item && item.artifactType === SUPPLEMENT_ARTIFACT_TYPE)
    .filter(item => supplementTargetArtifact(item) === artifactType)
    .sort((a, b) => Number(a.versionNo || 0) - Number(b.versionNo || 0))
}

export function supplementTargetArtifact(version) {
  const note = String(version && version.versionNote || "")
  if (note.includes("设计调整")) {
    return "requirement"
  }
  return "requirement_assessment"
}
