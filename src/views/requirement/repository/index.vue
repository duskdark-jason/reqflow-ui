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
      <el-form-item label="仓库名称" prop="repoName">
        <el-input
          v-model="queryParams.repoName"
          placeholder="请输入仓库名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="仓库类型" prop="repoType">
        <el-select v-model="queryParams.repoType" placeholder="仓库类型" clearable style="width: 140px">
          <el-option
            v-for="item in repoTypeOptions"
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
          v-hasPermi="['req:repo:add']"
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
          v-hasPermi="['req:repo:edit']"
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
          v-hasPermi="['req:repo:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="repositoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="所属项目" align="center" min-width="150" :show-overflow-tooltip="true">
        <template slot-scope="scope">{{ projectLabel(scope.row.projectId) }}</template>
      </el-table-column>
      <el-table-column label="仓库名称" align="center" prop="repoName" min-width="170" :show-overflow-tooltip="true" />
      <el-table-column label="仓库类型" align="center" prop="repoType" width="110">
        <template slot-scope="scope">{{ optionLabel(repoTypeOptions, scope.row.repoType) }}</template>
      </el-table-column>
      <el-table-column label="默认分支" align="center" prop="defaultBranch" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="Harness" align="center" prop="harnessStatus" width="130">
        <template slot-scope="scope">
          <el-tag :type="harnessTagType(scope.row.harnessStatus)" size="mini">
            {{ optionLabel(harnessStatusOptions, scope.row.harnessStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最后索引" align="center" prop="lastIndexedAt" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastIndexedAt) }}</span>
        </template>
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
            v-hasPermi="['req:repo:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['req:repo:remove']"
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
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
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
            <el-form-item label="仓库名称" prop="repoName">
              <el-input v-model="form.repoName" placeholder="请输入仓库名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="仓库类型" prop="repoType">
              <el-select v-model="form.repoType" placeholder="请选择仓库类型" style="width: 100%">
                <el-option
                  v-for="item in repoTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认分支" prop="defaultBranch">
              <el-input v-model="form.defaultBranch" placeholder="请输入默认分支" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="仓库地址" prop="repoUrl">
              <el-input v-model="form.repoUrl" placeholder="请输入仓库地址" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="本地路径提示" prop="localPathHint">
              <el-input v-model="form.localPathHint" placeholder="请输入本地路径提示" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Harness状态" prop="harnessStatus">
              <el-select v-model="form.harnessStatus" placeholder="请选择 Harness 状态" style="width: 100%">
                <el-option
                  v-for="item in harnessStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Harness提交" prop="harnessCommit">
              <el-input v-model="form.harnessCommit" placeholder="请输入 Harness 提交号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最后索引时间" prop="lastIndexedAt">
              <el-date-picker
                v-model="form.lastIndexedAt"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
                placeholder="请选择最后索引时间"
                style="width: 100%"
              />
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
import { listRepository, getRepository, delRepository, addRepository, updateRepository } from "@/api/requirement/repository"

export default {
  name: "RequirementRepository",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      repositoryList: [],
      projectOptions: [],
      title: "",
      open: false,
      statusOptions: [
        { value: "0", label: "正常", type: "success" },
        { value: "1", label: "停用", type: "info" }
      ],
      repoTypeOptions: [
        { value: "FRONTEND", label: "前端" },
        { value: "BACKEND", label: "后端" },
        { value: "MONOREPO", label: "多端仓库" },
        { value: "DOC", label: "文档仓库" },
        { value: "OTHER", label: "其他" }
      ],
      harnessStatusOptions: [
        { value: "uninitialized", label: "未初始化", type: "info" },
        { value: "initialized", label: "已初始化", type: "success" },
        { value: "stale", label: "待更新", type: "warning" },
        { value: "error", label: "异常", type: "danger" }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectId: undefined,
        repoName: undefined,
        repoType: undefined,
        status: undefined
      },
      form: {},
      rules: {
        projectId: [
          { required: true, message: "所属项目不能为空", trigger: "change" }
        ],
        repoName: [
          { required: true, message: "仓库名称不能为空", trigger: "blur" }
        ],
        repoType: [
          { required: true, message: "仓库类型不能为空", trigger: "change" }
        ],
        repoUrl: [
          { required: true, message: "仓库地址不能为空", trigger: "blur" }
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
      listRepository(this.queryParams).then(response => {
        this.repositoryList = response.rows || response.data || []
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
        repoId: undefined,
        projectId: undefined,
        repoName: undefined,
        repoType: "BACKEND",
        repoUrl: undefined,
        localPathHint: undefined,
        defaultBranch: "master",
        harnessStatus: "uninitialized",
        harnessCommit: undefined,
        lastIndexedAt: undefined,
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
      this.ids = selection.map(item => item.repoId || item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加仓库"
    },
    handleUpdate(row) {
      this.reset()
      const repoId = row.repoId || row.id || this.ids
      getRepository(repoId).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改仓库"
      })
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.repoId != undefined || this.form.id != undefined) {
            updateRepository(this.form).then(() => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addRepository(this.form).then(() => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    handleDelete(row) {
      const repoIds = row.repoId || row.id || this.ids
      this.$modal.confirm('是否确认删除仓库编号为"' + repoIds + '"的数据项？').then(function() {
        return delRepository(repoIds)
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
    },
    harnessTagType(value) {
      const option = this.harnessStatusOptions.find(item => item.value === String(value))
      return option ? option.type : ""
    }
  }
}
</script>
