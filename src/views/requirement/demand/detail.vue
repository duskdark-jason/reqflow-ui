<template>
  <div class="app-container">
    <el-page-header content="需求详情" @back="goBack" />

    <el-card class="detail-card" shadow="never" v-loading="loading">
      <div slot="header" class="detail-header">
        <div class="detail-heading">
          <div class="detail-title">{{ form.title || "未选择需求" }}</div>
          <div class="detail-subtitle">{{ form.demandNo || "-" }}</div>
        </div>
        <div class="detail-status-panel">
          <el-tag :type="demandStatusTagType(form.status)">{{ optionLabel(demandStatusOptions, form.status) }}</el-tag>
          <div v-if="statusActions(form).length" class="process-actions">
            <el-button
              v-for="action in statusActions(form)"
              :key="action.value"
              size="mini"
              class="flow-confirm-button"
              :class="'is-' + action.tone"
              :icon="action.icon"
              @click="handleStatusCommand(action)"
              v-hasPermi="['req:demand:edit']"
            >{{ action.label }}</el-button>
          </div>
          <el-button
            v-if="instructionAction"
            size="mini"
            class="generate-action-button"
            :icon="instructionAction.icon"
            :loading="instructionLoadingType === instructionAction.loadingType"
            @click="handleInstructionAction(instructionAction)"
            v-hasPermi="['req:demand:query']"
          >{{ instructionAction.label }}</el-button>
        </div>
      </div>

      <el-descriptions :column="3" border size="medium">
        <el-descriptions-item label="需求类型">{{ optionLabel(demandTypeOptions, form.demandType) }}</el-descriptions-item>
        <el-descriptions-item label="需求来源">{{ form.demandSource || "-" }}</el-descriptions-item>
        <el-descriptions-item label="所属项目">{{ projectLabel(form.projectId) }}</el-descriptions-item>
        <el-descriptions-item label="项目分支">{{ variantLabel(form.variantId) }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ demandModuleLabel }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ form.createBy || "-" }}</el-descriptions-item>
        <el-descriptions-item label="开发人员">{{ developerLabel(form) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(form.createTime) || "-" }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="isRepairing" class="repair-banner">
        <span>返修中</span>
        <small>下方 Agent 交接资料包保留每次需求可行性评估、需求设计、执行计划、执行报告和 Review 报告回写。</small>
      </div>

      <section v-if="canSubmitSupplement" class="supplement-panel">
        <div class="supplement-heading">
          <span>补充说明</span>
          <small>提交后将回到需求设计生成阶段</small>
        </div>
        <el-input
          v-model="supplementContent"
          type="textarea"
          :rows="5"
          maxlength="4000"
          show-word-limit
          resize="vertical"
          placeholder="请输入需要补充的业务背景、边界范围、验收口径或附件说明"
        />
        <div class="supplement-actions">
          <el-button
            type="primary"
            icon="el-icon-upload2"
            :loading="supplementSubmitting"
            @click="handleSubmitSupplement"
            v-hasPermi="['req:demand:edit']"
          >提交补充说明</el-button>
        </div>
      </section>

      <el-divider content-position="left">业务背景</el-divider>
      <div v-if="form.businessBackground" class="markdown-block">{{ form.businessBackground }}</div>
      <div v-else class="markdown-block">暂无内容</div>

      <el-divider content-position="left">预期结果</el-divider>
      <div class="markdown-block">{{ form.expectedResult || "暂无内容" }}</div>

      <el-divider content-position="left">验收标准</el-divider>
      <div class="markdown-block">{{ form.acceptanceText || "暂无内容" }}</div>

      <el-divider content-position="left">需求附件</el-divider>
      <div v-if="attachmentList.length" class="attachment-list">
        <el-link
          v-for="file in attachmentList"
          :key="file.url"
          :href="attachmentUrl(file.url)"
          :underline="false"
          target="_blank"
          class="attachment-item"
        >
          <i class="el-icon-paperclip"></i>
          <span>{{ attachmentName(file.name || file.url) }}</span>
        </el-link>
      </div>
      <div v-else class="markdown-block">暂无附件</div>

      <section v-loading="artifactLoading" class="embedded-package">
        <div class="handoff-header">
          <div class="handoff-heading">
            <div class="handoff-label">Agent 交接资料包</div>
            <div class="handoff-title">{{ form.title || "当前需求" }}</div>
            <div class="handoff-meta">
              <span>{{ form.demandNo || "-" }}</span>
              <span v-if="packageVersions.length">文档版本数：{{ packageVersions.length }}</span>
            </div>
          </div>
        </div>
        <el-tabs v-model="activeArtifact" class="embedded-package-tabs">
          <el-tab-pane
            v-for="artifact in artifactTypes"
            :key="artifact.value"
            :label="artifact.label"
            :name="artifact.value"
          >
            <div class="artifact-header">
              <span>{{ artifact.label }}</span>
              <el-tag v-if="artifacts[artifact.value].version" size="mini" type="info">
                v{{ artifacts[artifact.value].version }}
              </el-tag>
            </div>
            <div class="markdown-block artifact-content">
              {{ artifacts[artifact.value].content || "MCP 回写资料包后将在这里展示。" }}
            </div>
            <div v-if="artifactVersions(artifact.value).length" class="version-history">
              <span
                v-for="version in artifactVersions(artifact.value)"
                :key="artifact.value + '-' + version.versionNo"
                class="version-chip"
                :class="{ 'is-current': version.versionNo === artifacts[artifact.value].version }"
              >
                v{{ version.versionNo }}
                <small>{{ version.versionNote || parseTime(version.createTime) || "历史版本" }}</small>
              </span>
            </div>
            <div v-if="artifacts[artifact.value].updateTime" class="artifact-time">
              更新于 {{ parseTime(artifacts[artifact.value].updateTime) }}
            </div>
          </el-tab-pane>
        </el-tabs>
      </section>

      <div class="detail-actions">
        <el-button icon="el-icon-back" @click="goBack">返回</el-button>
      </div>
    </el-card>

    <el-dialog
      :title="feedbackDialog.action ? feedbackDialog.action.dialogTitle : '选择流程结论'"
      :visible.sync="feedbackDialog.visible"
      width="520px"
      append-to-body
    >
      <el-radio-group v-model="feedbackDialog.selected" class="feedback-options">
        <el-radio
          v-for="option in feedbackOptions"
          :key="option.value"
          :label="option.value"
          border
          class="feedback-option"
        >
          <span>{{ option.label }}</span>
          <small>{{ option.description }}</small>
        </el-radio>
      </el-radio-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="feedbackDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="feedbackDialog.loading" @click="submitFeedbackConclusion">确认提交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listProject } from "@/api/requirement/project"
import { listVariant } from "@/api/requirement/variant"
import { listModule } from "@/api/requirement/module"
import { listIndexModule } from "@/api/requirement/index"
import { getDemand, getDemandDevelopInstruction, getDemandPlanInstruction, submitDemandSupplement, updateDemandStatus } from "@/api/requirement/demand"
import { getDemandPackage } from "@/api/requirement/package"
import { mapGetters } from "vuex"
import { createEmptyArtifacts, defaultArtifactByStatus, handoffArtifactTypes } from "./artifacts"
import {
  canUseDeveloperInstruction as canUseDeveloperInstructionForRoles,
  demandStatusOptions,
  demandStatusTagType,
  optionLabel,
  primaryStatusAction as getPrimaryStatusAction,
  statusActions as getStatusActions
} from "./status"

export default {
  name: "RequirementDemandDetail",
  data() {
    return {
      loading: false,
      artifactLoading: false,
      instructionLoadingType: "",
      supplementSubmitting: false,
      demandId: undefined,
      activeArtifact: "requirement_draft",
      form: {},
      supplementContent: "",
      planInstruction: {},
      developInstruction: {},
      projectOptions: [],
      variantOptions: [],
      moduleOptions: [],
      packageVersions: [],
      artifactTypes: handoffArtifactTypes,
      artifacts: createEmptyArtifacts(),
      feedbackDialog: {
        visible: false,
        action: null,
        selected: "",
        loading: false
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
    ...mapGetters([
      "id",
      "permissions",
      "roles"
    ]),
    demandModuleLabel() {
      if (this.form.moduleId) {
        return this.moduleLabel(this.form.moduleId)
      }
      return this.form.remark || "新增功能"
    },
    canCopyInstruction() {
      return this.canUseDeveloperInstruction() && ["submitted", "plan_pending", "plan_ready"].includes(String(this.form.status))
    },
    canCopyDevelopInstruction() {
      return this.canUseDeveloperInstruction() && ["confirmed", "developing", "repairing"].includes(String(this.form.status))
    },
    instructionAction() {
      if (this.canCopyInstruction) {
        return {
          cacheKey: "planInstruction",
          loadingType: "plan",
          label: String(this.form.status) === "submitted" ? "生成需求分析指令" : "生成需求设计指令",
          icon: "el-icon-document-checked",
          loader: getDemandPlanInstruction
        }
      }
      if (this.canCopyDevelopInstruction) {
        return {
          cacheKey: "developInstruction",
          loadingType: "develop",
          label: String(this.form.status) === "repairing" ? "生成返修任务指令" : "生成执行任务指令",
          icon: "el-icon-position",
          loader: getDemandDevelopInstruction
        }
      }
      return null
    },
    isRepairing() {
      return String(this.form.status) === "repairing"
    },
    canSubmitSupplement() {
      return String(this.form.status) === "supplement_required" && (this.isAdmin() || this.sameUser(this.form.creatorId, this.id))
    },
    feedbackOptions() {
      return this.feedbackDialog.action && this.feedbackDialog.action.feedbackOptions
        ? this.feedbackDialog.action.feedbackOptions
        : []
    },
    attachmentList() {
      return this.normalizeAttachmentList(this.form.attachments)
    }
  },
  methods: {
    getDetail() {
      this.loading = true
      getDemand(this.demandId).then(response => {
        this.form = response.data || {}
        this.setDefaultActiveArtifact()
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    loadPackagePreview() {
      this.artifactLoading = true
      getDemandPackage(this.demandId).then(response => {
        this.packageVersions = this.normalizePackageVersions(response.data)
        this.artifactTypes.forEach(item => {
          this.setArtifact(item.value, this.latestArtifactVersion(item.value) || {})
        })
        this.setDefaultActiveArtifact()
        this.artifactLoading = false
      }).catch(() => {
        this.packageVersions = []
        this.artifactTypes.forEach(item => this.setArtifact(item.value, {}))
        this.setDefaultActiveArtifact()
        this.artifactLoading = false
      })
    },
    setArtifact(artifactType, data) {
      this.artifacts[artifactType].content = data.content || data.markdown || ""
      this.artifacts[artifactType].version = data.versionNo || data.version || data.artifactVersion
      this.artifacts[artifactType].updateTime = data.updateTime || data.createTime
    },
    normalizePackageVersions(data) {
      if (Array.isArray(data)) {
        return data
      }
      if (data && Array.isArray(data.items)) {
        return data.items
      }
      if (data && Array.isArray(data.artifacts)) {
        return data.artifacts
      }
      return []
    },
    artifactVersions(artifactType) {
      return this.packageVersions
        .filter(item => item.artifactType === artifactType)
        .sort((a, b) => Number(b.versionNo || 0) - Number(a.versionNo || 0))
        .slice(0, 5)
    },
    latestArtifactVersion(artifactType) {
      return this.artifactVersions(artifactType)[0]
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
    handleStatusCommand(action) {
      if (!this.demandId || !action) return
      if (action.feedbackOptions && action.feedbackOptions.length) {
        this.openFeedbackDialog(action)
        return
      }
      this.$modal.confirm(action.confirm || "是否确认更新需求状态？").then(() => {
        return updateDemandStatus(this.demandId, action.value)
      }).then(() => {
        this.$modal.msgSuccess("状态更新成功")
        this.getDetail()
      }).catch(() => {})
    },
    openFeedbackDialog(action) {
      this.feedbackDialog.action = action
      this.feedbackDialog.selected = action.feedbackOptions[0].value
      this.feedbackDialog.loading = false
      this.feedbackDialog.visible = true
    },
    submitFeedbackConclusion() {
      const option = this.feedbackOptions.find(item => item.value === this.feedbackDialog.selected)
      if (!option) {
        this.$modal.msgWarning("请选择流程结论")
        return
      }
      this.$modal.confirm(option.confirm || "是否确认提交该流程结论？").then(() => {
        this.feedbackDialog.loading = true
        return updateDemandStatus(this.demandId, option.value)
      }).then(() => {
        this.feedbackDialog.visible = false
        this.feedbackDialog.loading = false
        this.$modal.msgSuccess("流程结论已提交")
        this.getDetail()
        this.loadPackagePreview()
      }).catch(() => {
        this.feedbackDialog.loading = false
      })
    },
    handleSubmitSupplement() {
      if (!String(this.supplementContent || "").trim()) {
        this.$modal.msgWarning("请输入补充说明")
        return
      }
      this.supplementSubmitting = true
      submitDemandSupplement(this.demandId, { content: this.supplementContent.trim() }).then(() => {
        this.$modal.msgSuccess("补充说明已提交")
        this.supplementContent = ""
        this.getDetail()
        this.loadPackagePreview()
        this.supplementSubmitting = false
      }).catch(() => {
        this.supplementSubmitting = false
      })
    },
    setDefaultActiveArtifact() {
      const target = defaultArtifactByStatus(this.form.status)
      if (this.artifacts[target]) {
        this.activeArtifact = target
      }
    },
    handleInstructionAction(action) {
      if (!action) return
      this.copyInstruction(action.cacheKey, action.loadingType, action.loader)
    },
    copyInstruction(cacheKey, loadingType, loader) {
      if (!this.demandId) return
      if (this[cacheKey].content) {
        this.copyText(this[cacheKey].content)
        return
      }
      this.instructionLoadingType = loadingType
      loader(this.demandId).then(response => {
        this[cacheKey] = response.data || {}
        this.copyText(this[cacheKey].content || "")
        this.instructionLoadingType = ""
      }).catch(() => {
        this.instructionLoadingType = ""
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
      return getPrimaryStatusAction(status, this.roles, this.permissions, this.form, this.id)
    },
    statusActions(row) {
      return getStatusActions(row.status, this.roles, this.permissions, row, this.id)
    },
    canUseDeveloperInstruction() {
      return canUseDeveloperInstructionForRoles(this.roles, this.form, this.id, this.permissions)
    },
    isAdmin() {
      return (Array.isArray(this.roles) && this.roles.includes("admin")) ||
        (Array.isArray(this.permissions) && this.permissions.includes("*:*:*"))
    },
    sameUser(left, right) {
      return left !== undefined && left !== null && right !== undefined && right !== null && String(left) === String(right)
    },
    developerLabel(row) {
      if (!row) {
        return "-"
      }
      if (row.developerNickName && row.developerUserName) {
        return row.developerNickName + "（" + row.developerUserName + "）"
      }
      return row.developerNickName || row.developerUserName || "-"
    },
    normalizeAttachmentList(value) {
      if (!value) {
        return []
      }
      if (Array.isArray(value)) {
        return value
      }
      return String(value).split(",")
        .map(item => item.trim())
        .filter(Boolean)
        .map(item => ({ name: item, url: item }))
    },
    attachmentName(name) {
      const value = String(name || "")
      return value.lastIndexOf("/") > -1 ? value.slice(value.lastIndexOf("/") + 1) : value
    },
    attachmentUrl(url) {
      if (!url) {
        return "#"
      }
      if (/^https?:\/\//.test(url)) {
        return url
      }
      return process.env.VUE_APP_BASE_API + url
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
  gap: 16px;
}

.detail-heading {
  min-width: 0;
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

.detail-status-panel {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
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

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}

.attachment-item {
  align-self: flex-start;
  max-width: 100%;
}

.attachment-item span {
  margin-left: 6px;
  word-break: break-all;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  clear: both;
  margin-top: 18px;
}

.process-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.process-actions {
  justify-content: flex-end;
}

.flow-confirm-button {
  height: 30px;
  margin-left: 0 !important;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #1d4ed8;
  color: #fff;
  font-weight: 600;
}

.flow-confirm-button:hover,
.flow-confirm-button:focus {
  border-color: #1e40af;
  background: #1e40af;
  color: #fff;
}

.flow-confirm-button.is-repair {
  border-color: #fecaca;
  background: #fff1f2;
  color: #be123c;
}

.flow-confirm-button.is-repair:hover,
.flow-confirm-button.is-repair:focus {
  border-color: #fda4af;
  background: #ffe4e6;
  color: #9f1239;
}

.flow-confirm-button.is-complete {
  border-color: #059669;
  background: #059669;
}

.flow-confirm-button.is-complete:hover,
.flow-confirm-button.is-complete:focus {
  border-color: #047857;
  background: #047857;
}

.generate-action-button {
  height: 30px;
  margin-left: 0 !important;
  border-color: #d1d5db;
  color: #374151;
  background: #fff;
  font-weight: 600;
}

.generate-action-button:hover,
.generate-action-button:focus {
  border-color: #93c5fd;
  color: #1d4ed8;
  background: #eff6ff;
}

.repair-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-radius: 6px;
  background: #fff1f2;
  color: #be123c;
}

.repair-banner span {
  font-weight: 700;
}

.repair-banner small {
  color: #9f1239;
}

.supplement-panel {
  margin-top: 14px;
  padding: 14px;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  background: #fff7ed;
}

.supplement-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.supplement-heading span {
  color: #9a3412;
  font-weight: 700;
}

.supplement-heading small {
  color: #c2410c;
}

.supplement-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.embedded-package {
  clear: both;
  margin-top: 22px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  min-height: 240px;
}

.embedded-package-tabs {
  min-width: 0;
}

.embedded-package-tabs ::v-deep .el-tabs__content {
  overflow: visible;
}

.handoff-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.handoff-heading {
  min-width: 0;
}

.handoff-label {
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

.handoff-title {
  margin-top: 4px;
  color: #111827;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  word-break: break-word;
}

.handoff-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
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
  min-height: 220px;
  max-height: 420px;
  overflow: auto;
  box-sizing: border-box;
}

.artifact-time {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}

.version-history {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.version-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 3px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  color: #6b7280;
  background: #fff;
  font-size: 12px;
}

.version-chip.is-current {
  border-color: #bfdbfe;
  color: #1d4ed8;
  background: #eff6ff;
}

.version-chip small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feedback-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.feedback-option {
  display: flex;
  align-items: center;
  width: 100%;
  height: auto;
  margin: 0;
  padding: 12px 14px;
  border-radius: 6px;
}

.feedback-option ::v-deep .el-radio__label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  white-space: normal;
}

.feedback-option small {
  color: #6b7280;
  line-height: 18px;
}

@media (max-width: 900px) {
  .detail-header,
  .detail-status-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .process-actions {
    justify-content: flex-start;
  }

  .embedded-package {
    padding: 12px;
  }

  .artifact-content {
    max-height: 340px;
  }

  .embedded-package-tabs ::v-deep .el-tabs__nav-wrap {
    max-width: 100%;
  }
}
</style>
