<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="需求编号" prop="demandNo">
        <el-input
          v-model="queryParams.demandNo"
          placeholder="请输入需求编号"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="需求标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入需求标题"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="所属项目" prop="projectId">
        <el-select v-model="queryParams.projectId" placeholder="请选择项目" clearable filterable style="width: 200px">
          <el-option
            v-for="project in projectOptions"
            :key="project.projectId || project.id"
            :label="project.projectName"
            :value="project.projectId || project.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="需求类型" prop="demandType">
        <el-select v-model="queryParams.demandType" placeholder="需求类型" clearable style="width: 140px">
          <el-option
            v-for="item in demandTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="需求状态" clearable style="width: 140px">
          <el-option
            v-for="item in demandStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['req:demand:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['req:demand:edit']"
        >修改</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="demandList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="需求编号" align="center" prop="demandNo" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="需求标题" min-width="240" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <a class="link-type" style="cursor:pointer" @click="handleDetail(scope.row)">{{ scope.row.title }}</a>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="demandType" width="110">
        <template slot-scope="scope">{{ optionLabel(demandTypeOptions, scope.row.demandType) }}</template>
      </el-table-column>
      <el-table-column label="所属项目" align="center" min-width="150" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ projectLabel(scope.row.projectId) }}</template>
      </el-table-column>
      <el-table-column label="项目分支" align="center" min-width="130" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ variantLabel(scope.row.variantId) }}</template>
      </el-table-column>
      <el-table-column label="模块" align="center" min-width="130" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ moduleLabel(scope.row.moduleId) }}</template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="120">
        <template slot-scope="scope">
          <el-tag :type="demandStatusTagType(scope.row.status)" size="mini">
            {{ optionLabel(demandStatusOptions, scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="creatorId" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="260">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleDetail(scope.row)"
            v-hasPermi="['req:demand:query']"
          >详情</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['req:demand:edit']"
          >修改</el-button>
          <el-dropdown
            size="mini"
            @command="command => handleStatusCommand(command, scope.row)"
            v-hasPermi="['req:demand:edit']"
          >
            <el-button size="mini" type="text" icon="el-icon-refresh">状态</el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="item in nextStatusOptions(scope.row.status)"
                :key="item.value"
                :command="item.value"
              >{{ item.label }}</el-dropdown-item>
              <el-dropdown-item v-if="nextStatusOptions(scope.row.status).length === 0" disabled>暂无可流转状态</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-document"
            @click="handlePackage(scope.row)"
            v-hasPermi="['req:package:list']"
          >Agent资料</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" :visible.sync="open" width="860px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-divider content-position="left">基础信息</el-divider>
        <el-row>
          <el-col :span="12">
            <el-form-item label="需求编号" prop="demandNo">
              <el-input v-model="form.demandNo" placeholder="请输入需求编号" />
            </el-form-item>
          </el-col>
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
          <el-col :span="24">
            <el-form-item label="需求标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入需求标题" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
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
          <el-col :span="8">
            <el-form-item label="项目分支" prop="variantId">
              <el-select v-model="form.variantId" placeholder="请选择项目分支" filterable style="width: 100%" @change="handleVariantChange">
                <el-option
                  v-for="variant in filteredVariantOptions"
                  :key="variant.variantId || variant.id"
                  :label="variant.variantName"
                  :value="variant.variantId || variant.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="模块" prop="moduleId">
              <el-select v-model="form.moduleId" placeholder="请选择模块" clearable filterable style="width: 100%" @change="handleModuleChange">
                <el-option
                  v-for="module in filteredModuleOptions"
                  :key="module.moduleId || module.id"
                  :label="module.moduleName"
                  :value="module.moduleId || module.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建人ID" prop="creatorId">
              <el-input v-model="form.creatorId" placeholder="请输入创建人用户ID" />
            </el-form-item>
          </el-col>
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
        </el-row>
        <el-divider content-position="left">影响范围</el-divider>
        <el-alert
          v-if="form.projectId && form.moduleId"
          title="已根据项目和模块提供影响面推荐，可按需追加到下方字段，追加后仍可人工编辑。"
          type="info"
          show-icon
          :closable="false"
          class="mb8"
        />
        <el-row v-if="form.projectId && form.moduleId" class="mb8">
          <el-col :span="24">
            <el-button
              type="primary"
              plain
              icon="el-icon-refresh"
              size="mini"
              :loading="impactSuggestLoading"
              @click="loadImpactSuggest"
              v-hasPermi="['req:index:list']"
            >刷新推荐</el-button>
            <el-button
              type="success"
              plain
              icon="el-icon-plus"
              size="mini"
              :disabled="!hasImpactSuggest"
              @click="appendImpactSuggest"
            >追加推荐</el-button>
          </el-col>
          <el-col :span="24" v-if="hasImpactSuggest">
            <div class="impact-suggest">
              <div class="impact-group" v-for="group in visibleImpactGroups" :key="group.key">
                <span class="impact-group-title">{{ group.label }}</span>
                <el-tag
                  v-for="item in group.items"
                  :key="group.key + '-' + (item.impactId || item.itemKey || item.itemName)"
                  size="mini"
                  class="impact-tag"
                >{{ item.itemName || item.itemKey || item.relativePath }}</el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="影响页面" prop="impactPage">
              <el-input v-model="form.impactPage" type="textarea" :rows="3" placeholder="请输入影响页面或菜单" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="影响接口" prop="impactApi">
              <el-input v-model="form.impactApi" type="textarea" :rows="3" placeholder="请输入影响接口或服务" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="影响数据" prop="impactData">
              <el-input v-model="form.impactData" type="textarea" :rows="3" placeholder="请输入影响表、字段或数据口径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="影响权限" prop="impactPermission">
              <el-input v-model="form.impactPermission" type="textarea" :rows="3" placeholder="请输入影响权限点或角色" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="导出/异步" prop="impactExportOrAsync">
              <el-input v-model="form.impactExportOrAsync" type="textarea" :rows="3" placeholder="请输入导出、批处理、异步任务或消息影响" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">验收标准</el-divider>
        <el-form-item label="验收标准" prop="acceptanceText">
          <el-input v-model="form.acceptanceText" type="textarea" :rows="6" placeholder="请输入可验证的验收标准" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProject } from "@/api/requirement/project"
import { listVariant } from "@/api/requirement/variant"
import { listModule } from "@/api/requirement/module"
import { listDemand, getDemand, addDemand, updateDemand, updateDemandStatus } from "@/api/requirement/demand"
import { suggestImpact } from "@/api/requirement/index"

export default {
  name: "RequirementDemand",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      showSearch: true,
      total: 0,
      demandList: [],
      projectOptions: [],
      variantOptions: [],
      moduleOptions: [],
      impactSuggestLoading: false,
      impactSuggest: {
        pages: [],
        apis: [],
        tables: [],
        permissions: [],
        documents: []
      },
      title: "",
      open: false,
      demandTypeOptions: [
        { value: "FEATURE", label: "功能需求" },
        { value: "OPTIMIZATION", label: "优化需求" },
        { value: "BUGFIX", label: "缺陷修复" },
        { value: "RESEARCH", label: "调研任务" },
        { value: "OTHER", label: "其他" }
      ],
      demandStatusOptions: [
        { value: "draft", label: "草稿", type: "info" },
        { value: "submitted", label: "已提交", type: "" },
        { value: "plan_pending", label: "待出计划", type: "warning" },
        { value: "plan_ready", label: "计划就绪", type: "warning" },
        { value: "confirmed", label: "已确认", type: "success" },
        { value: "developing", label: "开发中", type: "primary" },
        { value: "review", label: "Review 中", type: "warning" },
        { value: "repairing", label: "返修中", type: "danger" },
        { value: "completed", label: "已完成", type: "success" },
        { value: "archived", label: "已归档", type: "info" }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        demandNo: undefined,
        title: undefined,
        demandType: undefined,
        projectId: undefined,
        status: undefined
      },
      form: {},
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
    filteredVariantOptions() {
      if (!this.form.projectId) {
        return this.variantOptions
      }
      return this.variantOptions.filter(item => String(item.projectId) === String(this.form.projectId))
    },
    filteredModuleOptions() {
      if (!this.form.projectId) {
        return this.moduleOptions
      }
      return this.moduleOptions.filter(item => String(item.projectId) === String(this.form.projectId))
    },
    impactGroups() {
      return [
        { key: "pages", label: "页面", items: this.impactSuggest.pages || [] },
        { key: "apis", label: "接口", items: this.impactSuggest.apis || [] },
        { key: "tables", label: "数据表", items: this.impactSuggest.tables || [] },
        { key: "permissions", label: "权限", items: this.impactSuggest.permissions || [] },
        { key: "documents", label: "文档", items: this.impactSuggest.documents || [] }
      ]
    },
    visibleImpactGroups() {
      return this.impactGroups.filter(group => group.items.length)
    },
    hasImpactSuggest() {
      return this.visibleImpactGroups.length > 0
    }
  },
  created() {
    this.getOptions()
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listDemand(this.queryParams).then(response => {
        this.demandList = response.rows || response.data || []
        this.total = response.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    getOptions() {
      listProject({ pageNum: 1, pageSize: 1000, status: "0" }).then(response => {
        this.projectOptions = response.rows || response.data || []
      })
      listVariant({ pageNum: 1, pageSize: 1000, status: "0" }).then(response => {
        this.variantOptions = response.rows || response.data || []
      })
      listModule({ status: "0" }).then(response => {
        this.moduleOptions = response.rows || response.data || []
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        demandId: undefined,
        demandNo: undefined,
        title: undefined,
        demandType: "FEATURE",
        projectId: undefined,
        variantId: undefined,
        moduleId: undefined,
        status: "submitted",
        creatorId: undefined,
        businessBackground: undefined,
        expectedResult: undefined,
        impactPage: undefined,
        impactApi: undefined,
        impactData: undefined,
        impactPermission: undefined,
        impactExportOrAsync: undefined,
        acceptanceText: undefined
      }
      this.resetImpactSuggest()
      this.resetForm("form")
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.demandId || item.id)
      this.single = selection.length != 1
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加需求"
    },
    handleUpdate(row) {
      this.reset()
      const demandId = row.demandId || row.id || this.ids
      getDemand(demandId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改需求"
        this.loadImpactSuggest()
      })
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.demandId != undefined || this.form.id != undefined) {
            updateDemand(this.form).then(() => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addDemand(this.form).then(() => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    handleStatusCommand(status, row) {
      const demandId = row.demandId || row.id
      const label = this.optionLabel(this.demandStatusOptions, status)
      this.$modal.confirm('是否确认将需求"' + row.title + '"状态调整为"' + label + '"？').then(function() {
        return updateDemandStatus(demandId, status)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("状态更新成功")
      }).catch(() => {})
    },
    nextStatusOptions(status) {
      const transitions = {
        draft: ["submitted"],
        submitted: ["plan_pending"],
        plan_pending: ["plan_ready"],
        plan_ready: ["confirmed"],
        confirmed: ["developing"],
        developing: ["review"],
        review: ["repairing", "completed"],
        repairing: ["review"],
        completed: ["archived"]
      }
      return (transitions[String(status)] || []).map(value => {
        return this.demandStatusOptions.find(item => item.value === value)
      }).filter(Boolean)
    },
    handleDetail(row) {
      const demandId = row.demandId || row.id
      this.$router.push({ path: "/requirement/demand/detail", query: { demandId: demandId } })
    },
    handlePackage(row) {
      const demandId = row.demandId || row.id
      this.$router.push({ path: "/requirement/package", query: { demandId: demandId } })
    },
    handleProjectChange() {
      if (this.form.variantId && !this.filteredVariantOptions.some(item => String(item.variantId || item.id) === String(this.form.variantId))) {
        this.form.variantId = undefined
      }
      if (this.form.moduleId && !this.filteredModuleOptions.some(item => String(item.moduleId || item.id) === String(this.form.moduleId))) {
        this.form.moduleId = undefined
      }
      this.resetImpactSuggest()
      this.loadImpactSuggest()
    },
    handleVariantChange() {
      this.loadImpactSuggest()
    },
    handleModuleChange() {
      this.resetImpactSuggest()
      this.loadImpactSuggest()
    },
    loadImpactSuggest() {
      if (!this.form.projectId || !this.form.moduleId) {
        return
      }
      const module = this.moduleOptions.find(item => String(item.moduleId || item.id) === String(this.form.moduleId))
      this.impactSuggestLoading = true
      suggestImpact({
        projectId: this.form.projectId,
        variantId: this.form.variantId,
        moduleId: this.form.moduleId,
        moduleCode: module ? module.moduleCode : undefined
      }).then(response => {
        this.impactSuggest = response.data || this.emptyImpactSuggest()
        this.impactSuggestLoading = false
      }).catch(() => {
        this.impactSuggestLoading = false
      })
    },
    appendImpactSuggest() {
      this.form.impactPage = this.appendLines(this.form.impactPage, this.formatImpactItems(this.impactSuggest.pages))
      this.form.impactApi = this.appendLines(this.form.impactApi, this.formatImpactItems(this.impactSuggest.apis))
      this.form.impactData = this.appendLines(this.form.impactData, this.formatImpactItems(this.impactSuggest.tables))
      this.form.impactPermission = this.appendLines(this.form.impactPermission, this.formatImpactItems(this.impactSuggest.permissions))
      this.form.impactExportOrAsync = this.appendLines(this.form.impactExportOrAsync, this.formatImpactItems(this.impactSuggest.documents))
    },
    appendLines(current, lines) {
      if (!lines) {
        return current
      }
      return current ? current + "\n" + lines : lines
    },
    formatImpactItems(items) {
      return (items || []).map(item => {
        return [item.itemName, item.itemKey || item.apiPath || item.permissionKey || item.tableName || item.relativePath, item.summary]
          .filter(Boolean)
          .join(" - ")
      }).join("\n")
    },
    resetImpactSuggest() {
      this.impactSuggest = this.emptyImpactSuggest()
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
    projectLabel(projectId) {
      const project = this.projectOptions.find(item => String(item.projectId || item.id) === String(projectId))
      return project ? project.projectName : projectId
    },
    variantLabel(variantId) {
      const variant = this.variantOptions.find(item => String(item.variantId || item.id) === String(variantId))
      return variant ? variant.variantName : variantId
    },
    moduleLabel(moduleId) {
      const module = this.moduleOptions.find(item => String(item.moduleId || item.id) === String(moduleId))
      return module ? module.moduleName : moduleId
    },
    optionLabel(options, value) {
      const option = options.find(item => item.value === String(value))
      return option ? option.label : value
    },
    demandStatusTagType(value) {
      const option = this.demandStatusOptions.find(item => item.value === String(value))
      return option ? option.type : ""
    }
  }
}
</script>

<style scoped>
.impact-suggest {
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
}

.impact-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 4px 0;
}

.impact-group-title {
  width: 56px;
  color: #606266;
  font-size: 13px;
}

.impact-tag {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
