<template>
  <div class="app-container demand-maintain-page">
    <el-page-header :content="pageTitle" @back="closePage" />

    <div v-loading="loading" class="demand-maintain-shell">
      <el-form ref="form" :model="form" :rules="rules" label-width="104px" :disabled="isReadonlyDemand">
        <section class="form-section">
          <div class="section-header">
            <span class="section-title">基础信息</span>
            <el-tag v-if="form.demandNo" size="mini" type="info">{{ form.demandNo }}</el-tag>
          </div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="需求类型" prop="demandType">
                <el-select v-model="form.demandType" placeholder="请选择需求类型" style="width: 100%">
                  <el-option
                    v-for="item in demandTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.demandNo">
              <el-form-item label="需求编号">
                <div class="readonly-value">{{ form.demandNo }}</div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="需求标题" prop="title">
                <el-input v-model="form.title" placeholder="请输入需求标题" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属项目" prop="projectId">
                <el-select v-model="form.projectId" placeholder="请选择项目" filterable style="width: 100%" @change="handleProjectChange">
                  <el-option
                    v-for="project in projectOptions"
                    :key="project.projectId || project.id"
                    :label="project.projectName"
                    :value="project.projectId || project.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="项目分支" prop="variantId">
                <el-select
                  v-model="form.variantId"
                  placeholder="请选择已初始化分支"
                  filterable
                  style="width: 100%"
                  :disabled="!form.projectId"
                  :loading="formProjectInitLoading"
                  @change="handleVariantChange"
                >
                  <el-option
                    v-for="variant in filteredVariantOptions"
                    :key="variant.variantId || variant.id"
                    :label="variant.branchLabel || variant.variantName"
                    :value="variant.variantId || variant.id"
                  />
                </el-select>
                <div v-if="form.projectId && !formProjectInitLoading && filteredVariantOptions.length === 0" class="form-tip">
                  当前项目暂无已初始化完成的分支，请先在项目维护中完成分支初始化。
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="form-section">
          <div class="section-header">
            <span class="section-title">模块与功能</span>
            <span class="section-tip">优先选择知识库模块，找不到时填写新功能名称。</span>
          </div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="知识库模块">
                <el-select
                  v-model="form.moduleId"
                  placeholder="请选择知识库模块"
                  clearable
                  filterable
                  style="width: 100%"
                  :disabled="!form.projectId || !form.variantId"
                  :loading="moduleLoading"
                  @change="handleModuleChange"
                >
                  <el-option
                    v-for="module in filteredModuleOptions"
                    :key="moduleOptionValue(module)"
                    :label="module.moduleName"
                    :value="moduleOptionValue(module)"
                  >
                    <span>{{ module.moduleName }}</span>
                    <span class="option-subtitle">{{ module.moduleCode || module.repoScope }}</span>
                  </el-option>
                </el-select>
                <div v-if="form.projectId && form.variantId && !moduleLoading && filteredModuleOptions.length === 0" class="form-tip">
                  当前分支暂无模块知识，可直接填写新功能名称提交需求。
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="新功能名称">
                <el-input
                  v-model="form.remark"
                  placeholder="例如：审批流配置"
                  :disabled="!!form.moduleId"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="form-section">
          <div class="section-header">
            <span class="section-title">需求内容</span>
          </div>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="业务背景" prop="businessBackground">
                <el-input v-model="form.businessBackground" type="textarea" :rows="4" placeholder="请输入业务背景、问题描述和目标说明" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="预期结果" prop="expectedResult">
                <el-input v-model="form.expectedResult" type="textarea" :rows="3" placeholder="请输入需求完成后的预期结果" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="验收标准" prop="acceptanceText">
                <el-input v-model="form.acceptanceText" type="textarea" :rows="6" placeholder="请输入可验证的验收标准" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>
      </el-form>

      <div class="maintain-actions">
        <el-button @click="closePage">关 闭</el-button>
        <el-button type="primary" :loading="saving || impactSuggestLoading" :disabled="isReadonlyDemand" @click="submitForm">保 存</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { listProject } from "@/api/requirement/project"
import { listModule } from "@/api/requirement/module"
import { getProjectInit } from "@/api/requirement/projectInit"
import { getDemand, addDemand, updateDemand } from "@/api/requirement/demand"
import { listIndexModule, suggestImpact } from "@/api/requirement/index"

