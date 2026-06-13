<template>
  <div class="app-container package-page" :class="{ 'is-focus-mode': focusedMode }">
    <section v-if="focusedMode" class="package-focus-header">
      <div class="focus-label">当前需求</div>
      <h2>{{ currentDemandTitle }}</h2>
      <div class="focus-meta">
        <span v-if="demandInfo.demandNo">{{ demandInfo.demandNo }}</span>
        <span v-if="packageVersionTotal">文档版本数：{{ packageVersionTotal }}</span>
      </div>
    </section>

    <el-form v-else :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="80px">
      <el-form-item label="需求ID" prop="demandId">
        <el-input
          v-model="queryParams.demandId"
          placeholder="请输入需求ID"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleLoadPackage"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleLoadPackage"
          v-hasPermi="['req:package:list']"
        >加载资料</el-button>
        <el-button
          type="success"
          icon="el-icon-magic-stick"
          size="mini"
          :disabled="!queryParams.demandId"
          @click="handleGenerate"
          v-hasPermi="['req:package:save']"
        >生成资料</el-button>
      </el-form-item>
    </el-form>

    <el-alert
      v-if="!queryParams.demandId"
      title="请输入需求ID或从需求列表进入 Agent 交接资料页面"
      type="info"
      show-icon
      :closable="false"
      class="mb8"
    />

    <el-card shadow="never" class="package-card" v-loading="loading">
      <div slot="header" class="package-header">
        <span>{{ focusedMode ? "需求文档" : "Agent 交接资料" }}</span>
        <div class="package-header-actions">
          <span class="package-meta" v-if="packageVersionTotal">版本数：{{ packageVersionTotal }}</span>
          <el-button
            v-if="focusedMode"
            type="primary"
            plain
            icon="el-icon-refresh"
            size="mini"
            :loading="loading"
            @click="handleRefresh"
          >刷新</el-button>
        </div>
      </div>

      <el-tabs v-model="activeArtifact">
        <el-tab-pane
          v-for="artifact in artifactTypes"
          :key="artifact.value"
          :label="artifact.label"
          :name="artifact.value"
        >
          <el-row v-if="!focusedMode" :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button
                type="primary"
                plain
                icon="el-icon-refresh"
                size="mini"
                :disabled="!queryParams.demandId"
                @click="handleLoadLatest(artifact.value)"
                v-hasPermi="['req:package:list']"
              >加载最新</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="success"
                plain
                icon="el-icon-check"
                size="mini"
                :disabled="!queryParams.demandId"
                @click="handleSave(artifact.value)"
                v-hasPermi="['req:package:save']"
              >保存新版本</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="info"
                plain
                icon="el-icon-copy-document"
                size="mini"
                @click="handleCopy(artifact.value)"
              >复制</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="warning"
                plain
                icon="el-icon-download"
                size="mini"
                @click="handleDownload(artifact.value)"
              >下载 Markdown</el-button>
            </el-col>
          </el-row>

          <div class="artifact-meta">
            <span v-if="!focusedMode">制品类型：{{ artifact.value }}</span>
            <span v-if="artifacts[artifact.value].version">版本：{{ artifacts[artifact.value].version }}</span>
            <span v-if="artifacts[artifact.value].updateTime">更新时间：{{ parseTime(artifacts[artifact.value].updateTime) }}</span>
          </div>

          <template v-if="focusedMode">
            <div class="artifact-viewer">
              <div
                v-if="artifacts[artifact.value].content"
                class="markdown-reader package-markdown"
                v-html="renderArtifactMarkdown(artifact.value)"
              />
              <el-empty v-else :description="artifact.label + '暂无内容'" :image-size="80" />
            </div>
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
          </template>
          <el-input
            v-else
            v-model="artifacts[artifact.value].content"
            type="textarea"
            :rows="22"
            resize="vertical"
            placeholder="请输入 Markdown 内容"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { getDemand } from "@/api/requirement/demand"
import { getDemandPackage, getLatestPackageArtifact, savePackageArtifact, generatePackage } from "@/api/requirement/package"
import { createEmptyArtifacts, defaultArtifactByStatus, handoffArtifactTypes, supplementVersionsForArtifact as getSupplementVersionsForArtifact } from "@/views/requirement/demand/artifacts"
import { renderMarkdown } from "@/views/requirement/demand/markdown"

