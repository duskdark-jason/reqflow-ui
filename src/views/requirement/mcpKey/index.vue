<template>
  <div class="app-container mcp-key-page">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="Key名称" prop="keyName">
        <el-input
          v-model="queryParams.keyName"
          placeholder="请输入Key名称"
          clearable
          style="width: 220px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户账号" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户账号"
          clearable
          style="width: 180px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="Key状态" clearable style="width: 140px">
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
          v-hasPermi="['req:mcp:key:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['req:mcp:key:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-if="lastInstallResult && lastInstallResult.plainKey"
          type="info"
          plain
          icon="el-icon-document-copy"
          size="mini"
          @click="reopenInstallCommands"
        >重新打开安装命令</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mcpKeyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Key名称" align="center" prop="keyName" min-width="170" :show-overflow-tooltip="true" />
      <el-table-column label="绑定用户" align="center" min-width="180" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ userDisplay(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="mini">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最近使用" align="center" prop="lastUsedTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.lastUsedTime) || "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近IP" align="center" prop="lastUsedIp" width="140" :show-overflow-tooltip="true" />
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
            icon="el-icon-document-copy"
            @click="handleOpenInstructions(scope.row)"
            v-hasPermi="['req:mcp:key:query']"
          >使用指令</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['req:mcp:key:remove']"
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

    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="绑定用户" prop="userId">
          <el-select
            v-if="isAdminUser"
            v-model="form.userId"
            filterable
            remote
            reserve-keyword
            :remote-method="searchUsers"
            :loading="userLoading"
            placeholder="请输入用户账号"
            style="width: 100%"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.userId"
              :label="userOptionLabel(item)"
              :value="item.userId"
            />
          </el-select>
          <el-input v-else :value="currentUserLabel" disabled />
        </el-form-item>
        <el-form-item label="Key名称" prop="keyName">
          <el-input v-model="form.keyName" placeholder="请输入Key名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="MCP Key" :visible.sync="resultOpen" width="860px" append-to-body>
      <div class="result-grid">
        <div class="result-field">
          <span class="config-label">统一安装指令</span>
          <div class="install-command-group">
            <div
              v-for="command in renderedInstallCommands"
              :key="'unified-' + command.platform"
              class="install-command-card"
            >
              <div class="install-command-header">
                <div>
                  <span class="install-command-title">{{ command.label }}</span>
                  <el-tag size="mini" type="info">{{ command.language }}</el-tag>
                </div>
                <el-button size="mini" icon="el-icon-document-copy" @click="copyInstallCommand(command)">复制命令</el-button>
              </div>
              <pre class="markdown-code-block"><code>{{ command.renderedCommand }}</code></pre>
            </div>
          </div>
        </div>
        <el-collapse class="advanced-install-package">
          <el-collapse-item title="高级配置/调试信息" name="setup-package">
            <el-input
              :value="formatSkillPackage(createResult.codexSetupPackage)"
              type="textarea"
              :autosize="{ minRows: 6, maxRows: 12 }"
              readonly
            />
            <div class="copy-line">
              <el-button size="mini" icon="el-icon-document-copy" @click="copyText(formatSkillPackage(createResult.codexSetupPackage))">复制高级配置</el-button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resultOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { listMcpKey, getMcpKeyInstruction, listMcpKeyUserOptions, addMcpKey, delMcpKey } from "@/api/requirement/mcpKey"

