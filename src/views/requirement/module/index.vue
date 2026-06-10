<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="所属项目" prop="projectId">
        <el-select v-model="queryParams.projectId" placeholder="请选择项目" clearable filterable style="width: 220px" @change="handleQueryProjectChange">
          <el-option
            v-for="project in projectOptions"
            :key="project.projectId || project.id"
            :label="project.projectName"
            :value="project.projectId || project.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目分支" prop="variantId">
        <el-select v-model="queryParams.variantId" placeholder="请选择分支" clearable filterable style="width: 200px">
          <el-option
            v-for="variant in queryVariantOptions"
            :key="variant.variantId || variant.id"
            :label="variant.branchLabel || variant.variantName"
            :value="variant.variantId || variant.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="模块名称" prop="moduleName">
        <el-input
          v-model="queryParams.moduleName"
          placeholder="请输入模块名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模块类型" prop="moduleType">
        <el-select v-model="queryParams.moduleType" placeholder="模块类型" clearable style="width: 140px">
          <el-option
            v-for="item in moduleTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="状态" clearable style="width: 120px">
          <el-option
            v-for="item in statusOptions"
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
          v-hasPermi="['req:module:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="moduleList"
      row-key="moduleId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="模块名称" prop="moduleName" min-width="220" :show-overflow-tooltip="true" />
      <el-table-column label="模块编码" align="center" prop="moduleCode" min-width="140" :show-overflow-tooltip="true" />
      <el-table-column label="所属项目" align="center" min-width="150" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ projectLabel(scope.row.projectId) }}</template>
      </el-table-column>
      <el-table-column label="项目分支" align="center" min-width="140" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ variantLabel(scope.row.variantId) }}</template>
      </el-table-column>
      <el-table-column label="模块类型" align="center" prop="moduleType" width="120">
        <template slot-scope="scope">{{ optionLabel(moduleTypeOptions, scope.row.moduleType) }}</template>
      </el-table-column>
      <el-table-column label="仓库范围" align="center" prop="repoScope" width="120">
        <template slot-scope="scope">{{ optionLabel(repoScopeOptions, scope.row.repoScope) }}</template>
      </el-table-column>
      <el-table-column label="排序" align="center" prop="orderNum" width="90" />
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="mini">{{ optionLabel(statusOptions, scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="210">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['req:module:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['req:module:add']"
          >新增</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['req:module:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="title" :visible.sync="open" width="760px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
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
              <el-select v-model="form.variantId" placeholder="请选择项目分支" filterable style="width: 100%" @change="handleVariantChange">
                <el-option
                  v-for="variant in formVariantOptions"
                  :key="variant.variantId || variant.id"
                  :label="variant.branchLabel || variant.variantName"
                  :value="variant.variantId || variant.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级模块" prop="parentId">
              <el-select v-model="form.parentId" placeholder="请选择上级模块" filterable style="width: 100%">
                <el-option label="无上级模块" :value="0" />
                <el-option
                  v-for="module in parentModuleOptions"
                  :key="module.moduleId || module.id"
                  :label="module.moduleName"
                  :value="module.moduleId || module.id"
                  :disabled="String(module.moduleId || module.id) === String(form.moduleId || form.id)"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块名称" prop="moduleName">
              <el-input v-model="form.moduleName" placeholder="请输入模块名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块编码" prop="moduleCode">
              <el-input v-model="form.moduleCode" placeholder="请输入模块编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块类型" prop="moduleType">
              <el-select v-model="form.moduleType" placeholder="请选择模块类型" style="width: 100%">
                <el-option
                  v-for="item in moduleTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仓库范围" prop="repoScope">
              <el-select v-model="form.repoScope" placeholder="请选择仓库范围" style="width: 100%">
                <el-option
                  v-for="item in repoScopeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.value"
                >{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入描述" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { listModule, getModule, delModule, addModule, updateModule } from "@/api/requirement/module"

export default {
  name: "RequirementModule",
  data() {
    return {
      loading: true,
      showSearch: true,
      moduleList: [],
      rawModuleList: [],
      projectOptions: [],
      variantOptions: [],
      title: "",
      open: false,
      isExpandAll: true,
      refreshTable: true,
      statusOptions: [
        { value: "0", label: "正常", type: "success" },
        { value: "1", label: "停用", type: "info" }
      ],
      moduleTypeOptions: [
        { value: "BUSINESS", label: "业务模块" },
        { value: "PAGE", label: "页面模块" },
        { value: "API", label: "接口模块" },
        { value: "DATABASE", label: "数据模块" },
        { value: "OTHER", label: "其他" }
      ],
      repoScopeOptions: [
        { value: "ALL", label: "全部仓库" },
        { value: "FRONTEND", label: "前端" },
        { value: "BACKEND", label: "后端" },
        { value: "DOC", label: "文档" }
      ],
      queryParams: {
        projectId: undefined,
        variantId: undefined,
        moduleName: undefined,
        moduleType: undefined,
        status: undefined
      },
      form: {},
      rules: {
        projectId: [
          { required: true, message: "所属项目不能为空", trigger: "change" }
        ],
        variantId: [
          { required: true, message: "项目分支不能为空", trigger: "change" }
        ],
        parentId: [
          { required: true, message: "上级模块不能为空", trigger: "change" }
        ],
        moduleName: [
          { required: true, message: "模块名称不能为空", trigger: "blur" }
        ],
        moduleCode: [
          { required: true, message: "模块编码不能为空", trigger: "blur" }
        ],
        moduleType: [
          { required: true, message: "模块类型不能为空", trigger: "change" }
        ],
        orderNum: [
          { required: true, message: "排序不能为空", trigger: "blur" }
        ]
      }
    }
  },
  computed: {
    queryVariantOptions() {
      if (!this.queryParams.projectId) {
        return this.variantOptions
      }
      return this.variantOptions.filter(item => String(item.projectId) === String(this.queryParams.projectId))
    },
    formVariantOptions() {
      if (!this.form.projectId) {
        return this.variantOptions
      }
      return this.variantOptions.filter(item => String(item.projectId) === String(this.form.projectId))
    },
    parentModuleOptions() {
      if (!this.form.projectId) {
        return this.rawModuleList
      }
      return this.rawModuleList.filter(item => {
        return String(item.projectId) === String(this.form.projectId) && String(item.variantId) === String(this.form.variantId)
      })
    }
  },
  created() {
    this.getProjectOptions()
    this.getVariantOptions()
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listModule(this.queryParams).then(response => {
        this.rawModuleList = response.rows || response.data || []
        this.moduleList = this.handleTree(this.rawModuleList, "moduleId")
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    getProjectOptions() {
      listProject({ pageNum: 1, pageSize: 1000, status: "0" }).then(response => {
        this.projectOptions = response.rows || response.data || []
      })
    },
    getVariantOptions() {
      listVariant({ pageNum: 1, pageSize: 1000, status: "0" }).then(response => {
        this.variantOptions = response.rows || response.data || []
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        moduleId: undefined,
        projectId: undefined,
        variantId: undefined,
        parentId: 0,
        moduleName: undefined,
        moduleCode: undefined,
        moduleType: "BUSINESS",
        repoScope: "ALL",
        description: undefined,
        orderNum: 0,
        status: "0"
      }
      this.resetForm("form")
    },
    handleQuery() {
      this.getList()
    },
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    handleAdd(row) {
      this.reset()
      if (row) {
        this.form.projectId = row.projectId
        this.form.variantId = row.variantId
        this.form.parentId = row.moduleId || row.id
      }
      this.open = true
      this.title = "添加模块"
    },
    handleUpdate(row) {
      this.reset()
      const moduleId = row.moduleId || row.id
      getModule(moduleId).then(response => {
        this.form = response.data
        if (this.form.parentId === undefined || this.form.parentId === null) {
          this.form.parentId = 0
        }
        this.open = true
        this.title = "修改模块"
      })
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.moduleId != undefined || this.form.id != undefined) {
            updateModule(this.form).then(() => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addModule(this.form).then(() => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    handleDelete(row) {
      const moduleIds = row.moduleId || row.id
      this.$modal.confirm('是否确认删除模块编号为"' + moduleIds + '"的数据项？').then(function() {
        return delModule(moduleIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    handleProjectChange() {
      const variant = this.formVariantOptions.find(item => String(item.variantId || item.id) === String(this.form.variantId))
      if (!variant) {
        this.form.variantId = undefined
      }
      this.handleVariantChange()
    },
    handleVariantChange() {
      if (this.form.parentId !== 0) {
        const parent = this.parentModuleOptions.find(item => String(item.moduleId || item.id) === String(this.form.parentId))
        if (!parent) {
          this.form.parentId = 0
        }
      }
    },
    handleQueryProjectChange() {
      const variant = this.queryVariantOptions.find(item => String(item.variantId || item.id) === String(this.queryParams.variantId))
      if (!variant) {
        this.queryParams.variantId = undefined
      }
    },
    toggleExpandAll() {
      this.refreshTable = false
      this.isExpandAll = !this.isExpandAll
      this.$nextTick(() => {
        this.refreshTable = true
      })
    },
    projectLabel(projectId) {
      const project = this.projectOptions.find(item => String(item.projectId || item.id) === String(projectId))
      return project ? project.projectName : projectId
    },
    variantLabel(variantId) {
      const variant = this.variantOptions.find(item => String(item.variantId || item.id) === String(variantId))
      return variant ? (variant.branchLabel || variant.variantName) : (variantId || "-")
    },
    optionLabel(options, value) {
      const option = options.find(item => item.value === String(value))
      return option ? option.label : value
    },
    statusTagType(value) {
      const option = this.statusOptions.find(item => item.value === String(value))
      return option ? option.type : ""
    }
  }
}
</script>
