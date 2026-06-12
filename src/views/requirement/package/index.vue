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
        <span class="package-meta" v-if="packageVersionTotal">版本数：{{ packageVersionTotal }}</span>
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
            <span>制品类型：{{ artifact.value }}</span>
            <span v-if="artifacts[artifact.value].version">版本：{{ artifacts[artifact.value].version }}</span>
            <span v-if="artifacts[artifact.value].updateTime">更新时间：{{ parseTime(artifacts[artifact.value].updateTime) }}</span>
          </div>

          <div v-if="focusedMode" class="artifact-viewer">
            <pre v-if="artifacts[artifact.value].content">{{ artifacts[artifact.value].content }}</pre>
            <el-empty v-else :description="artifact.label + '暂无内容'" :image-size="80" />
          </div>
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
import { createEmptyArtifacts, defaultArtifactByStatus, handoffArtifactTypes } from "@/views/requirement/demand/artifacts"

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
      getDemand(this.queryParams.demandId).then(response => {
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
      getDemandPackage(this.queryParams.demandId).then(response => {
        this.packageInfo = response.data || {}
        this.resetArtifacts()
        this.fillArtifacts(this.packageInfo)
        this.setDefaultActiveArtifact()
        this.loading = false
      }).catch(() => {
        this.loading = false
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
      const target = defaultArtifactByStatus(this.demandInfo.status)
      if (this.artifacts[target]) {
        this.activeArtifact = target
      }
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

.artifact-viewer pre {
  min-height: 360px;
  margin: 0;
  padding: 16px;
  color: #1f2937;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
