<template>
  <div class="app-container dashboard-page">
    <section class="dashboard-hero" v-loading="loading">
      <div>
        <div class="dashboard-eyebrow">统一需求流转平台</div>
        <h1>需求流转看板</h1>
        <p>从需求提交、执行资料、开发交接到 Review 回收，集中观察每个项目的流转状态。</p>
      </div>
      <div class="hero-actions">
        <el-button type="primary" icon="el-icon-plus" @click="openPage('提交需求', '/requirement/demand')">提交需求</el-button>
        <el-button icon="el-icon-office-building" @click="openPage('项目管理', '/requirement/project')">项目管理</el-button>
      </div>
    </section>

    <el-row :gutter="14" class="metric-row">
      <el-col :xs="12" :sm="8" :lg="4" v-for="item in metrics" :key="item.key">
        <div class="metric-tile" :class="'metric-' + item.key">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.hint }}</small>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="14" class="content-row">
      <el-col :xs="24" :lg="15">
        <section class="dashboard-section">
          <div class="section-head">
            <div>
              <h2>项目流转排行</h2>
              <p>按需求量和资料覆盖率观察项目推进情况</p>
            </div>
            <el-button type="text" icon="el-icon-refresh" @click="loadDashboard">刷新</el-button>
          </div>
          <el-table :data="projectRank" size="small" empty-text="暂无项目统计">
            <el-table-column label="项目" prop="projectName" min-width="160" :show-overflow-tooltip="true" />
            <el-table-column label="需求数" prop="demandCount" width="90" />
            <el-table-column label="需求资料" width="130">
              <template slot-scope="scope">
                <el-progress :percentage="percent(scope.row.packageRate)" :stroke-width="8" />
              </template>
            </el-table-column>
            <el-table-column label="计划" width="130">
              <template slot-scope="scope">
                <el-progress :percentage="percent(scope.row.planRate)" :stroke-width="8" color="#67c23a" />
              </template>
            </el-table-column>
            <el-table-column label="执行报告" width="130">
              <template slot-scope="scope">
                <el-progress :percentage="percent(scope.row.executionReportRate)" :stroke-width="8" color="#409eff" />
              </template>
            </el-table-column>
            <el-table-column label="Review" width="130">
              <template slot-scope="scope">
                <el-progress :percentage="percent(scope.row.reviewReportRate)" :stroke-width="8" color="#e6a23c" />
              </template>
            </el-table-column>
          </el-table>
        </section>
      </el-col>

      <el-col :xs="24" :lg="9">
        <section class="dashboard-section">
          <div class="section-head">
            <div>
              <h2>近期活跃</h2>
              <p>最近参与需求流转的人员</p>
            </div>
          </div>
          <div v-if="!userUsage.length" class="empty-state">暂无活跃记录</div>
          <div v-for="user in userUsage" :key="user.userName" class="usage-item">
            <div>
              <strong>{{ user.userName || "-" }}</strong>
              <span>{{ user.roleName || "-" }}</span>
            </div>
            <em>{{ parseTime(user.lastActiveTime) || "-" }}</em>
          </div>
        </section>
      </el-col>
    </el-row>

    <section class="dashboard-section quick-section">
      <div class="section-head">
        <div>
          <h2>快捷流转</h2>
          <p>把高频动作放到首屏，不让需求卡在入口处</p>
        </div>
      </div>
      <el-row :gutter="12">
        <el-col :xs="24" :sm="8" v-for="item in quickActions" :key="item.title">
          <button class="quick-action" type="button" @click="openPage(item.title, item.path)">
            <i :class="item.icon"></i>
            <span>{{ item.title }}</span>
            <small>{{ item.desc }}</small>
          </button>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script>
import { getRequirementOverview, getProjectRank, getUserUsage } from "@/api/requirement/statistics"

