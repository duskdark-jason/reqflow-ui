import request from '@/utils/request'

// 查询MCP人员Key列表
export function listMcpKey(query) {
  return request({
    url: '/requirement/mcp/key/list',
    method: 'get',
    params: query
  })
}

// 查询MCP人员Key详细
export function getMcpKey(keyId) {
  return request({
    url: '/requirement/mcp/key/' + keyId,
    method: 'get'
  })
}

// 获取MCP Key安装指令包
export function getMcpKeyInstruction(keyId) {
  return request({
    url: '/requirement/mcp/key/' + keyId + '/instruction',
    method: 'get'
  })
}

// 查询MCP请求地址配置
export function getMcpKeyConfig() {
  return request({
    url: '/requirement/mcp/key/config',
    method: 'get'
  })
}

// 修改MCP请求地址配置
export function updateMcpKeyConfig(data) {
  return request({
    url: '/requirement/mcp/key/config',
    method: 'put',
    data: data
  })
}

// 查询MCP Key可绑定用户
export function listMcpKeyUserOptions(query) {
  return request({
    url: '/requirement/mcp/key/user-options',
    method: 'get',
    params: query
  })
}

// 新增MCP人员Key
export function addMcpKey(data) {
  return request({
    url: '/requirement/mcp/key',
    method: 'post',
    data: data
  })
}

// 删除MCP人员Key
export function delMcpKey(keyIds) {
  return request({
    url: '/requirement/mcp/key/' + keyIds,
    method: 'delete'
  })
}
