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
        <el-select v-model="queryParams.projectId" placeholder="请选择项目" clearable filterable style="width: 200px" @change="handleDemandQueryProjectChange">
          <el-option
            v-for="project in projectOptions"
            :key="project.projectId || project.id"
            :label="project.projectName"
            :value="project.projectId || project.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目分支" prop="variantId">
        <el-select v-model="queryParams.variantId" placeholder="请选择分支" clearable filterable style="width: 180px">
          <el-option
            v-for="variant in queryVariantOptions"
            :key="variant.variantId || variant.id"
            :label="variant.branchLabel || variant.variantName"
            :value="variant.variantId || variant.id"
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
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['req:demand:remove']"
        >删除</el-button>
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
      <el-table-column label="来源" align="center" prop="demandSource" width="110">
        <template slot-scope="scope">{{ optionLabel(demandSourceOptions, scope.row.demandSource) }}</template>
      </el-table-column>
      <el-table-column label="所属项目" align="center" min-width="150" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ projectLabel(scope.row.projectId) }}</template>
      </el-table-column>
      <el-table-column label="项目分支" align="center" min-width="130" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ variantLabel(scope.row.variantId) }}</template>
      </el-table-column>
      <el-table-column label="模块" align="center" min-width="130" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ demandModuleLabel(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="开发人员" align="center" min-width="140" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ developerLabel(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="190">
        <template slot-scope="scope">
          <el-tag :type="demandStatusTagType(scope.row.status)" size="mini">
            {{ optionLabel(demandStatusOptions, scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width demand-actions-column" width="340">
        <template slot-scope="scope">
          <div class="row-actions">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="handleDetail(scope.row)"
              v-hasPermi="['req:demand:query']"
            >详情</el-button>
            <el-button
              v-if="canEditDemand(scope.row)"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['req:demand:edit']"
            >修改</el-button>
            <el-button
              v-for="action in statusActions(scope.row)"
              :key="action.value"
              size="mini"
              class="status-action-button"
              :class="'is-' + action.tone"
              :icon="action.icon"
              @click="handleStatusCommand(action, scope.row)"
              v-hasPermi="['req:demand:edit']"
            >{{ action.label }}</el-button>
            <el-button
              size="mini"
              type="text"
              class="row-delete-button"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['req:demand:remove']"
            >删除</el-button>
          </div>
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
  </div>
</template>

<script>
import { listProject } from "@/api/requirement/project"
import { listVariant } from "@/api/requirement/variant"
import { listModule } from "@/api/requirement/module"
import { delDemand, listDemand, updateDemandStatus } from "@/api/requirement/demand"
import { listIndexModule } from "@/api/requirement/index"
import { mapGetters } from "vuex"
import {
  canEditDemand as canEditDemandRow,
  demandSourceOptions,
  demandStatusOptions,
  demandStatusTagType,
  nextStatusOptions,
  optionLabel,
  primaryStatusAction as getPrimaryStatusAction,
  statusActions as getStatusActions
} from "./status"

export default {
  name: "RequirementDemand",
  data() {
    return {
      loading: true,
      ids: [],
      selectedRows: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      demandList: [],
      projectOptions: [],
      variantOptions: [],
      moduleOptions: [],
      demandTypeOptions: [
        { value: "FEATURE", label: "功能需求" },
        { value: "OPTIMIZATION", label: "优化需求" },
        { value: "BUGFIX", label: "缺陷修复" },
        { value: "RESEARCH", label: "调研任务" },
        { value: "OTHER", label: "其他" }
      ],
      demandSourceOptions: demandSourceOptions,
      demandStatusOptions: demandStatusOptions,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        demandNo: undefined,
        title: undefined,
        demandType: undefined,
        projectId: undefined,
        variantId: undefined,
        status: undefined
      }
    }
  },
  computed: {
    ...mapGetters([
      "id",
      "permissions",
      "roles"
    ]),
    queryVariantOptions() {
      if (!this.queryParams.projectId) {
        return this.variantOptions
      }
      return this.variantOptions.filter(item => String(item.projectId) === String(this.queryParams.projectId))
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
      Promise.all([
        listModule({ status: "0" }).catch(() => ({ rows: [], data: [] })),
        listIndexModule({ status: "0" }).catch(() => ({ rows: [], data: [] }))
      ]).then(([manualResponse, indexResponse]) => {
        this.moduleOptions = this.mergeModuleOptions(
          manualResponse.rows || manualResponse.data || [],
          indexResponse.rows || indexResponse.data || []
        )
      })
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
      this.selectedRows = selection
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.$tab.openPage("新增需求", "/requirement/demand/maintain", { parentPath: "/requirement/demand" })
    },
    handleUpdate(row) {
      const target = row && (row.demandId || row.id) ? row : this.selectedRows[0]
      const demandId = target ? (target.demandId || target.id) : this.ids
      const targetDemandId = Array.isArray(demandId) ? demandId[0] : demandId
      if (!targetDemandId) return
      if (!target || !this.canEditDemand(target)) {
        this.$modal.msgWarning("只有未提交需求的创建人可以修改")
        return
      }
      const title = (target.title || "需求") + "维护"
      this.$tab.openPage(title, "/requirement/demand/maintain", { demandId: targetDemandId, parentPath: "/requirement/demand" })
    },
    handleStatusCommand(action, row) {
      const demandId = row.demandId || row.id
      const status = typeof action === "string" ? action : action.value
      const label = typeof action === "string" ? this.optionLabel(this.demandStatusOptions, status) : action.label
      const confirmText = (action && action.confirm) || ('是否确认将需求"' + row.title + '"状态调整为"' + label + '"？')
      this.$modal.confirm(confirmText).then(function() {
        return updateDemandStatus(demandId, status)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("状态更新成功")
      }).catch(() => {})
    },
    nextStatusOptions(status) {
      return nextStatusOptions(status, this.roles, this.permissions)
    },
    handleDelete(row) {
      const demandIds = row && (row.demandId || row.id) ? [row.demandId || row.id] : this.ids
      if (!demandIds.length) return
      const label = row && row.title ? row.title : demandIds.join(",")
      this.$modal.confirm('是否确认删除需求"' + label + '"？').then(function() {
        return delDemand(demandIds.join(","))
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    handleDetail(row) {
      const demandId = row.demandId || row.id
      this.$tab.openPage("需求详情", "/requirement/demand/detail", { demandId: demandId, parentPath: "/requirement/demand" })
    },
    handleDemandQueryProjectChange() {
      const variant = this.queryVariantOptions.find(item => String(item.variantId || item.id) === String(this.queryParams.variantId))
      if (!variant) {
        this.queryParams.variantId = undefined
      }
    },
    projectLabel(projectId) {
      const project = this.projectOptions.find(item => String(item.projectId || item.id) === String(projectId))
      return project ? project.projectName : projectId
    },
    variantLabel(variantId) {
      const variant = this.variantOptions.find(item => String(item.variantId || item.id) === String(variantId))
      return variant ? (variant.branchLabel || variant.variantName) : variantId
    },
    moduleLabel(moduleId) {
      const module = this.moduleOptions.find(item => String(this.moduleOptionValue(item)) === String(moduleId))
      return module ? module.moduleName : moduleId
    },
    demandModuleLabel(row) {
      if (row.moduleId) {
        return this.moduleLabel(row.moduleId)
      }
      return row.remark || "新增功能"
    },
    developerLabel(row) {
      if (!row) {
        return "-"
      }
      if (row.developerNickName && row.developerUserName) {
        return row.developerNickName + "（" + row.developerUserName + "）"
      }
      return row.developerNickName || row.developerUserName || "-"
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
    optionLabel(options, value) {
      return optionLabel(options, value)
    },
    demandStatusTagType(value) {
      return demandStatusTagType(value)
    },
    primaryStatusAction(status) {
      return getPrimaryStatusAction(status, this.roles, this.permissions, null, this.id)
    },
    statusActions(row) {
      return getStatusActions(row.status, this.roles, this.permissions, row, this.id)
    },
    canEditDemand(row) {
      return canEditDemandRow(row, this.id, this.roles, this.permissions)
    }
  }
}
</script>

<style scoped>
.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px 8px;
}

.status-action-button {
  height: 24px;
  margin-left: 0 !important;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #1d4ed8;
  font-weight: 500;
}

.status-action-button:hover,
.status-action-button:focus {
  border-color: #93c5fd;
  background: #dbeafe;
  color: #1d4ed8;
}

.status-action-button.is-repair {
  border-color: #fecaca;
  background: #fff1f2;
  color: #be123c;
}

.status-action-button.is-complete {
  border-color: #bbf7d0;
  background: #ecfdf5;
  color: #047857;
}

.status-action-button.is-develop {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #075985;
}

.row-delete-button {
  color: #f56c6c;
}
</style>
