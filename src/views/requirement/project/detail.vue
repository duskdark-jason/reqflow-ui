<template>
  <div class="app-container">
    <el-page-header content="项目接入中心" @back="goBack" />

    <el-card class="detail-card" shadow="never" v-loading="loading">
      <div slot="header" class="detail-header">
        <div>
          <div class="detail-title">{{ project.projectName || "未选择项目" }}</div>
          <div class="detail-subtitle">{{ project.projectCode || "-" }}</div>
        </div>
        <el-tag :type="project.status === '0' ? 'success' : 'info'">{{ project.status === '0' ? '正常' : '停用' }}</el-tag>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础信息" name="base">
          <el-descriptions :column="2" border size="medium">
            <el-descriptions-item label="项目名称">{{ project.projectName || "-" }}</el-descriptions-item>
            <el-descriptions-item label="项目编码">{{ project.projectCode || "-" }}</el-descriptions-item>
            <el-descriptions-item label="负责人ID">{{ project.ownerUserId || "-" }}</el-descriptions-item>
            <el-descriptions-item label="模板版本">{{ project.workspaceAgentsTemplateVersion || "-" }}</el-descriptions-item>
            <el-descriptions-item label="说明" :span="2">{{ project.description || project.remark || "-" }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="仓库" name="repositories">
          <el-alert
            title="这里只维护团队共享的 Git 远端和默认分支。本机仓库目录由本地索引器临时读取，不保存到平台。"
            type="info"
            show-icon
            :closable="false"
            class="mb8"
          />
          <el-table :data="repositories" size="small">
            <el-table-column label="仓库名称" prop="repoName" min-width="160" :show-overflow-tooltip="true" />
            <el-table-column label="类型" prop="repoType" width="110">
              <template slot-scope="scope">{{ optionLabel(repoTypeOptions, scope.row.repoType) }}</template>
            </el-table-column>
            <el-table-column label="Git 地址" prop="repoUrl" min-width="240" :show-overflow-tooltip="true" />
            <el-table-column label="默认分支" prop="defaultBranch" width="130" />
            <el-table-column label="Harness" prop="harnessStatus" width="120" />
            <el-table-column label="最近索引" prop="lastIndexedAt" width="170">
              <template slot-scope="scope">{{ parseTime(scope.row.lastIndexedAt) || "-" }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="项目分支" name="variants">
          <el-table :data="variants" size="small" row-key="variantId">
            <el-table-column label="分支标签" prop="variantName" min-width="160" />
            <el-table-column label="分支编码" prop="variantCode" min-width="130" />
            <el-table-column label="真实分支" prop="baselineBranch" min-width="140" />
            <el-table-column label="初始化指令" min-width="180">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-document-copy" @click="copyInstruction(scope.row)">复制指令</el-button>
              </template>
            </el-table-column>
            <el-table-column label="模块" width="90" align="center">
              <template slot-scope="scope">
                <el-tag size="mini" :type="(scope.row.totalModules || 0) > 0 ? 'success' : 'warning'">
                  {{ scope.row.totalModules || 0 }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="分支策略" prop="branchPolicy" min-width="140">
              <template slot-scope="scope">{{ optionLabel(branchPolicyOptions, scope.row.branchPolicy) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-notebook-2" @click="openKnowledge(scope.row)">知识库</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="MCP 索引" name="index">
          <el-alert
            title="本地 Codex 或索引 Agent 读取本机仓库后，通过 MCP tool publish_repository_index 推送结果。平台用初始化指令中的动作 token 识别项目分支和目标接口，用 Git 地址识别仓库。"
            type="info"
            show-icon
            :closable="false"
            class="mb8"
          />
          <el-input
            :value="mcpGuide"
            type="textarea"
            :rows="10"
            readonly
            class="mb8"
          />
          <div class="tab-toolbar">
            <el-select v-model="selectedVariantId" placeholder="选择项目分支" clearable filterable style="width: 260px">
              <el-option
                v-for="item in variants"
                :key="item.variantId"
                :label="item.branchLabel || item.variantName"
                :value="item.variantId"
              />
            </el-select>
          </div>
          <el-table :data="filteredIndexBatches" size="small">
            <el-table-column label="仓库ID" prop="repoId" width="90" />
            <el-table-column label="仓库类型" prop="repoType" width="110" />
            <el-table-column label="分支" prop="branchName" min-width="140" />
            <el-table-column label="Commit" prop="commitHash" min-width="160" :show-overflow-tooltip="true" />
            <el-table-column label="模块" prop="moduleCount" width="80" />
            <el-table-column label="页面" prop="pageCount" width="80" />
            <el-table-column label="接口" prop="apiCount" width="80" />
            <el-table-column label="表" prop="tableCount" width="70" />
            <el-table-column label="权限" prop="permissionCount" width="80" />
            <el-table-column label="时间" prop="createTime" width="170">
              <template slot-scope="scope">{{ parseTime(scope.row.createTime) || "-" }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="模块知识库" name="modules">
          <div class="tab-toolbar">
            <el-select v-model="selectedVariantId" placeholder="选择项目分支" clearable filterable style="width: 260px">
              <el-option
                v-for="item in variants"
                :key="item.variantId"
                :label="item.branchLabel || item.variantName"
                :value="item.variantId"
              />
            </el-select>
          </div>
          <el-table :data="filteredIndexModules" size="small">
            <el-table-column label="项目分支" width="140">
              <template slot-scope="scope">{{ variantLabel(scope.row.variantId) }}</template>
            </el-table-column>
            <el-table-column label="模块名称" prop="moduleName" min-width="160" />
            <el-table-column label="模块编码" prop="moduleCode" min-width="140" />
            <el-table-column label="仓库范围" prop="repoScope" width="120" />
            <el-table-column label="相对路径" prop="relativePath" min-width="220" :show-overflow-tooltip="true" />
            <el-table-column label="摘要" prop="summary" min-width="240" :show-overflow-tooltip="true" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

  </div>
</template>

<script>
import { getProjectInit } from "@/api/requirement/projectInit"
import { listIndexBatch, listIndexModule } from "@/api/requirement/index"

export default {
  name: "RequirementProjectDetail",
  data() {
    return {
      loading: false,
      activeTab: "base",
      projectId: undefined,
      project: {},
      repositories: [],
      variants: [],
      indexBatches: [],
      allIndexModules: [],
      selectedVariantId: undefined,
      repoTypeOptions: [
        { value: "FRONTEND", label: "前端" },
        { value: "BACKEND", label: "后端" },
        { value: "MONOREPO", label: "前后端同仓" },
        { value: "DOC", label: "文档仓库" },
        { value: "OTHER", label: "其他" }
      ],
      scopeTypeOptions: [
        { value: "PROJECT", label: "项目级" },
        { value: "CUSTOMER", label: "客户级" },
        { value: "MODULE", label: "模块级" }
      ],
      branchPolicyOptions: [
        { value: "SHARED", label: "共享分支" },
        { value: "DEDICATED", label: "独立分支" },
        { value: "RELEASE", label: "发布分支" }
      ]
    }
  },
  computed: {
    selectedVariant() {
      return this.variants.find(item => String(item.variantId) === String(this.selectedVariantId))
    },
    filteredIndexBatches() {
      const branchName = this.selectedVariant && this.selectedVariant.baselineBranch
      if (!branchName) return this.indexBatches
      return this.indexBatches.filter(item => item.branchName === branchName)
    },
    filteredIndexModules() {
      if (!this.selectedVariantId) return this.allIndexModules
      return this.allIndexModules.filter(item => String(item.variantId) === String(this.selectedVariantId))
    },
    mcpGuide() {
      const repoLines = this.repositories.map(repo => {
        return "- " + repo.repoName + "，" + repo.repoType + "，" + repo.repoUrl
      }).join("\n")
      const branchLines = this.variants.map(branch => {
        const token = branch.initInstruction && (branch.initInstruction.tokenPrefix || branch.initInstruction.token)
        return "- actionToken=" + (token ? token + "..." : (branch.mcpKey || "-")) + "，" + branch.variantName + "，" + branch.baselineBranch
      }).join("\n")
      return [
        "MCP tool: publish_repository_index",
        "project: " + (this.project.projectCode || this.projectId || "-"),
        "branches:",
        branchLines || "- 暂无项目分支，请先在项目管理中维护。",
        "repositories:",
        repoLines || "- 暂无仓库，请先在项目管理中维护代码仓库。",
        "",
        "上传要求：",
        "- 优先复制分支初始化指令，MCP 会从 actionToken 解析项目、分支和目标接口。",
        "- 上传索引时传 actionToken 和 remoteUrl；平台会自动解析项目、分支和仓库。",
        "- 兼容旧方式传 projectId、repoId 和 branchName。",
        "- commitHash 使用当前仓库提交号。",
        "- pages/apis/tables/permissions/documents 中只能写相对路径和结构化标识。",
        "- 不上传个人本机绝对路径。"
      ].join("\n")
    }
  },
  created() {
    this.projectId = this.$route.query.projectId
    this.loadDetail()
  },
  methods: {
    loadDetail() {
      if (!this.projectId) {
        this.$modal.msgWarning("缺少项目ID")
        return
      }
      this.loading = true
      Promise.all([
        getProjectInit(this.projectId),
        listIndexBatch({ pageNum: 1, pageSize: 20, projectId: this.projectId }),
        listIndexModule({ projectId: this.projectId, status: "0" })
      ]).then(([initRes, batchRes, moduleRes]) => {
        const initData = initRes.data || {}
        this.project = initData.project || {}
        this.repositories = initData.repositories || []
        this.variants = initData.variants || []
        this.indexBatches = batchRes.rows || batchRes.data || []
        this.allIndexModules = moduleRes.data || moduleRes.rows || []
        if (!this.selectedVariantId || !this.variants.some(item => String(item.variantId) === String(this.selectedVariantId))) {
          this.selectedVariantId = this.variants.length ? this.variants[0].variantId : undefined
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    goBack() {
      this.$router.back()
    },
    branchModules(row) {
      if (!row || !row.variantId) return []
      return this.allIndexModules.filter(item => String(item.variantId) === String(row.variantId))
    },
    openKnowledge(row) {
      if (!row || !row.variantId) return
      const title = (row.branchLabel || row.variantName || "分支") + "知识库"
      this.$tab.openPage(title, "/requirement/project/knowledge", { projectId: this.projectId, variantId: row.variantId })
    },
    instructionContent(row) {
      if (!row) return ""
      if (row.initInstruction && row.initInstruction.content) {
        return row.initInstruction.content
      }
      if (row.mcpKey) {
        return "请执行项目分支初始化，调用 publish_repository_index 发布当前仓库索引。\nactionToken: " + row.mcpKey
      }
      return ""
    },
    copyInstruction(row) {
      const content = this.instructionContent(row)
      if (!content) {
        this.$modal.msgWarning("当前分支还没有初始化指令")
        return
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(() => {
          this.$modal.msgSuccess("复制成功")
        }).catch(() => this.copyByTextarea(content))
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
    variantLabel(variantId) {
      const variant = this.variants.find(item => String(item.variantId) === String(variantId))
      return variant ? (variant.branchLabel || variant.variantName) : (variantId || "-")
    },
    optionLabel(options, value) {
      const option = options.find(item => item.value === String(value))
      return option ? option.label : value || "-"
    }
  }
}
</script>

<style scoped>
.detail-card {
  margin-top: 16px;
}

.tab-toolbar {
  margin-bottom: 8px;
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

.branch-detail-panel {
  padding: 12px 14px;
  background: #fafafa;
}

.branch-stat {
  min-height: 58px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 9px 12px;
  background: #fff;
}

.branch-stat span {
  display: block;
  color: #606266;
  font-size: 12px;
  line-height: 18px;
}

.branch-stat strong {
  display: block;
  margin-top: 5px;
  color: #303133;
  font-size: 18px;
  line-height: 22px;
}

.mt12 {
  margin-top: 12px;
}
</style>
