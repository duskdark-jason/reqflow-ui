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
          <el-button
            size="mini"
            type="primary"
            plain
            icon="el-icon-refresh"
            :loading="refreshing"
            @click="handleRefresh"
          >刷新</el-button>
          <el-tag :type="demandStatusTagType(form.status)">{{ optionLabel(demandStatusOptions, form.status) }}</el-tag>
          <div v-if="visibleStatusActions(form).length" class="process-actions">
            <el-button
              v-for="action in visibleStatusActions(form)"
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
            v-if="canOpenDesignAdjustment"
            size="mini"
            class="generate-action-button"
            icon="el-icon-edit-outline"
            @click="openDesignAdjustmentPanel"
            v-hasPermi="['req:demand:edit']"
          >补充调整说明</el-button>
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
          <span>{{ supplementPanelTitle }}</span>
          <small>{{ supplementPanelHint }}</small>
        </div>
        <el-input
          v-model="supplementContent"
          type="textarea"
          :rows="5"
          maxlength="4000"
          show-word-limit
          resize="vertical"
          :placeholder="supplementPlaceholder"
        />
        <div class="supplement-actions">
          <el-button
            type="primary"
            icon="el-icon-upload2"
            :loading="supplementSubmitting"
            @click="handleSubmitSupplement"
            v-hasPermi="['req:demand:edit']"
          >{{ supplementSubmitLabel }}</el-button>
          <el-button
            v-if="isDesignAdjustmentStage"
            icon="el-icon-close"
            :disabled="supplementSubmitting"
            @click="cancelDesignAdjustment"
          >取消调整</el-button>
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
            <div
              v-if="artifacts[artifact.value].content"
              class="markdown-reader artifact-content"
              v-html="renderArtifactMarkdown(artifact.value)"
            />
            <el-empty v-else :description="artifact.label + '暂无内容'" :image-size="80" class="artifact-empty" />
            <div v-if="artifactSupplementVersions(artifact.value).length" class="iteration-section">
              <div class="iteration-heading">补充与调整记录</div>
              <el-collapse class="iteration-collapse">
                <el-collapse-item
                  v-for="(version, index) in artifactSupplementVersions(artifact.value)"
                  :key="artifact.value + '-supplement-' + version.versionNo"
                  :name="artifact.value + '-supplement-' + version.versionNo"
                >
                  <template slot="title">
                    <span>{{ iterationTitle(version, index) }}</span>
                    <small>{{ parseTime(version.createTime) || "历史记录" }}</small>
                  </template>
                  <div class="markdown-reader iteration-content" v-html="renderSupplementMarkdown(version)" />
                </el-collapse-item>
              </el-collapse>
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
import { createEmptyArtifacts, defaultArtifactByStatus, handoffArtifactTypes, supplementVersionsForArtifact as getSupplementVersionsForArtifact } from "./artifacts"
import { renderMarkdown } from "./markdown"
import {
  canUseDeveloperInstruction as canUseDeveloperInstructionForRoles,
  canUseDevelopInstruction,
  canUsePlanInstruction,
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
      refreshing: false,
      instructionLoadingType: "",
      supplementSubmitting: false,
      demandId: undefined,
      activeArtifact: "requirement_draft",
      form: {},
      supplementContent: "",
      showDesignAdjustmentPanel: false,
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
      return canUsePlanInstruction(this.roles, this.form, this.id, this.permissions) &&
        !this.hasFeedbackArtifactForStatus(this.form.status)
    },
    canCopyDevelopInstruction() {
      return canUseDevelopInstruction(this.roles, this.form, this.id, this.permissions)
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
          loadingType: String(this.form.status) === "closeout_pending" ? "closeout" : "develop",
          label: this.developInstructionLabel,
          icon: "el-icon-position",
          loader: getDemandDevelopInstruction
        }
      }
      return null
    },
    isRepairing() {
      return String(this.form.status) === "repairing"
    },
    developInstructionLabel() {
      if (String(this.form.status) === "repairing") {
        return "生成返修任务指令"
      }
      if (String(this.form.status) === "closeout_pending") {
        return "生成合并归档指令"
      }
      return "生成执行任务指令"
    },
    canSubmitSupplement() {
      if (!this.canCurrentUserSubmitSupplement()) {
        return false
      }
      if (String(this.form.status) === "supplement_required") {
        return true
      }
      return this.isDesignAdjustmentStage && this.showDesignAdjustmentPanel
    },
    canOpenDesignAdjustment() {
      return this.isDesignAdjustmentStage &&
        !this.showDesignAdjustmentPanel &&
        this.canCurrentUserSubmitSupplement()
    },
    isDesignAdjustmentStage() {
      return String(this.form.status) === "plan_ready"
    },
    supplementPanelTitle() {
      return this.isDesignAdjustmentStage ? "补充调整说明" : "补充说明"
    },
    supplementPanelHint() {
      return this.isDesignAdjustmentStage
        ? "提交后回到需求设计生成阶段，可由开发人员按调整说明重新生成需求设计"
        : "提交后将回到需求设计生成阶段"
    },
    supplementPlaceholder() {
      return this.isDesignAdjustmentStage
        ? "请输入对当前需求设计需要调整的范围、规则、异常分支或验收样例"
        : "请输入需要补充的业务背景、边界范围、验收口径或附件说明"
    },
    supplementSubmitLabel() {
      return this.isDesignAdjustmentStage ? "提交调整说明" : "提交补充说明"
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
      return getDemand(this.demandId).then(response => {
        this.form = response.data || {}
        if (!this.isDesignAdjustmentStage) {
          this.showDesignAdjustmentPanel = false
          this.supplementContent = ""
        }
        this.setDefaultActiveArtifact()
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    loadPackagePreview() {
      this.artifactLoading = true
      return getDemandPackage(this.demandId).then(response => {
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
    handleRefresh() {
      if (!this.demandId || this.refreshing) return
      this.refreshing = true
      Promise.all([
        this.getDetail(),
        this.loadPackagePreview()
      ]).then(() => {
        this.$modal.msgSuccess("刷新成功")
      }).finally(() => {
        this.refreshing = false
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
    artifactSupplementVersions(artifactType) {
      return getSupplementVersionsForArtifact(this.packageVersions, artifactType)
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
        this.$modal.msgWarning(this.isDesignAdjustmentStage ? "请输入调整说明" : "请输入补充说明")
        return
      }
      this.supplementSubmitting = true
      submitDemandSupplement(this.demandId, { content: this.supplementContent.trim() }).then(() => {
        this.$modal.msgSuccess(this.isDesignAdjustmentStage ? "调整说明已提交" : "补充说明已提交")
        this.supplementContent = ""
        this.showDesignAdjustmentPanel = false
        this.getDetail()
        this.loadPackagePreview()
        this.supplementSubmitting = false
      }).catch(() => {
        this.supplementSubmitting = false
      })
    },
    setDefaultActiveArtifact() {
      const target = defaultArtifactByStatus(this.form.status, this.artifacts)
      if (this.artifacts[target]) {
        this.activeArtifact = target
      }
    },
    openDesignAdjustmentPanel() {
      this.showDesignAdjustmentPanel = true
      this.supplementContent = ""
    },
    cancelDesignAdjustment() {
      this.showDesignAdjustmentPanel = false
      this.supplementContent = ""
    },
    renderArtifactMarkdown(artifactType) {
      return renderMarkdown(this.artifacts[artifactType].content)
    },
    renderSupplementMarkdown(version) {
      return renderMarkdown(version && version.content)
    },
    iterationTitle(version, index) {
      const note = version && version.versionNote ? version.versionNote : "补充记录"
      const versionNo = version && version.versionNo ? "v" + version.versionNo : "第" + (index + 1) + "轮"
      return versionNo + " · " + note
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
    visibleStatusActions(row) {
      const actions = this.statusActions(row)
      const artifactAwareActions = actions.filter(action => {
        if (!action.feedbackOptions || !action.feedbackOptions.length) {
          return true
        }
        return this.hasFeedbackArtifactForStatus(row && row.status)
      })
      if (this.isDesignAdjustmentStage && this.showDesignAdjustmentPanel) {
        return artifactAwareActions.filter(action => action.value !== "confirmed")
      }
      return artifactAwareActions
    },
    hasFeedbackArtifactForStatus(status) {
      if (String(status) === "submitted") {
        return !!this.latestArtifactVersion("requirement_assessment")
      }
      if (String(status) === "plan_pending") {
        return !!this.latestArtifactVersion("requirement")
      }
      return false
    },
    canUseDeveloperInstruction() {
      return canUseDeveloperInstructionForRoles(this.roles, this.form, this.id, this.permissions)
    },
    canCurrentUserSubmitSupplement() {
      return this.isAdmin() || this.sameUser(this.form.creatorId, this.id)
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
  box-sizing: border-box;
}

.artifact-empty {
  min-height: 220px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fbfcfe;
}

.markdown-reader {
  min-height: 220px;
  padding: 18px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  color: #1f2937;
  line-height: 1.75;
  background: #fbfcfe;
  word-break: break-word;
}

.markdown-reader ::v-deep h1,
.markdown-reader ::v-deep h2,
.markdown-reader ::v-deep h3,
.markdown-reader ::v-deep h4,
.markdown-reader ::v-deep h5,
.markdown-reader ::v-deep h6 {
  margin: 18px 0 10px;
  color: #111827;
  font-weight: 700;
  line-height: 1.35;
}

.markdown-reader ::v-deep h1 {
  margin-top: 0;
  font-size: 22px;
}

.markdown-reader ::v-deep h2 {
  font-size: 18px;
}

.markdown-reader ::v-deep h3 {
  font-size: 16px;
}

.markdown-reader ::v-deep p {
  margin: 0 0 12px;
}

.markdown-reader ::v-deep ul,
.markdown-reader ::v-deep ol {
  margin: 0 0 12px;
  padding-left: 22px;
}

.markdown-reader ::v-deep li {
  margin: 4px 0;
}

.markdown-reader ::v-deep blockquote {
  margin: 12px 0;
  padding: 8px 12px;
  border-left: 3px solid #60a5fa;
  color: #374151;
  background: #eff6ff;
}

.markdown-reader ::v-deep code {
  padding: 2px 5px;
  border-radius: 4px;
  color: #92400e;
  background: #fef3c7;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 12px;
}

.markdown-reader ::v-deep pre {
  margin: 12px 0;
  padding: 12px;
  overflow: auto;
  border-radius: 6px;
  background: #111827;
}

.markdown-reader ::v-deep pre code {
  padding: 0;
  color: #f9fafb;
  background: transparent;
  white-space: pre;
}

.markdown-reader ::v-deep a {
  color: #2563eb;
}

.iteration-section {
  margin-top: 14px;
}

.iteration-heading {
  margin-bottom: 8px;
  color: #374151;
  font-weight: 700;
}

.iteration-collapse {
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.iteration-collapse ::v-deep .el-collapse-item__header {
  min-height: 44px;
  height: auto;
  line-height: 20px;
  gap: 8px;
  padding: 8px 0;
  color: #1f2937;
  font-weight: 600;
}

.iteration-collapse ::v-deep .el-collapse-item__header small {
  margin-left: 8px;
  color: #909399;
  font-weight: 400;
}

.iteration-content {
  min-height: 0;
  margin-bottom: 12px;
  background: #fff;
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
    min-height: 180px;
  }

  .embedded-package-tabs ::v-deep .el-tabs__nav-wrap {
    max-width: 100%;
  }
}
</style>
