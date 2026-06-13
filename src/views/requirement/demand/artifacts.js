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

function hasArtifactContent(artifacts, artifactType) {
  const artifact = artifacts && artifacts[artifactType]
  return !!(artifact && (artifact.content || artifact.version || artifact.updateTime))
}

export function defaultArtifactByStatus(status, artifacts) {
  switch (String(status || "")) {
    case "draft":
      return "requirement_draft"
    case "submitted":
      return hasArtifactContent(artifacts, "requirement_assessment") ? "requirement_assessment" : "requirement_draft"
    case "supplement_required":
      return "requirement_assessment"
    case "plan_pending":
    case "rejected":
      return hasArtifactContent(artifacts, "requirement") ? "requirement" : "requirement_assessment"
    case "plan_ready":
    case "confirmed":
      return "requirement"
    case "developing":
      return "plan"
    case "review":
      return "execution_report"
    case "repairing":
    case "closeout_pending":
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
