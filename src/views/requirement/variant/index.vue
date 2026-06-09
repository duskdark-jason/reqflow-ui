<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="所属项目" prop="projectId">
        <el-select v-model="queryParams.projectId" placeholder="请选择项目" clearable filterable style="width: 220px">
          <el-option
            v-for="project in projectOptions"
            :key="project.projectId || project.id"
            :label="project.projectName"
            :value="project.projectId || project.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="项目分支" prop="variantName">
        <el-input
          v-model="queryParams.variantName"
          placeholder="请输入项目分支名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName">
        <el-input
          v-model="queryParams.customerName"
          placeholder="请输入客户名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
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
          v-hasPermi="['req:variant:add']"
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
          v-hasPermi="['req:variant:edit']"
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
          v-hasPermi="['req:variant:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="variantList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="所属项目" align="center" min-width="150" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ projectLabel(scope.row.projectId) }}</template>
      </el-table-column>
      <el-table-column label="项目分支名称" align="center" prop="variantName" min-width="160" :show-overflow-tooltip="true" />
      <el-table-column label="项目分支编码" align="center" prop="variantCode" min-width="140" :show-overflow-tooltip="true" />
      <el-table-column label="客户名称" align="center" prop="customerName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="范围类型" align="center" prop="scopeType" width="120">
        <template slot-scope="scope">{{ optionLabel(scopeTypeOptions, scope.row.scopeType) }}</template>
      </el-table-column>
      <el-table-column label="基线分支" align="center" prop="baselineBranch" width="140" :show-overflow-tooltip="true" />
      <el-table-column label="分支策略" align="center" prop="branchPolicy" width="120">
        <template slot-scope="scope">{{ optionLabel(branchPolicyOptions, scope.row.branchPolicy) }}</template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="90">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="mini">{{ optionLabel(statusOptions, scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['req:variant:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['req:variant:remove']"
          >删除</el-button>
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

    <el-dialog :title="title" :visible.sync="open" width="760px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属项目" prop="projectId">
              <el-select v-model="form.projectId" placeholder="请选择项目" filterable style="width: 100%">
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
            <el-form-item label="分支名称" prop="variantName">
              <el-input v-model="form.variantName" placeholder="请输入项目分支名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分支编码" prop="variantCode">
              <el-input v-model="form.variantCode" placeholder="请输入项目分支编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input v-model="form.customerName" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="范围类型" prop="scopeType">
              <el-select v-model="form.scopeType" placeholder="请选择范围类型" style="width: 100%">
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
              <el-input v-model="form.baselineBranch" placeholder="请输入基线分支" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分支策略" prop="branchPolicy">
              <el-select v-model="form.branchPolicy" placeholder="请选择分支策略" style="width: 100%">
                <el-option
                  v-for="item in branchPolicyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
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
import { listVariant, getVariant, delVariant, addVariant, updateVariant } from "@/api/requirement/variant"

export default {
  name: "RequirementVariant",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      variantList: [],
      projectOptions: [],
      title: "",
      open: false,
      statusOptions: [
        { value: "0", label: "正常", type: "success" },
        { value: "1", label: "停用", type: "info" }
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
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectId: undefined,
        variantName: undefined,
        customerName: undefined,
        status: undefined
      },
      form: {},
      rules: {
        projectId: [
          { required: true, message: "所属项目不能为空", trigger: "change" }
        ],
        variantName: [
          { required: true, message: "项目分支名称不能为空", trigger: "blur" }
        ],
        variantCode: [
          { required: true, message: "项目分支编码不能为空", trigger: "blur" }
        ],
        scopeType: [
          { required: true, message: "范围类型不能为空", trigger: "change" }
        ]
      }
    }
  },
  created() {
    this.getProjectOptions()
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listVariant(this.queryParams).then(response => {
        this.variantList = response.rows || response.data || []
        this.total = response.total || 0
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
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        variantId: undefined,
        projectId: undefined,
        variantName: undefined,
        variantCode: undefined,
        customerName: undefined,
        scopeType: "CUSTOMER",
        baselineBranch: "master",
        branchPolicy: "DEDICATED",
        description: undefined,
        status: "0"
      }
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
      this.ids = selection.map(item => item.variantId || item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加项目分支"
    },
    handleUpdate(row) {
      this.reset()
      const variantId = row.variantId || row.id || this.ids
      getVariant(variantId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改项目分支"
      })
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.variantId != undefined || this.form.id != undefined) {
            updateVariant(this.form).then(() => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addVariant(this.form).then(() => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    handleDelete(row) {
      const variantIds = row.variantId || row.id || this.ids
      this.$modal.confirm('是否确认删除项目分支编号为"' + variantIds + '"的数据项？').then(function() {
        return delVariant(variantIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    projectLabel(projectId) {
      const project = this.projectOptions.find(item => String(item.projectId || item.id) === String(projectId))
      return project ? project.projectName : projectId
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
