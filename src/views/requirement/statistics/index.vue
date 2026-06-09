<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="80px">
      <el-form-item label="统计时间">
        <el-date-picker
          v-model="dateRange"
          style="width: 260px"
          value-format="yyyy-MM-dd"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['req:stats:view']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="16" class="overview-row" v-loading="overviewLoading">
      <el-col :xs="24" :sm="12" :md="6" v-for="item in overviewCards" :key="item.key">
        <el-card shadow="never" class="overview-card">
          <div class="overview-label">{{ item.label }}</div>
          <div class="overview-value">{{ overviewValue(item.key) }}</div>
          <div class="overview-desc">{{ item.desc }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="rank-card" v-loading="rankLoading">
          <div slot="header">项目需求排行</div>
          <el-table :data="projectRankList">
            <el-table-column label="排名" type="index" align="center" width="70" />
            <el-table-column label="项目名称" prop="projectName" min-width="160" :show-overflow-tooltip="true" />
            <el-table-column label="需求数" align="center" prop="demandCount" width="100" />
            <el-table-column label="需求包率" align="center" width="100">
              <template slot-scope="scope">{{ formatRate(scope.row.packageRate) }}</template>
            </el-table-column>
            <el-table-column label="计划率" align="center" width="100">
              <template slot-scope="scope">{{ formatRate(scope.row.planRate) }}</template>
            </el-table-column>
            <el-table-column label="执行报告率" align="center" width="110">
              <template slot-scope="scope">{{ formatRate(scope.row.executionReportRate) }}</template>
            </el-table-column>
            <el-table-column label="Review率" align="center" width="100">
              <template slot-scope="scope">{{ formatRate(scope.row.reviewReportRate) }}</template>
            </el-table-column>
            <el-table-column label="Harness覆盖" align="center" width="120">
              <template slot-scope="scope">{{ formatRate(scope.row.harnessCoverageRate) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card shadow="never" class="rank-card" v-loading="usageLoading">
          <div slot="header">用户使用统计</div>
          <el-table :data="userUsageList">
            <el-table-column label="用户" prop="userName" min-width="140" :show-overflow-tooltip="true">
              <template slot-scope="scope">{{ scope.row.userName || scope.row.nickName || scope.row.userId }}</template>
            </el-table-column>
            <el-table-column label="角色" align="center" prop="roleName" width="110" :show-overflow-tooltip="true" />
            <el-table-column label="提交需求" align="center" prop="demandSubmitCount" width="100" />
            <el-table-column label="生成执行包" align="center" prop="packageGenerateCount" width="110" />
            <el-table-column label="保存计划" align="center" prop="planSaveCount" width="100" />
            <el-table-column label="执行报告" align="center" prop="executionReportUploadCount" width="100" />
            <el-table-column label="Review报告" align="center" prop="reviewReportUploadCount" width="110" />
            <el-table-column label="最近使用" align="center" prop="lastActiveTime" width="160">
              <template slot-scope="scope">{{ parseTime(scope.row.lastActiveTime) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getRequirementOverview, getProjectRank, getUserUsage } from "@/api/requirement/statistics"

export default {
  name: "RequirementStatistics",
  data() {
    return {
      overviewLoading: false,
      rankLoading: false,
      usageLoading: false,
      dateRange: [],
      overview: {},
      projectRankList: [],
      userUsageList: [],
      overviewCards: [
        { key: "demandCount", label: "需求总数", desc: "当前筛选范围内需求数量" },
        { key: "packageCount", label: "需求包", desc: "已生成的需求说明数量" },
        { key: "planCount", label: "执行计划", desc: "已保存的执行计划数量" },
        { key: "executionReportCount", label: "执行报告", desc: "已上传的执行报告数量" },
        { key: "reviewReportCount", label: "Review 报告", desc: "已上传的 Review 报告数量" },
        { key: "activeUserCount", label: "活跃用户", desc: "近 30 天有使用记录的用户数" }
      ],
      queryParams: {}
    }
  },
  created() {
    this.getStatistics()
  },
  methods: {
    getStatistics() {
      const params = this.addDateRange({ ...this.queryParams }, this.dateRange)
      this.getOverview(params)
      this.getProjectRank(params)
      this.getUserUsage(params)
    },
    getOverview(params) {
      this.overviewLoading = true
      getRequirementOverview(params).then(response => {
        this.overview = response.data || {}
        this.overviewLoading = false
      }).catch(() => {
        this.overviewLoading = false
      })
    },
    getProjectRank(params) {
      this.rankLoading = true
      getProjectRank(params).then(response => {
        this.projectRankList = response.rows || response.data || []
        this.rankLoading = false
      }).catch(() => {
        this.rankLoading = false
      })
    },
    getUserUsage(params) {
      this.usageLoading = true
      getUserUsage(params).then(response => {
        this.userUsageList = response.rows || response.data || []
        this.usageLoading = false
      }).catch(() => {
        this.usageLoading = false
      })
    },
    handleQuery() {
      this.getStatistics()
    },
    resetQuery() {
      this.dateRange = []
      this.resetForm("queryForm")
      this.getStatistics()
    },
    overviewValue(key) {
      const value = this.overview[key]
      return value === undefined || value === null ? 0 : value
    },
    formatRate(value) {
      if (value === undefined || value === null || value === "") {
        return "-"
      }
      const number = Number(value)
      if (Number.isNaN(number)) {
        return value
      }
      return number.toFixed(1) + "%"
    }
  }
}
</script>

<style scoped>
.overview-row {
  margin-bottom: 16px;
}

.overview-card {
  margin-bottom: 16px;
}

.overview-label {
  color: #606266;
  font-size: 14px;
}

.overview-value {
  margin-top: 10px;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
  line-height: 36px;
}

.overview-desc {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.rank-card {
  margin-bottom: 16px;
}
</style>
