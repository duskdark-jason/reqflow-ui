<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="innerVisible"
    width="1080px"
    append-to-body
    class="project-init-dialog"
    @close="handleClose"
  >
    <div v-loading="loading" class="project-init-body">
      <el-alert
        title="平台只保存团队共享 Git 信息、项目分支和分支级模块索引结果；每个分支单独初始化知识库，保存后生成 MCP key 识别项目与分支。"
        type="info"
        show-icon
        :closable="false"
        class="section-alert"
      />

      <section class="form-section">
        <div class="section-header">
          <span class="section-title">项目信息</span>
        </div>
        <el-form ref="projectForm" :model="form.project" :rules="projectRules" label-width="92px">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="项目名称" prop="projectName">
                <el-input v-model="form.project.projectName" placeholder="请输入项目名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目编码" prop="projectCode">
                <el-input v-model="form.project.projectCode" placeholder="请输入项目编码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="负责人ID" prop="ownerUserId">
                <el-input v-model="form.project.ownerUserId" placeholder="请输入负责人用户ID" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-radio-group v-model="form.project.status">
                  <el-radio label="0">正常</el-radio>
                  <el-radio label="1">停用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="项目说明" prop="description">
                <el-input v-model="form.project.description" type="textarea" :rows="2" placeholder="请输入项目说明" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </section>

      <section class="form-section">
        <div class="section-header">
          <span class="section-title">代码仓库</span>
          <el-button type="primary" plain size="mini" icon="el-icon-plus" @click="addRepository">新增仓库</el-button>
        </div>
        <el-table :data="form.repositories" size="small" border>
          <el-table-column label="仓库名称" min-width="150">
            <template slot-scope="scope">
              <el-input v-model="scope.row.repoName" size="small" placeholder="仓库名称" />
            </template>
          </el-table-column>
          <el-table-column label="类型" width="128">
            <template slot-scope="scope">
              <el-select v-model="scope.row.repoType" size="small" placeholder="类型" style="width: 100%">
                <el-option v-for="item in repoTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Git 地址" min-width="260">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.repoUrl"
                size="small"
                placeholder="团队共享 Git 远端地址"
                @blur="handleRepositoryUrlChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="默认分支" width="140">
            <template slot-scope="scope">
              <el-input v-model="scope.row.defaultBranch" size="small" placeholder="main" />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template slot-scope="scope">
              <el-select v-model="scope.row.status" size="small" style="width: 100%">
                <el-option label="正常" value="0" />
                <el-option label="停用" value="1" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="72" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" icon="el-icon-delete" @click="removeRepository(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section class="form-section">
        <div class="section-header">
          <span class="section-title">分支配置</span>
          <el-button type="primary" plain size="mini" icon="el-icon-plus" @click="addVariant">新增分支</el-button>
        </div>
        <el-table :data="form.variants" size="small" border row-key="variantId">
          <el-table-column type="expand" width="42">
            <template slot-scope="scope">
              <div class="branch-detail-panel">
                <el-row :gutter="12">
                  <el-col :span="6">
                    <div class="branch-stat">
                      <span class="branch-stat-label">模块总数</span>
                      <strong>{{ scope.row.totalModules || 0 }}</strong>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="branch-stat">
                      <span class="branch-stat-label">手工模块</span>
                      <strong>{{ scope.row.manualModules || 0 }}</strong>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="branch-stat">
                      <span class="branch-stat-label">索引模块</span>
                      <strong>{{ scope.row.indexedModules || 0 }}</strong>
                    </div>
                  </el-col>
                  <el-col :span="6">
                    <div class="branch-stat">
                      <span class="branch-stat-label">已索引仓库</span>
                      <strong>{{ scope.row.indexedRepositoryCount || 0 }}</strong>
                    </div>
                  </el-col>
                </el-row>
                <el-descriptions :column="2" border size="small" class="mt12">
                  <el-descriptions-item label="最近索引">{{ parseTime(scope.row.latestIndexedAt) || "-" }}</el-descriptions-item>
                  <el-descriptions-item label="最近 Commit">{{ scope.row.latestCommit || "-" }}</el-descriptions-item>
                  <el-descriptions-item label="未索引仓库">{{ scope.row.unindexedRepositoryCount || 0 }}</el-descriptions-item>
                  <el-descriptions-item label="初始化状态">
                    <el-tag size="mini" :type="branchReadyType(scope.row)">{{ branchReadyText(scope.row) }}</el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="中文标签" min-width="170">
            <template slot-scope="scope">
              <el-input v-model="scope.row.branchLabel" size="small" placeholder="例如：黑龙江医保" />
            </template>
          </el-table-column>
          <el-table-column label="真实分支名" min-width="190">
            <template slot-scope="scope">
              <el-input v-model="scope.row.baselineBranch" size="small" placeholder="main" />
            </template>
          </el-table-column>
          <el-table-column label="MCP Key" min-width="180">
            <template slot-scope="scope">
              <el-input v-model="scope.row.mcpKey" size="small" readonly placeholder="保存后生成" />
            </template>
          </el-table-column>
          <el-table-column label="知识库" width="112" align="center">
            <template slot-scope="scope">
              <el-tag size="mini" :type="branchReadyType(scope.row)">{{ scope.row.totalModules || 0 }} 个模块</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template slot-scope="scope">
              <el-select v-model="scope.row.status" size="small" style="width: 100%">
                <el-option label="正常" value="0" />
                <el-option label="停用" value="1" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="220">
            <template slot-scope="scope">
              <el-input v-model="scope.row.remark" size="small" placeholder="可选" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="72" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" icon="el-icon-delete" @click="removeVariant(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section class="form-section">
        <div class="section-header">
          <span class="section-title">项目级汇总</span>
          <span class="section-tip">{{ checklistText }}</span>
        </div>
        <el-row :gutter="12" class="summary-row">
          <el-col :span="6">
            <div class="summary-box">
              <div class="summary-label">模块总数</div>
              <div class="summary-value">{{ moduleSummary.totalModules || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-box">
              <div class="summary-label">索引模块</div>
              <div class="summary-value">{{ moduleSummary.indexedModules || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-box">
              <div class="summary-label">已索引仓库</div>
              <div class="summary-value">{{ indexSummary.indexedRepositoryCount || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="summary-box">
              <div class="summary-label">未索引仓库</div>
              <div class="summary-value">{{ indexSummary.unindexedRepositoryCount || 0 }}</div>
            </div>
          </el-col>
        </el-row>
        <el-descriptions :column="2" border size="small" class="mt12">
          <el-descriptions-item label="最近索引">{{ parseTime(indexSummary.latestIndexedAt) || "-" }}</el-descriptions-item>
          <el-descriptions-item label="最近 Commit">{{ indexSummary.latestCommit || "-" }}</el-descriptions-item>
        </el-descriptions>
      </section>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="innerVisible = false">取 消</el-button>
      <el-button :loading="saving" type="primary" @click="submit(false)">保 存</el-button>
      <el-button :loading="saving" type="success" @click="submit(true)">保存并进入接入中心</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getProjectInit, addProjectInit, updateProjectInit } from "@/api/requirement/projectInit"

export default {
  name: "ProjectInitWizard",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: [String, Number],
      default: undefined
    }
  },
  data() {
    return {
      innerVisible: false,
      loading: false,
      saving: false,
      moduleSummary: {},
      indexSummary: {},
      initChecklist: {},
      form: this.emptyForm(),
      repoTypeOptions: [
        { value: "FRONTEND", label: "前端" },
        { value: "BACKEND", label: "后端" },
        { value: "MONOREPO", label: "前后端同仓" },
        { value: "DOC", label: "文档仓库" },
        { value: "OTHER", label: "其他" }
      ],
      projectRules: {
        projectName: [
          { required: true, message: "项目名称不能为空", trigger: "blur" }
        ],
        projectCode: [
          { required: true, message: "项目编码不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "项目状态不能为空", trigger: "change" }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.projectId ? "编辑项目" : "新增项目"
    },
    checklistText() {
      const pending = []
      if (!this.initChecklist.repositoryReady) pending.push("补齐代码仓库")
      if (!this.initChecklist.variantReady) pending.push("补齐项目分支")
      if (!this.initChecklist.moduleReady) pending.push("沉淀模块知识")
      if (!this.initChecklist.indexReady) pending.push("完成仓库索引")
      return pending.length ? pending.join("、") : "基础初始化已完成"
    }
  },
  watch: {
    visible(value) {
      this.innerVisible = value
      if (value) {
        this.openDialog()
      }
    },
    innerVisible(value) {
      this.$emit("update:visible", value)
    }
  },
  methods: {
    openDialog() {
      if (this.projectId) {
        this.loadInit()
      } else {
        this.form = this.emptyForm()
        this.moduleSummary = {}
        this.indexSummary = {}
        this.initChecklist = {}
        this.clearProjectValidate()
      }
    },
    loadInit() {
      this.loading = true
      getProjectInit(this.projectId).then(response => {
        const data = response.data || {}
        this.form = {
          project: Object.assign({}, this.emptyProject(), data.project || {}),
          repositories: this.normalizeRepositories(data.repositories),
          variants: this.normalizeVariants(data.variants),
          remark: data.remark
        }
        this.moduleSummary = data.moduleSummary || {}
        this.indexSummary = data.indexSummary || {}
        this.initChecklist = data.initChecklist || {}
        this.loading = false
        this.clearProjectValidate()
      }).catch(() => {
        this.loading = false
      })
    },
    emptyForm() {
      return {
        project: this.emptyProject(),
        repositories: this.defaultRepositories(),
        variants: this.defaultVariants(),
        remark: undefined
      }
    },
    emptyProject() {
      return {
        projectId: undefined,
        projectName: undefined,
        projectCode: undefined,
        ownerUserId: undefined,
        description: undefined,
        status: "0"
      }
    },
    defaultRepositories() {
      return [
        this.newRepository("", "BACKEND")
      ]
    },
    defaultVariants() {
      return [
        this.newVariant("通用主线", "main")
      ]
    },
    newRepository(name, type) {
      return {
        repoId: undefined,
        repoName: name,
        repoType: type,
        repoUrl: undefined,
        localPathHint: undefined,
        defaultBranch: "main",
        harnessStatus: "uninitialized",
        status: "0"
      }
    },
    newVariant(label, branchName) {
      return {
        variantId: undefined,
        branchLabel: label || "",
        variantName: label || "",
        variantCode: undefined,
        mcpKey: undefined,
        customerName: label || "",
        scopeType: "BRANCH",
        baselineBranch: branchName || "main",
        branchPolicy: "SHARED",
        status: "0",
        remark: undefined
      }
    },
    normalizeRepositories(repositories) {
      const source = repositories && repositories.length ? repositories : this.defaultRepositories()
      return source.map(item => Object.assign({}, item, { localPathHint: undefined }))
    },
    normalizeVariants(variants) {
      const source = variants && variants.length ? variants : this.defaultVariants()
      return source.map(item => {
        const branchLabel = item.branchLabel || item.variantName || item.customerName || ""
        return Object.assign({}, item, {
          branchLabel: branchLabel,
          variantName: branchLabel,
          customerName: item.customerName || branchLabel,
          scopeType: item.scopeType || "BRANCH",
          branchPolicy: item.branchPolicy || "SHARED",
          status: item.status || "0"
        })
      })
    },
    addRepository() {
      this.form.repositories.push(this.newRepository("", "OTHER"))
    },
    removeRepository(index) {
      this.form.repositories.splice(index, 1)
    },
    addVariant() {
      this.form.variants.push(this.newVariant("", "main"))
    },
    removeVariant(index) {
      this.form.variants.splice(index, 1)
    },
    branchReadyType(row) {
      return (row.totalModules || 0) > 0 ? "success" : "warning"
    },
    branchReadyText(row) {
      return (row.totalModules || 0) > 0 ? "已初始化" : "待初始化"
    },
    handleRepositoryUrlChange(row) {
      const repoName = this.inferRepoName(row.repoUrl)
      if (!repoName) return
      if (!row.repoName) {
        this.$set(row, "repoName", repoName)
      }
      if (!this.form.project.projectName) {
        this.$set(this.form.project, "projectName", repoName)
      }
      if (!this.form.project.projectCode) {
        this.$set(this.form.project, "projectCode", this.inferProjectCode(repoName))
      }
    },
    inferRepoName(repoUrl) {
      if (!repoUrl) return ""
      const value = String(repoUrl).trim()
      const lastSegment = value.split(/[/:]/).filter(Boolean).pop() || ""
      return lastSegment.replace(/\.git$/i, "")
    },
    inferProjectCode(repoName) {
      const code = String(repoName || "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").toUpperCase()
      return code || undefined
    },
    validateAll() {
      return new Promise(resolve => {
        this.$refs.projectForm.validate(valid => {
          resolve(valid && this.validateRepositories() && this.validateVariants())
        })
      })
    },
    validateRepositories() {
      if (!this.form.repositories.length) {
        this.$modal.msgWarning("请至少维护一条代码仓库")
        return false
      }
      const invalid = this.form.repositories.some(item => !item.repoName || !item.repoType || !item.repoUrl || !item.defaultBranch || this.hasLocalPath(item.repoUrl) || this.hasLocalPath(item.defaultBranch))
      if (invalid) {
        this.$modal.msgWarning("请补齐仓库名称、类型、Git 地址、默认分支，且不要填写本机绝对路径")
        return false
      }
      return true
    },
    validateVariants() {
      if (!this.form.variants.length) {
        this.$modal.msgWarning("请至少维护一条项目分支")
        return false
      }
      const invalid = this.form.variants.some(item => !item.branchLabel || !item.baselineBranch || this.hasLocalPath(item.baselineBranch))
      if (invalid) {
        this.$modal.msgWarning("请补齐项目分支中文标签和真实分支名，且不要填写本机绝对路径")
        return false
      }
      return true
    },
    hasLocalPath(value) {
      if (!value) return false
      const normalized = String(value).replace(/\\/g, "/").trim()
      return normalized.indexOf("/Users/") === 0 || normalized.indexOf("/home/") === 0 || normalized.indexOf("file:/") === 0 || /^[A-Za-z]:\//.test(normalized)
    },
    submit(goIntake) {
      this.validateAll().then(valid => {
        if (!valid) return
        this.saving = true
        const action = this.projectId ? updateProjectInit : addProjectInit
        action(this.buildPayload()).then(response => {
          const data = response.data || {}
          const savedProject = data.project || this.form.project
          const savedProjectId = savedProject.projectId || this.projectId
          this.$modal.msgSuccess("项目已保存")
          this.saving = false
          this.innerVisible = false
          this.$emit("success", savedProjectId)
          if (goIntake) {
            this.$emit("intake", savedProjectId)
          }
        }).catch(() => {
          this.saving = false
        })
      })
    },
    buildPayload() {
      const project = Object.assign({}, this.form.project)
      return {
        project: project,
        repositories: this.form.repositories.map(item => {
          const repository = Object.assign({}, item)
          repository.localPathHint = undefined
          return repository
        }),
        variants: this.form.variants.map(item => {
          const branchLabel = item.branchLabel || item.variantName
          return Object.assign({}, item, {
            branchLabel: branchLabel,
            variantName: branchLabel,
            customerName: item.customerName || branchLabel,
            scopeType: item.scopeType || "BRANCH",
            branchPolicy: item.branchPolicy || "SHARED"
          })
        }),
        remark: this.form.remark
      }
    },
    handleClose() {
      this.$emit("update:visible", false)
    },
    clearProjectValidate() {
      this.$nextTick(() => {
        if (this.$refs.projectForm) {
          this.$refs.projectForm.clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped>
.project-init-dialog ::v-deep .el-dialog__body {
  padding-top: 12px;
  padding-bottom: 8px;
}

.project-init-body {
  max-height: 68vh;
  overflow-y: auto;
  padding-right: 4px;
}

.section-alert {
  margin-bottom: 12px;
}

.form-section {
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid #ebeef5;
}

.form-section:first-of-type {
  margin-top: 0;
  border-top: 0;
  padding-top: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.section-title {
  color: #303133;
  font-size: 15px;
  line-height: 24px;
  font-weight: 600;
}

.section-tip {
  color: #606266;
  font-size: 13px;
}

.summary-row {
  margin-top: 4px;
}

.summary-box {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 12px 14px;
  background: #fff;
}

.summary-label {
  color: #606266;
  font-size: 13px;
}

.summary-value {
  margin-top: 6px;
  color: #303133;
  font-size: 22px;
  line-height: 28px;
  font-weight: 600;
}

.branch-detail-panel {
  padding: 10px 14px 12px 14px;
  background: #fafafa;
}

.branch-stat {
  min-height: 58px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 9px 12px;
  background: #fff;
}

.branch-stat-label {
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
