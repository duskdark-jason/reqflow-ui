import request from '@/utils/request'

// 查询需求列表
export function listDemand(query) {
  return request({
    url: '/requirement/demand/list',
    method: 'get',
    params: query
  })
}

// 查询需求可指定开发人员
export function listDemandDevelopers(query) {
  return request({
    url: '/requirement/demand/developer-options',
    method: 'get',
    params: query
  })
}

// 查询需求详细
export function getDemand(demandId) {
  return request({
    url: '/requirement/demand/' + demandId,
    method: 'get'
  })
}

// 新增需求
export function addDemand(data) {
  return request({
    url: '/requirement/demand',
    method: 'post',
    data: data
  })
}

// 修改需求
export function updateDemand(data) {
  return request({
    url: '/requirement/demand',
    method: 'put',
    data: data
  })
}

// 删除需求
export function delDemand(demandIds) {
  return request({
    url: '/requirement/demand/' + demandIds,
    method: 'delete'
  })
}

// 更新需求状态
export function updateDemandStatus(demandId, status) {
  return request({
    url: '/requirement/demand/' + demandId + '/status/' + status,
    method: 'post'
  })
}

// 获取生成需求设计的 MCP 指令
export function getDemandPlanInstruction(demandId) {
  return request({
    url: '/requirement/demand/' + demandId + '/plan-instruction',
    method: 'get'
  })
}

// 获取执行任务的 MCP 指令
export function getDemandDevelopInstruction(demandId) {
  return request({
    url: '/requirement/demand/' + demandId + '/develop-instruction',
    method: 'get'
  })
}

// 上传需求附件
export function uploadDemandAttachment(data) {
  return request({
    url: '/requirement/demand/upload',
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data', repeatSubmit: false }
  })
}
