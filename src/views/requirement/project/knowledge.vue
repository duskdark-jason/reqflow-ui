<template>
  <div class="app-container branch-knowledge-page">
    <el-page-header content="分支知识库" @back="closePage" />

    <section class="knowledge-hero" v-loading="loading">
      <div>
        <div class="knowledge-eyebrow">知识库详情</div>
        <h2>{{ project.projectName || "未选择项目" }}</h2>
        <p>{{ project.projectCode || "-" }} / {{ selectedVariantLabel }}</p>
      </div>
      <div class="knowledge-actions">
        <el-select v-model="activeVariantId" placeholder="选择项目分支" filterable style="width: 260px">
          <el-option
            v-for="item in variants"
            :key="item.variantId"
            :label="item.branchLabel || item.variantName"
            :value="item.variantId"
          />
        </el-select>
        <el-button icon="el-icon-document-copy" type="primary" plain @click="copyInstruction(selectedVariant)">复制初始化指令</el-button>
      </div>
    </section>

    <el-row :gutter="14" class="metric-row">
      <el-col :xs="12" :sm="6">
        <div class="metric-box">
          <span>模块总数</span>
          <strong>{{ selectedVariant.totalModules || 0 }}</strong>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="metric-box">
          <span>索引模块</span>
          <strong>{{ selectedVariant.indexedModules || 0 }}</strong>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="metric-box">
          <span>已索引仓库</span>
          <strong>{{ selectedVariant.indexedRepositoryCount || 0 }}</strong>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="metric-box">
          <span>未索引仓库</span>
          <strong>{{ selectedVariant.unindexedRepositoryCount || 0 }}</strong>
        </div>
      </el-col>
    </el-row>

    <section class="knowledge-section" v-loading="loading">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="分支概览" name="overview">
          <el-descriptions :column="2" border size="medium">
            <el-descriptions-item label="分支标签">{{ selectedVariant.branchLabel || selectedVariant.variantName || "-" }}</el-descriptions-item>
            <el-descriptions-item label="真实分支">{{ selectedVariant.baselineBranch || "-" }}</el-descriptions-item>
            <el-descriptions-item label="分支编码">{{ selectedVariant.variantCode || "-" }}</el-descriptions-item>
            <el-descriptions-item label="分支策略">{{ selectedVariant.branchPolicy || "-" }}</el-descriptions-item>
            <el-descriptions-item label="最近索引">{{ parseTime(selectedVariant.latestIndexedAt) || "-" }}</el-descriptions-item>
            <el-descriptions-item label="最近 Commit">{{ selectedVariant.latestCommit || "-" }}</el-descriptions-item>
            <el-descriptions-item label="说明" :span="2">{{ selectedVariant.description || selectedVariant.remark || "-" }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="模块知识" name="modules">
          <el-table :data="filteredModules" size="small" empty-text="该分支暂无模块知识">
            <el-table-column label="模块名称" prop="moduleName" min-width="160" />
            <el-table-column label="模块编码" prop="moduleCode" min-width="140" />
            <el-table-column label="仓库范围" prop="repoScope" width="120" />
            <el-table-column label="相对路径" prop="relativePath" min-width="240" :show-overflow-tooltip="true" />
            <el-table-column label="摘要" prop="summary" min-width="260" :show-overflow-tooltip="true" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="索引批次" name="batches">
          <el-table :data="filteredBatches" size="small" empty-text="该分支暂无索引批次">
            <el-table-column label="仓库ID" prop="repoId" width="90" />
            <el-table-column label="仓库类型" prop="repoType" width="110" />
            <el-table-column label="分支" prop="branchName" min-width="150" />
            <el-table-column label="Commit" prop="commitHash" min-width="180" :show-overflow-tooltip="true" />
            <el-table-column label="模块" prop="moduleCount" width="80" />
            <el-table-column label="页面" prop="pageCount" width="80" />
            <el-table-column label="接口" prop="apiCount" width="80" />
            <el-table-column label="权限" prop="permissionCount" width="80" />
            <el-table-column label="时间" prop="createTime" width="170">
              <template slot-scope="scope">{{ parseTime(scope.row.createTime) || "-" }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="初始化指令" name="instruction">
          <el-input
            :value="instructionContent(selectedVariant)"
            type="textarea"
            :rows="9"
            readonly
            placeholder="保存项目分支后生成初始化指令"
          />
          <div class="instruction-toolbar">
            <el-button icon="el-icon-document-copy" type="primary" @click="copyInstruction(selectedVariant)">复制初始化指令</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script>
import { getProjectInit } from "@/api/requirement/projectInit"
import { listIndexBatch, listIndexModule } from "@/api/requirement/index"

export default {
  name: "RequirementProjectKnowledge",
  data() {
    return {
      loading: false,
      projectId: undefined,
      activeVariantId: undefined,
      activeTab: "overview",
      project: {},
      variants: [],
      indexBatches: [],
      indexModules: []
    }
  },
  computed: {
    selectedVariant() {
      return this.variants.find(item => String(item.variantId) === String(this.activeVariantId)) || {}
    },
    selectedVariantLabel() {
      return this.selectedVariant.branchLabel || this.selectedVariant.variantName || "未选择分支"
    },
    filteredModules() {
      if (!this.activeVariantId) return []
      return this.indexModules.filter(item => String(item.variantId) === String(this.activeVariantId))
    },
    filteredBatches() {
      const branchName = this.selectedVariant.baselineBranch
      if (!branchName) return []
      // 索引批次按真实 Git 分支归属，不能只按项目聚合，否则客户分支会互相借用索引结果。
      return this.indexBatches.filter(item => item.branchName === branchName)
    }
  },
  created() {
    this.projectId = this.$route.query.projectId
    this.activeVariantId = this.$route.query.variantId
    this.loadKnowledge()
  },
  methods: {
    loadKnowledge() {
      if (!this.projectId) {
        this.$modal.msgWarning("缺少项目ID")
        return
      }
      this.loading = true
      Promise.all([
        getProjectInit(this.projectId),
        listIndexBatch({ pageNum: 1, pageSize: 50, projectId: this.projectId }),
        listIndexModule({ projectId: this.projectId, status: "0" })
      ]).then(([initRes, batchRes, moduleRes]) => {
        const initData = initRes.data || {}
        this.project = initData.project || {}
        this.variants = initData.variants || []
        this.indexBatches = batchRes.rows || batchRes.data || []
        this.indexModules = moduleRes.data || moduleRes.rows || []
        if (!this.activeVariantId || !this.variants.some(item => String(item.variantId) === String(this.activeVariantId))) {
          this.activeVariantId = this.variants.length ? this.variants[0].variantId : undefined
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    instructionContent(row) {
      if (!row) return ""
      if (row.initInstruction && row.initInstruction.content) {
        return row.initInstruction.content
      }
      if (row.mcpKey) {
        // 兼容历史分支的 mcpKey 展示；新流程应使用后端返回的 actionToken 初始化指令。
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
      // 兜底支持不允许 navigator.clipboard 的浏览器环境，保证初始化指令仍可复制。
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      this.$modal.msgSuccess("复制成功")
    },
    closePage() {
      this.$tab.closePage()
    }
  }
}
</script>

<style scoped>
.branch-knowledge-page {
  min-height: calc(100vh - 84px);
  background: #f4f8fb;
}

.knowledge-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding: 20px;
  border: 1px solid #d8edf9;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(232, 247, 255, 0.96), rgba(255, 255, 255, 0.98)),
    radial-gradient(circle at 8% 12%, rgba(111, 203, 185, 0.18), transparent 34%);
}

.knowledge-eyebrow {
  color: #2477a8;
  font-size: 13px;
  font-weight: 600;
}

.knowledge-hero h2 {
  margin: 6px 0 8px;
  color: #1f3f59;
  font-size: 22px;
  line-height: 30px;
}

.knowledge-hero p {
  margin: 0;
  color: #637888;
}

.knowledge-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-row {
  margin-top: 14px;
}

.metric-box {
  min-height: 84px;
  padding: 14px 16px;
  border: 1px solid #dfeaf3;
  border-radius: 8px;
  background: #fff;
}

.metric-box span {
  color: #617789;
  font-size: 13px;
}

.metric-box strong {
  display: block;
  margin-top: 8px;
  color: #1f3f59;
  font-size: 26px;
  line-height: 32px;
}

.knowledge-section {
  margin-top: 14px;
  padding: 16px;
  border: 1px solid #e3edf5;
  border-radius: 8px;
  background: #fff;
}

.instruction-toolbar {
  margin-top: 12px;
  text-align: right;
}

@media (max-width: 860px) {
  .knowledge-hero,
  .knowledge-actions {
    display: block;
  }

  .knowledge-actions .el-button {
    margin-top: 10px;
  }
}
</style>
