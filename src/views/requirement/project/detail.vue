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
          <el-table :data="variants" size="small">
            <el-table-column label="分支标签" prop="variantName" min-width="160" />
            <el-table-column label="分支编码" prop="variantCode" min-width="130" />
            <el-table-column label="真实分支" prop="baselineBranch" min-width="140" />
            <el-table-column label="MCP Key" prop="mcpKey" min-width="170" :show-overflow-tooltip="true" />
            <el-table-column label="分支策略" prop="branchPolicy" min-width="140">
              <template slot-scope="scope">{{ optionLabel(branchPolicyOptions, scope.row.branchPolicy) }}</template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="MCP 索引" name="index">
          <el-alert
            title="本地 Codex 或索引 Agent 读取本机仓库后，通过 MCP tool publish_repository_index 推送结果。平台用 MCP key 识别项目分支，用 Git 地址识别仓库。"
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
          <el-table :data="indexBatches" size="small">
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
          <el-table :data="indexModules" size="small">
            <el-table-column label="模块名称" prop="moduleName" min-width="160" />
            <el-table-column label="模块编码" prop="moduleCode" min-width="140" />
            <el-table-column label="仓库范围" prop="repoScope" width="120" />
            <el-table-column label="相对路径" prop="relativePath" min-width="220" :show-overflow-tooltip="true" />
            <el-table-column label="摘要" prop="summary" min-width="240" :show-overflow-tooltip="true" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog :title="repositoryTitle" :visible.sync="repositoryOpen" width="620px" append-to-body>
      <el-form ref="repositoryForm" :model="repositoryForm" :rules="repositoryRules" label-width="90px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="仓库名称" prop="repoName">
              <el-input v-model="repositoryForm.repoName" placeholder="请输入仓库名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仓库类型" prop="repoType">
              <el-select v-model="repositoryForm.repoType" placeholder="请选择仓库类型" style="width: 100%">
                <el-option
                  v-for="item in repoTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Git 地址" prop="repoUrl">
              <el-input v-model="repositoryForm.repoUrl" placeholder="请输入团队共享 Git 远端地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认分支" prop="defaultBranch">
              <el-input v-model="repositoryForm.defaultBranch" placeholder="请输入默认分支" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="repositoryForm.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitRepository">确 定</el-button>
        <el-button @click="repositoryOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="variantTitle" :visible.sync="variantOpen" width="620px" append-to-body>
      <el-form ref="variantForm" :model="variantForm" :rules="variantRules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="分支标签" prop="variantName">
              <el-input v-model="variantForm.variantName" placeholder="请输入分支标签" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分支编码" prop="variantCode">
              <el-input v-model="variantForm.variantCode" placeholder="请输入分支编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="variantForm.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="范围类型" prop="scopeType">
              <el-select v-model="variantForm.scopeType" placeholder="请选择范围类型" style="width: 100%">
                <el-option
                  v-for="item in scopeTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基线分支" prop="baselineBranch">
              <el-input v-model="variantForm.baselineBranch" placeholder="请输入统一基线分支" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分支策略" prop="branchPolicy">
              <el-select v-model="variantForm.branchPolicy" placeholder="请选择分支策略" style="width: 100%">
                <el-option
                  v-for="item in branchPolicyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="说明" prop="description">
              <el-input v-model="variantForm.description" type="textarea" :rows="3" placeholder="请输入项目分支说明" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitVariant">确 定</el-button>
        <el-button @click="variantOpen = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getProject } from "@/api/requirement/project"