export default {
  name: "RequirementDemandMaintain",
  data() {
    return {
      demandId: undefined,
      loading: false,
      saving: false,
      formProjectInitLoading: false,
      moduleLoading: false,
      impactSuggestLoading: false,
      projectOptions: [],
      formVariantOptions: [],
      moduleOptions: [],
      form: this.emptyForm(),
      demandTypeOptions: [
        { value: "FEATURE", label: "功能需求" },
        { value: "OPTIMIZATION", label: "优化需求" },
        { value: "BUGFIX", label: "缺陷修复" },
        { value: "RESEARCH", label: "调研任务" },
        { value: "OTHER", label: "其他" }
      ],
      rules: {
        title: [
          { required: true, message: "需求标题不能为空", trigger: "blur" }
        ],
        demandType: [
          { required: true, message: "需求类型不能为空", trigger: "change" }
        ],
        projectId: [
          { required: true, message: "所属项目不能为空", trigger: "change" }
        ],
        variantId: [
          { required: true, message: "项目分支不能为空", trigger: "change" }
        ],
        businessBackground: [
          { required: true, message: "业务背景不能为空", trigger: "blur" }
        ],
        expectedResult: [
          { required: true, message: "预期结果不能为空", trigger: "blur" }
        ],
        acceptanceText: [
          { required: true, message: "验收标准不能为空", trigger: "blur" }
        ]
      }
    }
  },
  computed: {
    pageTitle() {
      return this.demandId ? "修改需求" : "新增需求"
    },
    isReadonlyDemand() {
      return !!this.demandId && !!this.form.status && String(this.form.status) !== "draft"
    },
    filteredVariantOptions() {
      if (!this.form.projectId) {
        return []
      }
      return this.formVariantOptions.filter(this.isVariantInitialized)
    },
    filteredModuleOptions() {
      if (!this.form.projectId || !this.form.variantId) {
        return []
      }
      return this.moduleOptions.filter(item => {
        return String(item.projectId) === String(this.form.projectId) && String(item.variantId) === String(this.form.variantId)
      })
    }
  },
  created() {
    this.demandId = this.$route.query.demandId
    this.openPage()
  },
  methods: {
    openPage() {
      this.loading = true
      listProject({ pageNum: 1, pageSize: 1000, status: "0" }).then(response => {
        this.projectOptions = response.rows || response.data || []
        if (this.demandId) {
          this.loadDemand()
        } else {
          this.loading = false
          this.reset()
        }
      }).catch(() => {
        this.loading = false
      })
    },
    loadDemand() {
      getDemand(this.demandId).then(response => {
        this.form = Object.assign(this.emptyForm(), response.data || {})
        this.loading = false
        this.loadFormProjectInit(this.form.projectId, this.form.variantId)
        this.loadModules(this.form.projectId, this.form.variantId)
      }).catch(() => {
        this.loading = false
      })
    },
    reset() {
      this.form = this.emptyForm()
      this.formVariantOptions = []
      this.moduleOptions = []
      this.resetForm("form")
    },
    emptyForm() {
      return {
        demandId: undefined,
        demandNo: undefined,
        title: undefined,
        demandType: "FEATURE",
        projectId: undefined,
        variantId: undefined,
        moduleId: undefined,
        featureId: undefined,
        status: "draft",
        businessBackground: undefined,
        expectedResult: undefined,
        impactPage: undefined,
        impactApi: undefined,
        impactData: undefined,
        impactPermission: undefined,
        impactExportOrAsync: undefined,
        acceptanceText: undefined,
        remark: undefined
      }
    },
    handleProjectChange() {
      this.form.variantId = undefined
      this.form.moduleId = undefined
      this.form.remark = undefined
      this.moduleOptions = []
      this.loadFormProjectInit(this.form.projectId)
    },
    handleVariantChange() {
      this.form.moduleId = undefined
      this.form.remark = undefined
      this.loadModules(this.form.projectId, this.form.variantId)
    },
    handleModuleChange(value) {
      if (value) {
        this.form.remark = undefined
      }
    },
    loadFormProjectInit(projectId, selectedVariantId) {
      if (!projectId) {
        this.formVariantOptions = []
        return Promise.resolve()
      }
      this.formProjectInitLoading = true
      return getProjectInit(projectId).then(response => {
        const data = response.data || {}
        this.formVariantOptions = data.variants || []
        this.formProjectInitLoading = false
        if (selectedVariantId && !this.filteredVariantOptions.some(item => String(item.variantId || item.id) === String(selectedVariantId))) {
          this.form.variantId = undefined
          this.form.moduleId = undefined
          this.form.remark = undefined
          this.$modal.msgWarning("所选项目分支尚未初始化完成，不能提交需求")
        }
      }).catch(() => {
        this.formVariantOptions = []
        this.formProjectInitLoading = false
      })
    },
    loadModules(projectId, variantId) {
      if (!projectId || !variantId) {
        this.moduleOptions = []
        return Promise.resolve()
      }
      this.moduleLoading = true
      return Promise.all([
        listModule({ projectId: projectId, variantId: variantId, status: "0" }).catch(() => ({ rows: [], data: [] })),
        listIndexModule({ projectId: projectId, variantId: variantId, status: "0" }).catch(() => ({ rows: [], data: [] }))
      ]).then(([manualResponse, indexResponse]) => {
        this.moduleOptions = this.mergeModuleOptions(
          manualResponse.rows || manualResponse.data || [],
          indexResponse.rows || indexResponse.data || []
        )
        this.moduleLoading = false
      }).catch(() => {
        this.moduleOptions = []
        this.moduleLoading = false
      })
    },
    isVariantInitialized(variant) {
      if (!variant || variant.status === "1") {
        return false
      }
      const indexedRepositoryCount = Number(variant.indexedRepositoryCount || 0)
      const unindexedRepositoryCount = Number(variant.unindexedRepositoryCount || 0)
      return indexedRepositoryCount > 0 && unindexedRepositoryCount === 0
    },
    isSelectedFormBranchInitialized() {
      return this.filteredVariantOptions.some(item => String(item.variantId || item.id) === String(this.form.variantId))
    },
    validateModuleChoice() {
      if (this.form.moduleId || this.form.remark) {
        return true
      }
      this.$modal.msgWarning("请选择知识库模块，或填写新功能名称")
      return false
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) return
        if (!this.isSelectedFormBranchInitialized()) {
          this.$modal.msgWarning("需求只能提交到已初始化完成的项目分支")
          return
        }
        if (!this.validateModuleChoice()) {
          return
        }
        this.saving = true
        this.applyImpactSuggest().then(() => {
          const action = this.form.demandId != undefined || this.form.id != undefined ? updateDemand : addDemand
          const payload = Object.assign({}, this.form)
          delete payload.creatorId
          delete payload.demandNo
          delete payload.status
          action(payload).then(() => {
            this.$modal.msgSuccess(this.demandId ? "修改成功" : "新增成功")
            this.saving = false
            this.closePage()
          }).catch(() => {
            this.saving = false
          })
        })
      })
    },
    applyImpactSuggest() {
      if (!this.form.projectId || !this.form.variantId || !this.form.moduleId) {
        this.clearImpactFields()
        return Promise.resolve()
      }
      const module = this.moduleOptions.find(item => String(this.moduleOptionValue(item)) === String(this.form.moduleId))
      this.impactSuggestLoading = true
      // 影响面字段对提需求人隐藏，但仍随需求保存，供执行包和后续编排自动关联知识库。
      return suggestImpact({
        projectId: this.form.projectId,
        variantId: this.form.variantId,
        moduleId: this.form.moduleId,
        moduleCode: module ? module.moduleCode : undefined
      }).then(response => {
        const suggest = response.data || this.emptyImpactSuggest()
        this.form.impactPage = this.formatImpactItems(suggest.pages)
        this.form.impactApi = this.formatImpactItems(suggest.apis)
        this.form.impactData = this.formatImpactItems(suggest.tables)
        this.form.impactPermission = this.formatImpactItems(suggest.permissions)
        this.form.impactExportOrAsync = this.formatImpactItems(suggest.documents)
        this.impactSuggestLoading = false
      }).catch(() => {
        this.clearImpactFields()
        this.impactSuggestLoading = false
      })
    },
    clearImpactFields() {
      this.form.impactPage = undefined
      this.form.impactApi = undefined
      this.form.impactData = undefined
      this.form.impactPermission = undefined
      this.form.impactExportOrAsync = undefined
    },
    emptyImpactSuggest() {
      return {
        pages: [],
        apis: [],
        tables: [],
        permissions: [],
        documents: []
      }
    },
    formatImpactItems(items) {
      return (items || []).map(item => {
        return [item.itemName, item.itemKey || item.apiPath || item.permissionKey || item.tableName || item.relativePath, item.summary]
          .filter(Boolean)
          .join(" - ")
      }).join("\n") || undefined
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
    closePage() {
      this.$tab.closePage()
    }
  }
}
</script>

<style scoped>
.demand-maintain-shell {
  margin-top: 16px;
}

.form-section {
  margin-bottom: 16px;
  padding: 16px 16px 4px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fff;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-title {
  color: #303133;
  font-size: 15px;
  font-weight: 600;
}

.section-tip,
.form-tip,
.option-subtitle {
  color: #909399;
  font-size: 12px;
}

.option-subtitle {
  float: right;
  margin-left: 16px;
}

.form-tip {
  margin-top: 6px;
  line-height: 18px;
}

.readonly-value {
  min-height: 32px;
  line-height: 32px;
  color: #303133;
  font-weight: 600;
}

.maintain-actions {
  margin-top: 18px;
  text-align: right;
}
</style>
