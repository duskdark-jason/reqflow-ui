<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="80px">
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
        >加载执行包</el-button>
        <el-button
          type="success"
          icon="el-icon-magic-stick"
          size="mini"
          :disabled="!queryParams.demandId"
          @click="handleGenerate"
          v-hasPermi="['req:package:save']"
        >生成执行包</el-button>
      </el-form-item>
    </el-form>

    <el-alert
      v-if="!queryParams.demandId"
      title="请输入需求ID或从需求列表进入执行包页面"
      type="info"
      show-icon
      :closable="false"
      class="mb8"
    />

    <el-card shadow="never" class="package-card" v-loading="loading">
      <div slot="header" class="package-header">
        <span>执行包制品</span>
        <span class="package-meta" v-if="packageVersionTotal">版本数：{{ packageVersionTotal }}</span>
      </div>

      <el-tabs v-model="activeArtifact">
        <el-tab-pane
          v-for="artifact in artifactTypes"
          :key="artifact.value"
          :label="artifact.label"
          :name="artifact.value"
        >
          <el-row :gutter="10" class="mb8">
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

          <el-input
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
import { getDemandPackage, getLatestPackageArtifact, savePackageArtifact, generatePackage } from "@/api/requirement/package"

export default {
  name: "RequirementPackage",
  data() {
    const artifactTypes = [
      { value: "requirement_draft", label: "需求草稿" },
      { value: "requirement", label: "需求说明" },
      { value: "plan", label: "执行计划" },
      { value: "context_manifest", label: "上下文清单" },
      { value: "branch_execution_brief", label: "分支执行简报" },
      { value: "execution_prompt", label: "执行提示词" },
      { value: "review_prompt", label: "Review 提示词" },
      { value: "execution_report", label: "执行报告" },
      { value: "review_report", label: "Review 报告" }
    ]
    return {
      loading: false,
      activeArtifact: "requirement_draft",
      artifactTypes: artifactTypes,
      packageInfo: {},
      queryParams: {
        demandId: undefined
      },
      artifacts: artifactTypes.reduce((result, item) => {
        result[item.value] = {
          content: "",
          version: undefined,
          updateTime: undefined
        }
        return result
      }, {})
    }
  },
  created() {
    this.queryParams.demandId = this.$route.query.demandId
    if (this.queryParams.demandId) {
      this.handleLoadPackage()
    }
  },
  computed: {
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
      this.$modal.confirm("是否确认生成该需求的执行包？").then(() => {
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
    }
  }
}
</script>

<style scoped>
.package-card {
  margin-top: 8px;
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
</style>