export default {
  name: "RequirementPackage",
  data() {
    return {
      loading: false,
      activeArtifact: "requirement_draft",
      artifactTypes: handoffArtifactTypes,
      demandInfo: {},
      packageInfo: {},
      queryParams: {
        demandId: undefined
      },
      artifacts: createEmptyArtifacts()
    }
  },
  created() {
    this.initializeFromRoute()
  },
  watch: {
    "$route.query.demandId"() {
      this.initializeFromRoute()
    }
  },
  computed: {
    focusedMode() {
      return !!this.$route.query.demandId
    },
    currentDemandTitle() {
      return this.demandInfo.title || (this.queryParams.demandId ? "需求 " + this.queryParams.demandId : "当前需求")
    },
    packageVersionTotal() {
      if (Array.isArray(this.packageInfo)) {
        return this.packageInfo.length
      }
      if (this.packageInfo && Array.isArray(this.packageInfo.items)) {
        return this.packageInfo.items.length
      }
      return 0
    }
  },
  methods: {
    initializeFromRoute() {
      this.queryParams.demandId = this.$route.query.demandId
      this.demandInfo = {}
      this.packageInfo = {}
      this.resetArtifacts()
      if (this.queryParams.demandId) {
        this.loadDemandInfo()
        this.handleLoadPackage()
      }
    },
    loadDemandInfo() {
      return getDemand(this.queryParams.demandId).then(response => {
        this.demandInfo = response.data || {}
        this.setDefaultActiveArtifact()
      })
    },
    handleLoadPackage() {
      if (!this.queryParams.demandId) {
        this.$modal.msgWarning("请先输入需求ID")
        return
      }
      this.loading = true
      return getDemandPackage(this.queryParams.demandId).then(response => {
        this.packageInfo = response.data || {}
        this.resetArtifacts()
        this.fillArtifacts(this.packageInfo)
        this.setDefaultActiveArtifact()
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    handleRefresh() {
      if (!this.queryParams.demandId || this.loading) return
      Promise.all([
        this.loadDemandInfo(),
        this.handleLoadPackage()
      ]).then(() => {
        this.$modal.msgSuccess("刷新成功")
      })
    },
    handleLoadLatest(artifactType) {
      if (!this.queryParams.demandId) {
        this.$modal.msgWarning("请先输入需求ID")
        return
      }
      getLatestPackageArtifact(this.queryParams.demandId, artifactType).then(response => {
        this.setArtifact(artifactType, response.data || {})
        this.$modal.msgSuccess("加载成功")
      })
    },
    handleSave(artifactType) {
      if (!this.queryParams.demandId) {
        this.$modal.msgWarning("请先输入需求ID")
        return
      }
      const artifact = this.artifacts[artifactType]
      savePackageArtifact(this.queryParams.demandId, artifactType, {
        artifactType: artifactType,
        content: artifact.content
      }).then(response => {
        this.setArtifact(artifactType, response.data || artifact)
        this.$modal.msgSuccess("保存成功")
      })
    },
    handleGenerate() {
      if (!this.queryParams.demandId) {
        this.$modal.msgWarning("请先输入需求ID")
        return
      }
      this.$modal.confirm("是否确认生成该需求的 Agent 交接资料？").then(() => {
        return generatePackage(this.queryParams.demandId, {})
      }).then(response => {
        this.packageInfo = response.data || {}
        this.resetArtifacts()
        this.fillArtifacts(this.packageInfo)
        this.$modal.msgSuccess("生成成功")
      }).catch(() => {})
    },
    resetArtifacts() {
      this.artifactTypes.forEach(item => {
        this.setArtifact(item.value, {})
      })
    },
    fillArtifacts(data) {
      const source = data.artifacts || data.items || data
      this.artifactTypes.forEach(item => {
        const artifact = Array.isArray(source)
          ? source.find(row => row.artifactType === item.value)
          : source[item.value]
        if (artifact) {
          this.setArtifact(item.value, artifact)
        }
      })
    },
    setArtifact(artifactType, data) {
      this.artifacts[artifactType].content = data.content || data.markdown || ""
      this.artifacts[artifactType].version = data.versionNo || data.version || data.artifactVersion
      this.artifacts[artifactType].updateTime = data.updateTime || data.createTime
    },
    handleCopy(artifactType) {
      const content = this.artifacts[artifactType].content || ""
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
    handleDownload(artifactType) {
      const content = this.artifacts[artifactType].content || ""
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
      const link = document.createElement("a")
      const demandId = this.queryParams.demandId || "demand"
      link.href = URL.createObjectURL(blob)
      link.download = demandId + "_" + artifactType + ".md"
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    },
    setDefaultActiveArtifact() {
      const target = defaultArtifactByStatus(this.demandInfo.status, this.artifacts)
      if (this.artifacts[target]) {
        this.activeArtifact = target
      }
    },
    renderArtifactMarkdown(artifactType) {
      return renderMarkdown(this.artifacts[artifactType].content)
    },
    artifactSupplementVersions(artifactType) {
      const source = this.packageInfo && (this.packageInfo.artifacts || this.packageInfo.items || this.packageInfo)
      return getSupplementVersionsForArtifact(Array.isArray(source) ? source : [], artifactType)
    },
    renderSupplementMarkdown(version) {
      return renderMarkdown(version && version.content)
    },
    iterationTitle(version, index) {
      const note = version && version.versionNote ? version.versionNote : "补充记录"
      const versionNo = version && version.versionNo ? "v" + version.versionNo : "第" + (index + 1) + "轮"
      return versionNo + " · " + note
    }
  }
}
</script>

<style scoped>
.package-card {
  margin-top: 8px;
}

.package-page.is-focus-mode {
  max-width: 1120px;
}

.package-focus-header {
  padding: 4px 0 14px;
  border-bottom: 1px solid #edf0f5;
}

.package-focus-header h2 {
  margin: 4px 0 6px;
  color: #1f2937;
  font-size: 22px;
  font-weight: 700;
  line-height: 30px;
}

.focus-label,
.focus-meta {
  color: #6b7280;
  font-size: 13px;
}

.focus-meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.package-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.package-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.package-meta,
.artifact-meta {
  color: #909399;
  font-size: 13px;
}

.artifact-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.artifact-viewer {
  min-height: 360px;
  border: 1px solid #e5e7eb;
  background: #fbfcfe;
}

.package-markdown {
  min-height: 360px;
  padding: 18px 20px;
  color: #1f2937;
  line-height: 1.75;
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
</style>