export default {
  name: "Index",
  data() {
    return {
      loading: false,
      overview: {},
      projectRank: [],
      userUsage: [],
      quickActions: [
        { title: "需求列表", path: "/requirement/demand", icon: "el-icon-tickets", desc: "查看、提交和推进需求" },
        { title: "执行资料", path: "/requirement/package", icon: "el-icon-document-checked", desc: "生成或查看 Agent 交接资料" },
        { title: "MCP 配置", path: "/requirement/mcpKey", icon: "el-icon-key", desc: "维护开发人员 MCP 访问 Key" }
      ]
    }
  },
  computed: {
    metrics() {
      return [
        { key: "demand", label: "需求总数", value: this.numberOf(this.overview.demandCount), hint: "已进入平台的需求" },
        { key: "package", label: "需求资料", value: this.numberOf(this.overview.packageCount), hint: "可交接资料包" },
        { key: "plan", label: "执行计划", value: this.numberOf(this.overview.planCount), hint: "已沉淀计划" },
        { key: "execution", label: "执行报告", value: this.numberOf(this.overview.executionReportCount), hint: "实施闭环记录" },
        { key: "review", label: "Review 报告", value: this.numberOf(this.overview.reviewReportCount), hint: "审查回收记录" },
        { key: "active", label: "活跃人员", value: this.numberOf(this.overview.activeUserCount), hint: "近 30 天" }
      ]
    }
  },
  created() {
    this.loadDashboard()
  },
  methods: {
    loadDashboard() {
      this.loading = true
      Promise.all([
        getRequirementOverview(),
        getProjectRank(),
        getUserUsage()
      ]).then(([overviewRes, rankRes, usageRes]) => {
        this.overview = overviewRes.data || {}
        this.projectRank = rankRes.data || rankRes.rows || []
        this.userUsage = usageRes.data || usageRes.rows || []
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    numberOf(value) {
      return value === undefined || value === null ? 0 : value
    },
    percent(value) {
      const number = Number(value || 0)
      return Math.max(0, Math.min(100, Number(number.toFixed(0))))
    },
    openPage(title, path) {
      this.$tab.openPage(title, path)
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 84px);
  background: #f4f8fb;
}

.dashboard-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  padding: 24px;
  border: 1px solid #d8edf9;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(232, 247, 255, 0.98), rgba(255, 255, 255, 0.98)),
    radial-gradient(circle at 88% 20%, rgba(111, 203, 185, 0.22), transparent 34%);
}

.dashboard-eyebrow {
  color: #2477a8;
  font-size: 13px;
  font-weight: 700;
}

.dashboard-hero h1 {
  margin: 8px 0;
  color: #1f3f59;
  font-size: 28px;
  line-height: 36px;
}

.dashboard-hero p {
  margin: 0;
  color: #5f7282;
  font-size: 14px;
  line-height: 24px;
}

.hero-actions {
  white-space: nowrap;
}

.metric-row,
.content-row,
.quick-section {
  margin-top: 14px;
}

.metric-tile {
  min-height: 120px;
  padding: 16px;
  border: 1px solid #dfeaf3;
  border-radius: 8px;
  background: #fff;
}

.metric-tile span {
  color: #617789;
  font-size: 13px;
}

.metric-tile strong {
  display: block;
  margin-top: 10px;
  color: #1f3f59;
  font-size: 28px;
  line-height: 34px;
}

.metric-tile small {
  display: block;
  margin-top: 8px;
  color: #8aa0af;
}

.dashboard-section {
  padding: 18px;
  border: 1px solid #e3edf5;
  border-radius: 8px;
  background: #fff;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.section-head h2 {
  margin: 0;
  color: #1f3f59;
  font-size: 18px;
  line-height: 26px;
}

.section-head p {
  margin: 4px 0 0;
  color: #758998;
  font-size: 13px;
}

.usage-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #edf3f8;
}

.usage-item:last-child {
  border-bottom: 0;
}

.usage-item strong,
.usage-item span,
.usage-item em {
  display: block;
}

.usage-item strong {
  color: #2b455a;
  font-size: 14px;
}

.usage-item span,
.usage-item em {
  margin-top: 4px;
  color: #7f93a3;
  font-size: 12px;
  font-style: normal;
}

.empty-state {
  padding: 36px 0;
  text-align: center;
  color: #8aa0af;
}

.quick-action {
  width: 100%;
  min-height: 96px;
  padding: 16px;
  text-align: left;
  border: 1px solid #dfeaf3;
  border-radius: 8px;
  background: #fbfdff;
  cursor: pointer;
}

.quick-action:hover {
  border-color: #8cc8ec;
  box-shadow: 0 8px 18px rgba(38, 86, 120, 0.08);
}

.quick-action i {
  color: #2477a8;
  font-size: 22px;
}

.quick-action span {
  display: block;
  margin-top: 10px;
  color: #1f3f59;
  font-size: 15px;
  font-weight: 700;
}

.quick-action small {
  display: block;
  margin-top: 6px;
  color: #7f93a3;
  line-height: 18px;
}

@media (max-width: 900px) {
  .dashboard-hero,
  .section-head {
    display: block;
  }

  .hero-actions {
    margin-top: 14px;
    white-space: normal;
  }
}
</style>
