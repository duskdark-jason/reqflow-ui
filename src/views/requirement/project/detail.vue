<template>
  <div class="app-container access-center-page">
    <el-page-header content="项目接入状态" @back="goBack" />

    <section class="access-status-overview" v-loading="loading">
      <div class="overview-main">
        <div class="overview-eyebrow">项目接入中心</div>
        <h2>{{ project.projectName || "未选择项目" }}</h2>
        <p>{{ project.projectCode || "-" }} / 接入中心只展示状态、索引和知识库；项目配置与初始化指令请回到维护页处理。</p>
        <div class="overview-actions">
          <el-button type="primary" icon="el-icon-edit" size="small" @click="openMaintain">维护配置</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="loadDetail">刷新状态</el-button>
        </div>
      </div>
      <div class="overview-score">
        <el-tag :type="accessSummary.type">{{ accessSummary.label }}</el-tag>
        <strong>{{ accessSummary.percentage }}%</strong>
        <el-progress :percentage="accessSummary.percentage" :stroke-width="7" :show-text="false" />
      </div>
    </section>

    <el-row :gutter="12" class="status-metric-row">
      <el-col :xs="12" :sm="6">
        <div class="status-metric">
          <span>代码仓库</span>
          <strong>{{ repositories.length }}</strong>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="status-metric">
          <span>已索引仓库</span>
          <strong>{{ indexSummary.indexedRepositoryCount || 0 }}</strong>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="status-metric">
          <span>可用分支</span>
          <strong>{{ readyBranchCount }}</strong>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="status-metric warning">
          <span>待处理项</span>
          <strong>{{ pendingItems.length }}</strong>
        </div>
      </el-col>
    </el-row>

    <section v-if="pendingItems.length" class="pending-panel">
      <div class="section-title">待处理项</div>
      <div class="pending-list">
        <div v-for="item in pendingItems" :key="item.key" class="pending-item">
          <el-tag size="mini" :type="item.type">{{ item.scope }}</el-tag>
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="access-detail-section" v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="项目概览" name="base">
          <el-descriptions :column="2" border size="medium">
            <el-descriptions-item label="项目名称">{{ project.projectName || "-" }}</el-descriptions-item>
            <el-descriptions-item label="项目编码">{{ project.projectCode || "-" }}</el-descriptions-item>
            <el-descriptions-item label="负责人ID">{{ project.ownerUserId || "-" }}</el-descriptions-item>
            <el-descriptions-item label="模板版本">{{ project.workspaceAgentsTemplateVersion || "-" }}</el-descriptions-item>
            <el-descriptions-item label="最近索引">{{ parseTime(indexSummary.latestIndexedAt) || "-" }}</el-descriptions-item>
            <el-descriptions-item label="最近 Commit">{{ indexSummary.latestCommit || "-" }}</el-descriptions-item>
            <el-descriptions-item label="说明" :span="2">{{ project.description || project.remark || "-" }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="仓库状态" name="repositories">
          <el-alert
            title="仓库配置在项目维护页编辑；这里仅展示团队 Git 远端和索引状态。"
            type="info"
            show-icon
            :closable="false"
            class="mb8"
          />
          <el-table :data="repositories" size="small" empty-text="暂无代码仓库，请先维护项目配置">
            <el-table-column label="仓库名称" prop="repoName" min-width="160" :show-overflow-tooltip="true" />
            <el-table-column label="类型" prop="repoType" width="110">
              <template slot-scope="scope">{{ optionLabel(repoTypeOptions, scope.row.repoType) }}</template>
            </el-table-column>
            <el-table-column label="Git 地址" prop="repoUrl" min-width="240" :show-overflow-tooltip="true" />
            <el-table-column label="默认分支" prop="defaultBranch" width="130" />
            <el-table-column label="索引状态" width="120">
              <template slot-scope="scope">
                <el-tag size="mini" :type="repoIndexed(scope.row) ? 'success' : 'warning'">
                  {{ repoIndexed(scope.row) ? "已索引" : "待索引" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最近索引" prop="lastIndexedAt" width="170">
              <template slot-scope="scope">{{ parseTime(scope.row.lastIndexedAt) || repoLatestIndexedAt(scope.row) || "-" }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="项目分支" name="variants">
          <el-table :data="variants" size="small" row-key="variantId" empty-text="暂无项目分支，请先维护项目配置">
            <el-table-column label="分支标签" min-width="150">
              <template slot-scope="scope">{{ variantLabel(scope.row.variantId) }}</template>
            </el-table-column>
            <el-table-column label="真实分支" prop="baselineBranch" min-width="140" />
            <el-table-column label="接入状态" width="120">
              <template slot-scope="scope">
                <el-tag size="mini" :type="branchAccessState(scope.row).type">
                  {{ branchAccessState(scope.row).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="模块" width="90" align="center">
              <template slot-scope="scope">{{ scope.row.totalModules || 0 }}</template>
            </el-table-column>
            <el-table-column label="已索引仓库" width="110" align="center">
              <template slot-scope="scope">{{ scope.row.indexedRepositoryCount || 0 }}</template>
            </el-table-column>
            <el-table-column label="未索引仓库" width="110" align="center">
              <template slot-scope="scope">{{ scope.row.unindexedRepositoryCount || 0 }}</template>
            </el-table-column>
            <el-table-column label="最近 Commit" prop="latestCommit" min-width="160" :show-overflow-tooltip="true" />
            <el-table-column label="操作" width="170" align="center">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-notebook-2" @click="openKnowledge(scope.row)">知识库</el-button>
                <el-button type="text" icon="el-icon-edit" @click="openMaintain">维护</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="MCP 索引" name="index">
          <el-alert
            title="索引发布仍由接入项目的 Codex/MCP 会话执行。接入中心只观察结果；需要复制初始化指令时，请进入项目维护页。"
            type="info"
            show-icon
            :closable="false"
            class="mb8"
          />
          <el-input
            :value="mcpGuide"
            type="textarea"
            :rows="8"
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
          <el-table :data="filteredIndexBatches" size="small" empty-text="当前分支暂无索引批次">
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
          <el-table :data="filteredIndexModules" size="small" empty-text="当前分支暂无模块知识">
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
    </section>
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
      initChecklist: {},
      indexSummary: {},
      selectedVariantId: undefined,
      repoTypeOptions: [
        { value: "FRONTEND", label: "前端" },
        { value: "BACKEND", label: "后端" },
        { value: "MONOREPO", label: "前后端同仓" },
        { value: "DOC", label: "文档仓库" },
        { value: "OTHER", label: "其他" }
      ]
    }
  },
  computed: {
    selectedVariant() {
      return this.variants.find(item => String(item.variantId) === String(this.selectedVariantId))
    },
    readyBranchCount() {
      return this.variants.filter(item => this.isBranchReady(item)).length
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
    pendingItems() {
      const items = []
      if (!this.repositories.length) {
        items.push({
          key: "repositories",
          scope: "项目",
          type: "warning",
          title: "补齐代码仓库",
          description: "进入项目维护页登记团队共享 Git 远端和默认分支。"
        })
      }
      if (!this.variants.length) {
        items.push({
          key: "variants",
          scope: "项目",
          type: "warning",
          title: "补齐项目分支",
          description: "至少维护一个中文分支标签和真实 Git 分支名。"
        })
      }
      this.variants.forEach(variant => {
        const label = this.variantLabel(variant.variantId)
        if ((variant.totalModules || 0) <= 0) {
          items.push({
            key: "module-" + variant.variantId,
            scope: label,
            type: "info",
            title: "缺少模块知识",
            description: "该分支还没有模块知识，需求表单不会把它作为可提交分支。"
          })
        }
        if ((variant.indexedRepositoryCount || 0) <= 0) {
          items.push({
            key: "index-" + variant.variantId,
            scope: label,
            type: "warning",
            title: "等待首次仓库索引",
            description: "在接入项目的 Codex/MCP 会话发布仓库索引后，这里会展示批次和 commit。"
          })
        } else if ((variant.unindexedRepositoryCount || 0) > 0) {
          items.push({
            key: "partial-index-" + variant.variantId,
            scope: label,
            type: "warning",
            title: "仍有仓库未索引",
            description: "还有 " + variant.unindexedRepositoryCount + " 个仓库没有该分支的索引批次。"
          })
        }
      })
      return items
    },
    accessSummary() {
      const keys = ["projectReady", "repositoryReady", "variantReady", "moduleReady", "indexReady"]
      const readyCount = keys.filter(key => this.initChecklist[key]).length
      const percentage = readyCount * 20
      if (percentage === 100 && this.pendingItems.length === 0) {
        return { label: "接入完成", type: "success", percentage: 100 }
      }
      if (!this.initChecklist.repositoryReady || !this.initChecklist.variantReady) {
        return { label: "配置待补齐", type: "warning", percentage: percentage }
      }
      return { label: "索引待完成", type: "info", percentage: percentage }
    },
    mcpGuide() {
      const repoLines = this.repositories.map(repo => {
        return "- " + repo.repoName + "，" + repo.repoType + "，" + repo.repoUrl
      }).join("\n")
      const branchLines = this.variants.map(branch => {
        return "- " + (branch.branchLabel || branch.variantName || "-") + "，真实分支：" + (branch.baselineBranch || "-") + "，状态：" + this.branchAccessState(branch).label
      }).join("\n")
      return [
        "接入中心用途：观察项目分支的索引结果和知识库状态。",
        "初始化指令主入口：项目维护页的分支配置。",
        "MCP tool: publish_repository_index",
        "project: " + (this.project.projectCode || this.projectId || "-"),
        "branches:",
        branchLines || "- 暂无项目分支，请先在项目维护页维护。",
        "repositories:",
        repoLines || "- 暂无仓库，请先在项目维护页维护代码仓库。",
        "",
        "上传要求：",
        "- 接入项目侧使用维护页复制的 actionToken 发布索引。",
        "- 上传索引时传 actionToken 和 remoteUrl；平台会自动解析项目、分支和仓库。",
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
        this.initChecklist = initData.initChecklist || {}
        this.indexSummary = initData.indexSummary || {}
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
    openMaintain() {
      if (!this.projectId) return
      const title = (this.project.projectName || "项目") + "维护"
      this.$tab.openPage(title, "/requirement/project/maintain", { projectId: this.projectId })
    },
    openKnowledge(row) {
      if (!row || !row.variantId) return
      const title = (row.branchLabel || row.variantName || "分支") + "知识库"
      this.$tab.openPage(title, "/requirement/project/knowledge", { projectId: this.projectId, variantId: row.variantId })
    },
    isBranchReady(row) {
      // 接入完成口径来自模块知识和仓库索引，不能只依赖项目或分支配置是否存在。
      return (row.totalModules || 0) > 0 && (row.indexedRepositoryCount || 0) > 0 && (row.unindexedRepositoryCount || 0) === 0
    },
    branchAccessState(row) {
      if (!row) return { label: "-", type: "info" }
      if (this.isBranchReady(row)) return { label: "已完成", type: "success" }
      if ((row.totalModules || 0) <= 0) return { label: "缺知识", type: "info" }
      if ((row.indexedRepositoryCount || 0) <= 0) return { label: "待索引", type: "warning" }
      if ((row.unindexedRepositoryCount || 0) > 0) return { label: "部分索引", type: "warning" }
      return { label: "待确认", type: "info" }
    },
    repoIndexed(row) {
      if (!row) return false
      if (row.lastIndexedAt) return true
      return this.indexBatches.some(batch => String(batch.repoId) === String(row.repoId))
    },
    repoLatestIndexedAt(row) {
      const batch = this.indexBatches.find(item => String(item.repoId) === String(row.repoId))
      return batch ? (this.parseTime(batch.createTime) || "-") : ""
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
.access-center-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fa;
}

.access-status-overview {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-top: 16px;
  padding: 20px 22px;
  border: 1px solid #d9e6ef;
  border-radius: 8px;
  background: #fff;
}

.overview-main {
  min-width: 0;
}

.overview-eyebrow {
  color: #2477a8;
  font-size: 13px;
  font-weight: 600;
}

.overview-main h2 {
  margin: 6px 0 8px;
  color: #20394d;
  font-size: 22px;
  line-height: 30px;
}

.overview-main p {
  margin: 0;
  color: #617587;
  line-height: 22px;
}

.overview-actions {
  margin-top: 14px;
}

.overview-score {
  width: 180px;
  flex: 0 0 180px;
  padding-top: 4px;
}

.overview-score strong {
  display: block;
  margin: 14px 0 8px;
  color: #20394d;
  font-size: 34px;
  line-height: 40px;
}

.status-metric-row {
  margin-top: 12px;
}

.status-metric {
  min-height: 82px;
  padding: 14px 16px;
  border: 1px solid #dfe8f0;
  border-radius: 8px;
  background: #fff;
}

.status-metric.warning {
  border-color: #f0dfc0;
}

.status-metric span {
  color: #667c8d;
  font-size: 13px;
}

.status-metric strong {
  display: block;
  margin-top: 8px;
  color: #20394d;
  font-size: 26px;
  line-height: 32px;
}

.pending-panel,
.access-detail-section {
  margin-top: 14px;
  padding: 16px;
  border: 1px solid #dfe8f0;
  border-radius: 8px;
  background: #fff;
}

.section-title {
  margin-bottom: 12px;
  color: #20394d;
  font-size: 15px;
  font-weight: 600;
}

.pending-list {
  display: grid;
  gap: 10px;
}

.pending-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid #edf1f5;
  border-radius: 6px;
  background: #fafcfe;
}

.pending-item strong {
  display: block;
  color: #33495c;
  font-size: 14px;
  line-height: 20px;
}

.pending-item p {
  margin: 2px 0 0;
  color: #6b7f8f;
  line-height: 20px;
}

.tab-toolbar {
  margin-bottom: 8px;
}

.mb8 {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .access-status-overview {
    flex-direction: column;
  }

  .overview-score {
    width: auto;
    flex: none;
  }
}
</style>
