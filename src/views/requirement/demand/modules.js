export function moduleOptionValue(module) {
  return module && (module.indexModuleId || module.moduleId || module.id)
}

export function isFrontendKnowledgeModule(module) {
  if (!module) return false
  const repoScope = String(module.repoScope || module.repoType || "").toUpperCase()
  const moduleType = String(module.moduleType || "").toUpperCase()
  const sourcePath = String(module.relativePath || module.sourceRef || "").replace(/\\/g, "/")
  return repoScope === "FRONTEND" ||
    moduleType === "PAGE_FUNCTION" ||
    moduleType === "MENU" ||
    sourcePath.includes("src/views/") ||
    sourcePath.includes("/views/") ||
    sourcePath.includes("pages/")
}

export function uniqueModuleOptions(modules) {
  const result = []
  const seen = new Set()
  ;(modules || []).forEach(item => {
    const key = moduleOptionValue(item)
    if (!key || seen.has(String(key))) return
    seen.add(String(key))
    result.push(item)
  })
  return result
}

export function mergeModuleOptions(manualModules, indexModules) {
  return uniqueModuleOptions((manualModules || []).concat(indexModules || []))
}

export function mergeDemandModuleOptions(manualModules, indexModules) {
  const indexedModules = uniqueModuleOptions(indexModules || [])
  const frontendModules = indexedModules.filter(isFrontendKnowledgeModule)
  if (frontendModules.length) {
    return frontendModules
  }
  return mergeModuleOptions(manualModules, indexModules)
}
