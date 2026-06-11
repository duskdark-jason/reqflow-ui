<template>
  <div class="app-container">
    <el-page-header content="需求详情" @back="goBack" />

    <el-card class="detail-card" shadow="never" v-loading="loading">
      <div slot="header" class="detail-header">
        <div>
          <div class="detail-title">{{ form.title || "未选择需求" }}</div>
          <div class="detail-subtitle">{{ form.demandNo || "-" }}</div>
        </div>
        <el-tag :type="demandStatusTagType(form.status)">{{ optionLabel(demandStatusOptions, form.status) }}</el-tag>
      </div>

      <el-descriptions :column="3" border size="medium">
        <el-descriptions-item label="需求类型">{{ optionLabel(demandTypeOptions, form.demandType) }}</el-descriptions-item>
        <el-descriptions-item label="所属项目">{{ projectLabel(form.projectId) }}</el-descriptions-item>
        <el-descriptions-item label="项目分支">{{ variantLabel(form.variantId) }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ demandModuleLabel }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ form.createBy || "-" }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(form.createTime) || "-" }}</el-descriptions-item>
      </el-descriptions>

      <div class="flow-actions">
        <el-button
          v-if="primaryStatusAction(form.status)"
          size="mini"
          plain
          :type="primaryStatusAction(form.status).type"
          :icon="primaryStatusAction(form.status).icon"
          @click="handleStatusCommand(primaryStatusAction(form.status))"
          v-hasPermi="['req:demand:edit']"
        >{{ primaryStatusAction(form.status).label }}</el-button>
        <el-button
          v-if="canCopyInstruction"
          size="mini"
          type="primary"
          plain
          icon="el-icon-document-copy"
          :loading="instructionLoading"
          @click="copyPlanInstruction"
          v-hasPermi="['req:demand:query']"
        >复制 MCP 编排指令</el-button>
        <el-button
          size="mini"
          type="primary"
          plain
          icon="el-icon-document"
          @click="openPackage"
          :disabled="!demandId"
          v-hasPermi="['req:package:list']"
        >Agent 交接资料</el-button>
      </div>

      <div v-if="planInstruction.content" class="instruction-preview">{{ planInstruction.content }}</div>

      <el-divider content-position="left">业务背景</el-divider>
      <div class="markdown-block">{{ form.businessBackground || "暂无内容" }}</div>

      <el-divider content-position="left">预期结果</el-divider>
      <div class="markdown-block">{{ form.expectedResult || "暂无内容" }}</div>

      <el-divider content-position="left">验收标准</el-divider>
      <div class="markdown-block">{{ form.acceptanceText || "暂无内容" }}</div>

      <el-divider content-position="left">需求设计与执行方案</el-divider>
      <div v-loading="artifactLoading" class="artifact-list">
        <section v-for="artifact in artifactTypes" :key="artifact.value" class="artifact-section">
          <div class="artifact-header">
            <span>{{ artifact.label }}</span>
            <el-tag v-if="artifacts[artifact.value].version" size="mini" type="info">
              v{{ artifacts[artifact.value].version }}
            </el-tag>
          </div>
          <div class="markdown-block artifact-content">
            {{ artifacts[artifact.value].content || "MCP 回写资料包后将在这里展示。" }}
          </div>
          <div v-if="artifacts[artifact.value].updateTime" class="artifact-time">
            更新于 {{ parseTime(artifacts[artifact.value].updateTime) }}
          </div>
        </section>
      </div>

      <div class="detail-actions">
        <el-button icon="el-icon-back" @click="goBack">返回</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { listProject } from "@/api/requirement/project"
import { listVariant } from "@/api/requirement/variant"
import { listModule } from "@/api/requirement/module"
import { listIndexModule } from "@/api/requirement/index"
import { getDemand, getDemandPlanInstruction, updateDemandStatus } from "@/api/requirement/demand"
import { getLatestPackageArtifact } from "@/api/requirement/package"
import {
  demandStatusOptions,
  demandStatusTagType,
  optionLabel,
  primaryStatusAction as getPrimaryStatusAction
} from "./status"