import { listRepository, addRepository, updateRepository } from "@/api/requirement/repository"
import { listVariant, addVariant, updateVariant } from "@/api/requirement/variant"
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
      indexModules: [],
      repositoryOpen: false,
      repositoryTitle: "",
      repositoryForm: {},
      variantOpen: false,
      variantTitle: "",
      variantForm: {},
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
      ],
      repositoryRules: {
        repoName: [
          { required: true, message: "仓库名称不能为空", trigger: "blur" }
        ],
        repoType: [
          { required: true, message: "仓库类型不能为空", trigger: "change" }
        ],
        repoUrl: [
          { required: true, message: "Git 地址不能为空", trigger: "blur" }
        ]
      },
      variantRules: {
        variantName: [
          { required: true, message: "分支标签不能为空", trigger: "blur" }
        ],
        variantCode: [
          { required: true, message: "分支编码不能为空", trigger: "blur" }
        ],
        scopeType: [
          { required: true, message: "范围类型不能为空", trigger: "change" }
        ],
        baselineBranch: [
          { required: true, message: "基线分支不能为空", trigger: "blur" }
        ]
      }
    }
  },
  computed: {
    mcpGuide() {
      const repoLines = this.repositories.map(repo => {
        return "- " + repo.repoName + "，" + repo.repoType + "，" + repo.repoUrl
      }).join("\n")
      const branchLines = this.variants.map(branch => {
        return "- mcpKey=" + (branch.mcpKey || "-") + "，" + branch.variantName + "，" + branch.baselineBranch
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
        "- 优先传 mcpKey 和 remoteUrl；平台会自动解析项目、分支和仓库。",
        "- 兼容旧方式传 projectId、repoId 和 branchName。",
        "- commitHash 使用当前仓库提交号。",
        "- pages/apis/tables/permissions/documents 中只能写相对路径和结构化标识。",
        "- 不上传个人本机绝对路径。"
      ].join("\n")
    }
  },
  created() {
    this.projectId = this.$route.query.projectId
    this.resetRepositoryForm()
    this.resetVariantForm()
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
        getProject(this.projectId),
        listRepository({ pageNum: 1, pageSize: 1000, projectId: this.projectId }),
        listVariant({ pageNum: 1, pageSize: 1000, projectId: this.projectId }),
        listIndexBatch({ pageNum: 1, pageSize: 20, projectId: this.projectId }),
        listIndexModule({ projectId: this.projectId, status: "0" })
      ]).then(([projectRes, repoRes, variantRes, batchRes, moduleRes]) => {
        this.project = projectRes.data || {}
        this.repositories = repoRes.rows || repoRes.data || []
        this.variants = variantRes.rows || variantRes.data || []
        this.indexBatches = batchRes.rows || batchRes.data || []
        this.indexModules = moduleRes.data || moduleRes.rows || []
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    goBack() {
      this.$router.back()
    },
    handleAddRepository() {
      this.resetRepositoryForm()
      this.repositoryTitle = "新增仓库"
      this.repositoryOpen = true
    },
    handleEditRepository(row) {
      this.repositoryForm = Object.assign({}, row, {
        projectId: this.projectId,
        defaultBranch: row.defaultBranch || "main",
        status: row.status || "0"
      })
      this.repositoryTitle = "编辑仓库"
      this.repositoryOpen = true
    },
    submitRepository() {
      this.$refs["repositoryForm"].validate(valid => {
        if (!valid) return
        const action = this.repositoryForm.repoId || this.repositoryForm.id ? updateRepository : addRepository
        action(this.repositoryForm).then(() => {
          this.$modal.msgSuccess("仓库已保存")
          this.repositoryOpen = false
          this.loadDetail()
        })
      })
    },
    resetRepositoryForm() {
      this.repositoryForm = {
        repoId: undefined,
        projectId: this.projectId,
        repoName: undefined,
        repoType: "BACKEND",
        repoUrl: undefined,
        localPathHint: undefined,
        defaultBranch: "main",
        harnessStatus: "uninitialized",
        status: "0"
      }
      this.$nextTick(() => {
        if (this.$refs.repositoryForm) this.$refs.repositoryForm.clearValidate()
      })
    },
    handleAddVariant() {
      this.resetVariantForm()
      this.variantTitle = "新增项目分支"
      this.variantOpen = true
    },
    handleEditVariant(row) {
      this.variantForm = Object.assign({}, row, {
        projectId: this.projectId,
        baselineBranch: row.baselineBranch || "main",
        status: row.status || "0"
      })
      this.variantTitle = "编辑项目分支"
      this.variantOpen = true
    },
    submitVariant() {
      this.$refs["variantForm"].validate(valid => {
        if (!valid) return
        const action = this.variantForm.variantId || this.variantForm.id ? updateVariant : addVariant
        action(this.variantForm).then(() => {
          this.$modal.msgSuccess("项目分支已保存")
          this.variantOpen = false
          this.loadDetail()
        })
      })
    },
    resetVariantForm() {
      this.variantForm = {
        variantId: undefined,
        projectId: this.projectId,
        variantName: undefined,
        variantCode: undefined,
        customerName: undefined,
        scopeType: "CUSTOMER",
        baselineBranch: "main",
        branchPolicy: "DEDICATED",
        description: undefined,
        status: "0"
      }
      this.$nextTick(() => {
        if (this.$refs.variantForm) this.$refs.variantForm.clearValidate()
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
</style>