export default {
  name: "RequirementMcpKey",
  data() {
    return {
      loading: true,
      userLoading: false,
      ids: [],
      multiple: true,
      showSearch: true,
      total: 0,
      mcpKeyList: [],
      userOptions: [],
      title: "",
      open: false,
      resultOpen: false,
      createResult: {
        key: null,
        plainKey: "",
        codexSetupPackage: null
      },
      lastInstallResult: null,
      installResultByKeyId: {},
      statusOptions: [
        { value: "0", label: "正常", type: "success" },
        { value: "1", label: "停用", type: "info" }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        keyName: undefined,
        userName: undefined,
        status: undefined
      },
      form: {},
      rules: {
        userId: [
          { required: true, message: "绑定用户不能为空", trigger: "change" }
        ],
        keyName: [
          { required: true, message: "Key名称不能为空", trigger: "blur" }
        ]
      }
    }
  },
  created() {
    this.getList()
    if (this.isAdminUser) {
      this.searchUsers("")
    } else {
      this.setCurrentUserOption()
    }
  },
  computed: {
    ...mapGetters([
      "id",
      "name",
      "nickName",
      "roles",
      "permissions"
    ]),
    isAdminUser() {
      return (Array.isArray(this.roles) && this.roles.includes("admin")) ||
        (Array.isArray(this.permissions) && this.permissions.includes("*:*:*"))
    },
    currentUserLabel() {
      return this.nickName && this.name ? this.nickName + "（" + this.name + "）" : (this.name || this.nickName || this.id || "当前用户")
    },
    renderedInstallCommands() {
      return this.installCommandsFor(this.createResult)
    }
  },
  methods: {
    getList() {
      this.loading = true
      listMcpKey(this.queryParams).then(response => {
        this.mcpKeyList = response.rows || response.data || []
        this.total = response.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    searchUsers(keyword) {
      if (!this.isAdminUser) {
        this.setCurrentUserOption()
        return
      }
      this.userLoading = true
      listMcpKeyUserOptions({
        pageNum: 1,
        pageSize: 20,
        userName: keyword
      }).then(response => {
        this.userOptions = response.rows || response.data || []
        this.userLoading = false
      }).catch(() => {
        this.userLoading = false
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        keyId: undefined,
        userId: this.isAdminUser ? undefined : this.id,
        keyName: undefined,
        remark: undefined
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
      this.ids = selection.map(item => item.keyId)
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      if (!this.isAdminUser) {
        this.setCurrentUserOption()
      }
      this.title = "新增MCP Key"
      this.open = true
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) return
        const payload = Object.assign({}, this.form)
        if (!this.isAdminUser) {
          payload.userId = this.id
        }
        addMcpKey(payload).then(response => {
          this.$modal.msgSuccess("新增成功")
          this.open = false
          this.showCreateResult(response.data)
          this.getList()
        })
      })
    },
    handleDelete(row) {
      const keyIds = row.keyId || this.ids
      this.$modal.confirm('是否确认删除MCP Key编号为"' + keyIds + '"的数据项？').then(function() {
        return delMcpKey(keyIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    handleOpenInstructions(row) {
      if (!row || !row.keyId) return
      const cached = this.installResultByKeyId[row.keyId]
      if (cached) {
        this.showInstructionResult(cached, false)
        return
      }
      getMcpKeyInstruction(row.keyId).then(response => {
        this.showInstructionResult(response.data || { key: row, plainKey: "", codexSetupPackage: null }, false)
      })
    },
    showCreateResult(data) {
      this.showInstructionResult(data, true)
    },
    showInstructionResult(data, rememberPlainKey) {
      this.createResult = Object.assign({ key: null, plainKey: "", codexSetupPackage: null }, data || {})
      if (this.createResult.plainKey) {
        const snapshot = JSON.parse(JSON.stringify(this.createResult))
        if (rememberPlainKey) {
          this.lastInstallResult = snapshot
        }
        const keyId = snapshot.key && snapshot.key.keyId
        if (keyId) {
          this.$set(this.installResultByKeyId, keyId, snapshot)
        }
      }
      this.resultOpen = true
    },
    reopenInstallCommands() {
      if (!this.lastInstallResult || !this.lastInstallResult.plainKey) return
      this.createResult = JSON.parse(JSON.stringify(this.lastInstallResult))
      this.resultOpen = true
    },
    installCommandsFor(result) {
      const setupPackage = result && result.codexSetupPackage
      const commands = setupPackage && Array.isArray(setupPackage.installCommands) ? setupPackage.installCommands : []
      return this.renderCommandList(commands, result && result.plainKey)
    },
    renderCommandList(commands, plainKey) {
      const sourceCommands = Array.isArray(commands) ? commands : []
      return sourceCommands.map(command => {
        // 安装包模板不直接写死 Key，渲染时再替换，避免复制高级配置时泄漏到长期模板字段。
        const commandText = command.command || ""
        return Object.assign({}, command, {
          renderedCommand: this.renderInstallCommand(commandText, plainKey),
          requiresPlainKey: commandText.indexOf("${REQFLOW_MCP_KEY}") >= 0
        })
      })
    },
    renderInstallCommand(command, plainKey) {
      if (!command) return ""
      return command.replace(/\$\{REQFLOW_MCP_KEY\}/g, plainKey || "明文Key缺失")
    },
    copyInstallCommand(command) {
      if (!command) return
      if (command.requiresPlainKey && !this.createResult.plainKey) {
        this.$modal.msgWarning("当前Key暂无明文，请重新生成Key")
        return
      }
      this.copyText(command.renderedCommand || "")
    },
    formatSkillPackage(skillPackage) {
      if (!skillPackage) return ""
      return JSON.stringify(skillPackage, null, 2)
    },
    copyText(text) {
      if (!text) return
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$modal.msgSuccess("复制成功")
        })
        return
      }
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      // 兜底支持非安全上下文或旧浏览器，保证用户仍能复制 Key 和安装命令。
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      this.$modal.msgSuccess("复制成功")
    },
    userDisplay(row) {
      if (!row) return "-"
      if (row.nickName && row.userName) return row.nickName + "（" + row.userName + "）"
      return row.userName || row.nickName || row.userId || "-"
    },
    userOptionLabel(user) {
      if (!user) return ""
      if (user.nickName && user.userName) return user.nickName + "（" + user.userName + "）"
      return user.userName || user.nickName || String(user.userId)
    },
    setCurrentUserOption() {
      this.userOptions = [{
        userId: this.id,
        userName: this.name,
        nickName: this.nickName
      }]
      if (this.form) {
        this.form.userId = this.id
      }
    },
    statusLabel(value) {
      const option = this.statusOptions.find(item => item.value === String(value))
      return option ? option.label : value
    },
    statusTagType(value) {
      const option = this.statusOptions.find(item => item.value === String(value))
      return option ? option.type : ""
    }
  }
}
</script>

<style scoped>
.mcp-key-page {
  min-width: 0;
}

.result-field {
  min-width: 0;
}

.config-label {
  display: block;
  margin-bottom: 6px;
  color: #606266;
  font-size: 13px;
  line-height: 18px;
}

.result-grid {
  display: grid;
  gap: 14px;
}

.install-command-group {
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
}

.install-command-group:last-child {
  border-bottom: none;
}

.install-group-title {
  margin-bottom: 8px;
  color: #606266;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
}

.install-command-card {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.install-command-card + .install-command-card {
  margin-top: 8px;
}

.install-command-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
}

.install-command-title {
  margin-right: 8px;
  font-weight: 600;
  color: #303133;
}

.markdown-code-block {
  margin: 0;
  padding: 12px;
  overflow-x: auto;
  color: #dcdfe6;
  background: #202124;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.advanced-install-package {
  border-top: none;
}

.copy-line {
  margin-top: 8px;
  text-align: right;
}
</style>