export default {
  name: "RequirementDemandDetail",
  data() {
    return {
      loading: false,
      artifactLoading: false,
      instructionLoading: false,
      demandId: undefined,
      form: {},
      planInstruction: {},
      projectOptions: [],
      variantOptions: [],
      moduleOptions: [],
      artifactTypes: [
        { value: "requirement", label: "需求设计" },
        { value: "plan", label: "执行方案" }
      ],
      artifacts: {
        requirement: { content: "", version: undefined, updateTime: undefined },
        plan: { content: "", version: undefined, updateTime: undefined }
      },
      demandTypeOptions: [
        { value: "FEATURE", label: "功能需求" },
        { value: "OPTIMIZATION", label: "优化需求" },
        { value: "BUGFIX", label: "缺陷修复" },
        { value: "RESEARCH", label: "调研任务" },
        { value: "OTHER", label: "其他" }
      ],
      demandStatusOptions: demandStatusOptions
    }
  },
  created() {
    this.demandId = this.$route.query.demandId || this.$route.params.demandId
    this.getOptions()
    if (this.demandId) {
      this.getDetail()
      this.loadPackagePreview()
    }
  },
  computed: {
    demandModuleLabel() {
      if (this.form.moduleId) {
        return this.moduleLabel(this.form.moduleId)
      }
      return this.form.remark || "新增功能"
    },
    canCopyInstruction() {
      return ["submitted", "plan_pending", "plan_ready"].includes(String(this.form.status))
    }
  },
  methods: {
    getDetail() {
      this.loading = true
      getDemand(this.demandId).then(response => {
        this.form = response.data || {}
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    loadPackagePreview() {
      this.artifactLoading = true
      Promise.all(this.artifactTypes.map(item => {
        return getLatestPackageArtifact(this.demandId, item.value).then(response => {
          this.setArtifact(item.value, response.data || {})
        }).catch(() => {
          this.setArtifact(item.value, {})
        })
      })).then(() => {
        this.artifactLoading = false
      })
    },
    setArtifact(artifactType, data) {
      this.artifacts[artifactType].content = data.content || data.markdown || ""
      this.artifacts[artifactType].version = data.versionNo || data.version || data.artifactVersion
      this.artifacts[artifactType].updateTime = data.updateTime || data.createTime
    },
    getOptions() {
      listProject({ pageNum: 1, pageSize: 1000, status: "0" }).then(response => {
        this.projectOptions = response.rows || response.data || []
      })
      listVariant({ pageNum: 1, pageSize: 1000, status: "0" }).then(response => {
        this.variantOptions = response.rows || response.data || []
      })
      Promise.all([
        listModule({ status: "0" }).catch(() => ({ rows: [], data: [] })),
        listIndexModule({ status: "0" }).catch(() => ({ rows: [], data: [] }))
      ]).then(([manualResponse, indexResponse]) => {
        this.moduleOptions = this.mergeModuleOptions(
          manualResponse.rows || manualResponse.data || [],
          indexResponse.rows || indexResponse.data || []
        )
      })
    },
    goBack() {
      this.$tab.closePage()
    },
    openPackage() {
      this.$tab.openPage("Agent交接资料", "/requirement/package", { demandId: this.demandId, parentPath: this.$route.fullPath })
    },
    handleStatusCommand(action) {
      if (!this.demandId || !action) return
      this.$modal.confirm(action.confirm || "是否确认更新需求状态？").then(() => {
        return updateDemandStatus(this.demandId, action.value)
      }).then(() => {
        this.$modal.msgSuccess("状态更新成功")
        this.getDetail()
      }).catch(() => {})
    },
    copyPlanInstruction() {
      if (!this.demandId) return
      if (this.planInstruction.content) {
        this.copyText(this.planInstruction.content)
        return
      }
      this.instructionLoading = true
      getDemandPlanInstruction(this.demandId).then(response => {
        this.planInstruction = response.data || {}
        this.copyText(this.planInstruction.content || "")
        this.instructionLoading = false
      }).catch(() => {
        this.instructionLoading = false
      })
    },
    copyText(content) {
      if (!content) {
        this.$modal.msgWarning("暂无可复制内容")
        return
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
          this.$modal.msgSuccess("复制成功")
        }).catch(() => {
          this.copyByTextarea(content)
        })
      } else {
        this.copyByTextarea(content)
      }
    },
    copyByTextarea(content) {
      const textarea = document.createElement("textarea")
      textarea.value = content
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      this.$modal.msgSuccess("复制成功")
    },
    projectLabel(projectId) {
      const project = this.projectOptions.find(item => String(item.projectId || item.id) === String(projectId))
      return project ? project.projectName : projectId || "-"
    },
    variantLabel(variantId) {
      const variant = this.variantOptions.find(item => String(item.variantId || item.id) === String(variantId))
      return variant ? (variant.branchLabel || variant.variantName) : variantId || "-"
    },
    moduleLabel(moduleId) {
      const module = this.moduleOptions.find(item => String(this.moduleOptionValue(item)) === String(moduleId))
      return module ? module.moduleName : moduleId || "-"
    },
    moduleOptionValue(module) {
      return module.indexModuleId || module.moduleId || module.id
    },
    mergeModuleOptions(manualModules, indexModules) {
      const result = []
      const seen = new Set()
      ;(manualModules || []).concat(indexModules || []).forEach(item => {
        const key = this.moduleOptionValue(item)
        if (!key || seen.has(String(key))) return
        seen.add(String(key))
        result.push(item)
      })
      return result
    },
    optionLabel(options, value) {
      return optionLabel(options, value)
    },
    demandStatusTagType(value) {
      return demandStatusTagType(value)
    },
    primaryStatusAction(status) {
      return getPrimaryStatusAction(status)
    }
  }
}
</script>

<style scoped>
.detail-card {
  margin-top: 16px;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 28px;
}

.detail-subtitle {
  margin-top: 4px;
  color: #909399;
  font-size: 13px;
}

.markdown-block {
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  color: #303133;
  line-height: 1.7;
  white-space: pre-wrap;
  background: #fafafa;
}

.detail-actions {
  margin-top: 18px;
  text-align: right;
}

.flow-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.instruction-preview {
  margin-top: 10px;
  padding: 10px 12px;
  border-left: 3px solid #409eff;
  color: #606266;
  line-height: 1.7;
  white-space: pre-wrap;
  background: #f7fbff;
}

.artifact-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.artifact-section {
  min-width: 0;
}

.artifact-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #303133;
  font-weight: 600;
}

.artifact-content {
  min-height: 140px;
}

.artifact-time {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}

@media (max-width: 900px) {
  .artifact-list {
    grid-template-columns: 1fr;
  }
}
</style>
