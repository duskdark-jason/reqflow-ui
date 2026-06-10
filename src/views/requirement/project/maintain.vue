<template>
  <div class="app-container project-maintain-page">
    <el-page-header :content="pageTitle" @back="closePage" />

    <div v-loading="loading" class="project-init-body maintain-shell">
      <div class="maintain-hero">
        <div>
          <div class="maintain-eyebrow">项目维护</div>
          <h2>{{ pageTitle }}</h2>
          <p>统一维护项目、团队 Git 远端和分支初始化指令，保存后可直接进入接入中心或分支知识库。</p>
        </div>
        <el-steps :active="initStepActive" finish-status="success" simple class="maintain-steps">
          <el-step title="项目信息" icon="el-icon-office-building" />
          <el-step title="代码仓库" icon="el-icon-folder-opened" />
          <el-step title="分支指令" icon="el-icon-key" />
          <el-step title="知识索引" icon="el-icon-data-analysis" />
        </el-steps>
      </div>
      <el-alert
        title="平台只保存团队共享 Git 信息、项目分支和分支级模块索引结果；每个分支保存后生成初始化指令，复制给 MCP 即可识别项目、分支和目标接口。"
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
          <el-table-column label="初始化指令" min-width="240">
            <template slot-scope="scope">
              <el-input :value="instructionPreview(scope.row)" size="small" readonly placeholder="保存后生成">
                <el-button slot="append" icon="el-icon-document-copy" @click="copyInstruction(scope.row)">复制</el-button>
              </el-input>
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
          <el-table-column label="操作" width="150" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" icon="el-icon-notebook-2" :disabled="!projectId || !scope.row.variantId" @click="openKnowledge(scope.row)">知识库</el-button>
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
      <div class="maintain-actions">
        <el-button @click="closePage">关 闭</el-button>
        <el-button :loading="saving" type="primary" @click="submit(false)">保 存</el-button>
        <el-button :loading="saving" type="success" @click="submit(true)">保存并进入接入中心</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getProjectInit, addProjectInit, updateProjectInit } from "@/api/requirement/projectInit"

export default {
  name: "RequirementProjectMaintain",
  data() {
    return {
      projectId: undefined,
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
    pageTitle() {
      return this.projectId ? "编辑项目" : "新增项目"
    },
    initStepActive() {
      if (!this.form.project.projectName || !this.form.project.projectCode) return 0
      if (!this.form.repositories.length) return 1
      if (!this.form.variants.length) return 2
      if (!this.initChecklist.indexReady) return 3
      return 4
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
  created() {
    this.projectId = this.$route.query.projectId
    this.openPage()
  },
  methods: {
    openPage() {
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
          if (savedProjectId && !this.projectId) {
            this.projectId = savedProjectId
            this.$router.replace({ path: this.$route.path, query: { projectId: savedProjectId } })
          }
          if (goIntake) {
            this.openIntake(savedProjectId, savedProject.projectName)
          } else if (savedProjectId) {
            this.loadInit()
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
    openIntake(projectId, projectName) {
      if (!projectId) return
      this.$tab.openPage((projectName || "项目") + "接入中心", "/requirement/project/detail", { projectId: projectId })
    },
    openKnowledge(row) {
      if (!this.projectId || !row || !row.variantId) return
      const title = (row.branchLabel || row.variantName || "分支") + "知识库"
      this.$tab.openPage(title, "/requirement/project/knowledge", { projectId: this.projectId, variantId: row.variantId })
    },
    instructionPreview(row) {
      if (!row) return ""
      if (row.initInstruction && row.initInstruction.tokenPrefix) {
        return row.initInstruction.copyLabel + "：" + row.initInstruction.tokenPrefix + "..."
      }
      if (row.initInstruction && row.initInstruction.token) {
        return row.initInstruction.copyLabel + "：" + row.initInstruction.token
      }
      if (row.mcpKey) return "兼容 Key：" + row.mcpKey
      return ""
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
        this.$modal.msgWarning("请先保存项目分支，生成初始化指令")
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
    closePage() {
      this.$tab.closePage()
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
.project-maintain-page {
  background: #f4f8fb;
  min-height: calc(100vh - 84px);
}

.project-init-body {
  margin-top: 16px;
}

.maintain-shell {
  background: #fff;
  border: 1px solid #dbe8f3;
  border-radius: 8px;
  padding: 18px 18px 0;
  box-shadow: 0 12px 28px rgba(38, 86, 120, 0.08);
}

.maintain-hero {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(360px, 520px);
  gap: 18px;
  align-items: center;
  padding: 18px;
  margin-bottom: 14px;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(230, 246, 255, 0.96), rgba(248, 252, 255, 0.98)),
    radial-gradient(circle at 92% 12%, rgba(94, 179, 255, 0.2), transparent 30%);
  border: 1px solid #d8edf9;
}

.maintain-eyebrow {
  color: #2477a8;
  font-size: 13px;
  font-weight: 600;
}

.maintain-hero h2 {
  margin: 6px 0 8px;
  color: #1f3f59;
  font-size: 22px;
  line-height: 30px;
  font-weight: 700;
}

.maintain-hero p {
  margin: 0;
  max-width: 620px;
  color: #5f7282;
  font-size: 13px;
  line-height: 22px;
}

.maintain-steps {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid #dcecf6;
  border-radius: 8px;
}

.section-alert {
  margin-bottom: 12px;
}

.form-section {
  padding: 16px;
  margin-top: 14px;
  border: 1px solid #e3edf5;
  border-radius: 8px;
  background: #fbfdff;
}

.form-section:first-of-type {
  margin-top: 0;
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
  border: 1px solid #dfeaf3;
  border-radius: 8px;
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

.maintain-actions {
  position: sticky;
  bottom: 0;
  z-index: 3;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 0 16px;
  margin-top: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), #fff 42%);
  border-top: 1px solid #e3edf5;
}

.mt12 {
  margin-top: 12px;
}

@media (max-width: 960px) {
  .maintain-hero {
    grid-template-columns: 1fr;
  }
}
</style>
