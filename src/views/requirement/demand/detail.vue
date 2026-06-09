<template>
  <div class="app-container">
    <el-page-header content="需求详情" @back="goBack" />

    <el-card class="detail-card" shadow="never" v-loading="loading">
      <div slot="header" class="detail-header">
        <div>
          <div class="detail-title">{{ form.title || "未选择需求" }}</div>
          <div class="detail-subtitle">{{ form.demandNo || "-" }}</div>
        </div>
        <el-tag :type="demandStatusTagType(form.status)">{{ optionLabel(demandStatusOptions, form.status) }}</el-tag>
      </div>

      <el-descriptions :column="3" border size="medium">
        <el-descriptions-item label="需求类型">{{ optionLabel(demandTypeOptions, form.demandType) }}</el-descriptions-item>
        <el-descriptions-item label="所属项目">{{ projectLabel(form.projectId) }}</el-descriptions-item>
        <el-descriptions-item label="客户线">{{ variantLabel(form.variantId) }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ moduleLabel(form.moduleId) }}</el-descriptions-item>
        <el-descriptions-item label="创建人ID">{{ form.creatorId || "-" }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(form.createTime) || "-" }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">业务背景</el-divider>
      <div class="markdown-block">{{ form.businessBackground || "暂无内容" }}</div>

      <el-divider content-position="left">预期结果</el-divider>
      <div class="markdown-block">{{ form.expectedResult || "暂无内容" }}</div>

      <el-divider content-position="left">影响范围</el-divider>
      <el-descriptions :column="2" border size="medium">
        <el-descriptions-item label="影响页面">{{ form.impactPage || "-" }}</el-descriptions-item>
        <el-descriptions-item label="影响接口">{{ form.impactApi || "-" }}</el-descriptions-item>
        <el-descriptions-item label="影响数据">{{ form.impactData || "-" }}</el-descriptions-item>
        <el-descriptions-item label="影响权限">{{ form.impactPermission || "-" }}</el-descriptions-item>
        <el-descriptions-item label="导出/异步" :span="2">{{ form.impactExportOrAsync || "-" }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">验收标准</el-divider>
      <div class="markdown-block">{{ form.acceptanceText || "暂无内容" }}</div>

      <div class="detail-actions">
        <el-button icon="el-icon-back" @click="goBack">返回</el-button>
        <el-button
          type="primary"
          icon="el-icon-document"
          @click="openPackage"
          :disabled="!demandId"
          v-hasPermi="['req:package:list']"
        >Agent 交接资料</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { listProject } from "@/api/requirement/project"
import { listVariant } from "@/api/requirement/variant"
import { listModule } from "@/api/requirement/module"
import { getDemand } from "@/api/requirement/demand"

export default {
  name: "RequirementDemandDetail",
  data() {
    return {
      loading: false,
      demandId: undefined,
      form: {},
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
      ]
    }
  },
  created() {
    this.demandId = this.$route.query.demandId || this.$route.params.demandId
    this.getOptions()
    if (this.demandId) {
      this.getDetail()
    }
  },
  methods: {
    getDetail() {
      this.loading = true
      getDemand(this.demandId).then(response => {
        this.form = response.data || {}
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
    goBack() {
      this.$router.back()
    },
    openPackage() {
      this.$router.push({ path: "/requirement/package", query: { demandId: this.demandId } })
    },
    projectLabel(projectId) {
      const project = this.projectOptions.find(item => String(item.projectId || item.id) === String(projectId))
      return project ? project.projectName : projectId || "-"
    },
    variantLabel(variantId) {
      const variant = this.variantOptions.find(item => String(item.variantId || item.id) === String(variantId))
      return variant ? variant.variantName : variantId || "-"
    },
    moduleLabel(moduleId) {
      const module = this.moduleOptions.find(item => String(item.moduleId || item.id) === String(moduleId))
      return module ? module.moduleName : moduleId || "-"
    },
    optionLabel(options, value) {
      const option = options.find(item => item.value === String(value))
      return option ? option.label : value || "-"
    },
    demandStatusTagType(value) {
      const option = this.demandStatusOptions.find(item => item.value === String(value))
      return option ? option.type : ""
    }
  }
}
</script>

<style scoped>
.detail-card {
  margin-top: 16px;
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

.markdown-block {
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  color: #303133;
  line-height: 1.7;
  white-space: pre-wrap;
  background: #fafafa;
}

.detail-actions {
  margin-top: 18px;
  text-align: right;
}
</style>
