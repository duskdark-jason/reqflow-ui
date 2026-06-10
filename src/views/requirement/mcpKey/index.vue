<template>
  <div class="app-container mcp-key-page">
    <div class="mcp-config">
      <div class="config-item">
        <span class="config-label">MCP地址</span>
        <el-input v-model="mcpConfig.mcpAddress" size="small" readonly>
          <el-button slot="append" icon="el-icon-document-copy" @click="copyText(mcpConfig.mcpAddress)">复制</el-button>
        </el-input>
      </div>
      <div class="config-item header-item">
        <span class="config-label">请求头</span>
        <el-input v-model="mcpConfig.headerName" size="small" readonly>
          <el-button slot="append" icon="el-icon-document-copy" @click="copyText(mcpConfig.headerName)">复制</el-button>
        </el-input>
      </div>
      <div class="config-item config-snippet">
        <span class="config-label">Codex配置</span>
        <el-input
          v-model="mcpConfig.codexConfigTemplate"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          readonly
        />
      </div>
    </div>

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
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['req:mcp:key:edit']"
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
          v-hasPermi="['req:mcp:key:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mcpKeyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Key名称" align="center" prop="keyName" min-width="170" :show-overflow-tooltip="true" />
      <el-table-column label="Key前缀" align="center" prop="keyPrefix" min-width="150" :show-overflow-tooltip="true" />
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
            icon="el-icon-refresh"
            @click="handleRegenerate(scope.row)"
            v-hasPermi="['req:mcp:key:edit']"
          >重置</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['req:mcp:key:edit']"
          >修改</el-button>
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
            v-model="form.userId"
            filterable
            remote
            reserve-keyword
            :disabled="!!form.keyId"
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
        </el-form-item>
        <el-form-item label="Key名称" prop="keyName">
          <el-input v-model="form.keyName" placeholder="请输入Key名称" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.value"
            >{{ item.label }}</el-radio>
          </el-radio-group>
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

    <el-dialog title="MCP Key" :visible.sync="resultOpen" width="720px" append-to-body>
      <div class="result-grid">
        <div class="result-field">
          <span class="config-label">明文Key</span>
          <el-input v-model="createResult.plainKey" readonly>
            <el-button slot="append" icon="el-icon-document-copy" @click="copyText(createResult.plainKey)">复制</el-button>
          </el-input>
        </div>
        <div class="result-field">
          <span class="config-label">Codex配置</span>
          <el-input
            v-model="createResult.codexConfig"
            type="textarea"
            :autosize="{ minRows: 7, maxRows: 12 }"
            readonly
          />
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" icon="el-icon-document-copy" @click="copyText(createResult.codexConfig)">复制配置</el-button>
        <el-button @click="resultOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUser } from "@/api/system/user"
import { listMcpKey, getMcpKey, getMcpKeyConfig, addMcpKey, updateMcpKey, regenerateMcpKey, delMcpKey } from "@/api/requirement/mcpKey"

export default {
  name: "RequirementMcpKey",
  data() {
    return {
      loading: true,
      userLoading: false,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      mcpKeyList: [],
      userOptions: [],
      title: "",
      open: false,
      resultOpen: false,
      mcpConfig: {
        mcpAddress: "",
        headerName: "X-MCP-Key",
        codexConfigTemplate: ""
      },
      createResult: {
        plainKey: "",
        codexConfig: ""
      },
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
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "change" }
        ]
      }
    }
  },
  created() {
    this.getConfig()
    this.getList()
    this.searchUsers("")
  },
  methods: {
    getConfig() {
      getMcpKeyConfig().then(response => {
        this.mcpConfig = response.data || this.mcpConfig
      })
    },
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
      this.userLoading = true
      listUser({
        pageNum: 1,
        pageSize: 20,
        userName: keyword,
        status: "0"
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
        userId: undefined,
        keyName: undefined,
        status: "0",
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
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      this.title = "新增MCP Key"
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      const keyId = row.keyId || this.ids
      getMcpKey(Array.isArray(keyId) ? keyId[0] : keyId).then(response => {
        this.form = response.data || {}
        this.ensureUserOption(this.form)
        this.title = "修改MCP Key"
        this.open = true
      })
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) return
        if (this.form.keyId != null) {
          updateMcpKey(this.form).then(() => {
            this.$modal.msgSuccess("修改成功")
            this.open = false
            this.getList()
          })
        } else {
          addMcpKey(this.form).then(response => {
            this.$modal.msgSuccess("新增成功")
            this.open = false
            this.showCreateResult(response.data)
            this.getList()
          })
        }
      })
    },
    handleRegenerate(row) {
      const keyId = row.keyId
      this.$modal.confirm('是否确认重置"' + row.keyName + '"的MCP Key？').then(function() {
        return regenerateMcpKey(keyId)
      }).then(response => {
        this.$modal.msgSuccess("重置成功")
        this.showCreateResult(response.data)
        this.getList()
      }).catch(() => {})
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
    showCreateResult(data) {
      this.createResult = data || { plainKey: "", codexConfig: "" }
      this.resultOpen = true
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
    ensureUserOption(row) {
      if (!row || !row.userId) return
      const exists = this.userOptions.some(item => item.userId === row.userId)
      if (!exists) {
        this.userOptions.push({
          userId: row.userId,
          userName: row.userName,
          nickName: row.nickName
        })
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

.mcp-config {
  display: grid;
  grid-template-columns: minmax(260px, 1.2fr) minmax(180px, 0.8fr);
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #f8fafc;
}

.config-item,
.result-field {
  min-width: 0;
}

.config-snippet {
  grid-column: 1 / -1;
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

@media (max-width: 768px) {
  .mcp-config {
    grid-template-columns: 1fr;
  }

  .header-item {
    grid-column: 1;
  }
}
</style>
