<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="innerVisible"
    width="980px"
    append-to-body
    class="project-init-dialog"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-steps :active="activeStep" finish-status="success" simple class="init-steps">
        <el-step title="项目信息" />
        <el-step title="代码仓库" />
        <el-step title="客户基线" />
        <el-step title="模块初始化" />
        <el-step title="确认保存" />
      </el-steps>

      <div v-show="activeStep === 0" class="wizard-pane">
        <el-form ref="projectForm" :model="form.project" :rules="projectRules" label-width="100px">
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
                <el-input v-model="form.project.description" type="textarea" :rows="3" placeholder="请输入项目说明" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div v-show="activeStep === 1" class="wizard-pane">
        <el-alert
          title="平台只保存团队共享 Git 远端、默认分支和索引结果；不会保存个人本机仓库目录。"
          type="info"
          show-icon
          :closable="false"
          class="mb8"
        />
        <div class="section-toolbar">
          <el-button type="primary" plain size="mini" icon="el-icon-plus" @click="addRepository">新增仓库</el-button>
        </div>
        <el-table :data="form.repositories" size="small" border>
          <el-table-column label="仓库名称" min-width="160">
            <template slot-scope="scope">
              <el-input v-model="scope.row.repoName" size="small" placeholder="仓库名称" />
            </template>
          </el-table-column>
          <el-table-column label="类型" width="130">
            <template slot-scope="scope">
              <el-select v-model="scope.row.repoType" size="small" placeholder="类型" style="width: 100%">
                <el-option v-for="item in repoTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="Git 地址" min-width="260">
            <template slot-scope="scope">
              <el-input v-model="scope.row.repoUrl" size="small" placeholder="团队共享 Git 远端地址" />
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
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" icon="el-icon-delete" @click="removeRepository(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-show="activeStep === 2" class="wizard-pane">
        <div class="section-toolbar">
          <el-button type="primary" plain size="mini" icon="el-icon-plus" @click="addVariant">新增客户基线</el-button>
        </div>
        <el-table :data="form.variants" size="small" border>
          <el-table-column label="客户线名称" min-width="150">
            <template slot-scope="scope">
              <el-input v-model="scope.row.variantName" size="small" placeholder="客户线名称" />
            </template>
          </el-table-column>
          <el-table-column label="编码" width="130">
            <template slot-scope="scope">
              <el-input v-model="scope.row.variantCode" size="small" placeholder="MAIN" />
            </template>
          </el-table-column>
          <el-table-column label="客户名称" min-width="140">
            <template slot-scope="scope">
              <el-input v-model="scope.row.customerName" size="small" placeholder="客户或地区" />
            </template>
          </el-table-column>
          <el-table-column label="统一基线分支" min-width="160">
            <template slot-scope="scope">
              <el-input v-model="scope.row.baselineBranch" size="small" placeholder="main" />
            </template>
          </el-table-column>
          <el-table-column label="分支策略" width="130">
            <template slot-scope="scope">
              <el-select v-model="scope.row.branchPolicy" size="small" style="width: 100%">
                <el-option v-for="item in branchPolicyOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="scope">
              <el-button type="text" size="mini" icon="el-icon-delete" @click="removeVariant(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-show="activeStep === 3" class="wizard-pane">
        <el-alert
          title="模块功能点由 MCP 索引沉淀，也可以后续在模块功能点菜单人工校正；本步骤只展示当前初始化状态。"
          type="info"
          show-icon
          :closable="false"
          class="mb8"
        />
        <el-row :gutter="12" class="summary-row">
          <el-col :span="8">
            <div class="summary-box">
              <div class="summary-label">模块总数</div>
              <div class="summary-value">{{ moduleSummary.totalModules || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="summary-box">
              <div class="summary-label">索引模块</div>
              <div class="summary-value">{{ moduleSummary.indexedModules || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="summary-box">
              <div class="summary-label">人工模块</div>
              <div class="summary-value">{{ moduleSummary.manualModules || 0 }}</div>
            </div>
          </el-col>
        </el-row>
        <el-descriptions :column="2" border size="small" class="mt12">
          <el-descriptions-item label="最近索引">{{ parseTime(indexSummary.latestIndexedAt) || "-" }}</el-descriptions-item>
          <el-descriptions-item label="最近 Commit">{{ indexSummary.latestCommit || "-" }}</el-descriptions-item>
          <el-descriptions-item label="已索引仓库">{{ indexSummary.indexedRepositoryCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="未索引仓库">{{ indexSummary.unindexedRepositoryCount || 0 }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div v-show="activeStep === 4" class="wizard-pane">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="项目">{{ form.project.projectName || "-" }}</el-descriptions-item>
          <el-descriptions-item label="编码">{{ form.project.projectCode || "-" }}</el-descriptions-item>
          <el-descriptions-item label="仓库数量">{{ form.repositories.length }}</el-descriptions-item>
          <el-descriptions-item label="客户基线">{{ form.variants.length }}</el-descriptions-item>
          <el-descriptions-item label="模块状态" :span="2">{{ checklistText }}</el-descriptions-item>
        </el-descriptions>
        <el-table :data="form.repositories" size="small" class="mt12">
          <el-table-column label="仓库" prop="repoName" min-width="160" />
          <el-table-column label="类型" prop="repoType" width="120">
            <template slot-scope="scope">{{ optionLabel(repoTypeOptions, scope.row.repoType) }}</template>
          </el-table-column>
          <el-table-column label="Git 地址" prop="repoUrl" min-width="260" :show-overflow-tooltip="true" />
          <el-table-column label="默认分支" prop="defaultBranch" width="130" />
        </el-table>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="innerVisible = false">取 消</el-button>
      <el-button v-if="activeStep > 0" @click="prevStep">上一步</el-button>
      <el-button v-if="activeStep < 4" type="primary" @click="nextStep">下一步</el-button>
      <el-button v-if="activeStep === 4" :loading="saving" type="primary" @click="submit(false)">保存</el-button>
      <el-button v-if="activeStep === 4" :loading="saving" type="success" @click="submit(true)">保存并进入接入中心</el-button>
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
      activeStep: 0,
      moduleSummary: {},
      indexSummary: {},
      initChecklist: {},
      form: this.emptyForm(),
      repoTypeOptions: [
        { value: "FRONTEND", label: "前端" },
        { value: "BACKEND", label: "后端" },
        { value: "MONOREPO", label: "多端仓库" },
        { value: "DOC", label: "文档仓库" },
        { value: "OTHER", label: "其他" }
      ],
      branchPolicyOptions: [
        { value: "SHARED", label: "共享分支" },
        { value: "DEDICATED", label: "独立分支" },
        { value: "RELEASE", label: "发布分支" }
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
      return this.projectId ? "编辑项目初始化" : "新增项目初始化"
    },
    checklistText() {
      const pending = []
      if (!this.initChecklist.repositoryReady) pending.push("补齐前后端仓库")
      if (!this.initChecklist.variantReady) pending.push("补齐客户基线")
      if (!this.initChecklist.moduleReady) pending.push("沉淀模块知识")
      if (!this.initChecklist.indexReady) pending.push("完成仓库索引")
      return pending.length ? pending.join("、") : "基础初始化已完成"
    }
  },
  watch: {
    visible(value) {
      this.innerVisible = value
      if (value) {
        this.openWizard()
      }
    },
    innerVisible(value) {
      this.$emit("update:visible", value)
    }
  },
  methods: {
    openWizard() {
      this.activeStep = 0
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
          repositories: (data.repositories && data.repositories.length ? data.repositories : this.defaultRepositories()).map(item => Object.assign({}, item)),
          variants: (data.variants && data.variants.length ? data.variants : this.defaultVariants()).map(item => Object.assign({}, item)),
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
        this.newRepository("前端仓库", "FRONTEND"),
        this.newRepository("后端仓库", "BACKEND")
      ]
    },
    defaultVariants() {
      return [
        {
          variantId: undefined,
          variantName: "主线",
          variantCode: "MAIN",
          customerName: "通用",
          scopeType: "PROJECT",
          baselineBranch: "main",
          branchPolicy: "SHARED",
          status: "0"
        }
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
    addRepository() {
      this.form.repositories.push(this.newRepository("", "OTHER"))
    },
    removeRepository(index) {
      this.form.repositories.splice(index, 1)
    },
    addVariant() {
      this.form.variants.push({
        variantId: undefined,
        variantName: "",
        variantCode: "",
        customerName: "",
        scopeType: "CUSTOMER",
        baselineBranch: "main",
        branchPolicy: "DEDICATED",
        status: "0"
      })
    },
    removeVariant(index) {
      this.form.variants.splice(index, 1)
    },
    prevStep() {
      if (this.activeStep > 0) {
        this.activeStep--
      }
    },
    nextStep() {
      this.validateCurrentStep().then(valid => {
        if (valid && this.activeStep < 4) {
          this.activeStep++
        }
      })
    },
    validateCurrentStep() {
      if (this.activeStep === 0) {
        return new Promise(resolve => {
          this.$refs.projectForm.validate(valid => resolve(valid))
        })
      }
      if (this.activeStep === 1) {
        return Promise.resolve(this.validateRepositories())
      }
      if (this.activeStep === 2) {
        return Promise.resolve(this.validateVariants())
      }
      return Promise.resolve(true)
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
        this.$modal.msgWarning("请至少维护前端仓库和后端仓库")
        return false
      }
      const types = this.form.repositories.map(item => item.repoType)
      if (types.indexOf("FRONTEND") === -1 || types.indexOf("BACKEND") === -1) {
        this.$modal.msgWarning("项目初始化至少需要一条前端仓库和一条后端仓库")
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
        this.$modal.msgWarning("请至少维护一条客户基线")
        return false
      }
      const invalid = this.form.variants.some(item => !item.variantName || !item.variantCode || !item.baselineBranch || this.hasLocalPath(item.baselineBranch))
      if (invalid) {
        this.$modal.msgWarning("请补齐客户线名称、编码和统一基线分支，且不要填写本机绝对路径")
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
          this.$modal.msgSuccess("项目初始化已保存")
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
        variants: this.form.variants.map(item => Object.assign({}, item)),
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
    },
    optionLabel(options, value) {
      const option = options.find(item => item.value === String(value))
      return option ? option.label : value || "-"
    }
  }
}
</script>

<style scoped>
.project-init-dialog ::v-deep .el-dialog__body {
  padding-top: 14px;
}

.init-steps {
  margin-bottom: 16px;
}

.wizard-pane {
  min-height: 360px;
}

.section-toolbar {
  margin-bottom: 8px;
}

.summary-row {
  margin-top: 8px;
}

.summary-box {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  background: #fff;
}

.summary-label {
  color: #606266;
  font-size: 13px;
}

.summary-value {
  margin-top: 8px;
  color: #303133;
  font-size: 24px;
  line-height: 30px;
  font-weight: 600;
}

.mt12 {
  margin-top: 12px;
}
</style>
