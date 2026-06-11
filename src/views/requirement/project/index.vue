<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="项目名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="项目编码" prop="projectCode">
        <el-input
          v-model="queryParams.projectCode"
          placeholder="请输入项目编码"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="项目状态" clearable style="width: 140px">
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
          v-hasPermi="['req:project:add']"
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
          v-hasPermi="['req:project:edit']"
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
          v-hasPermi="['req:project:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="项目名称" align="center" prop="projectName" min-width="180" :show-overflow-tooltip="true" />
      <el-table-column label="项目编码" align="center" prop="projectCode" min-width="140" :show-overflow-tooltip="true" />
      <el-table-column label="负责人ID" align="center" prop="ownerUserId" width="110" />
      <el-table-column label="初始化状态" align="center" min-width="190">
        <template slot-scope="scope">
          <div class="init-status-cell">
            <el-tag :type="initStatus(scope.row).type" size="mini">{{ initStatus(scope.row).label }}</el-tag>
            <el-progress
              :percentage="initStatus(scope.row).percentage"
              :stroke-width="6"
              :show-text="false"
              class="init-progress"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="mini">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="220">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-connection"
            @click="handleIntake(scope.row)"
            v-hasPermi="['req:project:query']"
          >接入状态</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['req:project:edit']"
          >维护</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['req:project:remove']"
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

  </div>
</template>

<script>
import { listProject, delProject } from "@/api/requirement/project"
import { getProjectInit } from "@/api/requirement/projectInit"

export default {
  name: "RequirementProject",
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      projectList: [],
      initStatusMap: {},
      statusOptions: [
        { value: "0", label: "正常", type: "success" },
        { value: "1", label: "停用", type: "info" }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectName: undefined,
        projectCode: undefined,
        status: undefined
      },
      form: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listProject(this.queryParams).then(response => {
        this.projectList = response.rows || response.data || []
        this.total = response.total || 0
        this.loading = false
        this.loadInitStatuses()
      }).catch(() => {
        this.loading = false
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
      this.ids = selection.map(item => item.projectId || item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.$tab.openPage("新增项目", "/requirement/project/maintain")
    },
    handleUpdate(row) {
      const projectId = row.projectId || row.id || this.ids
      const targetProjectId = Array.isArray(projectId) ? projectId[0] : projectId
      if (!targetProjectId) return
      const title = (row.projectName || "项目") + "维护"
      this.$tab.openPage(title, "/requirement/project/maintain", { projectId: targetProjectId })
    },
    handleIntake(row) {
      const projectId = row.projectId || row.id
      this.handleIntakeById(projectId)
    },
    handleIntakeById(projectId) {
      if (!projectId) return
      this.$tab.openPage("项目接入中心", "/requirement/project/detail", { projectId: projectId })
    },
    handleDelete(row) {
      const projectIds = row.projectId || row.id || this.ids
      this.$modal.confirm('是否确认删除项目编号为"' + projectIds + '"的数据项？').then(function() {
        return delProject(projectIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    statusLabel(value) {
      const option = this.statusOptions.find(item => item.value === String(value))
      return option ? option.label : value
    },
    statusTagType(value) {
      const option = this.statusOptions.find(item => item.value === String(value))
      return option ? option.type : ""
    },
    loadInitStatuses() {
      this.initStatusMap = {}
      this.projectList.forEach(project => {
        const projectId = project.projectId || project.id
        if (!projectId) return
        getProjectInit(projectId).then(response => {
          this.$set(this.initStatusMap, projectId, response.data || {})
        }).catch(() => {
          this.$set(this.initStatusMap, projectId, { initChecklist: {} })
        })
      })
    },
    initStatus(row) {
      const projectId = row.projectId || row.id
      const context = this.initStatusMap[projectId]
      if (!context) {
        return { label: "状态读取中", type: "info", percentage: 0 }
      }
      const checklist = context.initChecklist || {}
      const keys = ["projectReady", "repositoryReady", "variantReady", "moduleReady", "indexReady"]
      const readyCount = keys.filter(key => checklist[key]).length
      const percentage = readyCount * 20
      if (!checklist.projectReady) return { label: "项目信息未完成", type: "warning", percentage: percentage }
      if (!checklist.repositoryReady) return { label: "缺代码仓库", type: "warning", percentage: percentage }
      if (!checklist.variantReady) return { label: "缺项目分支", type: "warning", percentage: percentage }
      if (!checklist.moduleReady) return { label: "缺模块知识", type: "info", percentage: percentage }
      if (!checklist.indexReady) return { label: "待仓库索引", type: "info", percentage: percentage }
      return { label: "基础初始化完成", type: "success", percentage: 100 }
    }
  }
}
</script>

<style scoped>
.init-status-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.init-progress {
  width: 120px;
}
</style>
